from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Integer, Boolean, Float
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

# Enum class to represent different statuses of a job
class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT" # Job is created but not yet published
    ACTIVE = "ACTIVE" # Job is live and accepting applications
    CLOSED = "CLOSED" # Job is no longer open for applications



# Enum to represent the type of employment role offered
class RoleType(str, enum.Enum):
    FULL_TIME = "FULL_TIME" # Full-time employment
    PART_TIME = "PART_TIME" # Part-time position
    CONTRACT = "CONTRACT" # Contract-based work
    INTERNSHIP = "INTERNSHIP" # Internship position
    FREELANCE = "FREELANCE" # Freelance or gig-based work
    TEMPORARY = "TEMPORARY" # Temporary or short-term position

# Enum defining the type of question used in an interview or application
class QuestionType(str, enum.Enum):
    PHONE = "PHONE" # Phone-based interview question
    VIDEO = "VIDEO" # Video response question
    TEXT = "TEXT" # Text or written response question
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE" # Objective question with predefined choices
    CODE = "CODE" # Coding question requiring code input


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    role_type = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default='ACTIVE')

    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    requirements = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    # Relationships
    questions = relationship("Question", back_populates="job", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="job")
    company = relationship("Company", back_populates="jobs")

    def __repr__(self):
        return f"<Job {self.title}>"


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)

    type = Column(String(50), nullable=False)
    question = Column("question_text", Text, nullable=False)

    time_limit = Column(Integer, nullable=True)  # seconds for video
    options = Column("choices", JSONB, nullable=True)  # for multiple choice - stored as JSONB in database
    code_template = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)
    evaluation_criteria = Column(JSONB, nullable=True)

    required = Column(Boolean, default=True, nullable=False)
    order = Column("order_index", Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    job = relationship("Job", back_populates="questions")

    def __repr__(self):
        return f"<Question {self.type}: {self.question[:50]}>"
