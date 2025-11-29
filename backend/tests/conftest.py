"""
Pytest configuration and fixtures for the interview platform backend tests.

This module provides:
- Async test database setup with PostgreSQL (neondb_test) for API tests
- FastAPI test client
- Authentication fixtures (tokens, users)
- Mock data generators
"""

import asyncio
import os
import uuid
from datetime import datetime, timedelta
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from faker import Faker
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

# Use test PostgreSQL database (ssl=require is the asyncpg-compatible format)
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://neondb_owner:npg_IUgy8fBW9EzT@ep-autumn-glade-ad91atgw-pooler.c-2.us-east-1.aws.neon.tech/neondb_test?ssl=require"
)

# Set test environment variables before importing app modules
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test-secret-key-for-unit-tests-only-do-not-use-in-production"
os.environ["DEBUG"] = "True"
os.environ["GOOGLE_GEMINI_API_KEY"] = "test-api-key"
os.environ["OPENAI_API_KEY"] = "test-openai-key"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"  # Required by config

from app.main import app
from app.db.base import Base, get_db
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.job import Job, Question, JobStatus, RoleType, QuestionType
from app.models.candidate import Candidate, CandidateStatus
from app.models.invite import Invite, InviteStatus
from app.models.practice_interview import PracticeSession, PracticeQuestion, PracticeResponse, InterviewType, InterviewDifficulty
from app.models.applicant_profile import ApplicantProfile
from app.core.security import create_access_token, get_password_hash


# Initialize Faker
fake = Faker()

# Test database engine using PostgreSQL with SSL (ssl=require in URL)
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Track if tables have been created
_tables_created = False


@pytest.fixture(scope="session")
def event_loop_policy():
    """Return the event loop policy for tests."""
    return asyncio.get_event_loop_policy()


@pytest_asyncio.fixture(scope="session")
async def setup_database():
    """Create all tables once at the start of the test session."""
    global _tables_created
    if not _tables_created:
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _tables_created = True
    yield
    # Don't drop tables - keep for inspection if needed


@pytest_asyncio.fixture(scope="function")
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """
    Create a database session for each test.
    Uses transaction rollback for test isolation.
    """
    async with TestSessionLocal() as session:
        yield session
        # Rollback any changes made during the test
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an async HTTP client for testing API endpoints.
    Overrides the database dependency with test database.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# ============== User Fixtures ==============

