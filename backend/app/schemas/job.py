from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.job import JobStatus, RoleType, QuestionType


class QuestionBase(BaseModel):
    """
    Base interview question schema.

    Questions are embedded within jobs and define what candidates will be asked.
    """

    type: QuestionType = Field(
        ...,
        description="Question type: text, video, audio, code, or multiple_choice",
        example="text"
    )
    question: str = Field(
        ...,
        min_length=10,
        description="The question text shown to candidates",
        example="Describe your experience with Python and FastAPI"
    )
    time_limit: Optional[int] = Field(
        None,
        alias='timeLimit',
        ge=30,
        le=3600,
        description="Time limit in seconds (30s - 1 hour). Null for no limit.",
        example=300
    )
    options: Optional[List[str]] = Field(
        None,
        description="Answer options for multiple_choice questions",
        example=["Option A", "Option B", "Option C", "Option D"]
    )
    code_template: Optional[str] = Field(
        None,
        alias='codeTemplate',
        description="Starting code template for coding questions",
        example="def solution(arr):\n    # Your code here\n    pass"
    )
    correct_answer: Optional[str] = Field(
        None,
        alias='correctAnswer',
        description="Correct answer for objective questions (used for AI evaluation)",
        example="Option B"
    )
    required: bool = Field(
        True,
        description="Whether answering this question is mandatory",
        example=True
    )
    order: int = Field(
        ...,
        ge=1,
        description="Display order (1-indexed)",
        example=1
    )

    class Config:
        populate_by_name = True  # Allow both camelCase and snake_case


class QuestionCreate(QuestionBase):
    """
    Schema for creating interview questions.

    Questions are created as part of job posting creation.
    """

    class Config:
        json_schema_extra = {
            "example": {
                "type": "text",
                "question": "Tell us about your experience with cloud technologies (AWS, Azure, GCP)",
                "timeLimit": 300,
                "required": True,
                "order": 1
            }
        }


class QuestionResponse(QuestionBase):
    """
    Interview question response with metadata.

    Returned when fetching job details or interview questions.
    """

    id: int = Field(..., description="Unique question identifier", example=123)
    job_id: int = Field(..., description="Associated job ID", example=45)
    created_at: datetime = Field(
        ...,
        description="Question creation timestamp",
        example="2024-01-15T10:00:00Z"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 123,
                "job_id": 45,
                "type": "text",
                "question": "Describe your experience with Python and FastAPI",
                "timeLimit": 300,
                "options": None,
                "codeTemplate": None,
                "correctAnswer": None,
                "required": True,
                "order": 1,
                "created_at": "2024-01-15T10:00:00Z"
            }
        }


class JobStats(BaseModel):
    """
    Candidate pipeline statistics for a job.

    Tracks candidate progress through the interview funnel.
    """

    invited: int = Field(0, description="Candidates invited but haven't started", example=25)
    started: int = Field(0, description="Candidates who accessed questions", example=20)
    in_progress: int = Field(0, description="Candidates currently taking interview", example=15)
    submitted: int = Field(0, description="Candidates who completed interview", example=18)
    scored: int = Field(0, description="Interviews evaluated by AI", example=18)
    shortlisted: int = Field(0, description="Candidates marked for next round", example=8)
    rejected: int = Field(0, description="Candidates not moving forward", example=10)
    total: int = Field(0, description="Total candidates for this job", example=25)

    class Config:
        json_schema_extra = {
            "example": {
                "invited": 50,
                "started": 45,
                "in_progress": 10,
                "submitted": 35,
                "scored": 35,
                "shortlisted": 12,
                "rejected": 23,
                "total": 50
            }
        }


class JobBase(BaseModel):
    """
    Base job posting schema.

    Contains core job information without metadata.
    """

    title: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Job position title",
        example="Senior Backend Engineer"
    )
    description: str = Field(
        ...,
        min_length=50,
        max_length=5000,
        description="Detailed job description and responsibilities",
        example="We're seeking an experienced backend engineer to join our platform team..."
    )
    department: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Department or team",
        example="Engineering"
    )
    location: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Job location (city, remote, hybrid, etc.)",
        example="San Francisco, CA (Hybrid)"
    )
    role_type: RoleType = Field(
        ...,
        alias='roleType',
        description="Employment type: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, etc.",
        example="FULL_TIME"
    )
    requirements: Optional[str] = Field(
        None,
        description="Required skills, experience, and qualifications",
        example="5+ years Python experience, FastAPI, PostgreSQL, cloud platforms"
    )

    class Config:
        populate_by_name = True  # Allow both camelCase and snake_case


