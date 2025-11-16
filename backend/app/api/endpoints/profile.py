"""Profile API endpoints for applicants"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.db.base import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.applicant_profile import ApplicantProfile
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the current user's profile
    """
    try:
        # Fetch profile for the current user
        result = await db.execute(
            select(ApplicantProfile).where(ApplicantProfile.user_id == current_user.id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            # Return empty profile structure if not found
            return {
                "success": True,
                "data": {
                    "user_id": current_user.id,
                    "full_name": current_user.name,
                    "email": current_user.email,
                    "exists": False
                }
            }

        return {
            "success": True,
            "data": {
                "user_id": profile.user_id,
                "full_name": profile.full_name or current_user.name,
                "email": profile.email or current_user.email,
                "phone": profile.phone,
                "location": profile.location,
                "linkedin_url": profile.linkedin_url,
                "github_url": profile.github_url,
                "portfolio_url": profile.portfolio_url,
                "summary": profile.summary,
                "current_job_title": profile.current_job_title,
                "current_company": profile.current_company,
                "years_of_experience": profile.years_of_experience,
                "education": profile.education,
                "work_experience": profile.work_experience,
                "skills": profile.skills,
                "certifications": profile.certifications,
                "projects": profile.projects,
                "achievements": profile.achievements,
                "languages_spoken": profile.languages_spoken,
                "expected_salary": profile.expected_salary,
                "availability": profile.availability,
                "work_type": profile.work_type,
                "preferred_location": profile.preferred_location,
                "desired_roles": profile.desired_roles,
                "industries": profile.industries,
                "resume_url": profile.resume_url,
                "resume_parsed_at": profile.resume_parsed_at.isoformat() if profile.resume_parsed_at else None,
                "created_at": profile.created_at.isoformat(),
                "updated_at": profile.updated_at.isoformat(),
                "exists": True
            }
        }

    except Exception as e:
        logger.error(f"Error fetching profile for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


@router.post("/save")
async def save_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Save or update the current user's profile
    """
    try:
        # Check if profile exists
        result = await db.execute(
            select(ApplicantProfile).where(ApplicantProfile.user_id == current_user.id)
        )
        existing_profile = result.scalar_one_or_none()

        # Prepare profile data
        profile_dict = {
            "user_id": current_user.id,
            "full_name": profile_data.get("name") or profile_data.get("full_name"),
            "email": profile_data.get("email"),
            "phone": profile_data.get("phone"),
            "location": profile_data.get("location"),
            "linkedin_url": profile_data.get("linkedinUrl") or profile_data.get("linkedin_url"),
            "github_url": profile_data.get("githubUrl") or profile_data.get("github_url"),
            "portfolio_url": profile_data.get("portfolioUrl") or profile_data.get("portfolio_url"),
            "summary": profile_data.get("summary"),
            "current_job_title": profile_data.get("currentRole") or profile_data.get("current_job_title"),
            "current_company": profile_data.get("currentCompany") or profile_data.get("current_company"),
            "years_of_experience": profile_data.get("experience") or profile_data.get("years_of_experience"),
            "education": profile_data.get("education"),
            "expected_salary": profile_data.get("expectedSalary") or profile_data.get("expected_salary"),
            "availability": profile_data.get("availability"),
            "work_type": profile_data.get("workType") or profile_data.get("work_type"),
            "preferred_location": profile_data.get("preferredLocation") or profile_data.get("preferred_location"),
        }

        # Handle JSON fields
        if "skills" in profile_data:
            skills = profile_data["skills"]
            if isinstance(skills, list):
                # If it's a simple array, convert to categorized format
                profile_dict["skills"] = {"all": skills}
            else:
                profile_dict["skills"] = skills

        if "work_experience" in profile_data or "workExperience" in profile_data:
            profile_dict["work_experience"] = profile_data.get("workExperience") or profile_data.get("work_experience")

        if "certifications" in profile_data:
            profile_dict["certifications"] = profile_data.get("certifications")

        if "projects" in profile_data:
            profile_dict["projects"] = profile_data.get("projects")

        if "achievements" in profile_data:
            profile_dict["achievements"] = profile_data.get("achievements")

        if "languages_spoken" in profile_data or "languagesSpoken" in profile_data:
            profile_dict["languages_spoken"] = profile_data.get("languagesSpoken") or profile_data.get("languages_spoken")

        if "desired_roles" in profile_data or "desiredRoles" in profile_data:
            profile_dict["desired_roles"] = profile_data.get("desiredRoles") or profile_data.get("desired_roles")

        if "industries" in profile_data:
            profile_dict["industries"] = profile_data.get("industries")

        if "resume_url" in profile_data or "resumeUrl" in profile_data:
            profile_dict["resume_url"] = profile_data.get("resumeUrl") or profile_data.get("resume_url")

        if profile_data.get("resume_parsed_at") or profile_data.get("resumeParsedAt"):
            profile_dict["resume_parsed_at"] = datetime.utcnow()

        if existing_profile:
            # Update existing profile
            for key, value in profile_dict.items():
                if value is not None and key != "user_id":  # Don't update user_id
                    setattr(existing_profile, key, value)

            await db.commit()
            await db.refresh(existing_profile)

            logger.info(f"Updated profile for user {current_user.id}")
            return {
                "success": True,
                "message": "Profile updated successfully",
                "data": {"profile_id": existing_profile.id}
            }
        else:
            # Create new profile
            new_profile = ApplicantProfile(**profile_dict)
            db.add(new_profile)
            await db.commit()
            await db.refresh(new_profile)

            logger.info(f"Created new profile for user {current_user.id}")
            return {
                "success": True,
                "message": "Profile created successfully",
                "data": {"profile_id": new_profile.id}
            }

    except Exception as e:
        logger.error(f"Error saving profile for user {current_user.id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")


@router.delete("/me")
async def delete_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Delete the current user's profile
    """
    try:
        result = await db.execute(
            select(ApplicantProfile).where(ApplicantProfile.user_id == current_user.id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        await db.delete(profile)
        await db.commit()

        logger.info(f"Deleted profile for user {current_user.id}")
        return {
            "success": True,
            "message": "Profile deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting profile for user {current_user.id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete profile")