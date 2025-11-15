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


@router.post("/parse-resume", response_model=ApiResponse[ResumeParseResponse])
async def parse_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_hr_user),
):
    """
    Parse a resume file and extract structured information using Google Gemini AI.
    
    Supports PDF, DOC, DOCX, and image files (PNG, JPG, JPEG).
    Maximum file size: 10MB.
    
    Requires HR user authentication.
    """
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


@router.post("/generate-interview-report-test")
async def generate_interview_report_test_endpoint(
    audio_file: UploadFile = File(...),
    parsed_resume_data: str = Form(...),
):
    """
    TEST ENDPOINT - No authentication required for testing
    """
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


@router.post("/generate-interview-report")
async def generate_interview_report_endpoint(
    audio_file: UploadFile = File(...),
    parsed_resume_data: str = Form(...),
    current_user: User = Depends(get_current_hr_user),
):
    """
    Generate a comprehensive interview evaluation report from audio recording and resume data.
    
    Accepts an audio file of an interview recording and parsed resume data, then generates:
    - Full transcript of the interview
    - Extracted Q&A pairs
    - Comprehensive evaluation report with scores, strengths, weaknesses, and recommendations
    
    Supports audio formats: mp3, wav, m4a, webm
    Maximum file size: 50MB
    
    Requires HR user authentication.
    """
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
