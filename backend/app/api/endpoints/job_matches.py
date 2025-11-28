"""
Job Match Endpoints - Calculate and retrieve match scores between candidates and jobs
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel, Field

from app.db.base import get_db
from app.models.user import User
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.applicant_profile import ApplicantProfile
from app.models.company import Company
from app.models.candidate import Candidate
from app.schemas.common import ApiResponse
from app.api.dependencies.auth import get_current_user
from app.core.config import settings

import google.generativeai as genai
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/job-matches", tags=["Job Matches"])


class JobMatchResponse(BaseModel):
    job_id: int
    match_score: int
    match_reasons: List[str] = []
    missing_skills: List[str] = []
    calculated_at: datetime
    needs_recalculation: bool = False

    class Config:
        from_attributes = True


class JobWithMatchResponse(BaseModel):
    id: int
    title: str
    description: str
    department: str
    location: str
    role_type: str = Field(alias="roleType")
    requirements: Optional[str] = None
    company_name: Optional[str] = Field(None, alias="companyName")
    created_at: datetime = Field(alias="createdAt")
    applicant_count: int = Field(0, alias="applicantCount")
    match_score: int = 0
    match_reasons: List[str] = []
    missing_skills: List[str] = []

    class Config:
        from_attributes = True
        populate_by_name = True


async def calculate_match_with_ai(
    job_requirements: str,
    job_title: str,
    job_description: str,
    candidate_skills: dict,
    candidate_experience: str,
    candidate_summary: str
) -> dict:
    """Use AI to calculate match score between job and candidate profile"""
    try:
        genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        # Flatten skills from the JSONB structure
        all_skills = []
        if candidate_skills:
            if isinstance(candidate_skills, dict):
                for category, skills_list in candidate_skills.items():
                    if isinstance(skills_list, list):
                        all_skills.extend(skills_list)
            elif isinstance(candidate_skills, list):
                all_skills = candidate_skills

        prompt = f"""Analyze the match between this job and candidate profile. Return a JSON response.

JOB:
Title: {job_title}
Description: {job_description}
Requirements: {job_requirements or 'Not specified'}

CANDIDATE:
Skills: {', '.join(all_skills) if all_skills else 'Not specified'}
Experience: {candidate_experience or 'Not specified'}
Summary: {candidate_summary or 'Not specified'}

Evaluate the match and return ONLY a JSON object with this exact structure:
{{
    "match_score": <number 0-100>,
    "match_reasons": ["reason1", "reason2", "reason3"],
    "missing_skills": ["skill1", "skill2"]
}}

Be realistic but encouraging. Focus on:
- Skills overlap between requirements and candidate skills
- Experience relevance
- Overall fit for the role

