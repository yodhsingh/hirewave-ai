"""Tests for candidate management endpoints."""

import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate, CandidateStatus


class TestGetCandidate:
    """Tests for GET /api/v1/candidates/{candidate_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_candidate_success(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_candidate: Candidate,
    ):
        """Test getting candidate details."""
        response = await client.get(
            f"/api/v1/candidates/{test_candidate.id}",
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == test_candidate.id

    @pytest.mark.asyncio
    async def test_get_candidate_not_found(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test getting non-existent candidate."""
        response = await client.get(
            "/api/v1/candidates/99999",
            headers=hr_auth_headers
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_candidate_unauthorized(
        self, client: AsyncClient, test_candidate: Candidate
    ):
        """Test getting candidate without authentication."""
        response = await client.get(f"/api/v1/candidates/{test_candidate.id}")

        # 401 for unauthorized, 403 for forbidden (auth required but not provided)
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_get_candidate_as_non_hr(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_candidate: Candidate,
    ):
        """Test getting candidate as non-HR user."""
        response = await client.get(
            f"/api/v1/candidates/{test_candidate.id}",
            headers=auth_headers  # Candidate token
        )

        assert response.status_code == 403


class TestUpdateCandidate:
    """Tests for PATCH /api/v1/candidates/{candidate_id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_candidate_status(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_candidate: Candidate,
    ):
        """Test updating candidate status."""
        response = await client.patch(
            f"/api/v1/candidates/{test_candidate.id}",
            json={"status": "SHORTLISTED"},
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_candidate_not_found(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test updating non-existent candidate."""
        response = await client.patch(
            "/api/v1/candidates/99999",
            json={"status": "SHORTLISTED"},
            headers=hr_auth_headers
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_candidate_invalid_status(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_candidate: Candidate,
    ):
        """Test updating candidate with invalid status."""
        response = await client.patch(
            f"/api/v1/candidates/{test_candidate.id}",
            json={"status": "INVALID_STATUS"},
            headers=hr_auth_headers
        )

        assert response.status_code == 422


class TestBulkInvites:
    """Tests for POST /api/v1/candidates/{job_id}/invites endpoint."""

    @pytest.mark.asyncio
    async def test_send_invites_success(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_job: Job,
    ):
        """Test sending bulk invites."""
        unique_id = uuid.uuid4().hex[:8]
        response = await client.post(
            f"/api/v1/candidates/{test_job.id}/invites",
            json={
                "emails": [f"newcandidate1_{unique_id}@example.com", f"newcandidate2_{unique_id}@example.com"],
                "expires_in_days": 7
            },
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_send_invites_job_not_found(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test sending invites for non-existent job."""
        response = await client.post(
            "/api/v1/candidates/99999/invites",
            json={
                "emails": ["test@example.com"],
                "expires_in_days": 7
            },
            headers=hr_auth_headers
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_send_invites_unauthorized(
        self, client: AsyncClient, test_job: Job
    ):
        """Test sending invites without authentication."""
        response = await client.post(
            f"/api/v1/candidates/{test_job.id}/invites",
            json={
                "emails": ["test@example.com"],
                "expires_in_days": 7
            }
        )

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_send_invites_as_non_hr(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_job: Job,
    ):
        """Test sending invites as non-HR user."""
        response = await client.post(
            f"/api/v1/candidates/{test_job.id}/invites",
            json={
                "emails": ["test@example.com"],
                "expires_in_days": 7
            },
            headers=auth_headers  # Candidate token
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_send_invites_empty_emails(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_job: Job,
    ):
        """Test sending invites with empty email list."""
        response = await client.post(
            f"/api/v1/candidates/{test_job.id}/invites",
            json={
                "emails": [],
                "expires_in_days": 7
            },
            headers=hr_auth_headers
        )

        # 200 with 0 invites or 422 validation error for empty list
        assert response.status_code in [200, 422]


class TestGetJobCandidates:
    """Tests for GET /api/v1/candidates/{job_id}/candidates endpoint."""

    @pytest.mark.asyncio
    async def test_get_job_candidates_success(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_job: Job,
        test_candidate: Candidate,
    ):
        """Test getting all candidates for a job."""
        response = await client.get(
            f"/api/v1/candidates/{test_job.id}/candidates",
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_get_job_candidates_empty(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_hr_user: User,
        test_company,
        db_session: AsyncSession,
    ):
        """Test getting candidates for job with no applicants."""
        from app.models.job import Job, JobStatus, RoleType

        unique_id = uuid.uuid4().hex[:8]
        # Create a job with no candidates - with valid description length
        job = Job(
            title=f"Empty Job {unique_id}",
            description="This is a test job posting with no candidates. We are looking for talented individuals to join our team.",
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

        response = await client.get(
            f"/api/v1/candidates/{job.id}/candidates",
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"] == []

    @pytest.mark.asyncio
    async def test_get_job_candidates_unauthorized(
        self, client: AsyncClient, test_job: Job
    ):
        """Test getting job candidates without authentication."""
        response = await client.get(
            f"/api/v1/candidates/{test_job.id}/candidates"
        )

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_get_job_candidates_as_non_hr(
        self, client: AsyncClient, auth_headers: dict, test_job: Job
    ):
        """Test getting job candidates as non-HR user."""
        response = await client.get(
            f"/api/v1/candidates/{test_job.id}/candidates",
            headers=auth_headers  # Candidate token
        )

        assert response.status_code == 403


class TestCandidateStatusTransitions:
    """Tests for candidate status transitions."""

    @pytest.mark.asyncio
    async def test_shortlist_candidate(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_candidate: Candidate,
    ):
        """Test shortlisting a candidate."""
        response = await client.patch(
            f"/api/v1/candidates/{test_candidate.id}",
            json={"status": "SHORTLISTED"},
            headers=hr_auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_reject_candidate(
        self,
        client: AsyncClient,
        hr_auth_headers: dict,
        test_candidate: Candidate,
    ):
        """Test rejecting a candidate."""
        response = await client.patch(
            f"/api/v1/candidates/{test_candidate.id}",
            json={"status": "REJECTED"},
            headers=hr_auth_headers
        )

        assert response.status_code == 200
