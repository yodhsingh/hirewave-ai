"""Unit tests for email service module."""

import pytest
from unittest.mock import MagicMock, patch

from app.services.email_service import EmailService


class TestEmailServiceInitialization:
    """Tests for EmailService initialization."""

    def test_email_service_initialization(self):
        """Test email service initializes correctly."""
        service = EmailService()
        assert service._client is None
        assert service.from_email is not None

    def test_client_property_raises_without_api_key(self):
        """Test client raises error without API key."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = None
            mock_settings.SENDGRID_FROM_EMAIL = "test@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test"

            service = EmailService()
            service._client = None

            with pytest.raises(ValueError) as exc_info:
                _ = service.client

            assert "SENDGRID_API_KEY is not configured" in str(exc_info.value)

    def test_client_property_initializes_with_api_key(self):
        """Test client initializes with valid API key."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-api-key"
            mock_settings.SENDGRID_FROM_EMAIL = "test@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test"

            with patch("app.services.email_service.SendGridAPIClient") as mock_sg:
                mock_client = MagicMock()
                mock_sg.return_value = mock_client

                service = EmailService()
                service._client = None
                client = service.client

                mock_sg.assert_called_once_with("test-api-key")
                assert client == mock_client


class TestInterviewInvite:
    """Tests for interview invite emails."""

    @pytest.mark.asyncio
    async def test_send_interview_invite_success(self):
        """Test sending interview invite successfully."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test Platform"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            service = EmailService()

            mock_response = MagicMock()
            mock_response.status_code = 202

            mock_client = MagicMock()
            mock_client.send.return_value = mock_response

            service._client = mock_client

            result = await service.send_interview_invite(
                to_email="candidate@test.com",
                candidate_name="John Doe",
                job_title="Software Engineer",
                invite_token="test-token-123",
            )

            assert result is True
            mock_client.send.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_interview_invite_failure(self):
        """Test handling invite sending failure."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            service = EmailService()

            mock_response = MagicMock()
            mock_response.status_code = 400

            mock_client = MagicMock()
            mock_client.send.return_value = mock_response

            service._client = mock_client

            result = await service.send_interview_invite(
                "candidate@test.com", "John", "Job", "token"
            )

            assert result is False

    @pytest.mark.asyncio
    async def test_send_interview_invite_exception(self):
        """Test handling exception during invite sending."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            service = EmailService()

            mock_client = MagicMock()
            mock_client.send.side_effect = Exception("Network error")

            service._client = mock_client

            result = await service.send_interview_invite(
                "candidate@test.com", "John", "Job", "token"
            )

            assert result is False

    @pytest.mark.asyncio
    async def test_interview_invite_email_content(self):
        """Test interview invite email contains correct content."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test Platform"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            with patch("app.services.email_service.Mail") as mock_mail:
                service = EmailService()

                mock_response = MagicMock()
                mock_response.status_code = 202

                mock_client = MagicMock()
                mock_client.send.return_value = mock_response
                service._client = mock_client

                await service.send_interview_invite(
                    to_email="test@test.com",
                    candidate_name="Jane Smith",
                    job_title="Senior Developer",
                    invite_token="abc123",
                )

                # Verify Mail was called with correct parameters
                call_kwargs = mock_mail.call_args.kwargs
                assert call_kwargs["to_emails"] == "test@test.com"
                assert "Senior Developer" in call_kwargs["subject"]
                assert "Jane Smith" in call_kwargs["html_content"]
                assert "abc123" in call_kwargs["html_content"]