Return ONLY the JSON, no other text."""

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean up response - remove markdown code blocks if present
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()

        result = json.loads(result_text)
        return {
            "match_score": min(100, max(0, int(result.get("match_score", 50)))),
            "match_reasons": result.get("match_reasons", [])[:5],
            "missing_skills": result.get("missing_skills", [])[:5]
        }
    except Exception as e:
        logger.error(f"AI match calculation failed: {e}")
        # Fallback to simple keyword matching
        return calculate_simple_match(job_requirements, all_skills if 'all_skills' in dir() else [])


def calculate_simple_match(job_requirements: str, candidate_skills: list) -> dict:
    """Simple fallback matching based on keyword overlap"""
    if not job_requirements or not candidate_skills:
        return {
            "match_score": 50,
            "match_reasons": ["Profile incomplete - update for better matching"],
            "missing_skills": []
        }

    # Parse requirements into keywords
    req_keywords = set()
    for word in job_requirements.lower().replace(',', ' ').split():
        if len(word) > 2:
            req_keywords.add(word.strip())

    # Parse skills
    skill_keywords = set()
    for skill in candidate_skills:
        for word in skill.lower().split():
            if len(word) > 2:
                skill_keywords.add(word.strip())

    # Calculate overlap
    matching = req_keywords.intersection(skill_keywords)
    missing = req_keywords - skill_keywords

    if not req_keywords:
        score = 60
    else:
        score = min(100, int((len(matching) / len(req_keywords)) * 100) + 20)

    reasons = []
    if matching:
        reasons.append(f"Skills match: {', '.join(list(matching)[:3])}")
    if score >= 70:
        reasons.append("Good overall fit for the role")

    return {
        "match_score": score,
        "match_reasons": reasons,
        "missing_skills": list(missing)[:5]
    }


@router.get("/my-matches", response_model=ApiResponse[List[JobWithMatchResponse]])
async def get_my_job_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    recalculate: bool = False
):
    """
    Get all active jobs with match scores for the current user.
    Match scores are calculated once and cached. If profile is updated after
    the last calculation, scores will be recalculated.
    """
    # Get user's profile
    profile_result = await db.execute(
        select(ApplicantProfile).filter(ApplicantProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete your profile first."
        )

    # Get all active jobs with company names
    jobs_result = await db.execute(
        select(Job, Company.name.label('company_name'))
        .outerjoin(Company, Job.company_id == Company.id)
        .filter(Job.status == 'ACTIVE')
        .order_by(Job.created_at.desc())
    )
    jobs = jobs_result.all()

    if not jobs:
        return ApiResponse(success=True, data=[])

    # Get existing match scores for this user
    job_ids = [job[0].id for job in jobs]
    matches_result = await db.execute(
        select(JobMatch).filter(
            and_(
                JobMatch.user_id == current_user.id,
                JobMatch.job_id.in_(job_ids)
            )
        )
    )
    existing_matches = {m.job_id: m for m in matches_result.scalars().all()}

    response_data = []
    for job_row in jobs:
        job = job_row[0]
        company_name = job_row[1]

        # Get applicant count
        count_result = await db.execute(
            select(Candidate.id).filter(Candidate.job_id == job.id)
        )
        applicant_count = len(count_result.all())

        existing_match = existing_matches.get(job.id)
        needs_recalc = False

        # Check if we need to recalculate
        if existing_match:
            # Recalculate if profile was updated after the match was calculated
            if profile.updated_at and existing_match.calculated_at:
                if profile.updated_at > existing_match.calculated_at:
                    needs_recalc = True
        else:
            needs_recalc = True

        if needs_recalc or recalculate:
            # Calculate new match score
            match_data = await calculate_match_with_ai(
                job_requirements=job.requirements or "",
                job_title=job.title,
                job_description=job.description,
                candidate_skills=profile.skills or {},
                candidate_experience=profile.years_of_experience or "",
                candidate_summary=profile.summary or ""
            )

            # Save or update match
            if existing_match:
                existing_match.match_score = match_data["match_score"]
                existing_match.match_reasons = match_data["match_reasons"]
                existing_match.missing_skills = match_data["missing_skills"]
                existing_match.calculated_at = datetime.utcnow()
                existing_match.profile_updated_at = profile.updated_at
            else:
                new_match = JobMatch(
                    user_id=current_user.id,
                    job_id=job.id,
                    match_score=match_data["match_score"],
                    match_reasons=match_data["match_reasons"],
                    missing_skills=match_data["missing_skills"],
                    profile_updated_at=profile.updated_at
                )
                db.add(new_match)
                existing_match = new_match

            await db.commit()

        response_data.append(JobWithMatchResponse(
            id=job.id,
            title=job.title,
            description=job.description,
            department=job.department,
            location=job.location,
            roleType=job.role_type,
            requirements=job.requirements,
            companyName=company_name,
            createdAt=job.created_at,
            applicantCount=applicant_count,
            match_score=existing_match.match_score if existing_match else 0,
            match_reasons=existing_match.match_reasons or [] if existing_match else [],
            missing_skills=existing_match.missing_skills or [] if existing_match else []
        ))

    # Sort by match score descending
    response_data.sort(key=lambda x: x.match_score, reverse=True)

    return ApiResponse(success=True, data=response_data)


@router.post("/calculate/{job_id}", response_model=ApiResponse[JobMatchResponse])
async def calculate_job_match(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Calculate or recalculate match score for a specific job"""
    # Get job
    job_result = await db.execute(select(Job).filter(Job.id == job_id))
    job = job_result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get profile
    profile_result = await db.execute(
        select(ApplicantProfile).filter(ApplicantProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Calculate match
    match_data = await calculate_match_with_ai(
        job_requirements=job.requirements or "",
        job_title=job.title,
        job_description=job.description,
        candidate_skills=profile.skills or {},
        candidate_experience=profile.years_of_experience or "",
        candidate_summary=profile.summary or ""
    )

    # Get or create match record
    match_result = await db.execute(
        select(JobMatch).filter(
            and_(JobMatch.user_id == current_user.id, JobMatch.job_id == job_id)
        )
    )
    existing_match = match_result.scalar_one_or_none()

    if existing_match:
        existing_match.match_score = match_data["match_score"]
        existing_match.match_reasons = match_data["match_reasons"]
        existing_match.missing_skills = match_data["missing_skills"]
        existing_match.calculated_at = datetime.utcnow()
        existing_match.profile_updated_at = profile.updated_at
    else:
        existing_match = JobMatch(
            user_id=current_user.id,
            job_id=job_id,
            match_score=match_data["match_score"],
            match_reasons=match_data["match_reasons"],
            missing_skills=match_data["missing_skills"],
            profile_updated_at=profile.updated_at
        )
        db.add(existing_match)

    await db.commit()
    await db.refresh(existing_match)

    return ApiResponse(success=True, data=JobMatchResponse(
        job_id=job_id,
        match_score=existing_match.match_score,
        match_reasons=existing_match.match_reasons or [],
        missing_skills=existing_match.missing_skills or [],
        calculated_at=existing_match.calculated_at,
        needs_recalculation=False
    ))
