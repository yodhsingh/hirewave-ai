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
from app.models.company import Company
from app.models.practice_interview import PracticeSession
from app.models.user_insights import UserInsight

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
    completed_interviews = len([c for c in applications if c.status in ['SUBMITTED', 'SCORED', 'SHORTLISTED', 'HIRED']])
    in_progress = len([c for c in applications if c.status == 'IN_PROGRESS'])
    pending = len([c for c in applications if c.status in ['INVITED', 'STARTED']])

    # Get scored applications
    scored_applications = [c for c in applications if c.status == 'SCORED']

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
            select(Job, Company.name.label('company_name'))
            .outerjoin(Company, Job.company_id == Company.id)
            .where(Job.id == candidate.job_id)
        )
        row = job_result.first()

        if row:
            job = row[0]
            company_name = row[1] or "Company"
            recent_applications.append({
                "id": candidate.id,
                "jobId": job.id,
                "jobTitle": job.title,
                "company": company_name,
                "status": candidate.status,
                "inviteToken": candidate.invite_token,
                "appliedAt": candidate.invited_at.isoformat() if candidate.invited_at else None,
                "submittedAt": candidate.submitted_at.isoformat() if candidate.submitted_at else None,
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

    # Calculate readiness score from practice sessions and interviews combined
    readiness_score = 0

    # Get practice session average
    practice_avg = 0
    if practice_sessions:
        practice_scores = [s.overall_score for s in practice_sessions if s.overall_score is not None]
        if practice_scores:
            practice_avg = sum(practice_scores) / len(practice_scores)

    # Get interview average (avg_score already calculated above)
    interview_avg = float(avg_score) if avg_score else 0

    # Calculate combined readiness score
    if interview_avg > 0 and practice_avg > 0:
        # Both available: 70% interview, 30% practice (interview performance weighs more)
        readiness_score = round((interview_avg * 0.7) + (practice_avg * 0.3))
    elif interview_avg > 0:
        # Only interview scores available
        readiness_score = round(interview_avg)
    elif practice_avg > 0:
        # Only practice scores available (multiply by 0.85 to indicate it's practice, not real)
        readiness_score = round(practice_avg * 0.85)
    else:
        # No scores available
        readiness_score = 0

    # Get consolidated insights
    insight_result = await db.execute(
        select(UserInsight).where(UserInsight.user_id == current_user.id)
    )
    user_insight = insight_result.scalar_one_or_none()
    consolidated_insights = user_insight.insights if user_insight else []

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
                "readiness_score": min(100, readiness_score),
                "practice_streak": practice_streak,
                "improvement_rate": improvement_rate,
            },
            "recent_applications": recent_applications,
            "recent_activity": recent_activity,
            "skill_progress": skill_progress,
            "consolidated_insights": consolidated_insights,
        }
    }
