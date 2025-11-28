"""Resume parsing API endpoints"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.services.resume_parser import resume_parser
from app.services.resume_parser_openai import openai_resume_parser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Parse a resume file and extract structured information

    Args:
        file: Resume file (PDF, DOCX, DOC, or TXT)
        current_user: Authenticated user
        db: Database session

    Returns:
        Dictionary with parsed resume information
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
        file_ext = '.' + file.filename.split('.')[-1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )

        # Check file size (max 10MB)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 10MB"
            )

        # Check which resume parser is available (prefer OpenAI over Gemini)
        parser = None
        parser_name = "Unknown"

        if openai_resume_parser:
            parser = openai_resume_parser
            parser_name = "OpenAI"
        elif resume_parser:
            parser = resume_parser
            parser_name = "Gemini"
        else:
            raise HTTPException(
                status_code=503,
                detail="Resume parsing service is not configured. Please set up OpenAI or Google Gemini API key."
            )

        # Parse the resume
        logger.info(f"Parsing resume for user {current_user.id} using {parser_name}: {file.filename}")
        parsed_data = await parser.parse_resume(contents, file.filename)

        # Log successful parsing
        logger.info(f"Successfully parsed resume for user {current_user.id}")

        # Return parsed data
        return {
            "success": True,
            "data": parsed_data,
            "filename": file.filename,
            "message": "Resume parsed successfully"
        }

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Value error parsing resume: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error parsing resume: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse resume. Please try again."
        )