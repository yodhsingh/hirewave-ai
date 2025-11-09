import logging
from typing import List
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, To
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SendGrid"""

    def __init__(self):
        self._client = None
        self.from_email = settings.SENDGRID_FROM_EMAIL
        self.from_name = settings.SENDGRID_FROM_NAME

    @property
    def client(self) -> SendGridAPIClient:
        """Lazy initialization of SendGrid client"""
        if self._client is None:
            if not settings.SENDGRID_API_KEY:
                raise ValueError(
                    "SENDGRID_API_KEY is not configured. "
                    "Please set it in your .env file to send emails."
                )
            self._client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        return self._client

    async def send_interview_invite(
        self, to_email: str, candidate_name: str, job_title: str, invite_token: str
    ) -> bool:
        """Send interview invite email"""
        try:
            interview_url = f"{settings.FRONTEND_URL}/interview/{invite_token}"

            html_content = f"""
            <html>
            <body>
                <h2>Interview Invitation</h2>
                <p>Hi {candidate_name},</p>
                <p>You've been invited to complete an interview for the <strong>{job_title}</strong> position.</p>
                <p>This is an asynchronous video interview that you can complete at your convenience.</p>
                <p><a href="{interview_url}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">Start Interview</a></p>
                <p>The interview will take approximately 20-30 minutes to complete.</p>
                <p>Best regards,<br>The Hiring Team</p>
            </body>
            </html>
            """

            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email,
                subject=f"Interview Invitation - {job_title}",
                html_content=html_content,
            )

            response = self.client.send(message)
            logger.info(f"Interview invite sent to {to_email}: {response.status_code}")
            return response.status_code == 202

        except Exception as e:
            logger.error(f"Failed to send invite email: {e}")
            return False

    async def send_bulk_invites(
        self, recipients: List[dict], job_title: str
    ) -> dict:
        """Send bulk interview invites"""
        sent = 0
        failed = []

        for recipient in recipients:
            success = await self.send_interview_invite(
                recipient["email"],
                recipient["name"],
                job_title,
                recipient["token"],
            )
            if success:
                sent += 1
            else:
                failed.append(recipient["email"])

        return {"sent": sent, "failed": len(failed), "failed_emails": failed}

    async def send_reminder(
        self, to_email: str, candidate_name: str, job_title: str, invite_token: str
    ) -> bool:
        """Send interview reminder"""
        try:
            interview_url = f"{settings.FRONTEND_URL}/interview/{invite_token}"

            html_content = f"""
            <html>
            <body>
                <h2>Interview Reminder</h2>
                <p>Hi {candidate_name},</p>
                <p>This is a friendly reminder to complete your interview for the <strong>{job_title}</strong> position.</p>
                <p><a href="{interview_url}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 4px;">Continue Interview</a></p>
                <p>Looking forward to hearing from you!</p>
                <p>Best regards,<br>The Hiring Team</p>
            </body>
            </html>
            """

            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email,
                subject=f"Reminder: Interview for {job_title}",
                html_content=html_content,
            )

            response = self.client.send(message)
            return response.status_code == 202

        except Exception as e:
            logger.error(f"Failed to send reminder email: {e}")
            return False


# Singleton instance
email_service = EmailService()
