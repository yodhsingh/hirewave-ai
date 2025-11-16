from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.resume import ResumeParseResponse
from app.schemas.interview import InterviewReportResponse
from app.api.dependencies.auth import get_current_hr_user
from app.api.ai.resume_parser import parse_resume_with_gemini
from app.api.ai.interview_report_generator import generate_interview_report
from app.core.config import settings
import json
import tempfile
import os

router = APIRouter(prefix="/ai", tags=["AI"])

# Supported file formats and max file size
SUPPORTED_FORMATS = ["pdf", "doc", "docx", "png", "jpg", "jpeg"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post(
    "/parse-resume",
    response_model=ApiResponse[ResumeParseResponse],
    summary="Parse resume with AI",
    description="""
    Extract structured information from resume files using Google Gemini AI.

    **Supported Formats:**
    - PDF (.pdf)
    - Microsoft Word (.doc, .docx)
    - Images (.png, .jpg, .jpeg)

    **File Requirements:**
    - Maximum file size: 10MB
    - Must contain valid resume content

    **Extracted Information:**
    - Personal details (name, email, phone)
    - Work experience with dates and descriptions
    - Educational background
    - Skills and certifications
    - Professional summary

    **Authentication:** Requires HR or ADMIN role
    """,
    response_description="Resume successfully parsed with extracted structured data",
)
async def parse_resume(
    file: UploadFile = File(..., description="Resume file to parse (PDF, DOC, DOCX, or image)"),
    current_user: User = Depends(get_current_hr_user),
):
    # Validate file is provided
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded",
        )
    
    # Validate file format
    file_extension = file.filename.lower().split(".")[-1] if file.filename else ""
    if file_extension not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_FORMATS)}",
        )
    
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024)}MB",
        )
    
    # Reset file pointer for processing
    await file.seek(0)
    
    try:
        # Parse the resume
        result = await parse_resume_with_gemini(file)
        
        # Return standardized response
        return ApiResponse(
            success=True,
            data=ResumeParseResponse(**result),
        )
    
    except ValueError as e:
        # Handle parsing errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume: {str(e)}",
        )


@router.post(
    "/generate-interview-report-test",
    summary="[TEST] Generate interview report without authentication",
    description="""
    **⚠️ TEST ENDPOINT - No authentication required**

    This is a testing version of the interview report generator that bypasses authentication.
    Use this endpoint for development and testing purposes only.

    **Process:**
    Same as `/generate-interview-report` but without authentication:
    1. Transcribe audio interview recording
    2. Extract question-answer pairs
    3. Generate evaluation report with AI scoring

    **Supported Audio Formats:** MP3, WAV, M4A, WebM
    **Maximum File Size:** 50MB

    **Authentication:** None (public endpoint for testing)
    """,
    response_description="Interview report generated successfully",
)
async def generate_interview_report_test_endpoint(
    audio_file: UploadFile = File(..., description="Audio recording of the interview"),
    parsed_resume_data: str = Form(..., description="JSON string of parsed resume data"),
):
    # Same logic as authenticated endpoint
    if not audio_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is required.",
        )
    
    if not parsed_resume_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parsed resume data (JSON) is required.",
        )
    
    if isinstance(parsed_resume_data, str):
        try:
            resume_data_dict = json.loads(parsed_resume_data)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON format for parsed_resume_data.",
            )
    else:
        resume_data_dict = parsed_resume_data
    
    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_audio:
            content = await audio_file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        report = generate_interview_report(
            audio_path=temp_audio_path,
            parsed_resume_data=resume_data_dict
        )
        
        return {
            "success": True,
            "data": report,
            "message": "Interview report generated successfully."
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating interview report: {str(e)}",
        )
    
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception as e:
                print(f"Warning: Failed to delete temporary file: {e}")


@router.post(
    "/generate-interview-report",
    summary="Generate AI interview evaluation report",
    description="""
    Generate comprehensive interview evaluation from audio recording and resume data.

    **Process:**
    1. Transcribe audio interview recording
    2. Extract question-answer pairs from transcript
    3. Analyze responses against resume qualifications
    4. Generate detailed evaluation with AI scoring

    **Supported Audio Formats:**
    - MP3 (.mp3)
    - WAV (.wav)
    - M4A (.m4a)
    - WebM (.webm)

    **File Requirements:**
    - Maximum audio file size: 50MB
    - Clear audio quality recommended for accurate transcription

    **Generated Report Includes:**
    - Full interview transcript
    - Extracted Q&A pairs with timestamps
    - Overall candidate score (0-100)
    - Strengths and weaknesses analysis
    - Technical skills assessment
    - Cultural fit evaluation
    - Hiring recommendations

    **Authentication:** Requires HR or ADMIN role
    """,
    response_description="Interview report successfully generated with comprehensive evaluation",
)
async def generate_interview_report_endpoint(
    audio_file: UploadFile = File(..., description="Audio recording of the interview"),
    parsed_resume_data: str = Form(..., description="JSON string of parsed resume data from /parse-resume endpoint"),
    current_user: User = Depends(get_current_hr_user),
):
    # Validate audio file is provided
    if not audio_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is required.",
        )
    
    # Validate parsed resume data
    if not parsed_resume_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parsed resume data (JSON) is required.",
        )
    
    # Parse JSON string to dict if needed
    if isinstance(parsed_resume_data, str):
        try:
            resume_data_dict = json.loads(parsed_resume_data)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON format for parsed_resume_data.",
            )
    else:
        resume_data_dict = parsed_resume_data
    
    # Save audio file temporarily
    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_audio:
            content = await audio_file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Generate interview report using the same flow from finalInterviewReport.py
        report = generate_interview_report(
            audio_path=temp_audio_path,
            parsed_resume_data=resume_data_dict
        )
        
        # Return standardized response (same format as Django)
        return {
            "success": True,
            "data": report,
            "message": "Interview report generated successfully."
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating interview report: {str(e)}",
        )
    
    finally:
        # Clean up temporary file
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception as e:
                print(f"Warning: Failed to delete temporary file: {e}")
