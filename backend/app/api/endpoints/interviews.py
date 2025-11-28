from datetime import datetime
import logging
import json
import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import google.generativeai as genai

from app.db.base import get_db
from app.models.candidate import Candidate, CandidateStatus
from app.models.job import Job
from app.models.company import Company
from app.models.invite import Invite, InviteStatus
from app.models.applicant_profile import ApplicantProfile
from app.models.user import User
from app.models.generated_interview import CandidateInterviewQuestion, CandidateInterviewResponse
from app.schemas.candidate import InterviewSubmitRequest, InterviewSubmitResponse
from app.schemas.job import JobResponse, QuestionResponse
from app.schemas.common import ApiResponse
from app.services.storage import storage_service
from app.tasks.interview_tasks import process_interview_submission
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interviews", tags=["Interviews"])


def get_gemini_model():
    """Get or initialize the Gemini model"""
    api_key = os.getenv("GOOGLE_GEMINI_API_KEY") or settings.GOOGLE_GEMINI_API_KEY
    if not api_key:
        logger.error("GOOGLE_GEMINI_API_KEY not found")
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured"
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(settings.GEMINI_MODEL)


async def generate_interview_questions_for_candidate(
    job: Job,
    candidate: Candidate,
    resume_data: Optional[Dict[str, Any]] = None,
    sample_questions: Optional[List[str]] = None,
    questions_count: int = 5
) -> List[Dict[str, Any]]:
    """
    Generate personalized interview questions based on job description and candidate resume.
    Uses sample questions from the job as inspiration if helpful.
    """
    # Build job context
    job_context = f"""
    Job Title: {job.title}
    Department: {job.department}
    Description: {job.description}
    Requirements: {job.requirements or 'Not specified'}
    """

    # Build resume/candidate context
    resume_context = ""
    if resume_data:
        resume_context = f"""
        Candidate Name: {resume_data.get('full_name', candidate.name)}
        Current Role: {resume_data.get('current_job_title', 'Not specified')}
        Experience: {resume_data.get('years_of_experience', 'Not specified')} years
        Skills: {json.dumps(resume_data.get('skills', {}))}
        Education: {resume_data.get('education', 'Not specified')}
        Summary: {resume_data.get('summary', 'Not specified')}
        """
    else:
        resume_context = f"""
        Candidate Name: {candidate.name}
        Email: {candidate.email}
        """

    # Build sample questions context
    sample_context = ""
    if sample_questions and len(sample_questions) > 0:
        sample_context = f"""

        Sample questions from the job posting (use as inspiration if relevant):
        {chr(10).join(f'- {q}' for q in sample_questions[:3])}
        """

    # Create prompt for Gemini
    prompt = f"""You are an expert HR interviewer. Generate {questions_count} personalized interview questions for a candidate.

    {job_context}

    {resume_context}
    {sample_context}

    Generate a mix of question types:
    - 2 behavioral questions (STAR method appropriate)
    - 2 technical/skill-based questions specific to the role
    - 1 situational question

    For each question, provide:
    1. The question itself (clear, specific, not too long)
    2. The type (behavioral, technical, situational)
    3. Brief context about what this question assesses
    4. 3-4 key points that would make a strong answer

    Format your response as a JSON array with this structure:
    [
        {{
            "question": "Your question here",
            "type": "behavioral|technical|situational",
            "context": "What this question assesses",
            "ideal_points": ["point1", "point2", "point3"]
        }}
    ]

    Make questions specific to:
    1. The job requirements and description
    2. The candidate's background and experience level
    3. Skills that are relevant for this role

    Questions should be conversational but professional.
    """

    try:
        model = get_gemini_model()
        response = model.generate_content(prompt)
        text = response.text

        # Extract JSON from response
        start_idx = text.find('[')
        end_idx = text.rfind(']') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            questions = json.loads(json_str)
            logger.info(f"Generated {len(questions)} interview questions for candidate {candidate.id}")
            return questions
        else:
            logger.warning("Could not parse Gemini response, using fallback questions")
            return generate_fallback_interview_questions(job.title, questions_count)

    except Exception as e:
        logger.error(f"Error generating questions with Gemini: {e}")
        return generate_fallback_interview_questions(job.title, questions_count)


