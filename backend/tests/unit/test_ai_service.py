"""Unit tests for AI service module."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json

from app.services.ai_service import AIService


class TestAIService:
    """Tests for AIService class."""

    def test_ai_service_initialization(self):
        """Test AI service initializes correctly."""
        service = AIService()
        assert service._client is None
        assert service.model is not None

    def test_client_property_raises_without_api_key(self):
        """Test client raises error without API key."""
        with patch("app.services.ai_service.settings") as mock_settings:
            mock_settings.OPENAI_API_KEY = None
            mock_settings.OPENAI_MODEL = "gpt-4"
            service = AIService()
            service._client = None

            with pytest.raises(ValueError) as exc_info:
                _ = service.client

            assert "OPENAI_API_KEY is not configured" in str(exc_info.value)

    def test_client_property_initializes_with_api_key(self):
        """Test client initializes with valid API key."""
        with patch("app.services.ai_service.settings") as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-api-key"
            mock_settings.OPENAI_MODEL = "gpt-4"

            with patch("app.services.ai_service.AsyncOpenAI") as mock_openai:
                mock_client = MagicMock()
                mock_openai.return_value = mock_client

                service = AIService()
                service._client = None
                client = service.client

                mock_openai.assert_called_once_with(api_key="test-api-key")
                assert client == mock_client


class TestAIServiceScoringPrompt:
    """Tests for scoring prompt generation."""

    def test_build_scoring_prompt_basic(self):
        """Test building scoring prompt with basic data."""
        service = AIService()

        job_description = "Software Engineer position"
        questions = [{"question": "Tell me about yourself"}]
        responses = [{"transcript": "I am a developer"}]
        candidate_info = {"name": "Test User", "email": "test@example.com"}

        prompt = service._build_scoring_prompt(
            job_description, questions, responses, candidate_info
        )

        assert "Software Engineer position" in prompt
        assert "Tell me about yourself" in prompt
        assert "I am a developer" in prompt
        assert "Test User" in prompt
        assert "test@example.com" in prompt

    def test_build_scoring_prompt_with_content_fallback(self):
        """Test prompt uses content when transcript is not available."""
        service = AIService()

        job_description = "Developer role"
        questions = [{"question": "Why do you want this job?"}]
        responses = [{"content": "I love programming"}]
        candidate_info = {"name": "Jane", "email": "jane@test.com"}

        prompt = service._build_scoring_prompt(
            job_description, questions, responses, candidate_info
        )

        assert "I love programming" in prompt

    def test_build_scoring_prompt_multiple_questions(self):
        """Test prompt with multiple Q&A pairs."""
        service = AIService()

        questions = [
            {"question": "Question 1"},
            {"question": "Question 2"},
            {"question": "Question 3"},
        ]
        responses = [
            {"transcript": "Answer 1"},
            {"transcript": "Answer 2"},
            {"transcript": "Answer 3"},
        ]

        prompt = service._build_scoring_prompt(
            "Job description",
            questions,
            responses,
            {"name": "User", "email": "user@test.com"},
        )

        assert "Question 1" in prompt
        assert "Answer 1" in prompt
        assert "Question 2" in prompt
        assert "Answer 2" in prompt
        assert "Question 3" in prompt
        assert "Answer 3" in prompt


class TestAIServiceResponseParsing:
    """Tests for AI response parsing."""

    def test_parse_valid_json_response(self):
        """Test parsing valid JSON response."""
        service = AIService()

        valid_response = json.dumps({
            "overall_score": 75,
            "breakdown": {
                "communication": 80,
                "technical_skills": 70,
            },
        })

        result = service._parse_ai_response(valid_response)

        assert result["overall_score"] == 75
        assert result["breakdown"]["communication"] == 80

    def test_parse_invalid_json_returns_fallback(self):
        """Test parsing invalid JSON returns fallback score."""
        service = AIService()

        invalid_response = "This is not valid JSON"

        result = service._parse_ai_response(invalid_response)

        # Should return fallback score
        assert result["overall_score"] == 50
        assert "AI scoring temporarily unavailable" in result["insights"]["summary"]

    def test_parse_empty_string_returns_fallback(self):
        """Test parsing empty string returns fallback."""
        service = AIService()

        result = service._parse_ai_response("")

        assert result["overall_score"] == 50


class TestAIServiceFallbackScore:
    """Tests for fallback score generation."""

    def test_fallback_score_structure(self):
        """Test fallback score has correct structure."""
        service = AIService()

        fallback = service._get_fallback_score()

        assert "overall_score" in fallback
        assert fallback["overall_score"] == 50

        assert "breakdown" in fallback
        assert fallback["breakdown"]["communication"] == 50
        assert fallback["breakdown"]["technical_skills"] == 50
        assert fallback["breakdown"]["problem_solving"] == 50
        assert fallback["breakdown"]["culture_fit"] == 50
        assert fallback["breakdown"]["experience"] == 50

        assert "insights" in fallback
        assert "summary" in fallback["insights"]
        assert "strengths" in fallback["insights"]
        assert "weaknesses" in fallback["insights"]
        assert "red_flags" in fallback["insights"]
        assert "recommendations" in fallback["insights"]

        assert "skills_extracted" in fallback
        assert fallback["skills_extracted"] == []

        assert "per_question_scores" in fallback
        assert fallback["per_question_scores"] == []

    def test_fallback_score_red_flags(self):
        """Test fallback score includes AI failure red flag."""
        service = AIService()

        fallback = service._get_fallback_score()

        assert "AI scoring failed" in fallback["insights"]["red_flags"]
        assert "Manual review required" in fallback["insights"]["recommendations"]


class TestAIServiceTranscription:
    """Tests for audio transcription."""

    @pytest.mark.asyncio
    async def test_transcribe_audio_returns_placeholder(self):
        """Test transcribe audio returns placeholder."""
        service = AIService()

        result = await service.transcribe_audio("https://example.com/audio.mp3")

        assert result is not None
        assert "placeholder" in result.lower()

    @pytest.mark.asyncio
    async def test_transcribe_audio_handles_exception(self):
        """Test transcribe audio handles exceptions gracefully."""
        service = AIService()

        # Even with invalid URL, should not raise
        result = await service.transcribe_audio("")

        # Should still return placeholder or None
        assert result is None or "placeholder" in result.lower()


class TestAIServiceScoring:
    """Tests for interview scoring."""

    @pytest.mark.asyncio
    async def test_score_interview_success(self):
        """Test successful interview scoring."""
        service = AIService()

        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps({
                        "overall_score": 85,
                        "breakdown": {
                            "communication": 90,
                            "technical_skills": 80,
                            "problem_solving": 85,
                            "culture_fit": 82,
                            "experience": 88,
                        },
                        "insights": {
                            "summary": "Great candidate",
                            "strengths": ["Good communicator"],
                            "weaknesses": [],
                            "red_flags": [],
                            "recommendations": [],
                            "confidence_level": 90,
                        },
                        "skills_extracted": [],
                        "per_question_scores": [],
                    })
                )
            )
        ]

        # Mock the _client attribute directly
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        service._client = mock_client

        result = await service.score_interview(
            "Software Engineer",
            [{"question": "Tell me about yourself"}],
            [{"transcript": "I am experienced"}],
            {"name": "John", "email": "john@test.com"},
        )

        assert result["overall_score"] == 85
        assert result["breakdown"]["communication"] == 90

    @pytest.mark.asyncio
    async def test_score_interview_api_error(self):
        """Test scoring returns fallback on API error."""
        service = AIService()

        # Mock the _client attribute directly
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        service._client = mock_client

        result = await service.score_interview(
            "Job description",
            [{"question": "Q1"}],
            [{"transcript": "A1"}],
            {"name": "Test", "email": "test@test.com"},
        )

        # Should return fallback score
        assert result["overall_score"] == 50
        assert "AI scoring failed" in result["insights"]["red_flags"]


class TestAIServicePracticeFeedback:
    """Tests for practice feedback generation."""

    @pytest.mark.asyncio
    async def test_generate_practice_feedback_success(self):
        """Test successful practice feedback generation."""
        service = AIService()

        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps({
                        "score": 75,
                        "grade": "B",
                        "communication_analysis": {
                            "clarity": 80,
                            "pace": "good",
                            "filler_word_count": 3,
                            "improvement_tip": "Reduce filler words",
                        },
                        "content_analysis": {
                            "key_points_covered": ["Point 1"],
                            "key_points_missed": ["Point 2"],
                            "depth": "moderate",
                            "improvement_tip": "Add more detail",
                        },
                        "overall_feedback": "Good response",
                        "action_items": ["Practice more"],
                        "model_answer": "Example answer",
                    })
                )
            )
        ]

        # Mock the _client attribute directly
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        service._client = mock_client

        result = await service.generate_practice_feedback(
            "What is your greatest strength?",
            "I am a team player",
        )

        assert result["score"] == 75
        assert result["grade"] == "B"

    @pytest.mark.asyncio
    async def test_generate_practice_feedback_with_context(self):
        """Test practice feedback with context."""
        service = AIService()

        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(content=json.dumps({"score": 80, "grade": "B"}))
            )
        ]

        # Mock the _client attribute directly
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        service._client = mock_client

        result = await service.generate_practice_feedback(
            "Describe a challenge",
            "I faced a deadline issue",
            context="Technical interview for senior role",
        )

        # Verify context is used (check the prompt)
        call_args = mock_client.chat.completions.create.call_args
        messages = call_args.kwargs["messages"]
        user_message = messages[1]["content"]
        assert "Technical interview for senior role" in user_message

    @pytest.mark.asyncio
    async def test_generate_practice_feedback_api_error(self):
        """Test practice feedback returns error on API failure."""
        service = AIService()

        # Mock the _client attribute directly
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        service._client = mock_client

        result = await service.generate_practice_feedback(
            "Question", "Answer"
        )

        assert "error" in result
