"""
Models for AI-generated interview questions for candidates.
This mirrors the practice interview structure (PracticeQuestion/PracticeResponse)
but is tied to actual job candidates instead of practice sessions.
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base


class CandidateInterviewQuestion(Base):
    """
    AI-generated interview questions specific to a candidate.
    These questions are created based on the job description and candidate's resume.
    Similar to PracticeQuestion but linked to Candidate.
    """
    __tablename__ = "candidate_interview_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)

    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False, default="behavioral")  # behavioral, technical, situational
    difficulty = Column(String(20), nullable=True, default="medium")  # easy, medium, hard
    order_index = Column(Integer, default=0)

    # Context and evaluation hints (same as PracticeQuestion)
    context = Column(Text, nullable=True)  # Why this question is relevant
    ideal_answer_points = Column(JSONB, nullable=True)  # Key points for a good answer

    time_limit = Column(Integer, nullable=True, default=180)  # seconds, default 3 minutes

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    response = relationship("CandidateInterviewResponse", uselist=False, back_populates="question", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CandidateInterviewQuestion {self.id}: {self.question_text[:50]}>"


class CandidateInterviewResponse(Base):
    """
    Candidate's response to a generated interview question.
    Similar to PracticeResponse but linked to CandidateInterviewQuestion.
    """
    __tablename__ = "candidate_interview_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("candidate_interview_questions.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Response content
    transcript = Column(Text, nullable=True)  # Text answer or transcribed audio
    audio_url = Column(String(500), nullable=True)  # If audio was recorded
    duration = Column(Integer, nullable=True)  # Time taken in seconds

    # AI evaluation (filled after submission) - same as PracticeResponse
    ai_score = Column(Float, nullable=True)  # Score from 0-100
    ai_feedback = Column(Text, nullable=True)
    strengths = Column(JSONB, nullable=True)
    improvements = Column(JSONB, nullable=True)
    key_points_covered = Column(JSONB, nullable=True)
    sentiment_analysis = Column(JSONB, nullable=True)  # confidence, clarity, enthusiasm

    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    question = relationship("CandidateInterviewQuestion", back_populates="response")

    def __repr__(self):
        return f"<CandidateInterviewResponse {self.question_id}>"
