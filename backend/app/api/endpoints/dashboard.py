"""
Dashboard endpoints for applicant/candidate users
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.db.base import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.candidate import Candidate, CandidateScore
from app.models.job import Job

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/applicant")
async def get_applicant_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get dashboard data for applicant/candidate user
    Returns stats, applications, and activity
    """

    # Get all candidate applications for this user (matching by email)
    result = await db.execute(
        select(Candidate)
        .where(Candidate.email == current_user.email)
        .order_by(Candidate.invited_at.desc())
    )
    applications = result.scalars().all()

    # Calculate stats
    total_applications = len(applications)
    completed_interviews = len([c for c in applications if c.status in ['submitted', 'scored', 'shortlisted', 'hired']])
    in_progress = len([c for c in applications if c.status == 'in_progress'])
    pending = len([c for c in applications if c.status in ['invited', 'started']])

    # Get scored applications
    scored_applications = [c for c in applications if c.status == 'scored']

    # Calculate average score
    if scored_applications:
        result = await db.execute(
            select(func.avg(CandidateScore.overall_score))
            .join(Candidate, CandidateScore.candidate_id == Candidate.id)
            .where(Candidate.email == current_user.email)
            .where(CandidateScore.overall_score.isnot(None))
        )
        avg_score = result.scalar() or 0
    else:
        avg_score = 0

    # Get recent applications with job details
    recent_applications = []
    for candidate in applications[:5]:  # Last 5 applications
        job_result = await db.execute(
            select(Job).where(Job.id == candidate.job_id)
        )
        job = job_result.scalar_one_or_none()

        if job:
            recent_applications.append({
                "id": candidate.id,
                "job_title": job.title,
                "company": "HireWave.AI",  # You can add company field to Job model
                "status": candidate.status,
                "applied_at": candidate.invited_at.isoformat() if candidate.invited_at else None,
                "submitted_at": candidate.submitted_at.isoformat() if candidate.submitted_at else None,
            })

    # Get recent activity
    recent_activity = []
    for candidate in applications[:10]:
        if candidate.submitted_at:
            recent_activity.append({
                "type": "interview",
                "title": f"Completed interview",
                "time": candidate.submitted_at.isoformat(),
                "details": f"Job ID: {candidate.job_id}"
            })
        elif candidate.started_at:
            recent_activity.append({
                "type": "started",
                "title": f"Started interview",
                "time": candidate.started_at.isoformat(),
                "details": f"Job ID: {candidate.job_id}"
            })

    # Sort by time
    recent_activity.sort(key=lambda x: x['time'], reverse=True)
    recent_activity = recent_activity[:5]

    return {
        "success": True,
        "data": {
            "user": {
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role,
            },
            "stats": {
                "total_applications": total_applications,
                "completed_interviews": completed_interviews,
                "in_progress": in_progress,
                "pending": pending,
                "average_score": round(float(avg_score), 1) if avg_score else 0,
                "readiness_score": min(100, round(float(avg_score or 60), 0)),  # Use avg score as readiness
                "practice_streak": 0,  # Not implemented yet
                "improvement_rate": 0,  # Not implemented yet
            },
            "recent_applications": recent_applications,
            "recent_activity": recent_activity,
        }
    }
