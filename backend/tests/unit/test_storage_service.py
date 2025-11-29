"""Unit tests for storage service module."""

import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError

from app.services.storage import S3StorageService


class TestS3StorageServiceInitialization:
    """Tests for S3StorageService initialization."""

    def test_storage_service_initialization(self):
        """Test storage service initializes correctly."""
        service = S3StorageService()
        assert service._s3_client is None
        assert service._bucket is None

    def test_s3_client_raises_without_credentials(self):
        """Test s3_client raises error without credentials."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = None
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "bucket"

            service = S3StorageService()
            service._s3_client = None

            with pytest.raises(ValueError) as exc_info:
                _ = service.s3_client

            assert "AWS credentials not configured" in str(exc_info.value)

    def test_s3_client_raises_without_bucket(self):
        """Test s3_client raises error without bucket."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = None

            service = S3StorageService()
            service._s3_client = None

            with pytest.raises(ValueError) as exc_info:
                _ = service.s3_client

            assert "AWS credentials not configured" in str(exc_info.value)

    def test_s3_client_initializes_with_credentials(self):
        """Test s3_client initializes with valid credentials."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "test-key-id"
            mock_settings.AWS_SECRET_ACCESS_KEY = "test-secret"
            mock_settings.S3_BUCKET = "test-bucket"
            mock_settings.AWS_REGION = "us-east-1"

            with patch("app.services.storage.boto3") as mock_boto3:
                mock_client = MagicMock()
                mock_boto3.client.return_value = mock_client

                service = S3StorageService()
                service._s3_client = None
                client = service.s3_client

                mock_boto3.client.assert_called_once_with(
                    "s3",
                    aws_access_key_id="test-key-id",
                    aws_secret_access_key="test-secret",
                    region_name="us-east-1",
                )
                assert client == mock_client

    def test_bucket_property_raises_without_config(self):
        """Test bucket property raises error without config."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.S3_BUCKET = None

            service = S3StorageService()
            service._bucket = None

            with pytest.raises(ValueError) as exc_info:
                _ = service.bucket

            assert "S3_BUCKET not configured" in str(exc_info.value)

    def test_bucket_property_returns_bucket_name(self):
        """Test bucket property returns configured bucket name."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.S3_BUCKET = "my-test-bucket"

            service = S3StorageService()
            service._bucket = None
            bucket = service.bucket

            assert bucket == "my-test-bucket"


class TestVideoUpload:
    """Tests for video upload functionality."""

    @pytest.mark.asyncio
    async def test_upload_video_success(self):
        """Test successful video upload."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "test-bucket"
            mock_settings.AWS_REGION = "us-west-2"

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.put_object.return_value = {}
            service._s3_client = mock_client
            service._bucket = "test-bucket"

            result = await service.upload_video(
                file_data=b"video content",
                candidate_id="candidate123",
                question_id="question456",
                file_extension="mp4",
            )

            assert result is not None
            assert "test-bucket" in result
            assert "candidate123" in result
            assert "question456" in result
            assert "mp4" in result

            mock_client.put_object.assert_called_once()

    @pytest.mark.asyncio
    async def test_upload_video_failure(self):
        """Test video upload failure."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "test-bucket"
            mock_settings.AWS_REGION = "us-east-1"

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.put_object.side_effect = ClientError(
                {"Error": {"Code": "500", "Message": "Internal Error"}},
                "PutObject",
            )
            service._s3_client = mock_client
            service._bucket = "test-bucket"

            result = await service.upload_video(
                b"data", "candidate", "question", "mp4"
            )

            assert result is None

    @pytest.mark.asyncio
    async def test_upload_video_correct_key_format(self):
        """Test video upload generates correct S3 key."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "bucket"
            mock_settings.AWS_REGION = "us-east-1"

            service = S3StorageService()

            mock_client = MagicMock()
            service._s3_client = mock_client
            service._bucket = "bucket"

            await service.upload_video(
                b"content", "cand-123", "q-456", "webm"
            )

            call_kwargs = mock_client.put_object.call_args.kwargs
            assert call_kwargs["Key"] == "videos/cand-123/q-456.webm"
            assert call_kwargs["ContentType"] == "video/webm"


