import logging
from datetime import datetime, timedelta
from typing import Dict, List
from celery import Task
from sqlalchemy import select
from app.tasks.celery_app import celery_app
from app.models.candidate import Candidate, InterviewResponse, CandidateScore, CandidateStatus
from app.models.job import Job, Question
from app.models.invite import Invite, InviteStatus
from app.services.ai_service import ai_service
from app.services.storage import storage_service
from app.services.email_service import email_service
from app.db.base import AsyncSessionLocal

logger = logging.getLogger(__name__)


class DatabaseTask(Task):
    """Base task with database session"""

    _db = None

    @property
    def db(self):
        if self._db is None:
            self._db = AsyncSessionLocal()
        return self._db


@celery_app.task(name="app.tasks.interview_tasks.process_interview_submission")
def process_interview_submission(candidate_id: str):
    """
    Process interview submission:
    1. Transcribe video responses
    2. Run AI analysis
    3. Calculate scores
    4. Update candidate status
    """
    import asyncio

    async def _process():
        async with AsyncSessionLocal() as db:
            try:
                logger.info(f"Processing interview for candidate: {candidate_id}")

                # Get candidate with responses
                result = await db.execute(
                    select(Candidate).filter(Candidate.id == candidate_id)
                )
                candidate = result.scalar_one_or_none()

                if not candidate:
                    logger.error(f"Candidate not found: {candidate_id}")
                    return

                # Get job and questions
                result = await db.execute(
                    select(Job).filter(Job.id == candidate.job_id)
                )
                job = result.scalar_one_or_none()

                if not job:
                    logger.error(f"Job not found: {candidate.job_id}")
                    return

                # Step 1: Transcribe video responses
                logger.info("Step 1: Transcribing video responses...")
                for response in candidate.responses:
                    if response.type in ["video", "phone"] and not response.transcript:
                        transcript = await ai_service.transcribe_audio(response.content)
                        if transcript:
                            response.transcript = transcript
                            await db.commit()

                # Step 2: Prepare data for AI analysis
                logger.info("Step 2: Running AI analysis...")
                questions_data = [
                    {
                        "id": str(q.id),
                        "question": q.question,
                        "type": q.type.value,
                    }
                    for q in job.questions
                ]

                responses_data = [
                    {
                        "question_id": str(r.question_id),
                        "content": r.content,
                        "transcript": r.transcript,
                        "type": r.type,
                    }
                    for r in candidate.responses
                ]

                candidate_info = {
                    "name": candidate.name,
                    "email": candidate.email,
                }

                # Step 3: Get AI scores
                ai_result = await ai_service.score_interview(
                    job_description=job.description,
                    questions=questions_data,
                    responses=responses_data,
                    candidate_info=candidate_info,
                )

                # Step 4: Save scores to database
                logger.info("Step 3: Saving scores...")
                score = CandidateScore(
                    candidate_id=candidate.id,
                    overall_score=ai_result.get("overall_score"),
                    ai_score=ai_result.get("overall_score"),
                    communication=ai_result["breakdown"].get("communication"),
                    technical_skills=ai_result["breakdown"].get("technical_skills"),
                    problem_solving=ai_result["breakdown"].get("problem_solving"),
                    culture_fit=ai_result["breakdown"].get("culture_fit"),
                    experience=ai_result["breakdown"].get("experience"),
                    summary=ai_result["insights"].get("summary"),
                    strengths=ai_result["insights"].get("strengths", []),
                    weaknesses=ai_result["insights"].get("weaknesses", []),
                    red_flags=ai_result["insights"].get("red_flags", []),
                    recommendations=ai_result["insights"].get("recommendations", []),
                    confidence_level=ai_result["insights"].get("confidence_level"),
                    skills_extracted=ai_result.get("skills_extracted", []),
                    scored_at=datetime.utcnow(),
                )

                db.add(score)

                # Step 5: Calculate percentile ranking
                result = await db.execute(
                    select(Candidate)
                    .filter(Candidate.job_id == candidate.job_id)
                    .filter(Candidate.status == CandidateStatus.SCORED)
                )
                all_candidates = result.scalars().all()
                total_candidates = len(all_candidates) + 1  # +1 for current candidate

                # Simple percentile calculation
                if total_candidates > 1:
                    rank = sum(
                        1
                        for c in all_candidates
                        if c.score and c.score.overall_score and c.score.overall_score < score.overall_score
                    ) + 1
                    percentile = (rank / total_candidates) * 100
                else:
                    rank = 1
                    percentile = 100

                score.percentile = percentile
                score.rank = rank
                score.total_candidates = total_candidates
                score.top_competencies = self._get_top_competencies(ai_result["breakdown"])
                score.comparison_text = self._get_comparison_text(percentile)

                # Step 6: Update per-question scores
                for q_score in ai_result.get("per_question_scores", []):
                    response = next(
                        (r for r in candidate.responses if str(r.question_id) == q_score["questionId"]),
                        None,
                    )
                    if response:
                        response.question_score = q_score.get("score")
                        response.question_feedback = {"feedback": q_score.get("feedback")}
                        response.keywords_found = q_score.get("keywordsFound", [])

                # Step 7: Update candidate status
                candidate.status = CandidateStatus.SCORED
                await db.commit()

                logger.info(f"Interview processed successfully for candidate: {candidate_id}")

            except Exception as e:
                logger.error(f"Error processing interview: {e}", exc_info=True)
                await db.rollback()
                raise

    def _get_top_competencies(breakdown: Dict) -> List[str]:
        """Get top 3 competencies"""
        sorted_competencies = sorted(
            breakdown.items(), key=lambda x: x[1] if x[1] else 0, reverse=True
        )
        return [comp[0] for comp in sorted_competencies[:3]]

    def _get_comparison_text(percentile: float) -> str:
        """Get comparison text based on percentile"""
        if percentile >= 90:
            return "Top 10% of candidates"
        elif percentile >= 75:
            return "Top 25% of candidates"
        elif percentile >= 50:
            return "Above average"
        else:
            return "Below average"

    # Run async function
    asyncio.run(_process())


