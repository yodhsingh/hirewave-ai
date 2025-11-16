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
from app.models.practice_interview import PracticeSession

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

    # Get practice sessions for skill progress
    practice_result = await db.execute(
        select(PracticeSession)
        .where(PracticeSession.user_id == current_user.id)
        .where(PracticeSession.completed_at.isnot(None))
        .order_by(PracticeSession.completed_at.desc())
    )
    practice_sessions = practice_result.scalars().all()

    # Calculate skill progress from practice sessions
    skill_progress = []
    if practice_sessions:
        # Aggregate category scores across all completed sessions
        category_totals = {
            "communication": [],
            "technical": [],
            "problem_solving": [],
            "confidence": [],
            "completeness": []
        }

        for session in practice_sessions:
            if session.category_scores:
                for category, score in session.category_scores.items():
                    if category in category_totals and score is not None:
                        category_totals[category].append(score)

        # Calculate average for each category
        for category, scores in category_totals.items():
            if scores:
                current_avg = sum(scores) / len(scores)
                # Target is 15% above current or 90, whichever is higher
                target = min(90, max(current_avg + 15, 75))

                skill_progress.append({
                    "skill": category.replace('_', ' ').title(),
                    "current": round(current_avg, 1),
                    "target": round(target, 0),
                    "trend": "up" if len(scores) > 1 and scores[0] > scores[-1] else "stable"
                })

    # If no practice sessions, use placeholder data
    if not skill_progress:
        skill_progress = [
            {"skill": "Communication", "current": 0, "target": 75, "trend": "stable"},
            {"skill": "Technical", "current": 0, "target": 75, "trend": "stable"},
            {"skill": "Problem Solving", "current": 0, "target": 75, "trend": "stable"},
            {"skill": "Confidence", "current": 0, "target": 75, "trend": "stable"},
            {"skill": "Completeness", "current": 0, "target": 75, "trend": "stable"},
        ]

    # Calculate practice streak
    practice_streak = 0
    if practice_sessions:
        # Count consecutive days with practice
        today = datetime.utcnow().date()
        for session in practice_sessions:
            session_date = session.completed_at.date()
            days_diff = (today - session_date).days
            if days_diff == practice_streak:
                practice_streak += 1
            else:
                break

    # Calculate improvement rate
    improvement_rate = 0
    if len(practice_sessions) >= 2:
        recent_avg = sum(s.overall_score or 0 for s in practice_sessions[:3]) / min(3, len(practice_sessions))
        older_avg = sum(s.overall_score or 0 for s in practice_sessions[-3:]) / min(3, len(practice_sessions))
        if older_avg > 0:
            improvement_rate = round(((recent_avg - older_avg) / older_avg) * 100, 1)

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
                "readiness_score": min(100, round(float(avg_score or 60), 0)),
                "practice_streak": practice_streak,
                "improvement_rate": improvement_rate,
            },
            "recent_applications": recent_applications,
            "recent_activity": recent_activity,
            "skill_progress": skill_progress,
        }
    }
