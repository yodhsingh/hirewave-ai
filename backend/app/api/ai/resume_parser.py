import google.generativeai as genai
from PyPDF2 import PdfReader
from docx import Document
import json
import re
import time
from io import BytesIO
from fastapi import UploadFile

from app.core.config import settings
from app.core.gemini import configure_genai_with_rotation


# Function to load and configure API key
def configure_genai():
    configure_genai_with_rotation()


# Function to extract text from PDF
def extract_text_from_pdf(file):
    try:
        reader = PdfReader(file)
        text = ''
        urls = []
        
        # extracting text and collect URLs from each page
        for page in reader.pages:
            text += page.extract_text()
            
            # extracting URLs from annotations (explicit hyperlinks)
            if '/Annots' in page:
                for annot in page['/Annots']:
                    obj = annot.get_object()
                    if obj['/Subtype'] == '/Link' and '/A' in obj and '/URI' in obj['/A']:
                        urls.append(obj['/A']['/URI'])
        
        # use regex to find URLs in the text itself
        url_pattern = r'(https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+|(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?://(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})'
        embedded_urls = re.findall(url_pattern, text)
        urls.extend(embedded_urls)
        
        # Remove duplicates while preserving order
        unique_urls = []
        for url in urls:
            if url not in unique_urls:
                unique_urls.append(url)
                
        return {'text': text.strip(), 'urls': unique_urls}
    except Exception as e:
        raise ValueError(f"Error reading PDF file: {e}")


# Function to extract text from Word documents
def extract_text_from_word(file):
    try:
        doc = Document(file)
        text = ''
        urls = []
        
        # Extract text from paragraphs
        for paragraph in doc.paragraphs:
            text += paragraph.text + '\n'
            
            # Extract URLs from hyperlinks in the paragraph
            for run in paragraph.runs:
                if run.element.tag.endswith('hyperlink') or hasattr(run.element, 'hyperlink'):
                    # Try to get hyperlink URL
                    try:
                        hyperlink = run.element.hyperlink
                        if hyperlink and hasattr(hyperlink, 'address') and hyperlink.address:
                            urls.append(hyperlink.address)
                    except:
                        pass
        
        # Extract text from tables if any
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + '\n'
        
        # Use regex to find URLs in the text itself
        url_pattern = r'(https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+|(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?://(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})'
        embedded_urls = re.findall(url_pattern, text)
        urls.extend(embedded_urls)
        
        # Remove duplicates while preserving order
        unique_urls = []
        for url in urls:
            if url not in unique_urls:
                unique_urls.append(url)
                
        return {'text': text.strip(), 'urls': unique_urls}
    except Exception as e:
        raise ValueError(f"Error reading Word file: {e}")


# Universal function to extract text from supported file formats
def extract_text_from_file(file):
    """
    Extract text and URLs from supported file formats (PDF, DOC, DOCX)
    """
    try:
        # Get file extension
        filename = getattr(file, 'name', str(file))
        file_extension = filename.lower().split('.')[-1]
        
        if file_extension == 'pdf':
            return extract_text_from_pdf(file)
        elif file_extension in ['doc', 'docx']:
            return extract_text_from_word(file)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}. Supported formats: PDF, DOC, DOCX")
    except Exception as e:
        raise ValueError(f"Error processing file: {e}")


resumeSchema = {
    "name": "",
    "contact_information": {
        "email": "",
        "phone": "",
        "address": ""
    },
    "social profile links": [],
    "professional title": [],
    "education": [
        {
            "college_name": "",
            "degree": "",
            "start_date": "",
            "end_date": ""
        }
    ],
    "experience": [
        {
            "company name": "",
            "start date": "", 
            "end date": "", 
            "job title": "",
            "work description": [], 
            "project links": "",
        }
    ],
    "skills": [],
    "achivements": [],
    "projects": [
        {
            "name": "",
            "description": [],
            "links": [],
            "technologies": [],
        }
    ],
    "certificates": [],
    "volunteer": []
}