@celery_app.task(name="app.tasks.interview_tasks.send_interview_reminders")
def send_interview_reminders():
    """Send reminders for pending interviews"""
    import asyncio

    async def _send_reminders():
        async with AsyncSessionLocal() as db:
            try:
                # Find invites that need reminders (sent 2+ days ago, not completed)
                cutoff_date = datetime.utcnow() - timedelta(days=2)
                result = await db.execute(
                    select(Invite)
                    .filter(Invite.status.in_([InviteStatus.SENT, InviteStatus.OPENED]))
                    .filter(Invite.sent_at < cutoff_date)
                    .filter(Invite.reminder_count < 2)  # Max 2 reminders
                )
                invites = result.scalars().all()

                logger.info(f"Sending reminders to {len(invites)} candidates")

                for invite in invites:
                    # Get job details
                    result = await db.execute(
                        select(Job).filter(Job.id == invite.job_id)
                    )
                    job = result.scalar_one_or_none()

                    if job:
                        # Get candidate
                        result = await db.execute(
                            select(Candidate).filter(Candidate.invite_token == invite.token)
                        )
                        candidate = result.scalar_one_or_none()

                        if candidate:
                            success = await email_service.send_reminder(
                                invite.email,
                                candidate.name,
                                job.title,
                                invite.token,
                            )

                            if success:
                                invite.reminder_count += 1
                                invite.last_reminder_at = datetime.utcnow()
                                await db.commit()

                logger.info(f"Reminders sent successfully")

            except Exception as e:
                logger.error(f"Error sending reminders: {e}", exc_info=True)

    asyncio.run(_send_reminders())