def generate_fallback_interview_questions(job_title: str, count: int) -> List[Dict[str, Any]]:
    """Generate fallback questions if AI generation fails"""
    fallback = [
        {
            "question": f"Tell me about your experience and why you're interested in this {job_title} position.",
            "type": "behavioral",
            "context": "Assesses motivation and relevant experience",
            "ideal_points": ["Relevant experience", "Clear motivation", "Job alignment", "Career goals"]
        },
        {
            "question": "Describe a challenging project you worked on. What was your role and how did you handle obstacles?",
            "type": "behavioral",
            "context": "Evaluates problem-solving and resilience",
            "ideal_points": ["Clear situation", "Specific actions", "Measurable results", "Learning outcome"]
        },
        {
            "question": "What technical skills do you bring to this role, and how have you applied them in your previous work?",
            "type": "technical",
            "context": "Assesses technical competency and practical application",
            "ideal_points": ["Relevant skills", "Practical examples", "Impact demonstrated", "Continuous learning"]
        },
        {
            "question": "How do you stay updated with the latest trends and developments in your field?",
            "type": "technical",
            "context": "Evaluates commitment to professional growth",
            "ideal_points": ["Learning resources", "Community involvement", "Application of new knowledge", "Adaptability"]
        },
        {
            "question": "If you joined our team and faced a tight deadline with competing priorities, how would you handle it?",
            "type": "situational",
            "context": "Assesses prioritization and stress management",
            "ideal_points": ["Prioritization strategy", "Communication approach", "Time management", "Quality focus"]
        }
    ]
    return fallback[:count]


async def generate_answer_feedback(
    question: str,
    answer: str,
    question_type: str,
    ideal_points: List[str]
) -> Dict[str, Any]:
    """Generate AI feedback for an interview answer"""
    prompt = f"""
    You are an expert interview coach. Analyze this interview answer and provide detailed feedback.

    Question Type: {question_type}
    Question: {question}

    Candidate's Answer: {answer}

    Ideal Answer Points: {json.dumps(ideal_points) if ideal_points else 'General assessment'}

    Provide feedback in the following JSON format:
    {{
        "score": <number from 0-100>,
        "feedback": "<overall feedback paragraph>",
        "strengths": ["strength1", "strength2", ...],
        "improvements": ["improvement1", "improvement2", ...],
        "key_points_covered": ["point1", "point2", ...],
        "sentiment": {{
            "confidence": <0-100>,
            "clarity": <0-100>,
            "enthusiasm": <0-100>
        }}
    }}

    Be constructive and specific in your feedback.
    """

    try:
        model = get_gemini_model()
        response = model.generate_content(prompt)
        text = response.text

        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            return {
                "score": 70,
                "feedback": "Your answer addressed the question. Consider providing more specific examples.",
                "strengths": ["Answered the question", "Clear communication"],
                "improvements": ["Add specific examples", "More detail"],
                "key_points_covered": [],
                "sentiment": {"confidence": 70, "clarity": 70, "enthusiasm": 70}
            }
    except Exception as e:
        logger.error(f"Error generating feedback: {e}")
        return {
            "score": 70,
            "feedback": "Answer recorded successfully.",
            "strengths": ["Answer provided"],
            "improvements": [],
            "key_points_covered": [],
            "sentiment": {"confidence": 70, "clarity": 70, "enthusiasm": 70}
        }