generation_config = {
    "response_mime_type": "application/json",
    "temperature": 0.1,
    "top_p": 0.95,
    "top_k": 1
}


# Function to parse resume text with LLM
def parse_data_to_json(resume_text, extracted_urls=None, resume_schema=resumeSchema, generation_config=generation_config):
    """
    Extracts structured information from the resume text, urls, embeeded url and retrieves the usage metadata
    """

    # Include the extracted URLs in the prompt if available
    url_info = ""
    if extracted_urls and len(extracted_urls) > 0:
        url_info = f"""
        Additionally, these URLs were extracted from the document:
        {extracted_urls}
        
        Please incorporate these URLs appropriately into the relevant sections 
        (social profile links, projects, etc.) where they match the context.
        """

    # prompt for the model
    prompt = f"""
    Extract the following information from the resume text and format it as a JSON object:
    - Full name
    - Contact information (email, phone, address)
    - Social Profile Links (platform name : Link)
    - Professional Title . Generate a real-world professional title based on the projects made, skills, and work experience. Ensure the title reflects the candidate's expertise and industry relevance.
    - Education history (college name, degree, start date, completion year/end date). For start date, extract if available, otherwise estimate based on degree duration or use "Not specified".
    - Projects made (name, link, description, technologies used).  Identify the top technologies (tools, frameworks, libraries, etc.) used in each project based on the description and embedded links. Ensure accuracy in determining these technologies, including libraries and frameworks utilized. You have to fetch embeeded links in the project as well, you have to check it.You have to do it. For project descriptions, format them as an array of exactly 4 bullet points that can be easily displayed in frontend. Keep each point as a one-liner, short and succinct while retaining all important information.
    - Work experience (company name, start date, end date, job title, work description, project links). If job title not present based on the work description, candidate's expertise and industry relevance generate it. Also project link should follow schem, so don't create a list of same. You have to do it. For work descriptions, format them as an array of exactly 4 bullet points that can be easily displayed in frontend. Keep each point as a one-liner, short and succinct while retaining all important information.
    - Skills (do not add any other sections like hard/soft skills)
    - Achievements, if any, else Nones
    - Certificates with links and embedded links, if any, else None
    - Volunteer experience, if any, else None

    For all descriptions (work experience and projects), structure them as arrays where each element is a separate bullet point. IMPORTANT: Each description array must contain exactly 4 bullet points - no more, no less. Each bullet point should be a concise one-liner that captures essential information without being verbose. If the original content has fewer points, expand or elaborate. If it has more, condense into exactly 4 meaningful, succinct points.

    Resume text:
    {resume_text}
    {url_info}

    Ensure the output matches this JSON schema:
    {resume_schema}
    """

    try:
        start_time = time.time()
        
        # Generate content using the LLM
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt, generation_config=generation_config)
        
        elapsed_time = round(time.time() - start_time, 4)
        
        return {
            "content": json.loads(response.text),
            "usage_metadata": {
                "prompt_tokens": response.usage_metadata.prompt_token_count,
                "completion_tokens": response.usage_metadata.candidates_token_count,
                "total_tokens": response.usage_metadata.total_token_count
            },
            "execution_time": elapsed_time
        }
    except Exception as e:
        raise ValueError(f"Error parsing resume with Gemini: {e}")


async def parse_resume_with_gemini(file: UploadFile):
    """
    Parse a resume file (PDF, DOC, DOCX) and return structured JSON data.
    
    Args:
        file: FastAPI UploadFile object
    
    Returns:
        dict: Parsed resume data as JSON with usage metadata and execution time
    """
    configure_genai()
    
    # Read file content into BytesIO for processing
    file_content = await file.read()
    file_bytes = BytesIO(file_content)
    
    # Set the name attribute for file type detection
    file_bytes.name = file.filename
    
    extracted_data = extract_text_from_file(file_bytes)

    result = parse_data_to_json(
        resume_text=extracted_data['text'],
        extracted_urls=extracted_data['urls']
    )
    
    return result
