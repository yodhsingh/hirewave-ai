"""
Interview Report Generation Service

This module provides functionality to generate comprehensive interview evaluation reports
from audio recordings. It uses Google Gemini AI for transcription, Q&A extraction, and
intelligent evaluation.
"""

import google.generativeai as genai
import json
import time
import os
from typing import Dict, List, Tuple, Any
from fastapi import UploadFile
import tempfile

from app.core.config import settings
from app.core.gemini import configure_genai_with_rotation
from app.schemas.interview import InterviewReportSchema


# =============================================================================
# CONFIGURATION
# =============================================================================

def configure_genai() -> None:
    """
    Configure Google Gemini AI with API key from settings.
    
    Raises:
        ValueError: If GOOGLE_GEMINI_API_KEY is not configured
    """
    try:
        configure_genai_with_rotation()
    except ValueError as exc:
        raise ValueError("GOOGLE_GEMINI_API_KEY is not configured in environment variables") from exc


# =============================================================================
# CORE FUNCTIONS
# =============================================================================

async def generate_transcript(file_path: str) -> Dict[str, Any]:
    """
    Generate a transcript from an audio file using Google Generative AI.
    
    Args:
        file_path: Path to the audio file
        
    Returns:
        Dictionary containing:
            - transcript: The generated transcript text
            
    Raises:
        Exception: If transcription fails
    """
    try:
        configure_genai()
        
        # Upload the file using the File API
        uploaded_file = genai.upload_file(path=file_path)
        
        # Wait for file to be processed
        import time as time_module
        while uploaded_file.state.name == "PROCESSING":
            time_module.sleep(1)
            uploaded_file = genai.get_file(uploaded_file.name)
        
        if uploaded_file.state.name == "FAILED":
            raise Exception("File processing failed")
        
        # Create transcript with specific prompt
        prompt = (
            "Generate a transcript of the speech. Only output the transcript with candidate names "
            "correctly spelled. If you hear, Hi, I'm Rahul from {company}, conducting your interview, "
            "kindly always replace company with Kcron. No extra text"
        )
        
        generation_config = {
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 1
        }
        
        # Get response using the uploaded file
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            [prompt, uploaded_file],
            generation_config=generation_config
        )
        
        # Clean up uploaded file
        genai.delete_file(uploaded_file.name)
        
        return {"transcript": response.text}
        
    except Exception as e:
        raise Exception(f"Error generating transcript: {str(e)}")


async def extract_qa_pairs(transcript: str) -> Tuple[List[Dict[str, str]], Dict[str, int]]:
    """
    Extract Q/A pairs from the transcript in the format {Q:, A:}.
    
    Args:
        transcript: The interview transcript text
        
    Returns:
        Tuple containing:
            - List of Q/A pairs as dictionaries with 'Q' and 'A' keys
            - Usage metadata dictionary with token counts
            
    Raises:
        ValueError: If Q/A extraction fails or JSON parsing fails
    """
    prompt = f"""
    Task 1: Extract Q/A Pairs
    Carefully read the transcript and extract clear interviewer questions (Q) and candidate answers (A) as Q/A pairs.
    If the transcript is conversational or not strictly formatted, infer the most likely questions and answers based on context.
    Present the Q/A pairs in the following JSON-like format:
    [
        {{ "Q": "Question 1", "A": "Answer 1" }},
        {{ "Q": "Question 2", "A": "Answer 2" }},
        ...
    ]
    Transcript:
    {transcript}
    """
    
    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.0,
        "top_p": 0.95,
        "top_k": 1
    }
    
    try:
        configure_genai()
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt, generation_config=generation_config)
        
        qa_pairs = json.loads(response.text.strip())
        
        usage_metadata = {
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "completion_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count
        }
        
        return qa_pairs, usage_metadata
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Q/A pairs JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error extracting Q/A pairs: {str(e)}")


