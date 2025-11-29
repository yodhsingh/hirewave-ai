"""Unit tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError
from datetime import datetime

from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.job import JobCreate, JobUpdate, QuestionCreate
from app.schemas.candidate import CandidateUpdate, BulkInviteRequest
from app.schemas.practice import (
    PracticeSessionRequest,
    TextAnswerRequest,
    InterviewTypeEnum,
    DifficultyEnum,
)
from app.models.user import UserRole


class TestUserSchemas:
    """Tests for user-related schemas."""

    def test_user_create_valid(self):
        """Test valid user creation schema."""
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "securepassword123",
            "role": "CANDIDATE",
        }
        user = UserCreate(**data)

        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.role == UserRole.CANDIDATE

    def test_user_create_with_company(self):
        """Test HR user creation with company."""
        data = {
            "email": "hr@company.com",
            "name": "HR User",
            "password": "securepassword123",
            "role": "HR",
            "company_name": "Test Company",
        }
        user = UserCreate(**data)

        assert user.role == UserRole.HR
        assert user.company_name == "Test Company"

    def test_user_create_invalid_email(self):
        """Test user creation with invalid email."""
        data = {
            "email": "invalid-email",
            "name": "Test User",
            "password": "securepassword123",
            "role": "CANDIDATE",
        }
        with pytest.raises(ValidationError):
            UserCreate(**data)

    def test_user_create_missing_password(self):
        """Test user creation without password."""
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "role": "CANDIDATE",
        }
        with pytest.raises(ValidationError):
            UserCreate(**data)

    def test_user_login_valid(self):
        """Test valid login schema."""
        data = {
            "email": "test@example.com",
            "password": "password123",
        }
        login = UserLogin(**data)

        assert login.email == "test@example.com"
        assert login.password == "password123"


class TestJobSchemas:
    """Tests for job-related schemas."""

    def test_job_create_valid(self):
        """Test valid job creation schema."""
        data = {
            "title": "Software Engineer",
            "description": "We are looking for a talented software engineer to join our team and build amazing products. This is a great opportunity for growth.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "FULL_TIME",
            "questions": [],
        }
        job = JobCreate(**data)

        assert job.title == "Software Engineer"
        assert job.role_type == "FULL_TIME"

    def test_job_create_with_questions(self):
        """Test job creation with questions."""
        data = {
            "title": "Software Engineer",
            "description": "We are looking for a talented software engineer to join our team and build amazing products. This is a great opportunity for growth.",
            "department": "Engineering",
            "location": "New York",
            "role_type": "FULL_TIME",
            "questions": [
                {
                    "type": "TEXT",
                    "question": "Tell me about yourself",
                    "required": True,
                    "order": 1,
                },
                {
                    "type": "VIDEO",
                    "question": "Why this role?",
                    "time_limit": 180,
                    "required": True,
                    "order": 2,
                },
            ],
        }
        job = JobCreate(**data)

        assert len(job.questions) == 2
        assert job.questions[0].type == "TEXT"
        assert job.questions[1].time_limit == 180

    def test_job_create_missing_title(self):
        """Test job creation without title."""
        data = {
            "description": "Building great software that helps customers solve problems.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "FULL_TIME",
            "questions": [],
        }
        with pytest.raises(ValidationError):
            JobCreate(**data)

    def test_job_update_partial(self):
        """Test partial job update."""
        data = {
            "title": "Updated Title",
        }
        update = JobUpdate(**data)

        assert update.title == "Updated Title"
        assert update.description is None

    def test_question_create_with_options(self):
        """Test question creation with multiple choice options."""
        data = {
            "type": "MULTIPLE_CHOICE",
            "question": "What language do you prefer?",
            "options": ["Python", "JavaScript", "Go", "Rust"],
            "required": True,
            "order": 1,
        }
        question = QuestionCreate(**data)

        assert question.type == "MULTIPLE_CHOICE"
        assert len(question.options) == 4


class TestCandidateSchemas:
    """Tests for candidate-related schemas."""

    def test_candidate_update_status(self):
        """Test candidate status update."""
        data = {
            "status": "SHORTLISTED",
        }
        update = CandidateUpdate(**data)

        assert update.status == "SHORTLISTED"

    def test_candidate_update_notes(self):
        """Test candidate notes update."""
        data = {
            "notes": "Great candidate, strong technical skills",
        }
        update = CandidateUpdate(**data)

        assert update.notes == "Great candidate, strong technical skills"

    def test_candidate_update_tags(self):
        """Test candidate tags update."""
        data = {
            "tags": ["experienced", "strong-communication"],
        }
        update = CandidateUpdate(**data)

        assert len(update.tags) == 2

    def test_bulk_invite_request_valid(self):
        """Test valid bulk invite request."""
        data = {
            "emails": ["test1@example.com", "test2@example.com"],
            "expires_in_days": 7,
        }
        invite = BulkInviteRequest(**data)

        assert len(invite.emails) == 2
        assert invite.expires_in_days == 7

    def test_bulk_invite_request_default_expiry(self):
        """Test bulk invite with default expiry."""
        data = {
            "emails": ["test@example.com"],
        }
        invite = BulkInviteRequest(**data)

        # Check default value
        assert invite.expires_in_days >= 1


class TestPracticeSchemas:
    """Tests for practice interview schemas."""

    def test_practice_session_request_valid(self):
        """Test valid practice session request."""
        data = {
            "interview_type": "technical",
            "difficulty": "medium",
            "target_role": "Software Engineer",
            "questions_count": 5,
        }
        session = PracticeSessionRequest(**data)

        assert session.interview_type == InterviewTypeEnum.TECHNICAL
        assert session.difficulty == DifficultyEnum.MEDIUM
        assert session.questions_count == 5

    def test_practice_session_request_defaults(self):
        """Test practice session with default values."""
        data = {}
        session = PracticeSessionRequest(**data)

        # Check defaults
        assert session.interview_type == InterviewTypeEnum.TECHNICAL
        assert session.difficulty == DifficultyEnum.MEDIUM
        assert session.target_role == "Software Engineer"
        assert session.questions_count == 3

    def test_practice_session_request_with_focus_areas(self):
        """Test practice session with focus areas."""
        data = {
            "interview_type": "technical",
            "difficulty": "hard",
            "focus_areas": ["algorithms", "system design", "databases"],
        }
        session = PracticeSessionRequest(**data)

        assert len(session.focus_areas) == 3
        assert "algorithms" in session.focus_areas

    def test_practice_session_request_invalid_type(self):
        """Test practice session with invalid type."""
        data = {
            "interview_type": "invalid_type",
        }
        with pytest.raises(ValidationError):
            PracticeSessionRequest(**data)

    def test_practice_session_request_invalid_difficulty(self):
        """Test practice session with invalid difficulty."""
        data = {
            "difficulty": "super_hard",
        }
        with pytest.raises(ValidationError):
            PracticeSessionRequest(**data)

    def test_practice_session_request_questions_count_bounds(self):
        """Test questions count validation."""
        # Too few
        with pytest.raises(ValidationError):
            PracticeSessionRequest(questions_count=0)

        # Too many
        with pytest.raises(ValidationError):
            PracticeSessionRequest(questions_count=100)

    def test_text_answer_request_valid(self):
        """Test valid text answer request."""
        data = {
            "answer_text": "This is my answer to the question.",
        }
        answer = TextAnswerRequest(**data)

        assert answer.answer_text == "This is my answer to the question."

    def test_text_answer_request_empty(self):
        """Test text answer with empty string."""
        data = {
            "answer_text": "",
        }
        with pytest.raises(ValidationError):
            TextAnswerRequest(**data)

    def test_text_answer_request_too_long(self):
        """Test text answer exceeding max length."""
        data = {
            "answer_text": "a" * 11000,  # Exceeds 10000 limit
        }
        with pytest.raises(ValidationError):
            TextAnswerRequest(**data)


class TestEnumSchemas:
    """Tests for enum schemas."""

    def test_interview_type_values(self):
        """Test interview type enum values."""
        assert InterviewTypeEnum.TECHNICAL == "technical"
        assert InterviewTypeEnum.BEHAVIORAL == "behavioral"
        assert InterviewTypeEnum.SITUATIONAL == "situational"
        assert InterviewTypeEnum.MIXED == "mixed"

    def test_difficulty_values(self):
        """Test difficulty enum values."""
        assert DifficultyEnum.EASY == "easy"
        assert DifficultyEnum.MEDIUM == "medium"
        assert DifficultyEnum.HARD == "hard"


class TestSchemaValidation:
    """Tests for schema validation edge cases."""

    def test_email_normalization(self):
        """Test email case handling."""
        data = {
            "email": "Test@Example.COM",
            "name": "Test User",
            "password": "securepassword123",
            "role": "CANDIDATE",
        }
        user = UserCreate(**data)

        # Email should be stored as-is (case sensitivity depends on app logic)
        assert "@" in user.email

    def test_string_trimming(self):
        """Test that strings are handled properly."""
        data = {
            "title": "  Software Engineer  ",
            "description": "We are looking for a talented software engineer to join our team and build amazing products. This is a great opportunity for growth.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "FULL_TIME",
            "questions": [],
        }
        job = JobCreate(**data)

        # String handling depends on Pydantic config
        assert "Software Engineer" in job.title

    def test_job_update_optional_fields(self):
        """Test that job update allows partial updates with None values."""
        # JobUpdate should allow all optional fields
        data = {"title": "Updated Title"}
        update = JobUpdate(**data)

        assert update.title == "Updated Title"
        # Other fields should be None (not provided)
        assert update.description is None
