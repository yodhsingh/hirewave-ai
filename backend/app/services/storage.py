import boto3
from botocore.exceptions import ClientError
from datetime import timedelta
from typing import Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class S3StorageService:
    """Service for handling S3 file uploads and downloads"""

    def __init__(self):
        self._s3_client = None
        self._bucket = None

    @property
    def s3_client(self):
        """Lazy initialization of S3 client"""
        if self._s3_client is None:
            if not all([settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, settings.S3_BUCKET]):
                raise ValueError(
                    "AWS credentials not configured. "
                    "Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET in your .env file."
                )
            self._s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )
        return self._s3_client

    @property
    def bucket(self):
        """Get S3 bucket name"""
        if self._bucket is None:
            if not settings.S3_BUCKET:
                raise ValueError("S3_BUCKET not configured in .env file")
            self._bucket = settings.S3_BUCKET
        return self._bucket

    async def upload_video(
        self, file_data: bytes, candidate_id: str, question_id: str, file_extension: str
    ) -> Optional[str]:
        """Upload video to S3 and return URL"""
        try:
            key = f"videos/{candidate_id}/{question_id}.{file_extension}"

            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_data,
                ContentType=f"video/{file_extension}",
            )

            # Generate permanent URL
            url = f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            logger.info(f"Video uploaded successfully: {url}")
            return url

        except ClientError as e:
            logger.error(f"Failed to upload video: {e}")
            return None

    async def generate_presigned_url(self, key: str, expiry_seconds: Optional[int] = None) -> Optional[str]:
        """Generate a presigned URL for secure video access"""
        try:
            expiry = expiry_seconds or settings.S3_VIDEO_EXPIRY_SECONDS
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiry,
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return None

    async def delete_video(self, key: str) -> bool:
        """Delete video from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=key)
            logger.info(f"Video deleted successfully: {key}")
            return True
        except ClientError as e:
            logger.error(f"Failed to delete video: {e}")
            return False


# Singleton instance
storage_service = S3StorageService()
