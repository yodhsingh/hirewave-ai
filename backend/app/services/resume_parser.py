"""Resume Parser Service using Google Gemini AI"""

import io
import json
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path

import google.generativeai as genai
import PyPDF2
from docx import Document

from app.core.config import settings
from app.core.gemini import configure_genai_with_rotation

logger = logging.getLogger(__name__)


class ResumeParser:
    """Service for parsing resumes using Google Gemini AI"""

    def __init__(self):
        """Initialize the resume parser with Gemini AI"""
        try:
            configure_genai_with_rotation()
        except ValueError as exc:
            raise ValueError("Google Gemini API key is not configured") from exc

        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise ValueError(f"Failed to read PDF: {str(e)}")

    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            raise ValueError(f"Failed to read DOCX: {str(e)}")

    def extract_text(self, file_content: bytes, filename: str) -> str:
        """Extract text from resume file based on extension"""
        file_ext = Path(filename).suffix.lower()

        if file_ext == '.pdf':
            return self.extract_text_from_pdf(file_content)
        elif file_ext in ['.docx', '.doc']:
            return self.extract_text_from_docx(file_content)
        elif file_ext == '.txt':
            return file_content.decode('utf-8', errors='ignore')
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")

    async def parse_resume(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Parse resume and extract structured information using Gemini AI

        Args:
            file_content: Resume file content in bytes
            filename: Original filename with extension

        Returns:
            Dictionary with parsed resume information
        """
        try:
            # Extract text from the resume
            resume_text = self.extract_text(file_content, filename)

            if not resume_text or len(resume_text) < 50:
                raise ValueError("Resume appears to be empty or too short")

            # Create a prompt for Gemini to parse the resume
            prompt = f"""
            Parse the following resume and extract information in JSON format.
            Be accurate and extract only information that is explicitly mentioned in the resume.
            If a field is not present, set it to null or an empty array.

            Resume Text:
            {resume_text}

            Please extract and return ONLY a valid JSON object with the following structure:
            {{
                "personal_info": {{
                    "name": "full name",
                    "email": "email address",
                    "phone": "phone number",
                    "location": "city, state/country",
                    "linkedin": "LinkedIn profile URL",
                    "github": "GitHub profile URL",
                    "portfolio": "portfolio website URL",
                    "summary": "professional summary or objective"
                }},
                "experience": [
                    {{
                        "company": "company name",
                        "position": "job title",
                        "location": "city, state",
                        "start_date": "start date",
                        "end_date": "end date or 'Present'",
                        "description": "job description and achievements"
                    }}
                ],
                "education": [
                    {{
                        "institution": "school/university name",
                        "degree": "degree type",
                        "field": "field of study",
                        "graduation_date": "graduation date",
                        "gpa": "GPA if mentioned"
                    }}
                ],
                "skills": {{
                    "technical": ["list", "of", "technical", "skills"],
                    "soft": ["list", "of", "soft", "skills"],
                    "languages": ["programming", "languages"],
                    "tools": ["tools", "and", "technologies"]
                }},
                "certifications": [
                    {{
                        "name": "certification name",
                        "issuer": "issuing organization",
                        "date": "issue date"
                    }}
                ],
                "projects": [
                    {{
                        "name": "project name",
                        "description": "project description",
                        "technologies": ["tech", "stack"],
                        "url": "project URL if available"
                    }}
                ],
                "achievements": ["list", "of", "achievements", "and", "awards"],
                "languages_spoken": ["English", "Spanish", "etc"],
                "preferences": {{
                    "job_type": "Full-time/Part-time/Contract/Remote",
                    "desired_roles": ["desired", "job", "titles"],
                    "industries": ["preferred", "industries"]
                }}
            }}

            Return ONLY the JSON object, no other text or formatting.
            """

            # Generate response using Gemini
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Clean the response to extract just the JSON
            # Remove any markdown code blocks if present
            if response_text.startswith("```"):
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1])

            # Remove any non-JSON content before or after
            json_start = response_text.find('{')
            json_end = response_text.rfind('}')
            if json_start != -1 and json_end != -1:
                response_text = response_text[json_start:json_end+1]

            # Parse the JSON response
            try:
                parsed_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini response: {e}")
                logger.error(f"Response text: {response_text[:500]}")
                # Return a basic structure with raw text
                return self._create_fallback_response(resume_text)

            # Validate and clean the parsed data
            return self._validate_and_clean(parsed_data)

        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            raise ValueError(f"Failed to parse resume: {str(e)}")

    def _validate_and_clean(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the parsed resume data"""
        # Ensure all required fields exist with proper defaults
        cleaned = {
            "personal_info": data.get("personal_info", {}),
            "experience": data.get("experience", []),
            "education": data.get("education", []),
            "skills": data.get("skills", {
                "technical": [],
                "soft": [],
                "languages": [],
                "tools": []
            }),
            "certifications": data.get("certifications", []),
            "projects": data.get("projects", []),
            "achievements": data.get("achievements", []),
            "languages_spoken": data.get("languages_spoken", []),
            "preferences": data.get("preferences", {
                "job_type": None,
                "desired_roles": [],
                "industries": []
            })
        }

        # Ensure personal_info has all fields
        personal_defaults = {
            "name": None,
            "email": None,
            "phone": None,
            "location": None,
            "linkedin": None,
            "github": None,
            "portfolio": None,
            "summary": None
        }
        for key, default in personal_defaults.items():
            if key not in cleaned["personal_info"]:
                cleaned["personal_info"][key] = default

        # Ensure skills has all categories
        skill_categories = ["technical", "soft", "languages", "tools"]
        for category in skill_categories:
            if category not in cleaned["skills"]:
                cleaned["skills"][category] = []
            elif not isinstance(cleaned["skills"][category], list):
                cleaned["skills"][category] = []

        # Ensure preferences has all fields
        pref_defaults = {
            "job_type": None,
            "desired_roles": [],
            "industries": []
        }
        for key, default in pref_defaults.items():
            if key not in cleaned["preferences"]:
                cleaned["preferences"][key] = default

        return cleaned

    def _create_fallback_response(self, resume_text: str) -> Dict[str, Any]:
        """Create a basic fallback response when AI parsing fails"""
        # Try to extract basic information using simple patterns
        import re

        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'[\+\d]?[\d\s\-\(\)]+\d'

        email_match = re.search(email_pattern, resume_text)
        phone_match = re.search(phone_pattern, resume_text)

        # Get first line which often contains name
        lines = resume_text.split('\n')
        potential_name = lines[0] if lines else None

        return {
            "personal_info": {
                "name": potential_name,
                "email": email_match.group(0) if email_match else None,
                "phone": phone_match.group(0) if phone_match else None,
                "location": None,
                "linkedin": None,
                "github": None,
                "portfolio": None,
                "summary": None
            },
            "experience": [],
            "education": [],
            "skills": {
                "technical": [],
                "soft": [],
                "languages": [],
                "tools": []
            },
            "certifications": [],
            "projects": [],
            "achievements": [],
            "languages_spoken": [],
            "preferences": {
                "job_type": None,
                "desired_roles": [],
                "industries": []
            },
            "raw_text": resume_text[:5000]  # Include first 5000 chars of raw text
        }


# Create a singleton instance when at least one Gemini key is configured
resume_parser = ResumeParser() if (settings.GOOGLE_GEMINI_API_KEYS or settings.GOOGLE_GEMINI_API_KEY) else None