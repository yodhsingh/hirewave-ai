from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.candidate import CandidateStatus
from app.models.job import QuestionType


class ExtractedSkill(BaseModel):
    """Extracted skill schema"""

    name: str
    category: str  # technical, soft, domain
    proficiency: str  # beginner, intermediate, advanced, expert
    years_of_experience: Optional[int] = None
    matches_job_requirement: bool
    mentioned_in: List[str]  # question IDs


class ScoreBreakdown(BaseModel):
    """Score breakdown schema"""

    communication: Optional[float] = None
    technical_skills: Optional[float] = None
    problem_solving: Optional[float] = None
    culture_fit: Optional[float] = None
    experience: Optional[float] = None


class CompetencyRanking(BaseModel):
    """Competency ranking schema"""

    percentile: float
    rank: int
    total_candidates: int = Field(alias="totalCandidates")
    top_competencies: List[str] = Field(alias="topCompetencies")
    comparison_text: str = Field(alias="comparisonText")

    class Config:
        populate_by_name = True  # Allow both camelCase and snake_case


class AIInsights(BaseModel):
    """AI insights schema"""

    summary: str
    strengths: List[str]
    weaknesses: List[str]
    red_flags: Optional[List[str]] = None
    recommendations: List[str]
    confidence_level: float


class CheatingEvidence(BaseModel):
    """Cheating evidence entry"""
    timestamp: str
    question_id: Optional[int] = None
    confidence: float
    reason: str
    evidence_type: str


class Score(BaseModel):
    """Candidate score schema"""

    overall: Optional[float] = None
    ai_score: Optional[float] = None
    human_score: Optional[float] = None
    breakdown: Optional[ScoreBreakdown] = None
    scored_at: Optional[datetime] = None
    scored_by: Optional[int] = None
    ai_insights: Optional[AIInsights] = None
    skills_extracted: Optional[List[ExtractedSkill]] = None
    competency_ranking: Optional[CompetencyRanking] = None
    # Proctoring/Cheating info
    cheating_detected: bool = False
    cheating_evidence: Optional[List[CheatingEvidence]] = None
    proctoring_score_penalty: float = 0.0


class InterviewResponseBase(BaseModel):
    """Base interview response schema"""

    question_id: int
    type: QuestionType
    content: str
    duration: Optional[int] = None
    retries: int = 0


class InterviewResponseCreate(InterviewResponseBase):
    """Interview response creation schema"""

    pass


class QuestionScore(BaseModel):
    """Question-specific score"""

    score: float
    feedback: Optional[str] = None
    keywords_found: Optional[List[str]] = None


class InterviewResponseFull(InterviewResponseBase):
    """Full interview response with AI analysis"""

    id: int
    candidate_id: int
    transcript: Optional[str] = None
    submitted_at: datetime
    question_score: Optional[float] = None
    question_feedback: Optional[dict] = None
    keywords_found: Optional[List[str]] = None
    # Question text for display (from generated interview questions)
    question_text: Optional[str] = None

    class Config:
        from_attributes = True


class CandidateBase(BaseModel):
    """Base candidate schema"""

    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class CandidateCreate(CandidateBase):
    """Candidate creation schema"""

    job_id: int


class CandidateUpdate(BaseModel):
    """Candidate update schema"""

    status: Optional[CandidateStatus] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class CandidateResponse(CandidateBase):
    """Candidate response schema"""

    id: int
    job_id: int
    invite_token: str
    status: CandidateStatus
    invited_at: datetime
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    last_activity_at: Optional[datetime] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    responses: List[InterviewResponseFull] = []
    score: Optional[Score] = None

    class Config:
        from_attributes = True


class CandidateListItem(BaseModel):
    """Candidate list item (without full responses)"""

    id: int
    email: str
    name: str
    status: CandidateStatus
    invited_at: datetime
    submitted_at: Optional[datetime] = None
    score: Optional[Score] = None

    class Config:
        from_attributes = True


class BulkInviteRequest(BaseModel):
    """Bulk invite request schema"""

    emails: List[EmailStr] = Field(..., min_items=1, max_items=200)
    expires_in_days: int = Field(default=7, ge=1, le=30)
    send_reminders: bool = True


class BulkInviteResponse(BaseModel):
    """Bulk invite response schema"""

    total: int
    sent: int
    failed: int
    failed_emails: List[str] = []


class InterviewSubmitRequest(BaseModel):
    """Interview submission request"""

    responses: List[InterviewResponseCreate] = Field(default_factory=list)
    force_submit: Optional[bool] = False
    termination_reason: Optional[str] = None  # 'fullscreen_exit', 'tab_switch', etc.


class InterviewSubmitResponse(BaseModel):
    """Interview submission response"""

    success: bool
    message: str
    candidate_id: int
    submitted_at: datetime
