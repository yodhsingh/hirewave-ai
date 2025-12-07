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
    "/{token}/analyze-proctoring",
    response_model=ApiResponse,
    summary="Analyze proctoring images for cheating detection",
    description="""
    Analyze 5 captured images to detect if the candidate is using a phone or external device.
    Images should be base64 encoded. If cheating is detected, it will be recorded.
    """
)
async def analyze_proctoring(
    token: str,
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
):
    """Analyze captured images for cheating detection using Gemini"""
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    images = request.get("images", [])
    question_id = request.get("question_id")
    
    if not images or len(images) == 0:
        raise HTTPException(status_code=400, detail="No images provided")

    # Debug: Log when proctoring images are received
    print(f"\n{'='*60}")
    print(f"🎥 PROCTORING: Received {len(images)} images for analysis")
    print(f"   Candidate Token: {token[:20]}...")
    print(f"   Question ID: {question_id}")
    print(f"{'='*60}")

    try:
        # Use gemini-2.5-flash-lite for image proctoring (faster and cheaper)
        import google.generativeai as genai
        proctoring_model = genai.GenerativeModel("gemini-2.5-flash-lite")
        
        # Build image parts for Gemini
        image_parts = []
        for idx, img_base64 in enumerate(images[:5]):  # Limit to 5 images
            # Remove data URL prefix if present
            if "," in img_base64:
                img_base64 = img_base64.split(",")[1]
            
            image_parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": img_base64
                }
            })

        # Debug: Log before sending to Gemini
        print(f"📤 PROCTORING: Sending {len(image_parts)} images to Gemini (gemini-2.5-flash-lite) for analysis...")

        prompt = """You are a proctoring AI assistant for an online interview. 
Analyze these 5 images of a candidate taken during their interview.

Look for signs of cheating such as:
1. Using a phone or mobile device
2. Looking at another screen or monitor
3. Reading from notes or papers
4. Another person visible in the frame
5. Headphones/earbuds that could be receiving audio assistance

Respond with a JSON object:
{
    "cheating_detected": true/false,
    "confidence": 0.0-1.0,
    "reason": "Brief explanation of what was detected or why no cheating was found",
    "evidence_type": "phone|screen|notes|person|earbuds|none"
}

Be strict but fair. Only flag as cheating if you have clear evidence."""

        response = await proctoring_model.generate_content_async([prompt] + image_parts)
        response_text = response.text.strip()
        
        # Debug: Log response received from Gemini
        print(f"📥 PROCTORING: Received response from Gemini")
        print(f"   Raw response length: {len(response_text)} chars")
        
        # Parse JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        analysis = json.loads(response_text)
        cheating_detected = analysis.get("cheating_detected", False)
        
        # Debug: Log analysis result
        print(f"{'🚨' if cheating_detected else '✅'} PROCTORING RESULT:")
        print(f"   Cheating Detected: {cheating_detected}")
        print(f"   Confidence: {analysis.get('confidence', 0.0)}")
        print(f"   Reason: {analysis.get('reason', 'N/A')}")
        print(f"   Evidence Type: {analysis.get('evidence_type', 'none')}")
        print(f"{'='*60}\n")
        
        # If cheating detected, record it
        if cheating_detected:
            # Get or create score record
            from app.models.candidate import CandidateScore
            result = await db.execute(
                select(CandidateScore).filter(CandidateScore.candidate_id == candidate.id)
            )
            score_record = result.scalar_one_or_none()
            
            if not score_record:
                score_record = CandidateScore(
                    candidate_id=candidate.id,
                    cheating_detected=True,
                    cheating_evidence=[],
                    proctoring_score_penalty=15.0  # 15% penalty
                )
                db.add(score_record)
            else:
                score_record.cheating_detected = True
                if score_record.cheating_evidence is None:
                    score_record.cheating_evidence = []
                score_record.proctoring_score_penalty = 15.0
            
            # Add evidence
            evidence_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "question_id": question_id,
                "confidence": analysis.get("confidence", 0.0),
                "reason": analysis.get("reason", ""),
                "evidence_type": analysis.get("evidence_type", "unknown")
            }
            if score_record.cheating_evidence:
                score_record.cheating_evidence = score_record.cheating_evidence + [evidence_entry]
            else:
                score_record.cheating_evidence = [evidence_entry]
            
            await db.commit()
        
        return ApiResponse(
            success=True,
            data={
                "cheating_detected": cheating_detected,
                "confidence": analysis.get("confidence", 0.0),
                "reason": analysis.get("reason", ""),
                "evidence_type": analysis.get("evidence_type", "none")
            }
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse proctoring analysis: {e}")
        return ApiResponse(
            success=True,
            data={
                "cheating_detected": False,
                "confidence": 0.0,
                "reason": "Analysis failed - assuming no cheating",
                "evidence_type": "none"
            }
        )
    except Exception as e:
        logger.error(f"Proctoring analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Proctoring analysis failed: {str(e)}")


@router.post(
    "/{token}/transcribe",
    response_model=ApiResponse,
    summary="Transcribe audio to text using Gemini",
    description="Convert audio recording to text using Gemini's audio understanding capabilities."
)
async def transcribe_audio(
    token: str,
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Transcribe audio to text using Gemini"""
    # Find candidate
    result = await db.execute(
        select(Candidate).filter(Candidate.invite_token == token)
    )
    candidate = result.scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    # Validate file type
    content_type = audio.content_type or ""
    if not content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    try:
        # Read audio data
        audio_data = await audio.read()
        import base64
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        
        # Determine mime type
        mime_type = content_type
        if "webm" in content_type:
            mime_type = "audio/webm"
        elif "wav" in content_type:
            mime_type = "audio/wav"
        elif "mp3" in content_type or "mpeg" in content_type:
            mime_type = "audio/mp3"
        
        # Debug: Log audio transcription request
        print(f"\n{'='*60}")
        print(f"🎤 TRANSCRIPTION: Received audio for transcription")
        print(f"   Candidate Token: {token[:20]}...")
        print(f"   Audio Size: {len(audio_data) / 1024:.2f} KB")
        print(f"   MIME Type: {mime_type}")
        print(f"📤 TRANSCRIPTION: Sending audio to Gemini...")
        print(f"{'='*60}")
        
        model = get_gemini_model()
        
        prompt = """Transcribe the following audio recording of a candidate answering an interview question.
Provide ONLY the transcription text, nothing else. If the audio is unclear, transcribe what you can hear.
If the audio is completely inaudible, respond with: [Audio unclear - could not transcribe]"""

        audio_part = {
            "inline_data": {
                "mime_type": mime_type,
                "data": audio_base64
            }
        }
        
        response = await model.generate_content_async([prompt, audio_part])
        transcript = response.text.strip()
        
        # Debug: Log transcription result
        print(f"📥 TRANSCRIPTION: Received response from Gemini")
        print(f"   Transcript length: {len(transcript)} chars")
        print(f"   Preview: {transcript[:100]}{'...' if len(transcript) > 100 else ''}")
        print(f"{'='*60}\n")
        
        return ApiResponse(
            success=True,
            data={
                "transcript": transcript,
                "success": True
            }
        )
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


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

    # Check if this is a force submit (e.g., user exited fullscreen or switched tabs)
    is_force_submit = submission and submission.force_submit
    termination_reason = submission.termination_reason if submission else None
    
    if is_force_submit:
        logger.warning(f"Force submit for candidate {candidate.id}: {termination_reason}")

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

    # Only enforce "at least one answer" for normal submissions, not force submit
    if not responses and not is_force_submit:
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

    # Check for cheating and apply penalty
    from app.models.candidate import CandidateScore
    result = await db.execute(
        select(CandidateScore).filter(CandidateScore.candidate_id == candidate.id)
    )
    score_record = result.scalar_one_or_none()
    
    cheating_detected = False
    penalty_applied = 0.0
    session_terminated = False
    
    # Handle force submit (session terminated due to fullscreen exit or tab switch)
    if is_force_submit and termination_reason:
        session_terminated = True
        cheating_detected = True
        penalty_applied = 50.0  # Heavy penalty for session termination
        
        # Apply penalty - score is halved for terminated sessions
        overall_score = overall_score * 0.5
        
        # Create proper evidence entry matching CheatingEvidence schema
        termination_evidence = [{
            "timestamp": datetime.utcnow().isoformat(),
            "question_id": None,
            "confidence": 1.0,
            "reason": f"Session terminated: {termination_reason}",
            "evidence_type": "session_termination"
        }]
        
        if score_record:
            score_record.cheating_detected = True
            score_record.proctoring_score_penalty = penalty_applied
            # Append termination to existing evidence
            existing_evidence = score_record.cheating_evidence or []
            score_record.cheating_evidence = existing_evidence + termination_evidence
            score_record.overall_score = overall_score
            score_record.ai_score = overall_score
        else:
            score_record = CandidateScore(
                candidate_id=candidate.id,
                overall_score=overall_score,
                ai_score=overall_score,
                cheating_detected=True,
                cheating_evidence=termination_evidence,
                proctoring_score_penalty=penalty_applied
            )
            db.add(score_record)
    elif score_record and score_record.cheating_detected:
        cheating_detected = True
        penalty_applied = score_record.proctoring_score_penalty or 15.0
        # Apply percentage penalty to overall score
        overall_score = overall_score * (1 - penalty_applied / 100)
        score_record.overall_score = overall_score
        score_record.ai_score = overall_score
    elif not score_record:
        # Create score record if it doesn't exist
        score_record = CandidateScore(
            candidate_id=candidate.id,
            overall_score=overall_score,
            ai_score=overall_score,
            cheating_detected=False,
            proctoring_score_penalty=0.0
        )
        db.add(score_record)
    else:
        score_record.overall_score = overall_score
        score_record.ai_score = overall_score

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
            "message": "Interview submitted successfully. AI analysis complete." if not session_terminated else "Interview session terminated due to policy violation.",
            "candidateId": candidate.id,
            "overallScore": round(overall_score, 1),
            "questionsAnswered": len(all_scores),
            "totalQuestions": len(all_questions),
            "submittedAt": candidate.submitted_at.isoformat() if candidate.submitted_at else None,
            "feedback": questions_feedback,
            "cheatingDetected": cheating_detected,
            "penaltyApplied": penalty_applied,
            "sessionTerminated": session_terminated,
            "terminationReason": termination_reason
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
