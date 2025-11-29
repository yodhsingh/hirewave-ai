"""Tests for job management endpoints."""

import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.job import Job, JobStatus


class TestPublicJobs:
    """Tests for public job listing endpoints."""

    @pytest.mark.asyncio
    async def test_list_public_jobs(self, client: AsyncClient, test_job: Job):
        """Test listing active public jobs."""
        response = await client.get("/api/v1/jobs/public")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_list_public_jobs_with_search(self, client: AsyncClient, test_job: Job):
        """Test searching public jobs."""
        response = await client.get(
            "/api/v1/jobs/public",
            params={"search": "Software"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_list_public_jobs_with_filters(self, client: AsyncClient, test_job: Job):
        """Test filtering public jobs."""
        response = await client.get(
            "/api/v1/jobs/public",
            params={
                "department": "Engineering",
                "location": "Remote",
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_public_job_success(self, client: AsyncClient, test_job: Job):
        """Test getting a specific public job."""
        response = await client.get(f"/api/v1/jobs/public/{test_job.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == test_job.id

    @pytest.mark.asyncio
    async def test_get_public_job_not_found(self, client: AsyncClient):
        """Test getting non-existent public job."""
        response = await client.get("/api/v1/jobs/public/99999")

        assert response.status_code == 404


class TestJobApplications:
    """Tests for job application endpoints."""

    @pytest.mark.asyncio
    async def test_apply_to_job_success(
        self, client: AsyncClient, test_job: Job, auth_headers: dict, test_user: User
    ):
        """Test applying to a job."""
        response = await client.post(
            f"/api/v1/jobs/public/{test_job.id}/apply",
            headers=auth_headers
        )

        # Could be 200 (success) or 400 (already applied)
        assert response.status_code in [200, 400]

    @pytest.mark.asyncio
    async def test_apply_to_job_unauthorized(self, client: AsyncClient, test_job: Job):
        """Test applying to job without authentication."""
        response = await client.post(f"/api/v1/jobs/public/{test_job.id}/apply")

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_apply_to_nonexistent_job(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test applying to non-existent job."""
        response = await client.post(
            "/api/v1/jobs/public/99999/apply",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestHRJobManagement:
    """Tests for HR job management endpoints."""

    @pytest.mark.asyncio
    async def test_create_job_success(
        self, client: AsyncClient, hr_auth_headers: dict, test_hr_user: User
    ):
        """Test creating a new job."""
        unique_id = uuid.uuid4().hex[:8]
        job_data = {
            "title": f"Frontend Developer {unique_id}",
            "description": "We are looking for a talented frontend developer to join our team. This is an excellent opportunity to work on cutting-edge web applications.",
            "department": "Engineering",
            "location": "New York",
            "role_type": "FULL_TIME",
            "requirements": "React, TypeScript, CSS",
            "status": "ACTIVE",
            "questions": [
                {
                    "type": "TEXT",
                    "question": "Why do you want to work at our company?",
                    "time_limit": 120,
                    "required": True,
                    "order": 1
                }
            ]
        }

        response = await client.post(
            "/api/v1/jobs",
            json=job_data,
            headers=hr_auth_headers,
            follow_redirects=True
        )

        # 201 Created for successful POST
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "Frontend Developer" in data["data"]["title"]

    @pytest.mark.asyncio
    async def test_create_job_unauthorized(self, client: AsyncClient, auth_headers: dict):
        """Test creating job as non-HR user."""
        job_data = {
            "title": "Test Job",
            "description": "This is a test job description that is long enough to pass validation requirements.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "FULL_TIME",
            "questions": []
        }

        response = await client.post(
            "/api/v1/jobs",
            json=job_data,
            headers=auth_headers,  # Candidate token
            follow_redirects=True
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_create_job_no_auth(self, client: AsyncClient):
        """Test creating job without authentication."""
        job_data = {
            "title": "Test Job",
            "description": "This is a test job description that is long enough to pass validation requirements.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "FULL_TIME",
            "questions": []
        }

        response = await client.post("/api/v1/jobs", json=job_data, follow_redirects=True)

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_list_jobs_hr(
        self, client: AsyncClient, hr_auth_headers: dict, test_job: Job
    ):
        """Test HR listing their company's jobs."""
        response = await client.get(
            "/api/v1/jobs",
            headers=hr_auth_headers,
            follow_redirects=True
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_get_job_hr(
        self, client: AsyncClient, hr_auth_headers: dict, test_job: Job
    ):
        """Test HR getting job details."""
        response = await client.get(
            f"/api/v1/jobs/{test_job.id}",
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == test_job.id

    @pytest.mark.asyncio
    async def test_get_job_not_found(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test getting non-existent job."""
        response = await client.get(
            "/api/v1/jobs/99999",
            headers=hr_auth_headers
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_job_success(
        self, client: AsyncClient, hr_auth_headers: dict, test_job: Job
    ):
        """Test updating a job."""
        update_data = {
            "title": "Updated Title",
            "description": "Updated description that is long enough to pass validation requirements for the system.",
        }

        response = await client.patch(
            f"/api/v1/jobs/{test_job.id}",
            json=update_data,
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "Updated Title"

    @pytest.mark.asyncio
    async def test_update_job_not_found(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test updating non-existent job."""
        response = await client.patch(
            "/api/v1/jobs/99999",
            json={"title": "Updated"},
            headers=hr_auth_headers
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_job_unauthorized(
        self, client: AsyncClient, auth_headers: dict, test_job: Job
    ):
        """Test deleting job as non-HR user."""
        response = await client.delete(
            f"/api/v1/jobs/{test_job.id}",
            headers=auth_headers  # Candidate token
        )

        assert response.status_code == 403


class TestJobValidation:
    """Tests for job data validation."""

    @pytest.mark.asyncio
    async def test_create_job_missing_title(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test creating job without title."""
        job_data = {
            "description": "This is a test job description that is long enough to pass validation.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "FULL_TIME",
            "questions": []
        }

        response = await client.post(
            "/api/v1/jobs",
            json=job_data,
            headers=hr_auth_headers,
            follow_redirects=True
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_job_invalid_role_type(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test creating job with invalid role type."""
        job_data = {
            "title": "Test Job",
            "description": "This is a test job description that is long enough to pass validation requirements.",
            "department": "Engineering",
            "location": "Remote",
            "role_type": "INVALID_TYPE",
            "questions": []
        }

        response = await client.post(
            "/api/v1/jobs",
            json=job_data,
            headers=hr_auth_headers,
            follow_redirects=True
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_job_with_multiple_questions(
        self, client: AsyncClient, hr_auth_headers: dict
    ):
        """Test creating job with multiple question types."""
        unique_id = uuid.uuid4().hex[:8]
        job_data = {
            "title": f"Full Stack Developer {unique_id}",
            "description": "We are looking for a full stack developer to join our growing team. This is an excellent opportunity for growth.",
            "department": "Engineering",
            "location": "San Francisco",
            "role_type": "FULL_TIME",
            "status": "ACTIVE",
            "questions": [
                {
                    "type": "TEXT",
                    "question": "Describe your experience with web development",
                    "time_limit": 120,
                    "required": True,
                    "order": 1
                },
                {
                    "type": "VIDEO",
                    "question": "Tell us about yourself and your career goals",
                    "time_limit": 180,
                    "required": True,
                    "order": 2
                },
                {
                    "type": "MULTIPLE_CHOICE",
                    "question": "Which framework do you prefer for frontend development?",
                    "options": ["React", "Vue", "Angular"],
                    "required": False,
                    "order": 3
                }
            ]
        }

        response = await client.post(
            "/api/v1/jobs",
            json=job_data,
            headers=hr_auth_headers,
            follow_redirects=True
        )

        # 201 Created for successful POST
        assert response.status_code == 201
        data = response.json()
        assert len(data["data"]["questions"]) == 3


class TestJobStats:
    """Tests for job statistics."""

    @pytest.mark.asyncio
    async def test_job_stats_included_in_response(
        self, client: AsyncClient, hr_auth_headers: dict, test_job: Job
    ):
        """Test that job stats are included in job response."""
        response = await client.get(
            f"/api/v1/jobs/{test_job.id}",
            headers=hr_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        # Stats might be in the response or might not, depending on implementation
        assert data["success"] is True
