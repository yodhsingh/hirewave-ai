import logging
from typing import Dict, List, Optional
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered interview analysis"""

    def __init__(self):
        self._client = None
        self.model = settings.OPENAI_MODEL

    @property
    def client(self) -> AsyncOpenAI:
        """Lazy initialization of OpenAI client"""
        if self._client is None:
            if not settings.OPENAI_API_KEY:
                raise ValueError(
                    "OPENAI_API_KEY is not configured. "
                    "Please set it in your .env file to use AI features."
                )
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def transcribe_audio(self, audio_url: str) -> Optional[str]:
        """Transcribe audio/video using Whisper"""
        try:
            # Note: In production, you'd download the file first
            # For now, this is a placeholder
            logger.info(f"Transcribing audio from: {audio_url}")

            # TODO: Download file from S3 and transcribe
            # response = await self.client.audio.transcriptions.create(
            #     model="whisper-1",
            #     file=audio_file
            # )
            # return response.text

            return "Transcription placeholder - implement S3 download + Whisper API"

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return None

    async def score_interview(
        self,
        job_description: str,
        questions: List[Dict],
        responses: List[Dict],
        candidate_info: Dict,
    ) -> Dict:
        """Score interview responses using GPT-4"""
        try:
            # Build comprehensive prompt
            prompt = self._build_scoring_prompt(
                job_description, questions, responses, candidate_info
            )

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR interviewer and talent assessor. Analyze interview responses and provide structured feedback.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                response_format={"type": "json_object"},
            )

            result = response.choices[0].message.content
            logger.info(f"Interview scored successfully")
            return self._parse_ai_response(result)

        except Exception as e:
            logger.error(f"Scoring failed: {e}")
            return self._get_fallback_score()

    def _build_scoring_prompt(
        self,
        job_description: str,
        questions: List[Dict],
        responses: List[Dict],
        candidate_info: Dict,
    ) -> str:
        """Build comprehensive scoring prompt"""
        prompt = f"""
Analyze this candidate's interview responses and provide a detailed assessment.

JOB DESCRIPTION:
{job_description}

CANDIDATE:
- Name: {candidate_info.get('name')}
- Email: {candidate_info.get('email')}

INTERVIEW Q&A:
"""
        for q, r in zip(questions, responses):
            prompt += f"\nQ: {q['question']}\n"
            prompt += f"A: {r.get('transcript') or r.get('content')}\n"

        prompt += """

Please provide a JSON response with the following structure:
{
  "overall_score": <0-100>,
  "breakdown": {
    "communication": <0-100>,
    "technical_skills": <0-100>,
    "problem_solving": <0-100>,
    "culture_fit": <0-100>,
    "experience": <0-100>
  },
  "insights": {
    "summary": "<2-3 sentence overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
    "red_flags": ["<red flag if any>", ...],
    "recommendations": ["<recommendation 1>", ...],
    "confidence_level": <0-100>
  },
  "skills_extracted": [
    {
      "name": "<skill name>",
      "category": "technical|soft|domain",
      "proficiency": "beginner|intermediate|advanced|expert",
      "yearsOfExperience": <number or null>,
      "matchesJobRequirement": <true|false>,
      "mentionedIn": ["<question_id>", ...]
    }
  ],
  "per_question_scores": [
    {
      "questionId": "<question_id>",
      "score": <0-100>,
      "feedback": "<specific feedback>",
      "keywordsFound": ["<keyword>", ...]
    }
  ]
}
"""
        return prompt

    def _parse_ai_response(self, response: str) -> Dict:
        """Parse and validate AI response"""
        import json

        try:
            data = json.loads(response)
            return data
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI response: {response}")
            return self._get_fallback_score()

    def _get_fallback_score(self) -> Dict:
        """Return fallback score structure if AI fails"""
        return {
            "overall_score": 50,
            "breakdown": {
                "communication": 50,
                "technical_skills": 50,
                "problem_solving": 50,
                "culture_fit": 50,
                "experience": 50,
            },
            "insights": {
                "summary": "AI scoring temporarily unavailable. Manual review recommended.",
                "strengths": [],
                "weaknesses": [],
                "red_flags": ["AI scoring failed"],
                "recommendations": ["Manual review required"],
                "confidence_level": 0,
            },
            "skills_extracted": [],
            "per_question_scores": [],
        }

    async def generate_practice_feedback(
        self, question: str, response: str, context: Optional[str] = None
    ) -> Dict:
        """Generate feedback for practice session"""
        try:
            prompt = f"""
Provide constructive feedback on this practice interview response.

Question: {question}
Response: {response}
{f"Context: {context}" if context else ""}

Provide a JSON response with:
{{
  "score": <0-100>,
  "grade": "A|B|C|D|F",
  "communication_analysis": {{
    "clarity": <0-100>,
    "pace": "too_slow|good|too_fast",
    "filler_word_count": <number>,
    "improvement_tip": "<tip>"
  }},
  "content_analysis": {{
    "key_points_covered": ["<point>", ...],
    "key_points_missed": ["<point>", ...],
    "depth": "shallow|moderate|deep",
    "improvement_tip": "<tip>"
  }},
  "overall_feedback": "<detailed feedback>",
  "action_items": ["<action 1>", ...],
  "model_answer": "<example of strong answer>"
}}
"""

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful interview coach providing actionable feedback.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                response_format={"type": "json_object"},
            )

            result = response.choices[0].message.content
            return self._parse_ai_response(result)

        except Exception as e:
            logger.error(f"Practice feedback generation failed: {e}")
            return {"error": str(e)}


# Singleton instance
ai_service = AIService()
