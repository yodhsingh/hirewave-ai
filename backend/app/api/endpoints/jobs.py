from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.base import get_db
from app.models.user import User
from app.models.job import Job, Question
from app.models.candidate import Candidate, CandidateStatus
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse, JobStats
from app.schemas.common import ApiResponse
from app.api.dependencies.auth import get_current_hr_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=ApiResponse[JobResponse], status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new job posting"""
    # Create job
    job = Job(
        title=job_data.title,
        description=job_data.description,
        department=job_data.department,
        location=job_data.location,
        role_type=job_data.role_type,
        requirements=job_data.requirements,
        created_by=current_user.id,
        company_id=current_user.company_id,
    )

    db.add(job)
    await db.flush()  # Get job.id

    # Create questions
    for q_data in job_data.questions:
        question = Question(
            job_id=job.id,
            type=q_data.type,
            question=q_data.question,
            description=q_data.description,
            time_limit=q_data.time_limit,
            max_length=q_data.max_length,
            options=q_data.options,
            required=q_data.required,
            order=q_data.order,
            score_weight=q_data.score_weight,
        )
        db.add(question)

    await db.commit()
    await db.refresh(job)

    # Get stats
    stats = await _get_job_stats(job.id, db)

    response = JobResponse.model_validate(job)
    response.stats = stats

    return ApiResponse(success=True, data=response)


@router.get("", response_model=ApiResponse[List[JobListResponse]])
async def list_jobs(
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """List all jobs for current user's company"""
    query = select(Job).offset(skip).limit(limit).order_by(Job.created_at.desc())

    if current_user.company_id:
        query = query.filter(Job.company_id == current_user.company_id)

    result = await db.execute(query)
    jobs = result.scalars().all()

    # Get stats for each job
    jobs_with_stats = []
    for job in jobs:
        stats = await _get_job_stats(job.id, db)
        job_response = JobListResponse.model_validate(job)
        job_response.stats = stats
        jobs_with_stats.append(job_response)

    return ApiResponse(success=True, data=jobs_with_stats)


@router.get("/{job_id}", response_model=ApiResponse[JobResponse])
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Get job details by ID"""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.questions))
        .filter(Job.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Check company access
    if current_user.company_id and job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    stats = await _get_job_stats(job.id, db)
    response = JobResponse.model_validate(job)
    response.stats = stats

    return ApiResponse(success=True, data=response)


@router.patch("/{job_id}", response_model=ApiResponse[JobResponse])
async def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Update job details"""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Check access
    if current_user.company_id and job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Update fields
    update_data = job_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    await db.commit()
    await db.refresh(job)

    stats = await _get_job_stats(job.id, db)
    response = JobResponse.model_validate(job)
    response.stats = stats

    return ApiResponse(success=True, data=response)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_hr_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a job"""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Check access
    if current_user.company_id and job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    await db.delete(job)
    await db.commit()


async def _get_job_stats(job_id: int, db: AsyncSession) -> JobStats:
    """Helper to calculate job statistics"""
    result = await db.execute(
        select(Candidate.status, func.count(Candidate.id))
        .filter(Candidate.job_id == job_id)
        .group_by(Candidate.status)
    )
    status_counts = dict(result.all())

    stats = JobStats(
        invited=status_counts.get(CandidateStatus.INVITED, 0),
        started=status_counts.get(CandidateStatus.STARTED, 0),
        in_progress=status_counts.get(CandidateStatus.IN_PROGRESS, 0),
        submitted=status_counts.get(CandidateStatus.SUBMITTED, 0),
        scored=status_counts.get(CandidateStatus.SCORED, 0),
        shortlisted=status_counts.get(CandidateStatus.SHORTLISTED, 0),
        rejected=status_counts.get(CandidateStatus.REJECTED, 0),
    )
    stats.total = sum([
        stats.invited,
        stats.started,
        stats.in_progress,
        stats.submitted,
        stats.scored,
        stats.shortlisted,
        stats.rejected,
    ])

    return stats