async def generate_evaluation_report(
    transcript: str,
    qa_pairs: List[Dict[str, str]],
    parsed_resume_data: Dict[str, Any]
) -> Tuple[Dict[str, Any], Dict[str, int]]:
    """
    Generate a comprehensive interview evaluation report.
    
    Args:
        transcript: The interview transcript text
        qa_pairs: List of extracted Q/A pairs
        parsed_resume_data: Parsed resume data containing candidate information
        
    Returns:
        Tuple containing:
            - Evaluation report dictionary
            - Usage metadata dictionary with token counts
            
    Raises:
        ValueError: If report generation fails
    """
    # Define evaluation schema structure
    evaluation_schema = {
        "candidate_info": {
            "name": "<Candidate Full Name>",
            "email": "<Candidate Email>",
            "phone": "<Candidate Phone>",
            "resume_summary": "<Brief summary extracted from resume>",
            "applied_role": "<Job role candidate applied for>",
            "applied_company": "<Company candidate applied for>"
        },
        "interview_overview": {
            "mode": "<mock | real>",
            "date": "<YYYY-MM-DD>",
            "duration_minutes": "<Total duration in minutes>",
            "questions_asked": "<Number of questions asked>",
            "categories": ["<Category1>", "<Category2>", "<Category3>"]
        },
        "performance_metrics": {
            "content_analysis": {
                "resume_understanding": "<Summary of how well candidate explained resume projects>",
                "job_role_fit": "<How well candidate fits the role based on answers>",
                "technical_knowledge": "<Evaluation of technical skills>",
                "problem_solving": "<Problem-solving approach and depth>"
            },
            "communication_skills": {
                "clarity": "<Was the candidate clear or confusing?>",
                "conciseness": "<Were answers concise or verbose?>",
                "confidence_indicators": "<Phrases or tone showing confidence/hesitation>",
                "consistency": "<Consistency with resume and answers>"
            },
            "behavioral_traits": {
                "professionalism": "<Politeness, tone, and behavior>",
                "adaptability": "<How candidate handled follow-up questions>",
                "teamwork_leadership": "<Examples of teamwork or leadership>"
            },
            "linguistic_features": {
                "filler_words": ["<um>", "<like>", "<etc>"],
                "answer_length": "<Short | Medium | Long>",
                "vocabulary_richness": "<Use of technical or diverse vocabulary>",
                "tone": "<Positive | Neutral | Negative>"
            }
        },
        "scores": {
            "technical_knowledge": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "resume_alignment": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "job_role_fit": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "communication": {"score": "<0-10>", "justification": "<Covers professionalism, articulation, fluency, vocab>"},
            "articulation": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "confidence": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "clarity": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "domain_knowledge": {"score": "<0-10>", "justification": "<Why this score was given>"},
            "overall": {"score": "<0-100>", "justification": "<Overall justification>"}
        },
        "strengths": [
            "<Strength 1>",
            "<Strength 2>",
            "<Strength 3>"
        ],
        "weaknesses": [
            "<Weakness 1>",
            "<Weakness 2>"
        ],
        "recommendations": {
            "job_fit": "<low | moderate | high>",
            "improvement_suggestions": [
                "<Suggestion 1>",
                "<Suggestion 2>",
                "<Suggestion 3>"
            ],
            "resources": [
                "<Resource 1>",
                "<Resource 2>"
            ]
        },
        "transcript_analysis": {
            "qa_pairs": [
                {
                    "question": "<Question asked by AI interviewer>",
                    "answer": "<Candidate's response>",
                    "ai_notes": "<Analysis notes by AI>",
                    "answer_score": "<0-10>",
                    "justification": "<Why this score was given>",
                    "alternative_answers": [
                        {
                            "better_answer": "<Improved answer candidate could have given>",
                            "why_better": "<Why this alternative is stronger>"
                        }
                    ],
                    "why_bad": "<Why original answer was weak>"
                }
            ]
        }
    }
    
    prompt = f"""
    Task 2: Interview Evaluation
    Using only the extracted Q/A pairs and the provided parsed resume data, generate a detailed interview report as described below.

    CRITICAL INSTRUCTION: The entire evaluation report MUST be grounded and synchronized with the parsed resume data provided below.
    All candidate information, technical knowledge assessment, skills evaluation, experience validation, and project analysis must be 
    derived from and aligned with this resume data. If any field is present in the parsed resume data, it MUST be included in the report.
    This ensures accuracy and prevents hallucination or manipulation by the LLM or any other entity.

    Parsed Resume Data (SOURCE OF TRUTH):
    {json.dumps(parsed_resume_data, indent=4)}

    Use this resume data as the authoritative source for:
    - Candidate full name, email, phone, and all contact information
    - Professional title and applied role/company
    - Technical skills inventory and assessment
    - Work experience history and validation
    - Project details, descriptions, and technologies used
    - Educational background and certifications
    - All strengths must be based on skills and experience from the resume
    - All weaknesses assessments must reference resume skills gaps
    - Job fit recommendations must consider resume-to-role alignment

    Report Structure:
    1. Candidate Info  
       - Name (extract from parsed resume data - MUST match resume)
       - Email (extract from parsed resume data - MUST match resume)
       - Phone (extract from parsed resume data - MUST match resume)
       - Resume Summary (use resume summary from parsed data)
       - Role/Company applied (extract from parsed resume data)  

    2. Interview Overview  
       - Mode (mock | real - determine based on context)
       - Date (extract if mentioned, otherwise use current date format YYYY-MM-DD)
       - Duration in minutes (estimate based on transcript length if not mentioned)
       - Total number of questions asked (count Q entries)  
       - Question categories (e.g., technical: coding, system design; behavioral: teamwork, leadership; resume-based: work experience, projects; role-specific: job-relevant skills). Provide counts and examples for each category.  

    3. Performance Metrics (based solely on transcript and grounded in resume)
       Content Analysis:
       - Resume Understanding: Evaluate how well candidate explained resume projects and experience
       - Job Role Fit: How well candidate's resume skills fit the role based on answers
       - Technical Knowledge: Evaluation of technical skills mentioned in resume and demonstrated in answers
       - Problem Solving: Problem-solving approach and depth related to resume projects and experience
       
       Communication Skills:
       - Clarity: Was the candidate clear or confusing?
       - Conciseness: Were answers concise or verbose?
       - Confidence Indicators: Phrases or tone showing confidence/hesitation
       - Consistency: Consistency between resume claims and interview answers
       
       Behavioral Traits:
       - Professionalism: Politeness, tone, and behavior
       - Adaptability: How candidate handled follow-up questions
       - Teamwork Leadership: Examples of teamwork or leadership from resume experience
       
       Linguistic Features:
       - Filler Words: List any filler words used (um, like, etc.)
       - Answer Length: Short | Medium | Long
       - Vocabulary Richness: Use of technical or diverse vocabulary
       - Tone: Positive | Neutral | Negative

    4. Scoring (0 to 10 per category, adjusted for data availability)  
       - Technical Knowledge: Assess depth, correctness, and relevance of technical answers based on resume skills (weight: 10/10)
       - Resume Alignment: How well interview answers align with experience stated in resume
       - Job Role Fit: Suitability for the applied position based on resume qualifications
       - Communication: Covers professionalism, articulation, fluency, vocab
       - Articulation: Structure, clarity, and logical flow of answers
       - Confidence: Self-assurance in responses without arrogance
       - Clarity: Clear expression of ideas
       - Domain Knowledge: Knowledge specific to the field/industry based on resume expertise
       - Overall: Comprehensive score out of 100
       
       For each category, provide a score (0 to 10) and a brief justification (1 to 2 sentences) citing specific transcript examples.  
       If insufficient data exists for a category, assign a score of "N/A" with an explanation (e.g., "No technical questions asked").  

    5. Strengths & Weaknesses  
       - List 3 to 5 key strengths from resume and demonstrated in interview, supported by specific transcript examples.  
       - List 3 to 5 areas for improvement based on resume skills gaps, supported by specific examples from transcript.  

    6. Recommendations  
       - Job Fit: low | moderate | high (based on resume-to-role alignment)
       - Provide 2 to 3 personalized, actionable improvement suggestions based on resume gaps
       - Include relevant resources for improvement

    7. Transcript Analysis
       - For each Q/A pair, provide:
         * Question asked by interviewer
         * Candidate's response
         * AI analysis notes grounded in resume experience
         * Answer score (0-10)
         * Justification for the score citing resume alignment
         * Alternative better answers (if applicable)
         * Why the original answer was weak (if applicable)

    Guidelines for Accurate Evaluation:
    - Resume Grounding: Every assessment must reference and align with the parsed resume data
    - Weighting: Reflect the provided weights in scoring and emphasis.
    - Evidence-Based: Base all assessments on Q/A pairs and resume data, quoting or referencing specific elements
    - Fairness: Avoid bias from personal details unless explicitly relevant to role fit
    - Incomplete Data: If a metric cannot be evaluated, note "Insufficient data" and exclude from overall fit assessment
    - Consistency: Ensure scores align with evaluation metrics, Q/A evidence, and resume data
    - Industry Standards: Model evaluations on rubrics from top tech companies
    - No Hallucination: Do not invent skills, experience, or projects not present in the resume

    Output Format:
    - Use json {evaluation_schema} for clarity, with clear section headers and bullet points. You have to do it, do not deviate from the format.
    - Ensure scores reflect the weighted importance of each metric.
    - Provide concise, evidence-based justifications for all scores and observations grounded in resume data.

    Q/A Pairs:
    {json.dumps(qa_pairs, indent=4)}

    Output: A single valid JSON object matching the provided schema. Ensure all candidate information matches the parsed resume data exactly.
    """
    
    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.0,
        "top_p": 0.95,
        "top_k": 1
    }
    
    try:
        configure_genai()
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt, generation_config=generation_config)
        
        response_text = response.text.strip()
        evaluation_report = json.loads(response_text)
        
        # Validate using Pydantic schema
        try:
            validated_report = InterviewReportSchema(**evaluation_report)
            evaluation_report = validated_report.model_dump()
        except Exception as validation_error:
            # Log validation error but continue with unvalidated data
            print(f"Warning: Evaluation report validation failed: {validation_error}")
        
        usage_metadata = {
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "completion_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count
        }
        
        return evaluation_report, usage_metadata
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse evaluation report JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error generating evaluation report: {str(e)}")


