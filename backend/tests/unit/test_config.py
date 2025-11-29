"""Unit tests for configuration module."""

import pytest
from unittest.mock import patch
import os


class TestSettingsProperties:
    """Tests for Settings computed properties."""

    def test_max_video_size_bytes(self):
        """Test max video size calculation in bytes."""
        from app.core.config import settings

        expected = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
        assert settings.max_video_size_bytes == expected

    def test_max_audio_size_bytes(self):
        """Test max audio size calculation in bytes."""
        from app.core.config import settings

        expected = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
        assert settings.max_audio_size_bytes == expected

    def test_celery_broker_fallback_to_redis(self):
        """Test celery broker falls back to REDIS_URL."""
        from app.core.config import settings

        # When CELERY_BROKER_URL is not set, should use REDIS_URL
        if not settings.CELERY_BROKER_URL:
            assert settings.celery_broker == settings.REDIS_URL

    def test_celery_backend_fallback_to_redis(self):
        """Test celery backend falls back to REDIS_URL."""
        from app.core.config import settings

        # When CELERY_RESULT_BACKEND is not set, should use REDIS_URL
        if not settings.CELERY_RESULT_BACKEND:
            assert settings.celery_backend == settings.REDIS_URL


class TestSettingsDefaults:
    """Tests for Settings default values."""

    def test_app_name_default(self):
        """Test app name has default value."""
        from app.core.config import settings

        assert settings.APP_NAME == "GenAI Interview Platform"

    def test_app_version_default(self):
        """Test app version has default value."""
        from app.core.config import settings

        assert settings.APP_VERSION == "0.1.0"

    def test_api_prefix_default(self):
        """Test API prefix has default value."""
        from app.core.config import settings

        assert settings.API_V1_PREFIX == "/api/v1"

    def test_host_default(self):
        """Test host has default value."""
        from app.core.config import settings

        assert settings.HOST == "0.0.0.0"

    def test_port_default(self):
        """Test port has default value."""
        from app.core.config import settings

        assert settings.PORT == 8000

    def test_algorithm_default(self):
        """Test JWT algorithm has default value."""
        from app.core.config import settings

        assert settings.ALGORITHM == "HS256"

    def test_aws_region_default(self):
        """Test AWS region has default value."""
        from app.core.config import settings

        assert settings.AWS_REGION == "us-east-1"

    def test_openai_model_default(self):
        """Test OpenAI model has default value."""
        from app.core.config import settings

        assert "gpt" in settings.OPENAI_MODEL.lower()

    def test_gemini_model_default(self):
        """Test Gemini model has default value."""
        from app.core.config import settings

        assert "gemini" in settings.GEMINI_MODEL.lower()

    def test_video_expiry_default(self):
        """Test S3 video expiry has default value."""
        from app.core.config import settings

        assert settings.S3_VIDEO_EXPIRY_SECONDS == 3600

    def test_rate_limit_default(self):
        """Test rate limit has default value."""
        from app.core.config import settings

        assert settings.RATE_LIMIT_PER_MINUTE == 60

    def test_allowed_video_formats(self):
        """Test allowed video formats includes common formats."""
        from app.core.config import settings

        assert "mp4" in settings.ALLOWED_VIDEO_FORMATS
        assert "webm" in settings.ALLOWED_VIDEO_FORMATS

    def test_allowed_audio_formats(self):
        """Test allowed audio formats includes common formats."""
        from app.core.config import settings

        assert "mp3" in settings.ALLOWED_AUDIO_FORMATS
        assert "wav" in settings.ALLOWED_AUDIO_FORMATS


class TestCORSOriginsParsing:
    """Tests for CORS origins parsing."""

    def test_cors_origins_is_list(self):
        """Test CORS origins is a list."""
        from app.core.config import settings

        assert isinstance(settings.CORS_ORIGINS, list)

    def test_cors_origins_contains_localhost(self):
        """Test CORS origins includes localhost by default."""
        from app.core.config import settings

        has_localhost = any("localhost" in origin for origin in settings.CORS_ORIGINS)
        assert has_localhost


class TestSettingsRequired:
    """Tests for required settings."""

    def test_database_url_exists(self):
        """Test DATABASE_URL is configured."""
        from app.core.config import settings

        assert settings.DATABASE_URL is not None
        assert len(settings.DATABASE_URL) > 0

    def test_secret_key_exists(self):
        """Test SECRET_KEY is configured."""
        from app.core.config import settings

        assert settings.SECRET_KEY is not None
        assert len(settings.SECRET_KEY) > 0

    def test_redis_url_exists(self):
        """Test REDIS_URL is configured."""
        from app.core.config import settings

        assert settings.REDIS_URL is not None


class TestSettingsTypes:
    """Tests for settings type validation."""

    def test_debug_is_bool(self):
        """Test DEBUG is boolean."""
        from app.core.config import settings

        assert isinstance(settings.DEBUG, bool)

    def test_port_is_int(self):
        """Test PORT is integer."""
        from app.core.config import settings

        assert isinstance(settings.PORT, int)

    def test_access_token_expire_is_int(self):
        """Test ACCESS_TOKEN_EXPIRE_MINUTES is integer."""
        from app.core.config import settings

        assert isinstance(settings.ACCESS_TOKEN_EXPIRE_MINUTES, int)
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0

    def test_refresh_token_expire_is_int(self):
        """Test REFRESH_TOKEN_EXPIRE_DAYS is integer."""
        from app.core.config import settings

        assert isinstance(settings.REFRESH_TOKEN_EXPIRE_DAYS, int)
        assert settings.REFRESH_TOKEN_EXPIRE_DAYS > 0

    def test_database_pool_size_is_int(self):
        """Test DATABASE_POOL_SIZE is integer."""
        from app.core.config import settings

        assert isinstance(settings.DATABASE_POOL_SIZE, int)
        assert settings.DATABASE_POOL_SIZE > 0

    def test_max_video_size_is_int(self):
        """Test MAX_VIDEO_SIZE_MB is integer."""
        from app.core.config import settings

        assert isinstance(settings.MAX_VIDEO_SIZE_MB, int)
        assert settings.MAX_VIDEO_SIZE_MB > 0


class TestSettingsSecurity:
    """Tests for security-related settings."""

    def test_secret_key_not_empty(self):
        """Test SECRET_KEY is not empty."""
        from app.core.config import settings

        assert len(settings.SECRET_KEY) >= 16

    def test_algorithm_is_valid(self):
        """Test ALGORITHM is a valid JWT algorithm."""
        from app.core.config import settings

        valid_algorithms = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"]
        assert settings.ALGORITHM in valid_algorithms