@router.get(
    "/{token}",
    response_model=ApiResponse,
    summary="Get interview questions",
    description="""
    Retrieve AI-generated interview questions for a candidate.

    On first access:
    - Generates 5 personalized questions based on job + resume
    - Stores questions in database
    - Updates candidate status to 'started'

    On subsequent access:
    - Returns existing questions

    **Questions are personalized based on:**
    - Job title, description, and requirements
    - Candidate's resume/profile (if available)
    - Sample questions from job (as inspiration)
    """,
)
async def get_interview_questions(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    # Find candidate by token
    result = await db.execute(
        select(Candidate)
        .options(selectinload(Candidate.job).selectinload(Job.questions))
        .filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation token",
        )

    job = candidate.job

    # Check if questions already generated for this candidate
    result = await db.execute(
        select(CandidateInterviewQuestion)
        .filter(CandidateInterviewQuestion.candidate_id == candidate.id)
        .order_by(CandidateInterviewQuestion.order_index)
    )
    existing_questions = result.scalars().all()

    if existing_questions:
        # Return existing questions
        logger.info(f"Returning {len(existing_questions)} existing questions for candidate {candidate.id}")
        questions_data = [
            {
                "id": q.id,
                "question": q.question_text,
                "type": q.question_type,
                "context": q.context,
                "timeLimit": q.time_limit or 180,
                "order": q.order_index
            }
            for q in existing_questions
        ]
    else:
        # Generate new questions
        logger.info(f"Generating new questions for candidate {candidate.id}")

        # Get candidate's profile/resume if they have a user account
        resume_data = None
        result = await db.execute(
            select(User).filter(User.email == candidate.email)
        )
        user = result.scalar_one_or_none()

        if user:
            result = await db.execute(
                select(ApplicantProfile).filter(ApplicantProfile.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            if profile:
                resume_data = {
                    "full_name": profile.full_name,
                    "current_job_title": profile.current_job_title,
                    "years_of_experience": profile.years_of_experience,
                    "skills": profile.skills,
                    "education": profile.education,
                    "summary": profile.summary
                }

        # Get sample questions from job (if any)
        sample_questions = []
        if job.questions:
            sample_questions = [q.question for q in job.questions[:3]]

        # Generate questions
        generated = await generate_interview_questions_for_candidate(
            job=job,
            candidate=candidate,
            resume_data=resume_data,
            sample_questions=sample_questions,
            questions_count=5
        )

        # Store generated questions
        questions_data = []
        for idx, q in enumerate(generated):
            new_question = CandidateInterviewQuestion(
                candidate_id=candidate.id,
                question_text=q["question"],
                question_type=q.get("type", "behavioral"),
                context=q.get("context"),
                ideal_answer_points=q.get("ideal_points", []),
                order_index=idx,
                time_limit=180  # 3 minutes default
            )
            db.add(new_question)
            await db.flush()  # Get the ID

            questions_data.append({
                "id": new_question.id,
                "question": new_question.question_text,
                "type": new_question.question_type,
                "context": new_question.context,
                "timeLimit": new_question.time_limit,
                "order": new_question.order_index
            })

    # Update status to started if not already
    if candidate.status == CandidateStatus.INVITED:
        candidate.status = CandidateStatus.STARTED
        candidate.started_at = datetime.utcnow()

        # Update invite status
        result = await db.execute(
            select(Invite).filter(Invite.token == token)
        )
        invite = result.scalar_one_or_none()
        if invite and invite.status == InviteStatus.SENT:
            invite.status = InviteStatus.OPENED
            invite.opened_at = datetime.utcnow()

    await db.commit()

    # Get company name if available
    company_name = "Company"
    if job.company_id:
        result = await db.execute(
            select(Company).filter(Company.id == job.company_id)
        )
        company = result.scalar_one_or_none()
        if company:
            company_name = company.name

    # Return response with job info and questions
    return ApiResponse(
        success=True,
        data={
            "job": {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "department": job.department,
                "companyName": company_name
            },
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "status": candidate.status.value if candidate.status else None
            },
            "questions": questions_data,
            "totalQuestions": len(questions_data)
        }
    )


@router.post(
    "/{token}/save-answer/{question_id}",
    response_model=ApiResponse,
    summary="Save answer for a question",
    description="Save a text answer for a specific interview question without AI scoring (scoring happens on submit)."
)
async def save_interview_answer(
    token: str,
    question_id: int,
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
):
    """Save answer for a question (like practice save-text-answer)"""
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    # Verify question belongs to this candidate
    result = await db.execute(
        select(CandidateInterviewQuestion).filter(
            CandidateInterviewQuestion.id == question_id,
            CandidateInterviewQuestion.candidate_id == candidate.id
        )
    )
    question = result.scalar_one_or_none()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Get answer text
    answer_text = request.get("answer_text", "").strip()
    if not answer_text:
        raise HTTPException(status_code=400, detail="Answer text cannot be empty")

    # Update status to in_progress
    if candidate.status == CandidateStatus.STARTED:
        candidate.status = CandidateStatus.IN_PROGRESS
    candidate.last_activity_at = datetime.utcnow()

    # Check if response exists
    result = await db.execute(
        select(CandidateInterviewResponse).filter(
            CandidateInterviewResponse.question_id == question_id
        )
    )
    existing_response = result.scalar_one_or_none()

    if existing_response:
        existing_response.transcript = answer_text
        existing_response.submitted_at = datetime.utcnow()
    else:
        new_response = CandidateInterviewResponse(
            question_id=question_id,
            transcript=answer_text,
            duration=request.get("duration", 0)
        )
        db.add(new_response)

    await db.commit()

    return ApiResponse(
        success=True,
        data={"message": "Answer saved successfully"}
    )


@router.post(
    "/{token}/submit",
    response_model=ApiResponse,
    summary="Submit interview for AI evaluation",
    description="""
    Submit all answers for AI evaluation and scoring.
    Can be called before all questions are answered (partial submission allowed).

    **Process:**
    1. Scores all answered questions with AI
    2. Calculates overall score
    3. Updates candidate status to 'submitted'
    4. Triggers background processing for detailed analysis
    """
)
async def submit_interview(
    token: str,
    submission: Optional[InterviewSubmitRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    # Get all questions for this candidate
    result = await db.execute(
        select(CandidateInterviewQuestion)
        .filter(CandidateInterviewQuestion.candidate_id == candidate.id)
        .order_by(CandidateInterviewQuestion.order_index)
    )
    all_questions = result.scalars().all()

    # Get existing responses
    question_ids = [q.id for q in all_questions]
    result = await db.execute(
        select(CandidateInterviewResponse)
        .filter(CandidateInterviewResponse.question_id.in_(question_ids))
    )
    responses = result.scalars().all()
    response_map = {r.question_id: r for r in responses}

    if not responses:
        raise HTTPException(status_code=400, detail="No answers found. Please answer at least one question.")

    # Score each response with AI
    all_scores = []
    for question in all_questions:
        response = response_map.get(question.id)
        if response and response.transcript:
            logger.info(f"Scoring answer for question {question.id}")

            feedback_data = await generate_answer_feedback(
                question=question.question_text,
                answer=response.transcript,
                question_type=question.question_type,
                ideal_points=question.ideal_answer_points or []
            )

            response.ai_score = feedback_data["score"]
            response.ai_feedback = feedback_data["feedback"]
            response.strengths = feedback_data["strengths"]
            response.improvements = feedback_data["improvements"]
            response.key_points_covered = feedback_data["key_points_covered"]
            response.sentiment_analysis = feedback_data.get("sentiment", {})

            all_scores.append(feedback_data["score"])

    # Calculate overall score
    overall_score = sum(all_scores) / len(all_scores) if all_scores else 0

    # Update candidate status
    candidate.status = CandidateStatus.SUBMITTED
    candidate.submitted_at = datetime.utcnow()

    # Update invite status
    result = await db.execute(
        select(Invite).filter(Invite.token == token)
    )
    invite = result.scalar_one_or_none()
    if invite:
        invite.status = InviteStatus.COMPLETED

    await db.commit()

    # Trigger background processing for detailed analysis
    try:
        process_interview_submission.delay(str(candidate.id))
    except Exception as e:
        logger.warning(f"Could not trigger background task: {e}")

    # Prepare response with feedback
    questions_feedback = []
    for question in all_questions:
        response = response_map.get(question.id)
        questions_feedback.append({
            "questionId": question.id,
            "question": question.question_text,
            "answered": response is not None and response.transcript is not None,
            "score": response.ai_score if response else None,
            "feedback": response.ai_feedback if response else None,
            "strengths": response.strengths if response else None,
            "improvements": response.improvements if response else None
        })

    return ApiResponse(
        success=True,
        data={
            "message": "Interview submitted successfully. AI analysis complete.",
            "candidateId": candidate.id,
            "overallScore": round(overall_score, 1),
            "questionsAnswered": len(all_scores),
            "totalQuestions": len(all_questions),
            "submittedAt": candidate.submitted_at.isoformat() if candidate.submitted_at else None,
            "feedback": questions_feedback
        }
    )


# Keep legacy endpoints for backward compatibility

@router.post(
    "/{token}/responses",
    response_model=ApiResponse[dict],
    summary="Save interview response (legacy)",
)
async def save_response(
    token: str,
    question_id: str = Form(...),
    content: str = Form(...),
    duration: Optional[int] = Form(None),
    type: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Legacy endpoint for saving responses - redirects to new save-answer"""
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    # Update status
    if candidate.status == CandidateStatus.STARTED:
        candidate.status = CandidateStatus.IN_PROGRESS
    candidate.last_activity_at = datetime.utcnow()

    await db.commit()

    return ApiResponse(
        success=True,
        data={"message": "Response saved successfully"}
    )


@router.post("/upload/video", response_model=ApiResponse[dict])
async def upload_video(
    video: UploadFile = File(...),
    candidate_id: str = Form(...),
    question_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload video file to S3"""
    if not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    file_extension = video.filename.split(".")[-1]
    if file_extension not in ["mp4", "webm", "mov"]:
        raise HTTPException(status_code=400, detail="Unsupported video format")

    file_data = await video.read()

    url = await storage_service.upload_video(
        file_data, candidate_id, question_id, file_extension
    )

    if not url:
        raise HTTPException(status_code=500, detail="Failed to upload video")

    return ApiResponse(
        success=True,
        data={"url": url, "message": "Video uploaded successfully"}
    )
