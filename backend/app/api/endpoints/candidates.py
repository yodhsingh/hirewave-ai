from typing import List
from uuid import uuid4
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.base import get_db
from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate, CandidateStatus
from app.models.invite import Invite, InviteStatus
from app.schemas.candidate import (
    CandidateResponse,
    CandidateListItem,
    CandidateUpdate,
    BulkInviteRequest,
    BulkInviteResponse,
    Score,
    ScoreBreakdown,
    InterviewResponseFull,
)
from app.schemas.common import ApiResponse
from app.api.dependencies.auth import get_current_hr_user
from app.services.email_service import email_service
import secrets

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/{candidate_id}", response_model=ApiResponse[CandidateResponse])
async def get_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Get candidate details"""
    result = await db.execute(
        select(Candidate)
        .options(
            selectinload(Candidate.responses),
            selectinload(Candidate.score),
            selectinload(Candidate.job),
        )
        .filter(Candidate.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    # Check access
    if current_user.company_id and candidate.job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Build score response
    score = None
    if candidate.score:
        cs = candidate.score

        # Build breakdown
        breakdown = None
        if cs.communication or cs.technical_skills or cs.problem_solving or cs.culture_fit or cs.experience:
            breakdown = ScoreBreakdown(
                communication=cs.communication,
                technical_skills=cs.technical_skills,
                problem_solving=cs.problem_solving,
                culture_fit=cs.culture_fit,
                experience=cs.experience,
            )

        # Build AI insights
        ai_insights = None
        if cs.summary or cs.strengths or cs.weaknesses:
            ai_insights = {
                "summary": cs.summary or "",
                "strengths": cs.strengths or [],
                "weaknesses": cs.weaknesses or [],
                "red_flags": cs.red_flags or [],
                "recommendations": cs.recommendations or [],
                "confidence_level": cs.confidence_level or 0,
            }

        score = Score(
            overall=cs.overall_score,
            ai_score=cs.ai_score,
            human_score=cs.human_score,
            breakdown=breakdown,
            scored_at=cs.scored_at,
            scored_by=cs.scored_by,
            ai_insights=ai_insights,
            skills_extracted=cs.skills_extracted or [],
            competency_ranking=cs.competency_ranking,
        )

    # Build responses array
    responses_list = []
    for resp in candidate.responses:
        response_item = InterviewResponseFull(
            id=resp.id,
            candidate_id=resp.candidate_id,
            question_id=resp.question_id,
            type=resp.type,
            content=resp.content,
            duration=resp.duration,
            retries=resp.retries,
            transcript=resp.transcript,
            submitted_at=resp.submitted_at,
            question_score=resp.question_score,
            question_feedback=resp.question_feedback,
            keywords_found=resp.keywords_found,
        )
        responses_list.append(response_item)

    # Build response manually to avoid model_validate trying to auto-populate score
    response = CandidateResponse(
        id=candidate.id,
        email=candidate.email,
        name=candidate.name,
        phone=candidate.phone,
        resume_url=candidate.resume_url,
        linkedin_url=candidate.linkedin_url,
        job_id=candidate.job_id,
        invite_token=candidate.invite_token,
        status=candidate.status,
        invited_at=candidate.invited_at,
        started_at=candidate.started_at,
        submitted_at=candidate.submitted_at,
        last_activity_at=candidate.last_activity_at,
        notes=candidate.notes,
        tags=candidate.tags,
        responses=responses_list,
        score=score,
    )

    return ApiResponse(success=True, data=response)


@router.patch("/{candidate_id}", response_model=ApiResponse[CandidateResponse])
async def update_candidate(
    candidate_id: int,
    update_data: CandidateUpdate,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Update candidate (status, notes, tags)"""
    result = await db.execute(
        select(Candidate)
        .options(selectinload(Candidate.job))
        .filter(Candidate.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    # Update fields
    if update_data.status:
        candidate.status = update_data.status
    if update_data.notes is not None:
        candidate.notes = update_data.notes
    if update_data.tags is not None:
        candidate.tags = update_data.tags

    await db.commit()
    await db.refresh(candidate, attribute_names=["score"])

    # Build score response
    score = None
    if candidate.score:
        cs = candidate.score

        # Build breakdown
        breakdown = None
        if cs.communication or cs.technical_skills or cs.problem_solving or cs.culture_fit or cs.experience:
            breakdown = ScoreBreakdown(
                communication=cs.communication,
                technical_skills=cs.technical_skills,
                problem_solving=cs.problem_solving,
                culture_fit=cs.culture_fit,
                experience=cs.experience,
            )

        # Build AI insights
        ai_insights = None
        if cs.summary or cs.strengths or cs.weaknesses:
            ai_insights = {
                "summary": cs.summary or "",
                "strengths": cs.strengths or [],
                "weaknesses": cs.weaknesses or [],
                "red_flags": cs.red_flags or [],
                "recommendations": cs.recommendations or [],
                "confidence_level": cs.confidence_level or 0,
            }

        score = Score(
            overall=cs.overall_score,
            ai_score=cs.ai_score,
            human_score=cs.human_score,
            breakdown=breakdown,
            scored_at=cs.scored_at,
            scored_by=cs.scored_by,
            ai_insights=ai_insights,
            skills_extracted=cs.skills_extracted or [],
            competency_ranking=cs.competency_ranking,
        )

    # Build response manually
    response = CandidateResponse(
        id=candidate.id,
        email=candidate.email,
        name=candidate.name,
        phone=candidate.phone,
        resume_url=candidate.resume_url,
        linkedin_url=candidate.linkedin_url,
        job_id=candidate.job_id,
        invite_token=candidate.invite_token,
        status=candidate.status,
        invited_at=candidate.invited_at,
        started_at=candidate.started_at,
        submitted_at=candidate.submitted_at,
        last_activity_at=candidate.last_activity_at,
        notes=candidate.notes,
        tags=candidate.tags,
        responses=[],
        score=score,
    )
    return ApiResponse(success=True, data=response)


@router.post("/{job_id}/invites", response_model=ApiResponse[BulkInviteResponse])
async def send_invites(
    job_id: int,
    invite_data: BulkInviteRequest,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Send bulk interview invites"""
    # Get job
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    sent = 0
    failed_emails = []
    expires_at = datetime.utcnow() + timedelta(days=invite_data.expires_in_days)

    for email in invite_data.emails:
        try:
            # Check if already invited
            result = await db.execute(
                select(Candidate)
                .filter(Candidate.job_id == job_id)
                .filter(Candidate.email == email)
            )
            existing = result.scalar_one_or_none()

            if existing:
                failed_emails.append(email)
                continue

            # Generate unique token
            token = secrets.token_urlsafe(32)

            # Create candidate
            candidate = Candidate(
                email=email,
                name=email.split("@")[0].title(),  # Temporary name
                job_id=job_id,
                invite_token=token,
                status=CandidateStatus.INVITED,
            )
            db.add(candidate)

            # Create invite
            invite = Invite(
                job_id=job_id,
                email=email,
                token=token,
                status=InviteStatus.PENDING,
                expires_at=expires_at,
            )
            db.add(invite)

            await db.flush()

            # Send email
            success = await email_service.send_interview_invite(
                email, candidate.name, job.title, token
            )

            if success:
                invite.status = InviteStatus.SENT
                invite.sent_at = datetime.utcnow()
                sent += 1
            else:
                failed_emails.append(email)

        except Exception as e:
            failed_emails.append(email)
            continue

    await db.commit()

    return ApiResponse(
        success=True,
        data=BulkInviteResponse(
            total=len(invite_data.emails),
            sent=sent,
            failed=len(failed_emails),
            failed_emails=failed_emails,
        ),
    )


@router.get("/{job_id}/candidates", response_model=ApiResponse[List[CandidateListItem]])
async def get_job_candidates(
    job_id: int,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all candidates for a job"""
    result = await db.execute(
        select(Candidate)
        .options(selectinload(Candidate.score))
        .filter(Candidate.job_id == job_id)
        .order_by(Candidate.invited_at.desc())
    )
    candidates = result.scalars().all()

    candidates_list = []
    for candidate in candidates:
        score = None
        if candidate.score:
            cs = candidate.score
            breakdown = None
            if cs.communication or cs.technical_skills or cs.problem_solving or cs.culture_fit or cs.experience:
                breakdown = ScoreBreakdown(
                    communication=cs.communication,
                    technical_skills=cs.technical_skills,
                    problem_solving=cs.problem_solving,
                    culture_fit=cs.culture_fit,
                    experience=cs.experience,
                )

            score = Score(
                overall=cs.overall_score,
                ai_score=cs.ai_score,
                human_score=cs.human_score,
                breakdown=breakdown,
                scored_at=cs.scored_at,
                scored_by=cs.scored_by,
            )

        # Create CandidateListItem manually to avoid Pydantic validation issues with score relationship
        item = CandidateListItem(
            id=candidate.id,
            email=candidate.email,
            name=candidate.name,
            status=candidate.status,
            invited_at=candidate.invited_at,
            submitted_at=candidate.submitted_at,
            score=score,
        )
        candidates_list.append(item)

    return ApiResponse(success=True, data=candidates_list)
