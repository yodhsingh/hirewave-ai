"""Pydantic schemas for applicant profiles"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    current_job_title: Optional[str] = None
    current_company: Optional[str] = None
    years_of_experience: Optional[str] = None
    education: Optional[str] = None
    work_experience: Optional[List[Dict[str, Any]]] = None
    skills: Optional[Dict[str, List[str]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    achievements: Optional[List[str]] = None
    languages_spoken: Optional[List[str]] = None
    expected_salary: Optional[str] = None
    availability: Optional[str] = None
    work_type: Optional[str] = None
    preferred_location: Optional[str] = None
    desired_roles: Optional[List[str]] = None
    industries: Optional[List[str]] = None


class ProfileCreate(ProfileBase):
    """Schema for creating a new profile"""
    pass


class ProfileUpdate(ProfileBase):
    """Schema for updating an existing profile"""
    pass


class ProfileResponse(ProfileBase):
    """Schema for profile response"""
    user_id: int
    exists: bool = False
    resume_url: Optional[str] = None
    resume_parsed_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True