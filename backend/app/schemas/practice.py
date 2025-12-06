"""Pydantic schemas for Practice Interview API endpoints."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class InterviewTypeEnum(str, Enum):
    """Type of practice interview."""
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SITUATIONAL = "situational"
    MIXED = "mixed"


class DifficultyEnum(str, Enum):
    """Difficulty level of practice interview."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# ============== Request Schemas ==============

class PracticeSessionRequest(BaseModel):
    """Request schema for starting a new practice session."""

    interview_type: InterviewTypeEnum = Field(
        default=InterviewTypeEnum.TECHNICAL,
        description="Type of interview (technical, behavioral, situational, mixed)"
    )
    difficulty: DifficultyEnum = Field(
        default=DifficultyEnum.MEDIUM,
        description="Difficulty level (easy, medium, hard)"
    )
    target_role: str = Field(
        default="Software Engineer",
        description="Target job role for the practice interview",
        min_length=2,
        max_length=200
    )
    questions_count: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of questions to generate (1-10)"
    )
    focus_areas: List[str] = Field(
        default=[],
        description="Specific areas to focus on (e.g., ['algorithms', 'system design'])"
    )
    years_of_experience: Optional[int] = Field(
        default=None,
        ge=0,
        le=50,
        description="Years of experience for personalized questions"
    )
    education: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Education background for context"
    )
    skills: List[str] = Field(
        default=[],
        description="Technical skills for personalized questions"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "interview_type": "technical",
                "difficulty": "medium",
                "target_role": "Software Engineer",
                "questions_count": 3,
                "focus_areas": ["algorithms", "system design"],
                "skills": ["Python", "JavaScript", "SQL"]
            }
        }


class TextAnswerRequest(BaseModel):
    """Request schema for saving a text answer."""

    answer_text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="The text answer to the question"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "answer_text": "I would approach this problem by first analyzing the requirements..."
            }
        }


class SessionSubmitRequest(BaseModel):
    """Request schema for submitting a practice session."""

    responses: List[Dict[str, Any]] = Field(
        default=[],
        description="List of responses to submit (for backward compatibility)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "responses": [
                    {
                        "question_id": 1,
                        "answer_text": "My approach would be...",
                        "duration": 120,
                        "response_type": "text"
                    }
                ]
            }
        }


