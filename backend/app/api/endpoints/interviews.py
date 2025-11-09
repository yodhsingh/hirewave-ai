from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.base import get_db
from app.models.candidate import Candidate, InterviewResponse, CandidateStatus
from app.models.job import Job
from app.models.invite import Invite, InviteStatus
from app.schemas.candidate import InterviewSubmitRequest, InterviewSubmitResponse
from app.schemas.job import JobResponse, QuestionResponse
from app.schemas.common import ApiResponse
from app.services.storage import storage_service
from app.tasks.interview_tasks import process_interview_submission
from typing import Optional

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.get("/{token}", response_model=ApiResponse[JobResponse])
async def get_interview_questions(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Get interview questions for a candidate (public endpoint)"""
    # Find candidate by token
    result = await db.execute(
        select(Candidate)
        .options(selectinload(Candidate.job).selectinload(Job.questions))
        .filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation token",
        )

    # Update status to started if not already
    if candidate.status == CandidateStatus.INVITED:
        candidate.status = CandidateStatus.STARTED
        candidate.started_at = datetime.utcnow()

        # Update invite status
        result = await db.execute(
            select(Invite).filter(Invite.token == token)
        )
        invite = result.scalar_one_or_none()
        if invite:
            if invite.status == InviteStatus.SENT:
                invite.status = InviteStatus.OPENED
                invite.opened_at = datetime.utcnow()

        await db.commit()

    # Return job with questions
    job_response = JobResponse.model_validate(candidate.job)
    return ApiResponse(success=True, data=job_response)


@router.post("/{token}/responses", response_model=ApiResponse[dict])
async def save_response(
    token: str,
    question_id: str,
    content: str = Form(...),
    duration: Optional[int] = Form(None),
    type: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Save individual interview response"""
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation token",
        )

    # Update status to in_progress
    if candidate.status == CandidateStatus.STARTED:
        candidate.status = CandidateStatus.IN_PROGRESS

    candidate.last_activity_at = datetime.utcnow()

    # Check if response already exists
    result = await db.execute(
        select(InterviewResponse)
        .filter(InterviewResponse.candidate_id == candidate.id)
        .filter(InterviewResponse.question_id == question_id)
    )
    existing_response = result.scalar_one_or_none()

    if existing_response:
        # Update existing response
        existing_response.content = content
        existing_response.duration = duration
        existing_response.retries += 1
        existing_response.submitted_at = datetime.utcnow()
    else:
        # Create new response
        response = InterviewResponse(
            candidate_id=candidate.id,
            question_id=question_id,
            type=type,
            content=content,
            duration=duration,
            retries=0,
        )
        db.add(response)

    await db.commit()

    return ApiResponse(
        success=True,
        data={"message": "Response saved successfully"},
    )


@router.post("/{token}/submit", response_model=ApiResponse[InterviewSubmitResponse])
async def submit_interview(
    token: str,
    submission: InterviewSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit complete interview for processing"""
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation token",
        )

    # Save all responses
    for resp_data in submission.responses:
        result = await db.execute(
            select(InterviewResponse)
            .filter(InterviewResponse.candidate_id == candidate.id)
            .filter(InterviewResponse.question_id == resp_data.question_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.content = resp_data.content
            existing.duration = resp_data.duration
            existing.retries = resp_data.retries
        else:
            response = InterviewResponse(
                candidate_id=candidate.id,
                question_id=resp_data.question_id,
                type=resp_data.type,
                content=resp_data.content,
                duration=resp_data.duration,
                retries=resp_data.retries,
            )
            db.add(response)

    # Update candidate status
    candidate.status = CandidateStatus.SUBMITTED
    candidate.submitted_at = datetime.utcnow()

    # Update invite status
    result = await db.execute(
        select(Invite).filter(Invite.token == token)
    )
    invite = result.scalar_one_or_none()
    if invite:
        invite.status = InviteStatus.COMPLETED

    await db.commit()

    # Trigger background processing
    process_interview_submission.delay(str(candidate.id))

    return ApiResponse(
        success=True,
        data=InterviewSubmitResponse(
            success=True,
            message="Interview submitted successfully. AI analysis in progress.",
            candidate_id=candidate.id,
            submitted_at=candidate.submitted_at,
        ),
    )


@router.post("/upload/video", response_model=ApiResponse[dict])
async def upload_video(
    video: UploadFile = File(...),
    candidate_id: str = Form(...),
    question_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload video file to S3"""
    # Validate file type
    if not video.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a video",
        )

    # Get file extension
    file_extension = video.filename.split(".")[-1]
    if file_extension not in ["mp4", "webm", "mov"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported video format",
        )

    # Read file data
    file_data = await video.read()

    # Upload to S3
    url = await storage_service.upload_video(
        file_data, candidate_id, question_id, file_extension
    )

    if not url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload video",
        )

    return ApiResponse(
        success=True,
        data={
            "url": url,
            "message": "Video uploaded successfully",
        },
    )
