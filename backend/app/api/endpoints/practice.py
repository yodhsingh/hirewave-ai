"""Practice Interview API endpoints with AI-powered question generation and feedback"""

import logging
import json
import tempfile
import os
import io
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from datetime import datetime
import google.generativeai as genai
from gtts import gTTS

from app.db.base import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.applicant_profile import ApplicantProfile
from app.models.user_insights import UserInsight
from app.models.practice_interview import (
    PracticeSession,
    PracticeQuestion,
    PracticeResponse,
    InterviewType,
    InterviewDifficulty
)
from app.core.config import settings
from app.schemas.common import ApiResponse
from app.schemas.practice import (
    PracticeSessionRequest,
    TextAnswerRequest,
    SessionSubmitRequest,
    TextToSpeechRequest,
    PracticeSessionData,
    PracticeQuestionData,
    AnswerSubmitData,
    FeedbackData,
    TextAnswerSaveData,
    SessionListData,
    SessionListItemData,
    SessionDetailsResponseData,
    SessionDetailData,
    QuestionDetailData,
    ResponseDetailData,
    SessionSubmitData,
    SessionCompleteData,
    TranscriptionData,
    DeleteSessionData,
)
# Import existing interview report functions for transcription and evaluation
from app.api.ai.interview_report import (
    generate_transcript,
    extract_qa_pairs,
    generate_evaluation_report
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/practice", tags=["practice"])

# Configure Google Gemini (will be initialized when needed)
def get_gemini_model():
    """Get or initialize the Gemini model"""
    api_key = os.getenv("GOOGLE_GEMINI_API_KEY") or settings.GOOGLE_GEMINI_API_KEY
    if not api_key:
        logger.error("GOOGLE_GEMINI_API_KEY not found")
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured. Please set GOOGLE_GEMINI_API_KEY in environment variables."
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(settings.GEMINI_MODEL)


@router.post("/start-session", response_model=ApiResponse[PracticeSessionData])
async def start_practice_session(
    session_config: PracticeSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[PracticeSessionData]:
    """
    Start a new practice interview session with AI-generated questions
    based on user's profile and preferences.

    **Request Body:**
    - interview_type: Type of interview (technical, behavioral, situational, mixed)
    - difficulty: Difficulty level (easy, medium, hard)
    - target_role: Target job role for personalized questions
    - questions_count: Number of questions (1-10)
    - focus_areas: Specific areas to focus on
    - skills: Technical skills for context

    **Returns:**
    - session_id: ID of the created session
    - questions: List of generated practice questions
    """
    try:
        # Extract session configuration from request
        interview_type = session_config.interview_type.value
        difficulty = session_config.difficulty.value
        target_role = session_config.target_role
        questions_count = session_config.questions_count
        focus_areas = session_config.focus_areas

        # Optional: Get user-provided experience and education from request
        years_of_experience = session_config.years_of_experience
        education = session_config.education
        skills = session_config.skills

        # Use the authenticated user's ID
        session_user_id = current_user.id

        # Try to get the user's existing profile if they have one
        result = await db.execute(
            select(ApplicantProfile).where(ApplicantProfile.user_id == current_user.id)
        )
        existing_profile = result.scalar_one_or_none()

        # If user has a profile, use their actual data
        if existing_profile:
            target_role = session_config.get("target_role", existing_profile.current_job_title or "Software Engineer")
            years_of_experience = years_of_experience or existing_profile.years_of_experience
            education = education or existing_profile.education
            # Get skills from profile if not provided
            if not skills and existing_profile.skills:
                skills = existing_profile.skills.get("technical", [])

        # Use existing profile or create a temporary profile object for practice
        if existing_profile:
            # Use the actual user profile
            profile = existing_profile
        else:
            # Create temporary profile object (not saved to DB) for users without profile
            profile = ApplicantProfile(
                user_id=session_user_id,
                current_job_title=target_role,
                years_of_experience=years_of_experience,
                skills={"technical": skills} if skills else None,
                education=education,
                summary=f"Practice interview for {target_role}"
            )
            # Note: We don't save this to DB - it's just for generating questions

        # Create practice session
        # Get the enum members and ensure we use their values
        session_type_enum = InterviewType(interview_type.lower())
        difficulty_enum = InterviewDifficulty(difficulty.lower())

        new_session = PracticeSession(
            user_id=session_user_id,  # Dynamic user ID for this practice session
            session_type=session_type_enum,
            difficulty=difficulty_enum,
            target_role=target_role,
            focus_areas=focus_areas,
            questions_count=questions_count,
            started_at=datetime.utcnow()
        )
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)

        # Generate personalized interview questions using Gemini
        questions = await generate_interview_questions(
            profile=profile,
            interview_type=interview_type,
            difficulty=difficulty,
            target_role=target_role,
            questions_count=questions_count,
            focus_areas=focus_areas
        )

        # Store questions in database
        for idx, q in enumerate(questions):
            question = PracticeQuestion(
                session_id=new_session.id,
                question_text=q["question"],
                question_type=q["type"],
                difficulty=difficulty,
                context=q.get("context"),
                ideal_answer_points=q.get("ideal_points", []),
                order_index=idx
            )
            db.add(question)

        await db.commit()

        # Fetch all questions with their IDs
        result = await db.execute(
            select(PracticeQuestion)
            .where(PracticeQuestion.session_id == new_session.id)
            .order_by(PracticeQuestion.order_index)
        )
        saved_questions = result.scalars().all()

        return ApiResponse[PracticeSessionData](
            success=True,
            data=PracticeSessionData(
                session_id=new_session.id,
                questions=[
                    PracticeQuestionData(
                        id=q.id,
                        question=q.question_text,
                        type=q.question_type,
                        context=q.context,
                        order=q.order_index
                    )
                    for q in saved_questions
                ]
            )
        )

    except Exception as e:
        logger.error(f"Error starting practice session: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def generate_interview_questions(
    profile: ApplicantProfile,
    interview_type: str,
    difficulty: str,
    target_role: str,
    questions_count: int,
    focus_areas: List[str]
) -> List[Dict[str, Any]]:
    """Generate personalized interview questions using Google Gemini"""

    # Prepare profile summary
    profile_summary = f"""
    Candidate Profile:
    - Name: {profile.full_name}
    - Current Role: {profile.current_job_title or 'Not specified'}
    - Experience: {profile.years_of_experience or 'Not specified'}
    - Skills: {json.dumps(profile.skills) if profile.skills else 'Not specified'}
    - Education: {profile.education or 'Not specified'}
    - Summary: {profile.summary or 'Not specified'}
    """

    # Create prompt for Gemini
    prompt = f"""
    You are an expert interview coach. Generate {questions_count} interview questions for a candidate applying for a {target_role} position.

    {profile_summary}

    Interview Configuration:
    - Type: {interview_type} (behavioral/technical/situational/mixed)
    - Difficulty: {difficulty}
    - Focus Areas: {', '.join(focus_areas) if focus_areas else 'General'}

    For each question, provide:
    1. The question itself
    2. The type (behavioral, technical, or situational)
    3. Brief context or why this question is relevant
    4. 3-4 key points that would make a strong answer

    Format your response as a JSON array with this structure:
    [
        {{
            "question": "Your question here",
            "type": "behavioral|technical|situational",
            "context": "Why this question matters",
            "ideal_points": ["point1", "point2", "point3"]
        }}
    ]

    Make questions specific to the candidate's experience level and background.
    """

    try:
        model = get_gemini_model()
        response = model.generate_content(prompt)

        # Extract JSON from response
        text = response.text
        # Find JSON array in the response
        start_idx = text.find('[')
        end_idx = text.rfind(']') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            questions = json.loads(json_str)
            return questions
        else:
            # Fallback questions if parsing fails
            return generate_fallback_questions(interview_type, questions_count)

    except Exception as e:
        logger.error(f"Error generating questions with Gemini: {e}")
        return generate_fallback_questions(interview_type, questions_count)


def generate_fallback_questions(interview_type: str, count: int) -> List[Dict[str, Any]]:
    """Generate fallback questions if AI generation fails"""
    behavioral = [
        {
            "question": "Tell me about a time when you had to work under pressure. How did you handle it?",
            "type": "behavioral",
            "context": "Assesses stress management and problem-solving skills",
            "ideal_points": ["Specific situation", "Actions taken", "Positive outcome", "Lessons learned"]
        },
        {
            "question": "Describe a situation where you had to work with a difficult team member. How did you manage the relationship?",
            "type": "behavioral",
            "context": "Evaluates interpersonal skills and conflict resolution",
            "ideal_points": ["Professional approach", "Communication strategy", "Resolution achieved", "Team impact"]
        }
    ]

    technical = [
        {
            "question": "Explain a complex technical concept you've worked with to someone non-technical.",
            "type": "technical",
            "context": "Tests communication skills and technical understanding",
            "ideal_points": ["Clear explanation", "Use of analogies", "Avoiding jargon", "Checking understanding"]
        },
        {
            "question": "What's your approach to debugging a production issue?",
            "type": "technical",
            "context": "Assesses problem-solving methodology",
            "ideal_points": ["Systematic approach", "Tool usage", "Root cause analysis", "Documentation"]
        }
    ]

    situational = [
        {
            "question": "If you were assigned a project with an unrealistic deadline, how would you handle it?",
            "type": "situational",
            "context": "Evaluates planning and communication skills",
            "ideal_points": ["Stakeholder communication", "Priority negotiation", "Risk assessment", "Alternative solutions"]
        }
    ]

    if interview_type == "behavioral":
        return behavioral[:count]
    elif interview_type == "technical":
        return technical[:count]
    elif interview_type == "situational":
        return situational[:count]
    else:  # mixed
        all_questions = behavioral + technical + situational
        return all_questions[:count]


@router.post("/submit-answer/{question_id}", response_model=ApiResponse[AnswerSubmitData])
async def submit_practice_answer(
    question_id: int,
    audio_file: UploadFile = File(...),
    duration: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[AnswerSubmitData]:
    """
    Submit an audio answer for a practice question and get AI feedback.

    **Path Parameters:**
    - question_id: ID of the question to answer

    **Form Data:**
    - audio_file: Audio file (webm format)
    - duration: Recording duration in seconds (optional)

    **Returns:**
    - feedback: AI-generated feedback including score, strengths, and improvements
    """
    temp_file_path = None
    try:
        # Verify question belongs to user
        result = await db.execute(
            select(PracticeQuestion)
            .join(PracticeSession)
            .where(
                PracticeQuestion.id == question_id,
                PracticeSession.user_id == current_user.id
            )
        )
        question = result.scalar_one_or_none()

        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # Save audio file temporarily for transcription
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Use existing generate_transcript function for audio-to-text
        logger.info(f"Transcribing audio for question {question_id}")
        transcript_data = await generate_transcript(temp_file_path)
        transcript = transcript_data["transcript"]

        # Save audio file path (in production, upload to cloud storage)
        audio_url = f"/uploads/practice/{current_user.id}/{question_id}.webm"

        # Generate AI feedback using Gemini
        feedback_data = await generate_answer_feedback(
            question=question.question_text,
            answer=transcript,
            question_type=question.question_type,
            ideal_points=question.ideal_answer_points
        )

        # Check if response already exists
        result = await db.execute(
            select(PracticeResponse).where(PracticeResponse.question_id == question_id)
        )
        existing_response = result.scalar_one_or_none()

        if existing_response:
            # Update existing response
            existing_response.audio_url = audio_url
            existing_response.transcript = transcript
            existing_response.duration = duration
            existing_response.ai_score = feedback_data["score"]
            existing_response.ai_feedback = feedback_data["feedback"]
            existing_response.strengths = feedback_data["strengths"]
            existing_response.improvements = feedback_data["improvements"]
            existing_response.key_points_covered = feedback_data["key_points_covered"]
            existing_response.sentiment_analysis = feedback_data.get("sentiment", {})
            existing_response.submitted_at = datetime.utcnow()
        else:
            # Create new response
            response = PracticeResponse(
                question_id=question_id,
                audio_url=audio_url,
                transcript=transcript,
                duration=duration,
                ai_score=feedback_data["score"],
                ai_feedback=feedback_data["feedback"],
                strengths=feedback_data["strengths"],
                improvements=feedback_data["improvements"],
                key_points_covered=feedback_data["key_points_covered"],
                sentiment_analysis=feedback_data.get("sentiment", {})
            )
            db.add(response)

        # Update session completed count
        await db.execute(
            update(PracticeSession)
            .where(PracticeSession.id == question.session_id)
            .values(completed_count=PracticeSession.completed_count + 1)
        )

        await db.commit()

        return ApiResponse[AnswerSubmitData](
            success=True,
            data=AnswerSubmitData(
                feedback=FeedbackData(
                    score=feedback_data["score"],
                    feedback=feedback_data["feedback"],
                    strengths=feedback_data.get("strengths", []),
                    improvements=feedback_data.get("improvements", []),
                    key_points_covered=feedback_data.get("key_points_covered", []),
                    sentiment=feedback_data.get("sentiment")
                )
            )
        )

    except Exception as e:
        logger.error(f"Error submitting answer: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


@router.post("/save-text-answer/{question_id}", response_model=ApiResponse[TextAnswerSaveData])
async def save_text_answer(
    question_id: int,
    request: TextAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[TextAnswerSaveData]:
    """
    Save a text answer for a practice question immediately (without AI scoring).

    This allows users to save progress and resume sessions later.
    AI scoring will happen when the user submits the full session.

    **Path Parameters:**
    - question_id: ID of the question to save answer for

    **Request Body:**
    - answer_text: The text answer (1-10000 characters)

    **Returns:**
    - message: Confirmation that answer was saved
    """
    try:
        logger.info(f"[Save Text] Saving text answer for question {question_id}")

        # Verify question belongs to user's active session
        result = await db.execute(
            select(PracticeQuestion)
            .join(PracticeSession)
            .where(
                PracticeQuestion.id == question_id,
                PracticeSession.user_id == current_user.id
            )
        )
        question = result.scalar_one_or_none()

        if not question:
            raise HTTPException(status_code=404, detail="Question not found or not accessible")

        # Get text answer from request (already validated by Pydantic)
        answer_text = request.answer_text.strip()

        logger.info(f"[Save Text] Answer length: {len(answer_text)} characters")

        # Check if response already exists for this question
        result = await db.execute(
            select(PracticeResponse).where(PracticeResponse.question_id == question_id)
        )
        existing_response = result.scalar_one_or_none()

        if existing_response:
            # Update existing response
            logger.info(f"[Save Text] Updating existing response for question {question_id}")
            existing_response.transcript = answer_text
            existing_response.submitted_at = datetime.utcnow()
        else:
            # Create new response without AI scoring (will be scored on final submission)
            logger.info(f"[Save Text] Creating new response for question {question_id}")
            response = PracticeResponse(
                question_id=question_id,
                transcript=answer_text,
                duration=0,  # Text answers have no duration
                submitted_at=datetime.utcnow()
            )
            db.add(response)

            # Increment completed count for the session (only for NEW responses)
            result = await db.execute(
                select(PracticeSession).where(PracticeSession.id == question.session_id)
            )
            session = result.scalar_one()
            session.completed_count = session.completed_count + 1
            logger.info(f"[Save Text] Session completed_count incremented to {session.completed_count}")

        await db.commit()

        logger.info(f"[Save Text] ✅ Text answer saved successfully for question {question_id}")

        return ApiResponse[TextAnswerSaveData](
            success=True,
            data=TextAnswerSaveData(
                message="Answer saved successfully. Submit the session to get AI evaluation."
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Save Text] Error saving text answer: {e}")
        logger.error(f"[Save Text] Error details: ", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def generate_answer_feedback(
    question: str,
    answer: str,
    question_type: str,
    ideal_points: List[str]
) -> Dict[str, Any]:
    """Generate AI feedback for the practice answer using Gemini"""

    logger.info(f"[Gen AI] Starting answer feedback generation for question type: {question_type}")
    logger.info(f"[Gen AI] Answer length: {len(answer)} characters")

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

    Be constructive and specific in your feedback. Focus on both what was done well and areas for improvement.
    """

    try:
        logger.info("[Gen AI] Initializing Gemini model...")
        model = get_gemini_model()

        logger.info("[Gen AI] Calling Gemini API for answer feedback...")
        response = model.generate_content(prompt)
        text = response.text

        logger.info(f"[Gen AI] Received response from Gemini, length: {len(text)} characters")
        logger.debug(f"[Gen AI] Raw Gemini response: {text[:500]}...")

        # Extract JSON from response
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            logger.info("[Gen AI] Extracted JSON from response, parsing...")
            feedback = json.loads(json_str)
            logger.info(f"[Gen AI] Successfully parsed feedback - Score: {feedback.get('score')}")
            return feedback
        else:
            # Fallback feedback
            logger.warning("[Gen AI] Could not find JSON in Gemini response, using fallback")
            logger.warning(f"[Gen AI] Full response was: {text}")
            return {
                "score": 70,
                "feedback": "Your answer covered the main points. Consider providing more specific examples and structuring your response more clearly.",
                "strengths": ["Clear communication", "Relevant content"],
                "improvements": ["Add specific examples", "Better structure"],
                "key_points_covered": ["Main concept addressed"],
                "sentiment": {"confidence": 70, "clarity": 75, "enthusiasm": 65}
            }

    except Exception as e:
        logger.error(f"[Gen AI] ERROR generating feedback: {type(e).__name__}: {str(e)}")
        logger.error(f"[Gen AI] Full exception: ", exc_info=True)
        return {
            "score": 70,
            "feedback": "Answer recorded successfully. Keep practicing to improve your interview skills.",
            "strengths": ["Answer provided"],
            "improvements": ["Practice more for detailed feedback"],
            "key_points_covered": [],
            "sentiment": {"confidence": 70, "clarity": 70, "enthusiasm": 70}
        }


@router.get("/sessions", response_model=ApiResponse[SessionListData])
async def get_practice_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[SessionListData]:
    """
    Get all practice sessions for the current user.

    **Returns:**
    - sessions: List of practice sessions with their scores and status
    """
    try:
        result = await db.execute(
            select(PracticeSession)
            .where(PracticeSession.user_id == current_user.id)
            .order_by(PracticeSession.started_at.desc())
        )
        sessions = result.scalars().all()

        return ApiResponse[SessionListData](
            success=True,
            data=SessionListData(
                sessions=[
                    SessionListItemData(
                        id=s.id,
                        type=s.session_type.value if s.session_type else None,
                        difficulty=s.difficulty.value if s.difficulty else None,
                        target_role=s.target_role,
                        questions_count=s.questions_count,
                        completed_count=s.completed_count,
                        overall_score=s.overall_score,
                        category_scores=s.category_scores,
                        started_at=s.started_at.isoformat() if s.started_at else None,
                        completed_at=s.completed_at.isoformat() if s.completed_at else None
                    )
                    for s in sessions
                ]
            )
        )
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}", response_model=ApiResponse[SessionDetailsResponseData])
async def get_session_details(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[SessionDetailsResponseData]:
    """
    Get detailed information about a specific practice session.

    **Path Parameters:**
    - session_id: ID of the session to retrieve

    **Returns:**
    - session: Session details including questions and responses
    """
    try:
        # Get session with questions and responses
        result = await db.execute(
            select(PracticeSession)
            .where(
                PracticeSession.id == session_id,
                PracticeSession.user_id == current_user.id
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get questions with responses
        result = await db.execute(
            select(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
            .order_by(PracticeQuestion.order_index)
        )
        questions = result.scalars().all()

        # Get responses
        question_ids = [q.id for q in questions]
        result = await db.execute(
            select(PracticeResponse)
            .where(PracticeResponse.question_id.in_(question_ids))
        )
        responses = result.scalars().all()
        response_map = {r.question_id: r for r in responses}

        return ApiResponse[SessionDetailsResponseData](
            success=True,
            data=SessionDetailsResponseData(
                session=SessionDetailData(
                    id=session.id,
                    type=session.session_type.value if session.session_type else None,
                    difficulty=session.difficulty.value if session.difficulty else None,
                    target_role=session.target_role,
                    overall_score=session.overall_score,
                    started_at=session.started_at.isoformat() if session.started_at else None,
                    questions=[
                        QuestionDetailData(
                            id=q.id,
                            question=q.question_text,
                            type=q.question_type,
                            response=ResponseDetailData(
                                transcript=response_map[q.id].transcript,
                                score=response_map[q.id].ai_score,
                                feedback=response_map[q.id].ai_feedback,
                                strengths=response_map[q.id].strengths,
                                improvements=response_map[q.id].improvements
                            ) if q.id in response_map else None
                        )
                        for q in questions
                    ]
                )
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_practice_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Response:
    """
    Delete a practice session (only if it belongs to the current user).

    **Path Parameters:**
    - session_id: ID of the session to delete

    **Returns:**
    - 204 No Content on success
    - 404 if session not found or unauthorized
    """
    try:
        # Get the session
        result = await db.execute(
            select(PracticeSession)
            .where(PracticeSession.id == session_id)
            .where(PracticeSession.user_id == current_user.id)
        )
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found or you don't have permission to delete it")

        # Delete the session (cascade delete will handle questions and responses)
        await db.delete(session)
        await db.commit()

        logger.info(f"Deleted practice session {session_id} for user {current_user.id}")

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


async def generate_category_scores(
    responses: List[PracticeResponse],
    questions: List[PracticeQuestion],
    session_type: str
) -> Dict[str, float]:
    """Generate category-wise scores using Gen AI analysis"""

    logger.info(f"[Gen AI Category] Starting category score generation for {len(responses)} responses")
    logger.info(f"[Gen AI Category] Session type: {session_type}")

    try:
        # Prepare data for AI analysis
        qa_pairs = []
        for i, response in enumerate(responses):
            question = next((q for q in questions if q.id == response.question_id), None)
            if question:
                qa_pairs.append({
                    "question": question.question_text,
                    "answer": response.transcript,
                    "type": question.question_type,
                    "score": response.ai_score
                })

        logger.info(f"[Gen AI Category] Prepared {len(qa_pairs)} Q&A pairs for analysis")

        # Create prompt for category analysis
        prompt = f"""You are an expert interview coach. Analyze the following interview responses and provide category-wise scores (0-100) for each category.

Session Type: {session_type}

Interview Q&A:
"""
        for i, qa in enumerate(qa_pairs, 1):
            prompt += f"\nQuestion {i} ({qa['type']}): {qa['question']}\n"
            prompt += f"Answer: {qa['answer']}\n"
            prompt += f"Individual Score: {qa['score']}/100\n"

        prompt += """

Based on all responses, rate the candidate on these categories (0-100):
1. Communication Skills - Clarity, structure, articulation
2. Technical Knowledge - Domain expertise and accuracy
3. Problem Solving - Analytical thinking and approach
4. Confidence - Delivery and self-assurance
5. Completeness - Thoroughness and depth of answers

Respond ONLY with a JSON object in this exact format:
{
    "communication": <score>,
    "technical": <score>,
    "problem_solving": <score>,
    "confidence": <score>,
    "completeness": <score>
}
"""

        logger.info("[Gen AI Category] Initializing Gemini model...")
        model = get_gemini_model()

        logger.info(f"[Gen AI Category] Calling Gemini API for category scoring... (prompt length: {len(prompt)} chars)")
        ai_response = model.generate_content(prompt)
        text = ai_response.text.strip()

        logger.info(f"[Gen AI Category] Received response from Gemini, length: {len(text)} characters")
        logger.info(f"[Gen AI Category] Full raw response:\n{text}")

        # Extract JSON
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            logger.info(f"[Gen AI Category] Extracted JSON: {json_str}")

            category_scores = json.loads(json_str)
            logger.info(f"[Gen AI Category] Successfully parsed category scores:")
            logger.info(f"[Gen AI Category]   - Communication: {category_scores.get('communication')}")
            logger.info(f"[Gen AI Category]   - Technical: {category_scores.get('technical')}")
            logger.info(f"[Gen AI Category]   - Problem Solving: {category_scores.get('problem_solving')}")
            logger.info(f"[Gen AI Category]   - Confidence: {category_scores.get('confidence')}")
            logger.info(f"[Gen AI Category]   - Completeness: {category_scores.get('completeness')}")

            # Validate all required categories are present with valid scores
            required_categories = ['communication', 'technical', 'problem_solving', 'confidence', 'completeness']
            avg_score = sum(r.ai_score for r in responses) / len(responses) if responses else 50

            missing_or_invalid = []
            for category in required_categories:
                value = category_scores.get(category)
                if value is None or not isinstance(value, (int, float)) or not (0 <= value <= 100):
                    missing_or_invalid.append(category)
                    # Fill with average score as fallback
                    category_scores[category] = avg_score
                    logger.warning(f"[Gen AI Category] Missing or invalid '{category}' score, using fallback: {avg_score}")

            if missing_or_invalid:
                logger.warning(f"[Gen AI Category] Fixed missing/invalid categories: {missing_or_invalid}")
            else:
                logger.info(f"[Gen AI Category] ✅ All 5 categories validated successfully")

            return category_scores
        else:
            # Fallback: calculate simple averages
            logger.warning(f"[Gen AI Category] Could not extract JSON from response. Using fallback scores.")
            logger.warning(f"[Gen AI Category] Full response text: {text}")
            avg_score = sum(r.ai_score for r in responses) / len(responses) if responses else 0
            logger.warning(f"[Gen AI Category] Fallback average score: {avg_score}")
            return {
                "communication": avg_score,
                "technical": avg_score,
                "problem_solving": avg_score,
                "confidence": avg_score,
                "completeness": avg_score
            }

    except Exception as e:
        logger.error(f"[Gen AI Category] ERROR generating category scores: {type(e).__name__}: {str(e)}")
        logger.error(f"[Gen AI Category] Full exception: ", exc_info=True)
        # Fallback scores
        avg_score = sum(r.ai_score for r in responses) / len(responses) if responses else 0
        logger.warning(f"[Gen AI Category] Using fallback scores due to exception. Average: {avg_score}")
        return {
            "communication": avg_score,
            "technical": avg_score,
            "problem_solving": avg_score,
            "confidence": avg_score,
            "completeness": avg_score
        }


async def generate_consolidated_insights(
    current_session_feedback: str,
    category_scores: Dict[str, float],
    overall_score: float,
    previous_insights: List[str] = None,
    recent_sessions_feedback: List[Dict[str, Any]] = None
) -> List[str]:
    """
    Generate consolidated, actionable insights using Gen AI

    Args:
        current_session_feedback: Feedback from the current practice session
        category_scores: Category-wise scores from current session
        overall_score: Overall score from current session
        previous_insights: Previous consolidated insights (if any)
        recent_sessions_feedback: Feedback from last 2-3 sessions with scores

    Returns:
        List of 2-3 short, actionable insight strings
    """
    logger.info("[Gen AI Insights] Starting consolidated insights generation")

    try:
        # Build context for Gen AI
        context = f"""You are an interview coach helping a candidate improve their interview skills.

Current Session Performance:
- Overall Score: {overall_score}/100
- Communication: {category_scores.get('communication', 0)}/100
- Technical: {category_scores.get('technical', 0)}/100
- Problem Solving: {category_scores.get('problem_solving', 0)}/100
- Confidence: {category_scores.get('confidence', 0)}/100
- Completeness: {category_scores.get('completeness', 0)}/100

Current Session Feedback:
{current_session_feedback}
"""

        if previous_insights:
            context += f"\n\nPrevious Consolidated Insights:\n"
            for idx, insight in enumerate(previous_insights, 1):
                context += f"{idx}. {insight}\n"

        if recent_sessions_feedback:
            context += f"\n\nRecent Practice Sessions Trend:\n"
            for idx, session in enumerate(recent_sessions_feedback, 1):
                context += f"Session {idx}: Score {session.get('score', 0)}/100\n"
                if session.get('feedback'):
                    context += f"  Key points: {session['feedback'][:200]}...\n"

        prompt = context + """

Based on the current session and historical performance, generate EXACTLY 2-3 short, specific, actionable insights.
Each insight should be:
- Maximum 15 words
- Specific and actionable (not generic)
- Focus on what's improving OR what needs immediate attention
- Use encouraging but honest tone

Return ONLY a JSON array of strings. Example format:
["Your communication improved 15% - storytelling works well", "Focus on technical depth - explain concepts simply", "Structure answers: intro-body-conclusion"]

JSON array of insights:"""

        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        text = response.text.strip()

        logger.info(f"[Gen AI Insights] Raw response: {text}")

        # Extract JSON array
        start_idx = text.find('[')
        end_idx = text.rfind(']') + 1

        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            insights = json.loads(json_str)

            # Validate and limit to 2-3 insights
            if isinstance(insights, list) and all(isinstance(i, str) for i in insights):
                insights = insights[:3]  # Max 3 insights
                logger.info(f"[Gen AI Insights] Generated {len(insights)} insights")
                return insights

        # Fallback insights based on scores
        logger.warning("[Gen AI Insights] Could not parse JSON, using fallback insights")
        fallback = []

        if overall_score >= 80:
            fallback.append(f"Excellent performance ({overall_score}%) - you're interview-ready!")
        elif overall_score >= 60:
            fallback.append(f"Good progress ({overall_score}%) - refine your weak areas")
        else:
            fallback.append(f"Keep practicing ({overall_score}%) - focus on fundamentals")

        # Add specific area feedback
        lowest_category = min(category_scores, key=category_scores.get)
        fallback.append(f"Improve {lowest_category.replace('_', ' ')} - currently at {category_scores[lowest_category]:.0f}%")

        return fallback[:3]

    except Exception as e:
        logger.error(f"[Gen AI Insights] Error generating insights: {e}", exc_info=True)
        return ["Continue practicing to improve your interview skills"]


async def generate_session_feedback(
    session: PracticeSession,
    responses: List[PracticeResponse],
    overall_score: float
) -> str:
    """Generate comprehensive AI feedback for the entire session"""

    if overall_score >= 80:
        performance_level = "excellent"
        encouragement = "Outstanding performance! You're well-prepared for real interviews."
    elif overall_score >= 70:
        performance_level = "good"
        encouragement = "Good job! With a bit more practice, you'll be interview-ready."
    elif overall_score >= 60:
        performance_level = "satisfactory"
        encouragement = "Decent performance. Focus on the areas of improvement to boost your confidence."
    else:
        performance_level = "needs improvement"
        encouragement = "Keep practicing! Every session helps you improve your interview skills."

    # Count strengths and improvements across all responses
    all_strengths = []
    all_improvements = []
    for response in responses:
        if response.strengths:
            all_strengths.extend(response.strengths)
        if response.improvements:
            all_improvements.extend(response.improvements)

    # Generate feedback
    feedback = f"""Your overall performance was {performance_level} with a score of {overall_score:.1f}/100.

{encouragement}

You answered {len(responses)} out of {session.questions_count} questions in this {session.difficulty.value if session.difficulty else 'practice'} level {session.session_type.value if session.session_type else 'interview'} session."""

    if all_strengths:
        feedback += f"\n\nKey Strengths Demonstrated:\n• " + "\n• ".join(set(all_strengths[:3]))

    if all_improvements and overall_score < 80:
        feedback += f"\n\nAreas for Improvement:\n• " + "\n• ".join(set(all_improvements[:3]))
        feedback += "\n\nRecommendation: Practice more with similar questions and focus on structuring your answers using the STAR method."

    return feedback


@router.post("/submit-session/{session_id}", response_model=ApiResponse[SessionSubmitData])
async def submit_session_answers(
    session_id: int,
    request: Optional[SessionSubmitRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[SessionSubmitData]:
    """
    Submit practice session for AI evaluation.

    Can either load existing responses from DB (if saved incrementally)
    or accept new responses in request body.

    **Path Parameters:**
    - session_id: ID of the session to submit

    **Request Body (optional):**
    - responses: List of responses to submit (for backward compatibility)

    **Returns:**
    - overall_score: Overall evaluation score
    - category_scores: Category-wise scores
    - feedback: AI-generated feedback
    """
    try:
        logger.info(f"[Submit Session] User {current_user.id} submitting session {session_id}")

        # Verify session belongs to user
        result = await db.execute(
            select(PracticeSession)
            .where(
                PracticeSession.id == session_id,
                PracticeSession.user_id == current_user.id
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            logger.error(f"[Submit Session] Session {session_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Session not found")

        # Get all questions for this session
        result = await db.execute(
            select(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
            .order_by(PracticeQuestion.order_index)
        )
        all_questions = result.scalars().all()
        logger.info(f"[Submit Session] Session has {len(all_questions)} questions")

        # Check if responses already exist in DB (from incremental saves)
        result = await db.execute(
            select(PracticeResponse)
            .join(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
        )
        existing_db_responses = result.scalars().all()
        logger.info(f"[Submit Session] Found {len(existing_db_responses)} existing responses in database")

        # Get responses from request body (if any)
        responses_data = request.responses if request else []
        logger.info(f"[Submit Session] Received {len(responses_data)} responses in request body")

        # If we have existing responses in DB, use those; otherwise use request data
        if existing_db_responses:
            logger.info(f"[Submit Session] Using {len(existing_db_responses)} responses from database")
            # We'll score the existing responses below
        elif not responses_data:
            logger.error(f"[Submit Session] No responses found in database or request")
            raise HTTPException(status_code=400, detail="No responses found. Please answer at least one question.")

        # Process responses - either from DB or from request
        all_scores = []

        if existing_db_responses:
            # Score existing responses from database
            logger.info(f"[Submit Session] Scoring {len(existing_db_responses)} existing responses from database")

            for i, db_response in enumerate(existing_db_responses, 1):
                # Get the question for this response
                result = await db.execute(
                    select(PracticeQuestion).where(PracticeQuestion.id == db_response.question_id)
                )
                question = result.scalar_one_or_none()

                if not question:
                    logger.warning(f"[Submit Session] Question {db_response.question_id} not found, skipping")
                    continue

                logger.info(f"[Submit Session] Scoring response {i}/{len(existing_db_responses)} - Question ID: {question.id}")

                # Generate AI feedback for this saved answer
                feedback_data = await generate_answer_feedback(
                    question=question.question_text,
                    answer=db_response.transcript or "",
                    question_type=question.question_type,
                    ideal_points=question.ideal_answer_points or []
                )
                logger.info(f"[Submit Session] AI feedback generated - Score: {feedback_data.get('score')}")

                # Update response with AI scores
                db_response.ai_score = feedback_data["score"]
                db_response.ai_feedback = feedback_data["feedback"]
                db_response.strengths = feedback_data["strengths"]
                db_response.improvements = feedback_data["improvements"]
                db_response.key_points_covered = feedback_data["key_points_covered"]
                db_response.sentiment_analysis = feedback_data.get("sentiment", {})

                all_scores.append(feedback_data["score"])
        else:
            # Process responses from request body (backward compatibility)
            logger.info(f"[Submit Session] Processing {len(responses_data)} responses from request body")

            for i, resp_data in enumerate(responses_data, 1):
                question_id = resp_data.get("question_id")
                answer_text = resp_data.get("answer_text", "")
                duration = resp_data.get("duration", 0)
                response_type = resp_data.get("response_type", "text")

                logger.info(f"[Submit Session] Processing response {i}/{len(responses_data)} - Question ID: {question_id}")

                # Get question
                result = await db.execute(
                    select(PracticeQuestion).where(PracticeQuestion.id == question_id)
                )
                question = result.scalar_one_or_none()

                if not question:
                    logger.warning(f"[Submit Session] Question {question_id} not found, skipping")
                    continue

                logger.info(f"[Submit Session] Generating AI feedback for question {question_id}...")
                # Generate AI feedback
                feedback_data = await generate_answer_feedback(
                    question=question.question_text,
                    answer=answer_text,
                    question_type=question.question_type,
                    ideal_points=question.ideal_answer_points or []
                )
                logger.info(f"[Submit Session] AI feedback generated - Score: {feedback_data.get('score')}")

                # Check if response already exists
                result = await db.execute(
                    select(PracticeResponse).where(PracticeResponse.question_id == question_id)
                )
                existing_response = result.scalar_one_or_none()

                if existing_response:
                    # Update existing
                    existing_response.transcript = answer_text
                    existing_response.duration = duration
                    existing_response.ai_score = feedback_data["score"]
                    existing_response.ai_feedback = feedback_data["feedback"]
                    existing_response.strengths = feedback_data["strengths"]
                    existing_response.improvements = feedback_data["improvements"]
                    existing_response.key_points_covered = feedback_data["key_points_covered"]
                    existing_response.sentiment_analysis = feedback_data.get("sentiment", {})
                    existing_response.submitted_at = datetime.utcnow()
                else:
                    # Create new
                    new_response = PracticeResponse(
                        question_id=question_id,
                        transcript=answer_text,
                        duration=duration,
                        ai_score=feedback_data["score"],
                        ai_feedback=feedback_data["feedback"],
                        strengths=feedback_data["strengths"],
                        improvements=feedback_data["improvements"],
                        key_points_covered=feedback_data["key_points_covered"],
                        sentiment_analysis=feedback_data.get("sentiment", {})
                    )
                    db.add(new_response)

                all_scores.append(feedback_data["score"])

        # Flush to make responses visible to subsequent queries
        await db.flush()
        logger.info(f"[Submit Session] Flushed {len(all_scores)} responses to database")

        # Calculate overall score
        overall_score = sum(all_scores) / len(all_scores) if all_scores else 0

        # Get all responses for feedback generation
        result = await db.execute(
            select(PracticeResponse)
            .join(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
        )
        all_responses = result.scalars().all()
        logger.info(f"[Submit Session] Retrieved {len(all_responses)} responses from database for scoring")

        # Get all questions for category scoring
        result = await db.execute(
            select(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
        )
        all_questions = result.scalars().all()

        # Generate category-wise scores using Gen AI
        category_scores = await generate_category_scores(
            all_responses,
            all_questions,
            session.session_type.value if session.session_type else "mixed"
        )

        # Generate comprehensive AI feedback
        ai_feedback = await generate_session_feedback(session, all_responses, overall_score)

        # Update session
        session.completed_at = datetime.utcnow()
        session.overall_score = overall_score
        session.category_scores = category_scores
        session.completed_count = len(existing_db_responses) if existing_db_responses else len(responses_data)
        session.ai_feedback = ai_feedback

        # Generate and store consolidated insights
        logger.info(f"[Submit Session] Generating consolidated insights for user {current_user.id}")

        # Get previous insights (if any)
        result = await db.execute(
            select(UserInsight).where(UserInsight.user_id == current_user.id)
        )
        user_insight = result.scalar_one_or_none()
        previous_insights = user_insight.insights if user_insight and user_insight.insights else None

        # Get recent completed sessions (last 2-3 sessions, excluding current)
        result = await db.execute(
            select(PracticeSession)
            .where(
                PracticeSession.user_id == current_user.id,
                PracticeSession.id != session_id,
                PracticeSession.completed_at.isnot(None)
            )
            .order_by(PracticeSession.completed_at.desc())
            .limit(3)
        )
        recent_sessions = result.scalars().all()
        recent_sessions_feedback = [
            {
                "score": s.overall_score,
                "feedback": s.ai_feedback[:300] if s.ai_feedback else ""
            }
            for s in recent_sessions
        ]

        # Generate new consolidated insights
        new_insights = await generate_consolidated_insights(
            current_session_feedback=ai_feedback,
            category_scores=category_scores,
            overall_score=overall_score,
            previous_insights=previous_insights,
            recent_sessions_feedback=recent_sessions_feedback if recent_sessions_feedback else None
        )

        # Upsert user insights
        if user_insight:
            user_insight.insights = new_insights
            user_insight.sessions_analyzed = len(recent_sessions) + 1
            user_insight.last_session_id = session_id
            user_insight.updated_at = datetime.utcnow()
        else:
            user_insight = UserInsight(
                user_id=current_user.id,
                insights=new_insights,
                sessions_analyzed=1,
                last_session_id=session_id
            )
            db.add(user_insight)

        logger.info(f"[Submit Session] Generated {len(new_insights)} consolidated insights")

        await db.commit()

        logger.info(f"[Submit Session] ✅ Session {session_id} submitted successfully!")
        logger.info(f"[Submit Session] Overall score: {overall_score:.2f}")
        logger.info(f"[Submit Session] Category scores: {category_scores}")

        return ApiResponse[SessionSubmitData](
            success=True,
            data=SessionSubmitData(
                overall_score=overall_score,
                category_scores=category_scores,
                feedback=ai_feedback,
                message="Session submitted and evaluated successfully"
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Submit Session] ❌ Error submitting session {session_id}: {type(e).__name__}: {str(e)}")
        logger.error(f"[Submit Session] Full exception:", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session/{session_id}/complete", response_model=ApiResponse[SessionCompleteData])
async def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ApiResponse[SessionCompleteData]:
    """
    Mark a practice session as complete and calculate overall score.

    **Path Parameters:**
    - session_id: ID of the session to complete

    **Returns:**
    - overall_score: Overall evaluation score
    - category_scores: Category-wise scores
    - feedback: AI-generated feedback
    - insights: Consolidated improvement insights
    """
    try:
        # Get session
        result = await db.execute(
            select(PracticeSession)
            .where(
                PracticeSession.id == session_id,
                PracticeSession.user_id == current_user.id
            )
        )
        session = result.scalar_one_or_none()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Calculate average score from all responses
        result = await db.execute(
            select(PracticeResponse)
            .join(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
        )
        responses = result.scalars().all()
        logger.info(f"[Complete Session] Found {len(responses)} responses for session {session_id}")

        if responses:
            scores = [r.ai_score for r in responses if r.ai_score is not None]
            overall_score = sum(scores) / len(scores) if scores else 0
        else:
            overall_score = 0

        # Get all questions for category scoring
        result = await db.execute(
            select(PracticeQuestion)
            .where(PracticeQuestion.session_id == session_id)
        )
        all_questions = result.scalars().all()

        # Generate category-wise scores using Gen AI
        category_scores = await generate_category_scores(
            responses,
            all_questions,
            session.session_type.value if session.session_type else "mixed"
        )

        # Generate comprehensive AI feedback
        ai_feedback = await generate_session_feedback(session, responses, overall_score)

        # Update session
        session.completed_at = datetime.utcnow()
        session.overall_score = overall_score
        session.category_scores = category_scores
        session.completed_count = len(responses)
        session.ai_feedback = ai_feedback

        # Generate and store consolidated insights
        logger.info(f"[Complete Session] Generating consolidated insights for user {current_user.id}")

        # Get previous insights (if any)
        result = await db.execute(
            select(UserInsight).where(UserInsight.user_id == current_user.id)
        )
        user_insight = result.scalar_one_or_none()
        previous_insights = user_insight.insights if user_insight and user_insight.insights else None

        # Get recent completed sessions (last 2-3 sessions, excluding current)
        result = await db.execute(
            select(PracticeSession)
            .where(
                PracticeSession.user_id == current_user.id,
                PracticeSession.id != session_id,
                PracticeSession.completed_at.isnot(None)
            )
            .order_by(PracticeSession.completed_at.desc())
            .limit(3)
        )
        recent_sessions = result.scalars().all()
        recent_sessions_feedback = [
            {
                "score": s.overall_score,
                "feedback": s.ai_feedback[:300] if s.ai_feedback else ""
            }
            for s in recent_sessions
        ]

        # Generate new consolidated insights
        new_insights = await generate_consolidated_insights(
            current_session_feedback=ai_feedback,
            category_scores=category_scores,
            overall_score=overall_score,
            previous_insights=previous_insights,
            recent_sessions_feedback=recent_sessions_feedback if recent_sessions_feedback else None
        )

        # Upsert user insights
        if user_insight:
            user_insight.insights = new_insights
            user_insight.sessions_analyzed = len(recent_sessions) + 1
            user_insight.last_session_id = session_id
            user_insight.updated_at = datetime.utcnow()
        else:
            user_insight = UserInsight(
                user_id=current_user.id,
                insights=new_insights,
                sessions_analyzed=1,
                last_session_id=session_id
            )
            db.add(user_insight)

        logger.info(f"[Complete Session] Stored {len(new_insights)} insights for user {current_user.id}")

        await db.commit()

        return ApiResponse[SessionCompleteData](
            success=True,
            data=SessionCompleteData(
                overall_score=overall_score,
                category_scores=category_scores,
                feedback=ai_feedback,
                insights=new_insights,
                message="Session completed successfully"
            )
        )

    except Exception as e:
        logger.error(f"Error completing session: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/question/{question_id}/audio")
async def get_question_audio(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate high-quality text-to-speech audio for a question"""
    try:
        # Get the question
        result = await db.execute(
            select(PracticeQuestion)
            .join(PracticeSession)
            .where(
                PracticeQuestion.id == question_id,
                PracticeSession.user_id == current_user.id
            )
        )
        question = result.scalar_one_or_none()

        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # Generate audio using gTTS
        tts = gTTS(
            text=question.question_text,
            lang='en',
            slow=False,  # Normal speed
            tld='com'  # Use .com domain for better quality
        )

        # Save to a BytesIO buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        # Return audio as streaming response
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mp3",
            headers={
                "Content-Disposition": f"inline; filename=question_{question_id}.mp3"
            }
        )

    except Exception as e:
        logger.error(f"Error generating audio for question {question_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")


@router.post("/transcribe", response_model=ApiResponse[TranscriptionData])
async def transcribe_audio(
    audio: UploadFile = File(...)
) -> ApiResponse[TranscriptionData]:
    """
    Transcribe audio to text using Google Speech-to-Text or mock for demo.

    **Form Data:**
    - audio: Audio file to transcribe

    **Returns:**
    - transcript: Transcribed text
    """
    try:
        # For demo, return a mock transcription
        # In production, use Google Speech-to-Text or similar service
        import random

        # Mock transcriptions based on common interview answers
        mock_transcripts = [
            "I believe I would be a great fit for this role because of my strong background in data engineering and my passion for building scalable data pipelines.",
            "My experience includes working with various big data technologies like Apache Spark, Kafka, and cloud platforms such as AWS and GCP.",
            "I've successfully implemented ETL pipelines that process millions of records daily, ensuring data quality and reliability.",
            "In my previous role, I led a team that migrated our data infrastructure to the cloud, resulting in 40% cost reduction.",
            "I'm particularly interested in this position because it aligns with my career goals and allows me to work with cutting-edge technologies.",
        ]

        # Simulate processing time
        import asyncio
        await asyncio.sleep(1)

        # Return a random mock transcript
        transcript = random.choice(mock_transcripts)

        return ApiResponse[TranscriptionData](
            success=True,
            data=TranscriptionData(transcript=transcript)
        )

    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        return ApiResponse[TranscriptionData](
            success=False,
            data=TranscriptionData(transcript="Unable to transcribe audio at this time."),
            error={"code": "TRANSCRIPTION_ERROR", "message": str(e)}
        )


@router.post("/text-to-speech")
async def text_to_speech(
    request: TextToSpeechRequest
):
    """
    Generate text-to-speech audio for any text (no authentication required for demo).

    **Request Body:**
    - text: Text to convert to speech (1-5000 characters)

    **Returns:**
    - Audio stream (audio/mp3)
    """
    try:
        text = request.text

        # Generate audio using gTTS with optimized settings for interview questions
        tts = gTTS(
            text=text,
            lang='en',
            slow=False,  # Normal speed for natural conversation
            tld='com'  # Use .com for better voice quality
        )

        # Save to a BytesIO buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        # Return audio as streaming response
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mp3",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
            }
        )

    except Exception as e:
        logger.error(f"Error generating text-to-speech: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")