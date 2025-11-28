from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.base import get_db
from app.models.user import User
from app.models.company import Company
from app.models.job import Job, Question, JobStatus
from app.models.candidate import Candidate, CandidateStatus
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse, JobStats, PublicJobResponse, PublicJobListResponse, QuestionResponse
from app.schemas.common import ApiResponse
from app.api.dependencies.auth import get_current_hr_user, get_current_user
from pydantic import BaseModel
from datetime import datetime
import secrets

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# ========== PUBLIC ENDPOINTS (No Auth Required) ==========

@router.get("/public", response_model=ApiResponse[List[PublicJobListResponse]])
async def list_public_jobs(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    department: Optional[str] = None,
    location: Optional[str] = None,
    role_type: Optional[str] = None,
):
    """
    List all active jobs for candidates to browse.

    This is a public endpoint - no authentication required.
    Only returns jobs with status=ACTIVE.
    """
    query = (
        select(Job, Company.name.label('company_name'))
        .outerjoin(Company, Job.company_id == Company.id)
        .filter(Job.status == 'ACTIVE')
        .order_by(Job.created_at.desc())
    )

    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Job.title.ilike(search_filter)) |
            (Job.description.ilike(search_filter)) |
            (Job.department.ilike(search_filter))
        )
    if department:
        query = query.filter(Job.department.ilike(f"%{department}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if role_type:
        query = query.filter(Job.role_type == role_type)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    # Build response with company name and applicant count
    jobs_response = []
    for row in rows:
        job = row[0]
        company_name = row[1]

        # Get applicant count
        count_result = await db.execute(
            select(func.count(Candidate.id)).filter(Candidate.job_id == job.id)
        )
        applicant_count = count_result.scalar() or 0

        jobs_response.append(PublicJobListResponse(
            id=job.id,
            title=job.title,
            description=job.description,
            department=job.department,
            location=job.location,
            role_type=job.role_type,
            requirements=job.requirements,
            company_name=company_name,
            created_at=job.created_at,
            applicant_count=applicant_count,
        ))

    return ApiResponse(success=True, data=jobs_response)


@router.get("/public/{job_id}", response_model=ApiResponse[PublicJobResponse])
async def get_public_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get public job details for candidates.

    This is a public endpoint - no authentication required.
    Only returns jobs with status=ACTIVE.
    """
    result = await db.execute(
        select(Job, Company.name.label('company_name'))
        .outerjoin(Company, Job.company_id == Company.id)
        .options(selectinload(Job.questions))
        .filter(Job.id == job_id)
        .filter(Job.status == 'ACTIVE')
    )
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not active",
        )

    job = row[0]
    company_name = row[1]

    # Get applicant count
    count_result = await db.execute(
        select(func.count(Candidate.id)).filter(Candidate.job_id == job.id)
    )
    applicant_count = count_result.scalar() or 0

    return ApiResponse(success=True, data=PublicJobResponse(
        id=job.id,
        title=job.title,
        description=job.description,
        department=job.department,
        location=job.location,
        role_type=job.role_type,
        requirements=job.requirements,
        company_name=company_name,
        created_at=job.created_at,
        applicant_count=applicant_count,
        questions=[QuestionResponse.model_validate(q) for q in job.questions],
    ))


# ========== APPLICANT ENDPOINTS (Auth Required) ==========

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: Optional[str]
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True


class MyApplicationsResponse(BaseModel):
    applications: List[ApplicationResponse]


@router.post("/public/{job_id}/apply", response_model=ApiResponse[ApplicationResponse])
async def apply_to_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Apply to a job as a logged-in candidate.
    Creates a new candidate record linked to the job.
    """
    # Check if job exists and is active
    result = await db.execute(
        select(Job, Company.name.label('company_name'))
        .outerjoin(Company, Job.company_id == Company.id)
        .filter(Job.id == job_id)
        .filter(Job.status == 'ACTIVE')
    )
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not active",
        )

    job = row[0]
    company_name = row[1]

    # Check if already applied
    existing = await db.execute(
        select(Candidate).filter(
            Candidate.job_id == job_id,
            Candidate.email == current_user.email
        )
    )
    existing_candidate = existing.scalar_one_or_none()

    if existing_candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job",
        )

    # Create candidate record
    invite_token = secrets.token_urlsafe(32)
    candidate = Candidate(
        email=current_user.email,
        name=current_user.name,
        job_id=job_id,
        invite_token=invite_token,
        status=CandidateStatus.INVITED,
        invited_at=datetime.utcnow(),
    )

    db.add(candidate)
    await db.commit()
    await db.refresh(candidate)

    return ApiResponse(success=True, data=ApplicationResponse(
        id=candidate.id,
        job_id=job_id,
        job_title=job.title,
        company_name=company_name,
        status=candidate.status,
        applied_at=candidate.invited_at,
    ))


@router.get("/my-applications", response_model=ApiResponse[List[ApplicationResponse]])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all job applications for the current user.
    """
    result = await db.execute(
        select(Candidate, Job.title, Company.name)
        .join(Job, Candidate.job_id == Job.id)
        .outerjoin(Company, Job.company_id == Company.id)
        .filter(Candidate.email == current_user.email)
        .order_by(Candidate.invited_at.desc())
    )
    rows = result.all()

    applications = []
    for row in rows:
        candidate = row[0]
        job_title = row[1]
        company_name = row[2]

        applications.append(ApplicationResponse(
            id=candidate.id,
            job_id=candidate.job_id,
            job_title=job_title,
            company_name=company_name,
            status=candidate.status,
            applied_at=candidate.invited_at,
        ))

    return ApiResponse(success=True, data=applications)


@router.get("/public/{job_id}/application-status")
async def get_application_status(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Check if the current user has applied to a specific job.
    """
    result = await db.execute(
        select(Candidate).filter(
            Candidate.job_id == job_id,
            Candidate.email == current_user.email
        )
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        return ApiResponse(success=True, data={"applied": False, "status": None})

    return ApiResponse(success=True, data={
        "applied": True,
        "status": candidate.status,
        "applied_at": candidate.invited_at,
        "invite_token": candidate.invite_token,
    })


# ========== HR ENDPOINTS (Auth Required) ==========

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
        status=job_data.status,  # Allow setting status from frontend
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
            time_limit=q_data.time_limit,
            options=q_data.options,
            code_template=q_data.code_template,
            correct_answer=q_data.correct_answer,
            required=q_data.required,
            order=q_data.order,
        )
        db.add(question)

    await db.commit()

    # Re-fetch job with questions loaded
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.questions))
        .filter(Job.id == job.id)
    )
    job = result.scalar_one()

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