# =============================================================================
# MAIN ORCHESTRATION FUNCTION
# =============================================================================

async def generate_interview_report(
    audio_file: UploadFile,
    parsed_resume_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Complete pipeline: audio file -> transcript -> Q/A pairs -> interview report.
    
    This is the main orchestration function that coordinates all steps of the
    interview report generation process.
    
    Args:
        audio_file: Uploaded audio file
        parsed_resume_data: Parsed resume data containing candidate information
        
    Returns:
        Dictionary containing:
            - transcript: Full interview transcript
            - qa_pairs: Extracted Q/A pairs
            - evaluation_report: Comprehensive evaluation report
            - usage_metadata: Token usage information for each step
            - execution_time: Total execution time in seconds
            
    Raises:
        Exception: If any step of the process fails
    """
    start_time = time.time()
    temp_file_path = None
    
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Step 1: Generate transcript from audio
        print(f"Generating transcript from {audio_file.filename}...")
        transcript_data = await generate_transcript(temp_file_path)
        transcript = transcript_data["transcript"]
        print(f"✓ Transcript generated ({len(transcript)} characters)")
        
        # Step 2: Extract Q/A pairs from transcript
        print("Extracting Q/A pairs...")
        qa_pairs, qa_usage = await extract_qa_pairs(transcript)
        print(f"✓ Extracted {len(qa_pairs)} Q/A pairs")
        print(f"  Q/A Extraction Usage - Tokens: {qa_usage['total_tokens']}")
        
        # Step 3: Generate evaluation report
        print("Generating evaluation report...")
        evaluation_report, eval_usage = await generate_evaluation_report(
            transcript,
            qa_pairs,
            parsed_resume_data
        )
        print("✓ Evaluation report generated successfully")
        print(f"  Evaluation Usage - Tokens: {eval_usage['total_tokens']}")
        
        # Calculate execution time
        elapsed_time = round(time.time() - start_time, 4)
        print(f"\n✓ Complete! Execution time: {elapsed_time}s")
        
        # Return complete report
        return {
            "transcript": transcript,
            "qa_pairs": qa_pairs,
            "evaluation_report": evaluation_report,
            "usage_metadata": {
                "qa_extraction": qa_usage,
                "evaluation": eval_usage
            },
            "execution_time": elapsed_time
        }
        
    except Exception as e:
        print(f"✗ Error: {e}")
        raise Exception(f"Error generating interview report: {str(e)}")
        
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Warning: Failed to delete temporary file {temp_file_path}: {e}")