class JobCreate(JobBase):
    """
    Schema for creating a new job posting.

    Requires 3-15 interview questions to be defined upfront.
    """

    questions: List[QuestionCreate] = Field(
        default=[],
        max_items=15,
        description="Interview questions (maximum 15)"
    )
    status: Optional[JobStatus] = Field(
        JobStatus.DRAFT,
        description="Initial status (defaults to DRAFT)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Senior Backend Engineer",
                "description": "Join our platform team to build scalable APIs using FastAPI...",
                "department": "Engineering",
                "location": "San Francisco, CA (Hybrid)",
                "roleType": "FULL_TIME",
                "requirements": "5+ years Python, FastAPI, PostgreSQL, AWS",
                "questions": [
                    {
                        "type": "text",
                        "question": "Describe your experience with microservices architecture",
                        "timeLimit": 300,
                        "required": True,
                        "order": 1
                    },
                    {
                        "type": "code",
                        "question": "Implement a function to validate email addresses",
                        "codeTemplate": "def validate_email(email: str) -> bool:\n    pass",
                        "timeLimit": 600,
                        "required": True,
                        "order": 2
                    },
                    {
                        "type": "video",
                        "question": "Tell us why you're interested in this position",
                        "timeLimit": 180,
                        "required": True,
                        "order": 3
                    }
                ],
                "status": "DRAFT"
            }
        }


class JobUpdate(BaseModel):
    """
    Schema for updating an existing job posting.

    All fields are optional - only provided fields will be updated.
    """

    title: Optional[str] = Field(
        None,
        min_length=3,
        max_length=255,
        description="Updated job title"
    )
    description: Optional[str] = Field(
        None,
        min_length=50,
        max_length=5000,
        description="Updated job description"
    )
    department: Optional[str] = Field(None, description="Updated department")
    location: Optional[str] = Field(None, description="Updated location")
    role_type: Optional[RoleType] = Field(None, description="Updated employment type")
    requirements: Optional[str] = Field(None, description="Updated requirements")
    status: Optional[JobStatus] = Field(None, description="Updated status (DRAFT, ACTIVE, CLOSED)")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "ACTIVE",
                "location": "Remote"
            }
        }


class JobResponse(JobBase):
    """
    Complete job posting response with all details.

    Includes questions, statistics, and metadata.
    """

    id: int = Field(..., description="Unique job identifier", example=45)
    status: JobStatus = Field(..., description="Current job status", example="ACTIVE")
    company_id: Optional[int] = Field(None, description="Associated company ID", example=5)
    created_by: int = Field(..., description="User ID of job creator (HR)", example=15)
    created_at: datetime = Field(..., description="Job creation timestamp", example="2024-01-15T10:00:00Z")
    updated_at: datetime = Field(..., description="Last update timestamp", example="2024-01-16T14:30:00Z")
    closed_at: Optional[datetime] = Field(None, description="Job closure timestamp", example=None)
    questions: List[QuestionResponse] = Field(default_factory=list, description="Interview questions")
    stats: JobStats = Field(default_factory=JobStats, description="Candidate pipeline statistics")

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """
    Lightweight job listing item without questions.

    Used in list views for better performance.
    """

    id: int = Field(..., description="Job ID", example=45)
    title: str = Field(..., description="Job title", example="Senior Backend Engineer")
    department: str = Field(..., description="Department", example="Engineering")
    location: str = Field(..., description="Location", example="San Francisco, CA")
    role_type: RoleType = Field(..., description="Employment type", example="FULL_TIME")
    status: JobStatus = Field(..., description="Job status", example="ACTIVE")
    created_at: datetime = Field(..., description="Creation date", example="2024-01-15T10:00:00Z")
    stats: JobStats = Field(default_factory=JobStats, description="Applicant statistics")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 45,
                "title": "Senior Backend Engineer",
                "department": "Engineering",
                "location": "San Francisco, CA (Hybrid)",
                "role_type": "FULL_TIME",
                "status": "ACTIVE",
                "created_at": "2024-01-15T10:00:00Z",
                "stats": {
                    "invited": 50,
                    "started": 45,
                    "in_progress": 10,
                    "submitted": 35,
                    "scored": 35,
                    "shortlisted": 12,
                    "rejected": 23,
                    "total": 50
                }
            }
        }


class PublicJobListResponse(BaseModel):
    """
    Public job listing for candidates browsing jobs.

    Includes company name and basic job info.
    """

    id: int = Field(..., description="Job ID", example=45)
    title: str = Field(..., description="Job title", example="Senior Backend Engineer")
    description: str = Field(..., description="Job description")
    department: str = Field(..., description="Department", example="Engineering")
    location: str = Field(..., description="Location", example="San Francisco, CA")
    role_type: RoleType = Field(..., alias="roleType", description="Employment type", example="FULL_TIME")
    requirements: Optional[str] = Field(None, description="Job requirements")
    company_name: Optional[str] = Field(None, alias="companyName", description="Company name", example="TechCorp Inc.")
    created_at: datetime = Field(..., alias="createdAt", description="Creation date")
    applicant_count: int = Field(0, alias="applicantCount", description="Number of applicants")

    class Config:
        from_attributes = True
        populate_by_name = True


class PublicJobResponse(PublicJobListResponse):
    """
    Full public job details with questions for candidates.
    """

    questions: List[QuestionResponse] = Field(default_factory=list, description="Interview questions")