class TestPresignedURL:
    """Tests for presigned URL generation."""

    @pytest.mark.asyncio
    async def test_generate_presigned_url_success(self):
        """Test successful presigned URL generation."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "test-bucket"
            mock_settings.S3_VIDEO_EXPIRY_SECONDS = 3600

            service = S3StorageService()

            mock_url = "https://test-bucket.s3.amazonaws.com/video.mp4?signature=xyz"
            mock_client = MagicMock()
            mock_client.generate_presigned_url.return_value = mock_url
            service._s3_client = mock_client
            service._bucket = "test-bucket"

            result = await service.generate_presigned_url("videos/test.mp4")

            assert result == mock_url
            mock_client.generate_presigned_url.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_presigned_url_custom_expiry(self):
        """Test presigned URL with custom expiry."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "bucket"
            mock_settings.S3_VIDEO_EXPIRY_SECONDS = 3600

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.generate_presigned_url.return_value = "url"
            service._s3_client = mock_client
            service._bucket = "bucket"

            await service.generate_presigned_url("key", expiry_seconds=7200)

            call_kwargs = mock_client.generate_presigned_url.call_args.kwargs
            assert call_kwargs["ExpiresIn"] == 7200

    @pytest.mark.asyncio
    async def test_generate_presigned_url_default_expiry(self):
        """Test presigned URL uses default expiry."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "bucket"
            mock_settings.S3_VIDEO_EXPIRY_SECONDS = 1800

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.generate_presigned_url.return_value = "url"
            service._s3_client = mock_client
            service._bucket = "bucket"

            await service.generate_presigned_url("key")

            call_kwargs = mock_client.generate_presigned_url.call_args.kwargs
            assert call_kwargs["ExpiresIn"] == 1800

    @pytest.mark.asyncio
    async def test_generate_presigned_url_failure(self):
        """Test presigned URL generation failure."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "bucket"
            mock_settings.S3_VIDEO_EXPIRY_SECONDS = 3600

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.generate_presigned_url.side_effect = ClientError(
                {"Error": {"Code": "403", "Message": "Forbidden"}},
                "GeneratePresignedUrl",
            )
            service._s3_client = mock_client
            service._bucket = "bucket"

            result = await service.generate_presigned_url("key")

            assert result is None


class TestVideoDelete:
    """Tests for video deletion."""

    @pytest.mark.asyncio
    async def test_delete_video_success(self):
        """Test successful video deletion."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "test-bucket"

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.delete_object.return_value = {}
            service._s3_client = mock_client
            service._bucket = "test-bucket"

            result = await service.delete_video("videos/candidate/question.mp4")

            assert result is True
            mock_client.delete_object.assert_called_once_with(
                Bucket="test-bucket",
                Key="videos/candidate/question.mp4",
            )

    @pytest.mark.asyncio
    async def test_delete_video_failure(self):
        """Test video deletion failure."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "bucket"

            service = S3StorageService()

            mock_client = MagicMock()
            mock_client.delete_object.side_effect = ClientError(
                {"Error": {"Code": "404", "Message": "Not Found"}},
                "DeleteObject",
            )
            service._s3_client = mock_client
            service._bucket = "bucket"

            result = await service.delete_video("nonexistent/key")

            assert result is False

    @pytest.mark.asyncio
    async def test_delete_video_correct_parameters(self):
        """Test delete video uses correct S3 parameters."""
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.AWS_ACCESS_KEY_ID = "key"
            mock_settings.AWS_SECRET_ACCESS_KEY = "secret"
            mock_settings.S3_BUCKET = "my-bucket"

            service = S3StorageService()

            mock_client = MagicMock()
            service._s3_client = mock_client
            service._bucket = "my-bucket"

            await service.delete_video("path/to/video.mp4")

            mock_client.delete_object.assert_called_once_with(
                Bucket="my-bucket",
                Key="path/to/video.mp4",
            )