class TextToSpeechRequest(BaseModel):
    """Request schema for text-to-speech conversion."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Text to convert to speech"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Tell me about a time when you had to work under pressure."
            }
        }


# ============== Response Data Schemas ==============

class PracticeQuestionData(BaseModel):
    """Data schema for a practice question."""

    id: int = Field(..., description="Question ID")
    question: str = Field(..., description="The question text")
    type: str = Field(..., description="Question type (behavioral, technical, situational)")
    context: Optional[str] = Field(None, description="Context for the question")
    order: int = Field(..., description="Question order in the session")

    class Config:
        from_attributes = True


class PracticeSessionData(BaseModel):
    """Data schema for a practice session."""

    session_id: int = Field(..., description="Session ID")
    questions: List[PracticeQuestionData] = Field(..., description="List of questions")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": 1,
                "questions": [
                    {
                        "id": 1,
                        "question": "Tell me about a time when you had to work under pressure.",
                        "type": "behavioral",
                        "context": "Assesses stress management skills",
                        "order": 0
                    }
                ]
            }
        }


class FeedbackData(BaseModel):
    """Data schema for AI feedback on an answer."""

    score: int = Field(..., ge=0, le=100, description="Score out of 100")
    feedback: str = Field(..., description="Overall feedback paragraph")
    strengths: List[str] = Field(default=[], description="List of strengths")
    improvements: List[str] = Field(default=[], description="Areas for improvement")
    key_points_covered: List[str] = Field(default=[], description="Key points mentioned")
    sentiment: Optional[Dict[str, int]] = Field(
        default=None,
        description="Sentiment analysis scores"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "score": 75,
                "feedback": "Good answer with clear examples.",
                "strengths": ["Clear communication", "Good structure"],
                "improvements": ["Add more specific metrics"],
                "key_points_covered": ["Problem description", "Solution"],
                "sentiment": {"confidence": 80, "clarity": 75, "enthusiasm": 70}
            }
        }


class AnswerSubmitData(BaseModel):
    """Data schema for answer submission response."""

    feedback: FeedbackData = Field(..., description="AI feedback on the answer")


class TextAnswerSaveData(BaseModel):
    """Data schema for text answer save response."""

    message: str = Field(
        default="Answer saved successfully. Submit the session to get AI evaluation.",
        description="Confirmation message"
    )


class SessionListItemData(BaseModel):
    """Data schema for a session in the list."""

    id: int = Field(..., description="Session ID")
    type: Optional[str] = Field(None, description="Interview type")
    difficulty: Optional[str] = Field(None, description="Difficulty level")
    target_role: Optional[str] = Field(None, description="Target role")
    questions_count: int = Field(..., description="Total questions")
    completed_count: int = Field(..., description="Completed questions")
    overall_score: Optional[float] = Field(None, description="Overall score")
    category_scores: Optional[Dict[str, float]] = Field(None, description="Category-wise scores")
    started_at: Optional[str] = Field(None, description="Start timestamp (ISO format)")
    completed_at: Optional[str] = Field(None, description="Completion timestamp (ISO format)")

    class Config:
        from_attributes = True


class SessionListData(BaseModel):
    """Data schema for session list response."""

    sessions: List[SessionListItemData] = Field(..., description="List of practice sessions")


class ResponseDetailData(BaseModel):
    """Data schema for a response in session details."""

    transcript: Optional[str] = Field(None, description="Transcribed answer")
    score: Optional[int] = Field(None, description="AI score")
    feedback: Optional[str] = Field(None, description="AI feedback")
    strengths: Optional[List[str]] = Field(None, description="Identified strengths")
    improvements: Optional[List[str]] = Field(None, description="Areas for improvement")


class QuestionDetailData(BaseModel):
    """Data schema for a question in session details."""

    id: int = Field(..., description="Question ID")
    question: str = Field(..., description="Question text")
    type: str = Field(..., description="Question type")
    response: Optional[ResponseDetailData] = Field(None, description="Candidate's response")


class SessionDetailData(BaseModel):
    """Data schema for session details."""

    id: int = Field(..., description="Session ID")
    type: Optional[str] = Field(None, description="Interview type")
    difficulty: Optional[str] = Field(None, description="Difficulty level")
    target_role: Optional[str] = Field(None, description="Target role")
    overall_score: Optional[float] = Field(None, description="Overall score")
    started_at: Optional[str] = Field(None, description="Start timestamp")
    questions: List[QuestionDetailData] = Field(..., description="Questions with responses")


class SessionDetailsResponseData(BaseModel):
    """Data schema for the session property in details response."""

    session: SessionDetailData = Field(..., description="Session details")


class SessionSubmitData(BaseModel):
    """Data schema for session submission response."""

    overall_score: float = Field(..., description="Overall score")
    category_scores: Dict[str, float] = Field(..., description="Category-wise scores")
    feedback: str = Field(..., description="AI feedback")
    message: str = Field(default="Session submitted and evaluated successfully")


class SessionCompleteData(BaseModel):
    """Data schema for session completion response."""

    overall_score: float = Field(..., description="Overall score")
    category_scores: Dict[str, float] = Field(..., description="Category-wise scores")
    feedback: str = Field(..., description="AI feedback")
    insights: List[str] = Field(default=[], description="Consolidated insights")
    message: str = Field(default="Session completed successfully")


class TranscriptionData(BaseModel):
    """Data schema for transcription response."""

    transcript: str = Field(..., description="Transcribed text")


class DeleteSessionData(BaseModel):
    """Data schema for delete session response."""

    message: str = Field(
        default="Practice session deleted successfully",
        description="Confirmation message"
    )
