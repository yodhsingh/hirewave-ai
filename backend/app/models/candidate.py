from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

# Enum class to represent various stages of a candidate in the recruitment process
class CandidateStatus(str, enum.Enum):
    INVITED = "invited" # Candidate has been invited to take the test/interview
    STARTED = "started" # Candidate has started the assessment
    IN_PROGRESS = "in_progress" # Candidate is currently working on the assessment
    SUBMITTED = "submitted" # Candidate has submitted their test or interview
    UNDER_REVIEW = "under_review" # Candidate’s submission is being reviewed by HR/interviewer
    SCORED = "scored" # Candidate’s performance has been evaluated/scored
    SHORTLISTED = "shortlisted" # Candidate has been shortlisted for next rounds or selection
    REJECTED = "rejected" # Candidate did not qualify for further rounds
    HIRED = "hired" # Candidate is successfully hired


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    resume_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    invite_token = Column(String(255), unique=True, nullable=False, index=True)

    status = Column(Enum(CandidateStatus, native_enum=True, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=CandidateStatus.INVITED)

    invited_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, nullable=True)

    notes = Column(Text, nullable=True)
    tags = Column(ARRAY(String), nullable=True)

    # Relationships
    job = relationship("Job", back_populates="candidates")
    responses = relationship("InterviewResponse", back_populates="candidate", cascade="all, delete-orphan")
    score = relationship("CandidateScore", back_populates="candidate", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Candidate {self.email}>"


class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    type = Column(Enum("phone", "video", "text", "multiple_choice", "code", name="response_type"), nullable=False)
    content = Column(Text, nullable=False)  # URL for video/audio, text for text responses
    transcript = Column(Text, nullable=True)  # For video/audio responses

    duration = Column(Integer, nullable=True)  # seconds for video/audio
    retries = Column(Integer, default=0, nullable=False)

    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # AI analysis for this specific question
    question_score = Column(Float, nullable=True)
    question_feedback = Column(JSONB, nullable=True)
    keywords_found = Column(ARRAY(String), nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="responses")

    def __repr__(self):
        return f"<InterviewResponse {self.candidate_id}:{self.question_id}>"


class CandidateScore(Base):
    __tablename__ = "candidate_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, unique=True)

    overall_score = Column(Float, nullable=True)
    ai_score = Column(Float, nullable=True)
    human_score = Column(Float, nullable=True)

    # Score breakdown
    communication = Column(Float, nullable=True)
    technical_skills = Column(Float, nullable=True)
    problem_solving = Column(Float, nullable=True)
    culture_fit = Column(Float, nullable=True)
    experience = Column(Float, nullable=True)

    # AI insights
    summary = Column(Text, nullable=True)
    strengths = Column(ARRAY(String), nullable=True)
    weaknesses = Column(ARRAY(String), nullable=True)
    red_flags = Column(ARRAY(String), nullable=True)
    recommendations = Column(ARRAY(String), nullable=True)
    confidence_level = Column(Float, nullable=True)

    # Extracted skills
    skills_extracted = Column(JSONB, nullable=True)  # Array of skill objects

    # Competency ranking (stored as JSONB in database)
    competency_ranking = Column(JSONB, nullable=True)

    scored_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    scored_by = Column(Integer, nullable=True)  # null for AI, user_id for human

    # Relationships
    candidate = relationship("Candidate", back_populates="score")

    def __repr__(self):
        return f"<CandidateScore {self.candidate_id}: {self.overall_score}>"
