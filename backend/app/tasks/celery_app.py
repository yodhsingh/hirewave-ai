from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "genai_interview",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
    include=["app.tasks.interview_tasks"],
)

# Configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "send-interview-reminders": {
        "task": "app.tasks.interview_tasks.send_interview_reminders",
        "schedule": 86400.0,  # Every 24 hours
    },
}
