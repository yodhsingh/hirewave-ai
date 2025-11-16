"""Applicant Profile Model for storing comprehensive candidate information"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base


class ApplicantProfile(Base):
    """
    Store comprehensive profile information for applicants/candidates
    This includes all parsed resume data and user-entered information
    """
    __tablename__ = "applicant_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Personal Information
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)

    # Social Links
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)

    # Professional Summary
    summary = Column(Text, nullable=True)

    # Current Position
    current_job_title = Column(String(255), nullable=True)
    current_company = Column(String(255), nullable=True)
    years_of_experience = Column(String(50), nullable=True)

    # Education (stored as text for simplicity, could be JSONB for multiple degrees)
    education = Column(Text, nullable=True)

    # Work Experience (stored as JSONB array for multiple positions)
    work_experience = Column(JSONB, nullable=True)
    # Format: [
    #   {
    #     "company": "Company Name",
    #     "position": "Job Title",
    #     "location": "City, State",
    #     "start_date": "2020-01",
    #     "end_date": "2023-12",
    #     "description": "Job responsibilities..."
    #   }
    # ]

    # Skills (stored as JSONB)
    skills = Column(JSONB, nullable=True)
    # Format: {
    #   "technical": ["Python", "JavaScript", ...],
    #   "soft": ["Leadership", "Communication", ...],
    #   "languages": ["English", "Spanish", ...],
    #   "tools": ["Docker", "AWS", ...]
    # }

    # Certifications (stored as JSONB array)
    certifications = Column(JSONB, nullable=True)
    # Format: [
    #   {
    #     "name": "AWS Certified",
    #     "issuer": "Amazon",
    #     "date": "2023-01"
    #   }
    # ]

    # Projects (stored as JSONB array)
    projects = Column(JSONB, nullable=True)
    # Format: [
    #   {
    #     "name": "Project Name",
    #     "description": "Project description",
    #     "technologies": ["React", "Node.js"],
    #     "url": "https://github.com/..."
    #   }
    # ]

    # Achievements
    achievements = Column(JSONB, nullable=True)  # Array of strings

    # Languages Spoken
    languages_spoken = Column(JSONB, nullable=True)  # Array of strings

    # Preferences
    expected_salary = Column(String(100), nullable=True)
    availability = Column(String(50), nullable=True)  # immediate, 2_weeks, 1_month, etc.
    work_type = Column(String(50), nullable=True)  # full-time, part-time, contract, etc.
    preferred_location = Column(String(50), nullable=True)  # remote, onsite, hybrid
    desired_roles = Column(JSONB, nullable=True)  # Array of job titles
    industries = Column(JSONB, nullable=True)  # Array of industry preferences

    # Resume file reference
    resume_url = Column(String(500), nullable=True)
    resume_parsed_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", backref="profile", uselist=False)

    def __repr__(self):
        return f"<ApplicantProfile {self.user_id}: {self.full_name}>"