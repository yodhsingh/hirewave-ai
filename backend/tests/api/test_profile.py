"""Tests for profile endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.applicant_profile import ApplicantProfile


class TestGetProfile:
    """Tests for GET /api/v1/profile/me endpoint."""

    @pytest.mark.asyncio
    async def test_get_profile_exists(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_profile: ApplicantProfile,
    ):
        """Test getting existing profile."""
        response = await client.get(
            "/api/v1/profile/me",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_profile_not_exists(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test getting profile when it doesn't exist."""
        response = await client.get(
            "/api/v1/profile/me",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_get_profile_unauthorized(self, client: AsyncClient):
        """Test getting profile without authentication."""
        response = await client.get("/api/v1/profile/me")

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]


class TestSaveProfile:
    """Tests for POST /api/v1/profile/save endpoint."""

    @pytest.mark.asyncio
    async def test_create_profile(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test creating a new profile."""
        profile_data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "location": "New York, NY",
            "summary": "Experienced software developer",
            "current_job_title": "Software Engineer",
            "years_of_experience": "5",
            "skills": ["Python", "JavaScript", "SQL"],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_update_profile(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_profile: ApplicantProfile,
    ):
        """Test updating an existing profile."""
        profile_data = {
            "full_name": "Updated Name",
            "current_job_title": "Senior Developer",
            "years_of_experience": "7",
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_save_profile_with_skills_array(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with skills as array."""
        profile_data = {
            "full_name": "Test User",
            "skills": ["Python", "FastAPI", "PostgreSQL"],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_save_profile_with_skills_dict(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with skills as categorized dict."""
        profile_data = {
            "full_name": "Test User",
            "skills": {
                "technical": ["Python", "JavaScript"],
                "soft": ["Communication", "Leadership"],
            },
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_save_profile_with_camelcase_fields(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with camelCase field names (from frontend)."""
        profile_data = {
            "name": "John Doe",
            "linkedinUrl": "https://linkedin.com/in/johndoe",
            "githubUrl": "https://github.com/johndoe",
            "currentRole": "Software Engineer",
            "currentCompany": "TechCorp",
            "experience": "5",
            "workExperience": [
                {
                    "company": "TechCorp",
                    "title": "Engineer",
                    "duration": "2 years"
                }
            ],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_save_profile_unauthorized(self, client: AsyncClient):
        """Test saving profile without authentication."""
        response = await client.post(
            "/api/v1/profile/save",
            json={"full_name": "Test"}
        )

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]


class TestDeleteProfile:
    """Tests for DELETE /api/v1/profile/me endpoint."""

    @pytest.mark.asyncio
    async def test_delete_profile_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_profile: ApplicantProfile,
    ):
        """Test deleting profile successfully."""
        response = await client.delete(
            "/api/v1/profile/me",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_delete_profile_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test deleting non-existent profile."""
        response = await client.delete(
            "/api/v1/profile/me",
            headers=auth_headers
        )

        # Could be 404 or 200 with message depending on implementation
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_delete_profile_unauthorized(self, client: AsyncClient):
        """Test deleting profile without authentication."""
        response = await client.delete("/api/v1/profile/me")

        # 401 for unauthorized, 403 for forbidden
        assert response.status_code in [401, 403]


class TestProfileFields:
    """Tests for various profile field handling."""

    @pytest.mark.asyncio
    async def test_profile_with_work_experience(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with work experience."""
        profile_data = {
            "full_name": "Test User",
            "work_experience": [
                {
                    "company": "Company A",
                    "title": "Developer",
                    "start_date": "2020-01",
                    "end_date": "2022-01",
                    "description": "Built software"
                },
                {
                    "company": "Company B",
                    "title": "Senior Developer",
                    "start_date": "2022-02",
                    "end_date": None,
                    "description": "Leading team"
                }
            ],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_profile_with_education(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with education."""
        profile_data = {
            "full_name": "Test User",
            "education": "Bachelor's in Computer Science, MIT 2020",
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_profile_with_certifications(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with certifications."""
        profile_data = {
            "full_name": "Test User",
            "certifications": [
                {"name": "AWS Certified Developer", "date": "2023"},
                {"name": "Google Cloud Professional", "date": "2022"},
            ],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_profile_with_projects(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with projects."""
        profile_data = {
            "full_name": "Test User",
            "projects": [
                {
                    "name": "E-commerce Platform",
                    "description": "Built a scalable platform",
                    "technologies": ["React", "Node.js", "PostgreSQL"],
                    "url": "https://github.com/test/project"
                }
            ],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_profile_with_preferences(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
    ):
        """Test saving profile with job preferences."""
        profile_data = {
            "full_name": "Test User",
            "expected_salary": "$120,000 - $150,000",
            "availability": "Immediately",
            "work_type": "Remote",
            "preferred_location": "United States",
            "desired_roles": ["Software Engineer", "Tech Lead"],
            "industries": ["Technology", "Finance"],
        }

        response = await client.post(
            "/api/v1/profile/save",
            json=profile_data,
            headers=auth_headers
        )

        assert response.status_code == 200
