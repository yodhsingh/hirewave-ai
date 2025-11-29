"""Unit tests for SQLAlchemy models."""

import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.models.user import User, UserRole
from app.models.job import Job, Question, JobStatus, RoleType, QuestionType
from app.models.candidate import Candidate, CandidateStatus
from app.models.company import Company
from app.models.invite import Invite, InviteStatus
from app.models.practice_interview import (
    PracticeSession,
    PracticeQuestion,
    PracticeResponse,
    InterviewType,
    InterviewDifficulty,
)
from app.models.applicant_profile import ApplicantProfile


class TestUserModel:
    """Tests for User model."""

    @pytest.mark.asyncio
    async def test_user_creation(self, db_session: AsyncSession):
        """Test creating a user."""
        unique_id = uuid.uuid4().hex[:8]
        user = User(
            email=f"model_test_{unique_id}@example.com",
            name="Model Test User",
            password_hash="hashed_password",
            role=UserRole.CANDIDATE,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.id is not None
        assert f"model_test_{unique_id}" in user.email
        assert user.role == UserRole.CANDIDATE
        assert user.created_at is not None

    @pytest.mark.asyncio
    async def test_user_roles(self, db_session: AsyncSession):
        """Test different user roles."""
        unique_id = uuid.uuid4().hex[:8]
        for role in UserRole:
            user = User(
                email=f"{role.value.lower()}_{unique_id}@example.com",
                name=f"{role.value} User",
                password_hash="hashed",
                role=role,
            )
            db_session.add(user)

        await db_session.commit()

        # Verify all roles were created
        from sqlalchemy import select
        result = await db_session.execute(select(User))
        users = result.scalars().all()
        assert len(users) >= len(UserRole)

    @pytest.mark.asyncio
    async def test_user_with_company(self, db_session: AsyncSession, test_company: Company):
        """Test user with company relationship."""
        unique_id = uuid.uuid4().hex[:8]
        user = User(
            email=f"hr_model_{unique_id}@example.com",
            name="HR Model User",
            password_hash="hashed",
            role=UserRole.HR,
            company_id=test_company.id,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        assert user.company_id == test_company.id


class TestCompanyModel:
    """Tests for Company model."""

    @pytest.mark.asyncio
    async def test_company_creation(self, db_session: AsyncSession):
        """Test creating a company."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        company = Company(
            name=f"Test Model Company {unique_id}",
        )
        db_session.add(company)
        await db_session.commit()
        await db_session.refresh(company)

        assert company.id is not None
        assert "Test Model Company" in company.name

    @pytest.mark.asyncio
    async def test_company_minimal(self, db_session: AsyncSession):
        """Test company with minimal fields."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        company = Company(name=f"Minimal Company {unique_id}")
        db_session.add(company)
        await db_session.commit()
        await db_session.refresh(company)

        assert company.id is not None
        assert company.created_at is not None


class TestJobModel:
    """Tests for Job model."""

    @pytest.mark.asyncio
    async def test_job_creation(
        self, db_session: AsyncSession, test_hr_user: User, test_company: Company
    ):
        """Test creating a job."""
        job = Job(
            title="Model Test Job",
            description="Testing job model",
            department="Engineering",
            location="Remote",
            role_type=RoleType.FULL_TIME,
            status=JobStatus.ACTIVE,
            company_id=test_company.id,
            created_by=test_hr_user.id,
        )
        db_session.add(job)
        await db_session.commit()
        await db_session.refresh(job)

        assert job.id is not None
        assert job.title == "Model Test Job"
        assert job.status == JobStatus.ACTIVE
        assert job.role_type == RoleType.FULL_TIME

    @pytest.mark.asyncio
    async def test_job_statuses(self):
        """Test job status enum values."""
        assert JobStatus.DRAFT.value == "DRAFT"
        assert JobStatus.ACTIVE.value == "ACTIVE"
        assert JobStatus.CLOSED.value == "CLOSED"

    @pytest.mark.asyncio
    async def test_role_types(self):
        """Test role type enum values."""
        assert RoleType.FULL_TIME.value == "FULL_TIME"
        assert RoleType.PART_TIME.value == "PART_TIME"
        assert RoleType.CONTRACT.value == "CONTRACT"
        assert RoleType.INTERNSHIP.value == "INTERNSHIP"


class TestQuestionModel:
    """Tests for Question model."""

    @pytest.mark.asyncio
    async def test_question_creation(self, db_session: AsyncSession, test_job: Job):
        """Test creating a question."""
        question = Question(
            job_id=test_job.id,
            type=QuestionType.TEXT,
            question="Model test question?",
            time_limit=120,
            required=True,
            order=0,
        )
        db_session.add(question)
        await db_session.commit()
        await db_session.refresh(question)

        assert question.id is not None
        assert question.type == QuestionType.TEXT

    @pytest.mark.asyncio
    async def test_question_types(self):
        """Test question type enum values."""
        assert QuestionType.TEXT.value == "TEXT"
        assert QuestionType.VIDEO.value == "VIDEO"
        assert QuestionType.PHONE.value == "PHONE"
        assert QuestionType.CODE.value == "CODE"
        assert QuestionType.MULTIPLE_CHOICE.value == "MULTIPLE_CHOICE"

    @pytest.mark.asyncio
    async def test_multiple_choice_question(self, db_session: AsyncSession, test_job: Job):
        """Test multiple choice question with options."""
        question = Question(
            job_id=test_job.id,
            type=QuestionType.MULTIPLE_CHOICE,
            question="Which language?",
            options=["Python", "JavaScript", "Go"],
            required=True,
            order=0,
        )
        db_session.add(question)
        await db_session.commit()
        await db_session.refresh(question)

        assert question.options == ["Python", "JavaScript", "Go"]


class TestCandidateModel:
    """Tests for Candidate model."""

    @pytest.mark.asyncio
    async def test_candidate_creation(self, db_session: AsyncSession, test_job: Job):
        """Test creating a candidate."""
        unique_id = uuid.uuid4().hex[:8]
        candidate = Candidate(
            email=f"candidate_model_{unique_id}@example.com",
            name="Model Candidate",
            job_id=test_job.id,
            status=CandidateStatus.INVITED,
            invite_token=f"model-test-token-{unique_id}",
        )
        db_session.add(candidate)
        await db_session.commit()
        await db_session.refresh(candidate)

        assert candidate.id is not None
        assert candidate.status == CandidateStatus.INVITED

    @pytest.mark.asyncio
    async def test_candidate_statuses(self):
        """Test candidate status enum values."""
        assert CandidateStatus.INVITED.value == "INVITED"
        assert CandidateStatus.STARTED.value == "STARTED"
        assert CandidateStatus.IN_PROGRESS.value == "IN_PROGRESS"
        assert CandidateStatus.SUBMITTED.value == "SUBMITTED"
        assert CandidateStatus.SCORED.value == "SCORED"
        assert CandidateStatus.SHORTLISTED.value == "SHORTLISTED"
        assert CandidateStatus.REJECTED.value == "REJECTED"


class TestInviteModel:
    """Tests for Invite model."""

    @pytest.mark.asyncio
    async def test_invite_creation(self, db_session: AsyncSession, test_job: Job):
        """Test creating an invite."""
        from datetime import timedelta
        unique_id = uuid.uuid4().hex[:8]
        invite = Invite(
            job_id=test_job.id,
            email=f"invite_model_{unique_id}@example.com",
            token=f"invite-model-token-{unique_id}",
            status=InviteStatus.PENDING,
            expires_at=datetime.utcnow() + timedelta(days=7),
        )
        db_session.add(invite)
        await db_session.commit()
        await db_session.refresh(invite)

        assert invite.id is not None
        assert invite.status == InviteStatus.PENDING

    @pytest.mark.asyncio
    async def test_invite_statuses(self):
        """Test invite status enum values."""
        assert InviteStatus.PENDING.value == "PENDING"
        assert InviteStatus.SENT.value == "SENT"
        assert InviteStatus.OPENED.value == "OPENED"
        assert InviteStatus.EXPIRED.value == "EXPIRED"


class TestPracticeModels:
    """Tests for Practice interview models."""

    @pytest.mark.asyncio
    async def test_practice_session_creation(self, db_session: AsyncSession, test_user: User):
        """Test creating a practice session."""
        session = PracticeSession(
            user_id=test_user.id,
            session_type=InterviewType.TECHNICAL,
            difficulty=InterviewDifficulty.MEDIUM,
            target_role="Software Engineer",
            questions_count=5,
            started_at=datetime.utcnow(),
        )
        db_session.add(session)
        await db_session.commit()
        await db_session.refresh(session)

        assert session.id is not None
        assert session.session_type == InterviewType.TECHNICAL

    @pytest.mark.asyncio
    async def test_interview_types(self):
        """Test interview type enum values."""
        assert InterviewType.TECHNICAL.value == "TECHNICAL"
        assert InterviewType.BEHAVIORAL.value == "BEHAVIORAL"
        assert InterviewType.SITUATIONAL.value == "SITUATIONAL"
        assert InterviewType.MIXED.value == "MIXED"

    @pytest.mark.asyncio
    async def test_difficulty_levels(self):
        """Test difficulty enum values."""
        assert InterviewDifficulty.EASY.value == "EASY"
        assert InterviewDifficulty.MEDIUM.value == "MEDIUM"
        assert InterviewDifficulty.HARD.value == "HARD"

    @pytest.mark.asyncio
    async def test_practice_question_creation(
        self, db_session: AsyncSession, test_practice_session: PracticeSession
    ):
        """Test creating a practice question."""
        question = PracticeQuestion(
            session_id=test_practice_session.id,
            question_text="Test practice question?",
            question_type="technical",
            difficulty="medium",
            order_index=0,
        )
        db_session.add(question)
        await db_session.commit()
        await db_session.refresh(question)

        assert question.id is not None


class TestApplicantProfileModel:
    """Tests for ApplicantProfile model."""

    @pytest.mark.asyncio
    async def test_profile_creation(self, db_session: AsyncSession, test_user: User):
        """Test creating an applicant profile."""
        profile = ApplicantProfile(
            user_id=test_user.id,
            full_name="Profile Model User",
            current_job_title="Developer",
            years_of_experience="3",
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        assert profile.id is not None
        assert profile.user_id == test_user.id

    @pytest.mark.asyncio
    async def test_profile_with_json_fields(self, db_session: AsyncSession, test_user: User):
        """Test profile with JSON fields."""
        profile = ApplicantProfile(
            user_id=test_user.id,
            full_name="JSON Profile User",
            skills={"technical": ["Python", "SQL"], "soft": ["Communication"]},
            work_experience=[
                {"company": "TechCorp", "title": "Developer", "years": 2}
            ],
            certifications=[{"name": "AWS", "year": 2023}],
        )
        db_session.add(profile)
        await db_session.commit()
        await db_session.refresh(profile)

        assert profile.skills == {"technical": ["Python", "SQL"], "soft": ["Communication"]}
        assert len(profile.work_experience) == 1


class TestModelRelationships:
    """Tests for model relationships."""

    @pytest.mark.asyncio
    async def test_job_questions_relationship(
        self, db_session: AsyncSession, test_job_with_questions: Job
    ):
        """Test job to questions relationship."""
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload

        result = await db_session.execute(
            select(Job)
            .options(selectinload(Job.questions))
            .filter(Job.id == test_job_with_questions.id)
        )
        job = result.scalar_one()

        assert len(job.questions) >= 1

    @pytest.mark.asyncio
    async def test_user_company_relationship(
        self, db_session: AsyncSession, test_hr_user: User, test_company: Company
    ):
        """Test user to company relationship."""
        assert test_hr_user.company_id == test_company.id

    @pytest.mark.asyncio
    async def test_candidate_job_relationship(
        self, db_session: AsyncSession, test_candidate: Candidate, test_job: Job
    ):
        """Test candidate to job relationship."""
        assert test_candidate.job_id == test_job.id