@pytest_asyncio.fixture
async def test_company(db_session: AsyncSession) -> Company:
    """Create a test company with unique name."""
    unique_id = uuid.uuid4().hex[:8]
    company = Company(
        name=f"Test Company {unique_id}",
    )
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)
    return company


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test candidate user with unique email."""
    unique_id = uuid.uuid4().hex[:8]
    user = User(
        email=f"testuser_{unique_id}@example.com",
        name="Test User",
        password_hash=get_password_hash("testpassword123"),
        role=UserRole.CANDIDATE,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_hr_user(db_session: AsyncSession, test_company: Company) -> User:
    """Create a test HR user with unique email."""
    unique_id = uuid.uuid4().hex[:8]
    user = User(
        email=f"hruser_{unique_id}@example.com",
        name="HR Manager",
        password_hash=get_password_hash("hrpassword123"),
        role=UserRole.HR,
        company_id=test_company.id,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Create a test admin user with unique email."""
    unique_id = uuid.uuid4().hex[:8]
    user = User(
        email=f"admin_{unique_id}@example.com",
        name="Admin User",
        password_hash=get_password_hash("adminpassword123"),
        role=UserRole.ADMIN,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


# ============== Token Fixtures ==============

@pytest.fixture
def auth_token(test_user: User) -> str:
    """Generate a valid JWT token for the test user."""
    return create_access_token({"sub": str(test_user.id)})


@pytest.fixture
def hr_auth_token(test_hr_user: User) -> str:
    """Generate a valid JWT token for the HR user."""
    return create_access_token({"sub": str(test_hr_user.id)})


@pytest.fixture
def admin_auth_token(test_admin_user: User) -> str:
    """Generate a valid JWT token for the admin user."""
    return create_access_token({"sub": str(test_admin_user.id)})


@pytest.fixture
def auth_headers(auth_token: str) -> dict:
    """Return authorization headers with Bearer token."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def hr_auth_headers(hr_auth_token: str) -> dict:
    """Return authorization headers for HR user."""
    return {"Authorization": f"Bearer {hr_auth_token}"}


@pytest.fixture
def admin_auth_headers(admin_auth_token: str) -> dict:
    """Return authorization headers for admin user."""
    return {"Authorization": f"Bearer {admin_auth_token}"}


# ============== Job Fixtures ==============

@pytest_asyncio.fixture
async def test_job(db_session: AsyncSession, test_hr_user: User, test_company: Company) -> Job:
    """Create a test job posting."""
    unique_id = uuid.uuid4().hex[:8]
    job = Job(
        title=f"Software Engineer {unique_id}",
        description="We are looking for a talented software engineer to join our dynamic team. This is an excellent opportunity to work on cutting-edge projects.",
        department="Engineering",
        location="Remote",
        role_type=RoleType.FULL_TIME,
        status=JobStatus.ACTIVE,
        company_id=test_company.id,
        created_by=test_hr_user.id,
        requirements="Python, FastAPI, SQL",
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job


@pytest_asyncio.fixture
async def test_job_with_questions(db_session: AsyncSession, test_job: Job) -> Job:
    """Create a test job with interview questions."""
    questions = [
        Question(
            job_id=test_job.id,
            type=QuestionType.TEXT,
            question="Tell me about yourself.",
            time_limit=120,
            required=True,
            order=1,
        ),
        Question(
            job_id=test_job.id,
            type=QuestionType.VIDEO,
            question="Why do you want to work here?",
            time_limit=180,
            required=True,
            order=2,
        ),
        Question(
            job_id=test_job.id,
            type=QuestionType.MULTIPLE_CHOICE,
            question="Which programming language do you prefer?",
            options=["Python", "JavaScript", "Java", "Go"],
            required=True,
            order=3,
        ),
    ]
    for q in questions:
        db_session.add(q)
    await db_session.commit()
    await db_session.refresh(test_job)
    return test_job


# ============== Candidate Fixtures ==============

@pytest_asyncio.fixture
async def test_candidate(db_session: AsyncSession, test_job: Job) -> Candidate:
    """Create a test candidate."""
    unique_id = uuid.uuid4().hex[:8]
    candidate = Candidate(
        email=f"candidate_{unique_id}@example.com",
        name="Test Candidate",
        job_id=test_job.id,
        status=CandidateStatus.INVITED,
        invite_token=f"test-invite-token-{unique_id}",
    )
    db_session.add(candidate)
    await db_session.commit()
    await db_session.refresh(candidate)
    return candidate


@pytest_asyncio.fixture
async def test_invite(db_session: AsyncSession, test_job: Job) -> Invite:
    """Create a test invite."""
    unique_id = uuid.uuid4().hex[:8]
    invite = Invite(
        job_id=test_job.id,
        email=f"invited_{unique_id}@example.com",
        token=f"test-invite-token-{unique_id}",
        status=InviteStatus.PENDING,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    db_session.add(invite)
    await db_session.commit()
    await db_session.refresh(invite)
    return invite


# ============== Practice Session Fixtures ==============

@pytest_asyncio.fixture
async def test_practice_session(db_session: AsyncSession, test_user: User) -> PracticeSession:
    """Create a test practice session."""
    session = PracticeSession(
        user_id=test_user.id,
        session_type=InterviewType.TECHNICAL,
        difficulty=InterviewDifficulty.MEDIUM,
        target_role="Software Engineer",
        questions_count=3,
        focus_areas=["algorithms", "system design"],
        started_at=datetime.utcnow(),
    )
    db_session.add(session)
    await db_session.commit()
    await db_session.refresh(session)
    return session


@pytest_asyncio.fixture
async def test_practice_session_with_questions(
    db_session: AsyncSession,
    test_practice_session: PracticeSession
) -> PracticeSession:
    """Create a practice session with questions."""
    questions = [
        PracticeQuestion(
            session_id=test_practice_session.id,
            question_text="What is a binary search tree?",
            question_type="technical",
            difficulty="medium",
            ideal_answer_points=["Sorted binary tree", "Left < Root < Right", "O(log n) search"],
            order_index=0,
        ),
        PracticeQuestion(
            session_id=test_practice_session.id,
            question_text="Describe a challenging project you worked on.",
            question_type="behavioral",
            difficulty="medium",
            ideal_answer_points=["Clear problem", "Your actions", "Positive outcome"],
            order_index=1,
        ),
    ]
    for q in questions:
        db_session.add(q)
    await db_session.commit()
    await db_session.refresh(test_practice_session)
    return test_practice_session


# ============== Profile Fixtures ==============

@pytest_asyncio.fixture
async def test_profile(db_session: AsyncSession, test_user: User) -> ApplicantProfile:
    """Create a test applicant profile."""
    profile = ApplicantProfile(
        user_id=test_user.id,
        full_name="Test User",
        current_job_title="Software Developer",
        years_of_experience="5",
        skills={"technical": ["Python", "JavaScript", "SQL"]},
        education="Bachelor's in Computer Science",
        summary="Experienced software developer with expertise in web development.",
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)
    return profile


# ============== Helper Functions ==============

def generate_random_user_data(role: UserRole = UserRole.CANDIDATE) -> dict:
    """Generate random user data for testing."""
    return {
        "email": fake.email(),
        "name": fake.name(),
        "password": "TestPassword123!",
        "role": role.value,
    }


def generate_random_job_data() -> dict:
    """Generate random job data for testing."""
    return {
        "title": fake.job(),
        "description": fake.paragraph(nb_sentences=5),
        "department": fake.word().capitalize(),
        "location": fake.city(),
        "role_type": "FULL_TIME",
        "requirements": ", ".join([fake.word() for _ in range(5)]),
    }


def generate_random_question_data(question_type: str = "TEXT") -> dict:
    """Generate random question data for testing."""
    return {
        "type": question_type,
        "question": fake.sentence() + "?",
        "time_limit": 120,
        "required": True,
    }
