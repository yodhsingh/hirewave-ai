"""Practice Interview models for storing interview sessions and responses"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base import Base


class InterviewDifficulty(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class InterviewType(enum.Enum):
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"
    SITUATIONAL = "situational"
    MIXED = "mixed"


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_type = Column(SQLEnum(InterviewType, name="interview_type", values_callable=lambda x: [e.value for e in x]), default=InterviewType.MIXED)
    difficulty = Column(SQLEnum(InterviewDifficulty, name="interview_difficulty", values_callable=lambda x: [e.value for e in x]), default=InterviewDifficulty.MEDIUM)
    target_role = Column(String(255), nullable=True)
    focus_areas = Column(JSONB, nullable=True)  # e.g., ["leadership", "technical skills", "problem-solving"]
    questions_count = Column(Integer, default=5)
    completed_count = Column(Integer, default=0)
    overall_score = Column(Float, nullable=True)
    category_scores = Column(JSONB, nullable=True)  # e.g., {"communication": 85, "technical": 78, "problem_solving": 90}
    ai_feedback = Column(Text, nullable=True)
    session_metadata = Column(JSONB, nullable=True)  # Store additional context
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", backref="practice_sessions")
    questions = relationship("PracticeQuestion", back_populates="session", cascade="all, delete-orphan")


class PracticeQuestion(Base):
    __tablename__ = "practice_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("practice_sessions.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50))  # behavioral, technical, situational
    difficulty = Column(String(20))  # easy, medium, hard
    context = Column(Text, nullable=True)  # Additional context or hints
    ideal_answer_points = Column(JSONB, nullable=True)  # Key points for a good answer
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("PracticeSession", back_populates="questions")
    response = relationship("PracticeResponse", uselist=False, back_populates="question")


class PracticeResponse(Base):
    __tablename__ = "practice_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("practice_questions.id", ondelete="CASCADE"), nullable=False, unique=True)
    audio_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    ai_score = Column(Float, nullable=True)  # Score from 0-100
    ai_feedback = Column(Text, nullable=True)
    strengths = Column(JSONB, nullable=True)
    improvements = Column(JSONB, nullable=True)
    key_points_covered = Column(JSONB, nullable=True)
    sentiment_analysis = Column(JSONB, nullable=True)  # e.g., confidence level, enthusiasm
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    question = relationship("PracticeQuestion", back_populates="response")