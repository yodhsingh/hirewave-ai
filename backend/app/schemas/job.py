from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.job import JobStatus, RoleType, QuestionType


class QuestionBase(BaseModel):
    """Base question schema"""

    type: QuestionType
    question: str = Field(..., min_length=10)
    time_limit: Optional[int] = None  # seconds
    options: Optional[List[str]] = None
    code_template: Optional[str] = None
    correct_answer: Optional[str] = None
    required: bool = True
    order: int


class QuestionCreate(QuestionBase):
    """Question creation schema"""

    pass


class QuestionResponse(QuestionBase):
    """Question response schema"""

    id: int
    job_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class JobStats(BaseModel):
    """Job statistics schema"""

    invited: int = 0
    started: int = 0
    in_progress: int = 0
    submitted: int = 0
    scored: int = 0
    shortlisted: int = 0
    rejected: int = 0
    total: int = 0


class JobBase(BaseModel):
    """Base job schema"""

    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=50, max_length=5000)
    department: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    role_type: RoleType
    requirements: Optional[str] = None


class JobCreate(JobBase):
    """Job creation schema"""

    questions: List[QuestionCreate] = Field(..., min_items=3, max_items=15)


class JobUpdate(BaseModel):
    """Job update schema"""

    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=50, max_length=5000)
    department: Optional[str] = None
    location: Optional[str] = None
    role_type: Optional[RoleType] = None
    requirements: Optional[str] = None
    status: Optional[JobStatus] = None


class JobResponse(JobBase):
    """Job response schema"""

    id: int
    status: JobStatus
    company_id: Optional[int] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    questions: List[QuestionResponse] = []
    stats: JobStats = Field(default_factory=JobStats)

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """Job list item (without questions)"""

    id: int
    title: str
    department: str
    location: str
    role_type: RoleType
    status: JobStatus
    created_at: datetime
    stats: JobStats = Field(default_factory=JobStats)

    class Config:
        from_attributes = True
