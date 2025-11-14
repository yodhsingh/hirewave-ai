from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.resume import ResumeParseResponse
from app.schemas.interview import InterviewReportResponse
from app.api.dependencies.auth import get_current_hr_user
from app.api.ai.resume_parser import parse_resume_with_gemini
from app.api.ai.interview_report import generate_interview_report
from app.core.config import settings
import json

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


@router.post("/generate-interview-report", response_model=ApiResponse[InterviewReportResponse])
async def generate_interview_report_endpoint(
    audio_file: UploadFile = File(...),
    resume_data: str = Form(...),
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
            detail="No audio file uploaded",
        )
    
    # Validate audio file format
    file_extension = audio_file.filename.lower().split(".")[-1] if audio_file.filename else ""
    if file_extension not in settings.ALLOWED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio format. Supported formats: {', '.join(settings.ALLOWED_AUDIO_FORMATS)}",
        )
    
    # Validate audio file size
    audio_content = await audio_file.read()
    file_size = len(audio_content)
    
    if file_size > settings.max_audio_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file too large. Maximum size: {settings.MAX_AUDIO_SIZE_MB}MB",
        )
    
    # Reset file pointer for processing
    await audio_file.seek(0)
    
    # Validate and parse resume data JSON
    try:
        parsed_resume_data = json.loads(resume_data)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid resume data JSON: {str(e)}",
        )
    
    # Validate resume data structure (basic validation)
    if not isinstance(parsed_resume_data, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume data must be a JSON object",
        )
    
    # Check for required fields in resume data
    required_fields = ["candidate_info"]
    missing_fields = [field for field in required_fields if field not in parsed_resume_data]
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields in resume data: {', '.join(missing_fields)}",
        )
    
    try:
        # Generate interview report
        result = await generate_interview_report(audio_file, parsed_resume_data)
        
        # Return standardized response
        return ApiResponse(
            success=True,
            data=InterviewReportResponse(**result),
        )
    
    except ValueError as e:
        # Handle validation and parsing errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating interview report: {str(e)}",
        )