class TestBulkInvites:
    """Tests for bulk invite functionality."""

    @pytest.mark.asyncio
    async def test_send_bulk_invites_all_success(self):
        """Test bulk invites all succeed."""
        service = EmailService()

        # Mock send_interview_invite to return True
        async def mock_send(*args, **kwargs):
            return True

        with patch.object(service, "send_interview_invite", mock_send):
            recipients = [
                {"email": "user1@test.com", "name": "User 1", "token": "token1"},
                {"email": "user2@test.com", "name": "User 2", "token": "token2"},
                {"email": "user3@test.com", "name": "User 3", "token": "token3"},
            ]

            result = await service.send_bulk_invites(recipients, "Test Job")

            assert result["sent"] == 3
            assert result["failed"] == 0
            assert result["failed_emails"] == []

    @pytest.mark.asyncio
    async def test_send_bulk_invites_partial_failure(self):
        """Test bulk invites with some failures."""
        service = EmailService()

        call_count = 0

        async def mock_send(email, name, job_title, token):
            nonlocal call_count
            call_count += 1
            # Fail every other email
            return call_count % 2 == 1

        with patch.object(service, "send_interview_invite", mock_send):
            recipients = [
                {"email": "user1@test.com", "name": "User 1", "token": "token1"},
                {"email": "user2@test.com", "name": "User 2", "token": "token2"},
                {"email": "user3@test.com", "name": "User 3", "token": "token3"},
                {"email": "user4@test.com", "name": "User 4", "token": "token4"},
            ]

            result = await service.send_bulk_invites(recipients, "Test Job")

            assert result["sent"] == 2
            assert result["failed"] == 2
            assert len(result["failed_emails"]) == 2

    @pytest.mark.asyncio
    async def test_send_bulk_invites_all_failure(self):
        """Test bulk invites all fail."""
        service = EmailService()

        async def mock_send(*args, **kwargs):
            return False

        with patch.object(service, "send_interview_invite", mock_send):
            recipients = [
                {"email": "user1@test.com", "name": "User 1", "token": "token1"},
                {"email": "user2@test.com", "name": "User 2", "token": "token2"},
            ]

            result = await service.send_bulk_invites(recipients, "Test Job")

            assert result["sent"] == 0
            assert result["failed"] == 2

    @pytest.mark.asyncio
    async def test_send_bulk_invites_empty_list(self):
        """Test bulk invites with empty list."""
        service = EmailService()

        result = await service.send_bulk_invites([], "Test Job")

        assert result["sent"] == 0
        assert result["failed"] == 0
        assert result["failed_emails"] == []


class TestReminderEmail:
    """Tests for reminder email functionality."""

    @pytest.mark.asyncio
    async def test_send_reminder_success(self):
        """Test sending reminder successfully."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test Platform"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            service = EmailService()

            mock_response = MagicMock()
            mock_response.status_code = 202

            mock_client = MagicMock()
            mock_client.send.return_value = mock_response
            service._client = mock_client

            result = await service.send_reminder(
                to_email="candidate@test.com",
                candidate_name="John",
                job_title="Developer",
                invite_token="token123",
            )

            assert result is True

    @pytest.mark.asyncio
    async def test_send_reminder_failure(self):
        """Test reminder sending failure."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            service = EmailService()

            mock_client = MagicMock()
            mock_client.send.side_effect = Exception("Send failed")
            service._client = mock_client

            result = await service.send_reminder(
                "test@test.com", "User", "Job", "token"
            )

            assert result is False

    @pytest.mark.asyncio
    async def test_reminder_email_content(self):
        """Test reminder email contains correct content."""
        with patch("app.services.email_service.settings") as mock_settings:
            mock_settings.SENDGRID_API_KEY = "test-key"
            mock_settings.SENDGRID_FROM_EMAIL = "noreply@test.com"
            mock_settings.SENDGRID_FROM_NAME = "Test Platform"
            mock_settings.FRONTEND_URL = "http://localhost:3000"

            with patch("app.services.email_service.Mail") as mock_mail:
                service = EmailService()

                mock_response = MagicMock()
                mock_response.status_code = 202

                mock_client = MagicMock()
                mock_client.send.return_value = mock_response
                service._client = mock_client

                await service.send_reminder(
                    to_email="test@test.com",
                    candidate_name="Bob Smith",
                    job_title="Manager",
                    invite_token="xyz789",
                )

                call_kwargs = mock_mail.call_args.kwargs
                assert "Reminder" in call_kwargs["subject"]
                assert "Manager" in call_kwargs["subject"]
                assert "Bob Smith" in call_kwargs["html_content"]
                assert "xyz789" in call_kwargs["html_content"]
