from typing import List, Optional, Union, Literal
from pydantic import BaseModel, Field, field_validator


class ScoreModel(BaseModel):
    """Individual score with validation for 0-10 range or N/A"""
    score: Union[int, str] = Field(..., description="Score between 0-10 or 'N/A'")
    justification: str = Field(..., description="Explanation for the score")
    
    @field_validator('score')
    @classmethod
    def validate_score(cls, v):
        if isinstance(v, str):
            if v.upper() != 'N/A':
                raise ValueError("String score must be 'N/A'")
            return v.upper()
        if isinstance(v, int):
            if not 0 <= v <= 10:
                raise ValueError("Integer score must be between 0 and 10")
            return v
        raise ValueError("Score must be an integer (0-10) or 'N/A'")


class OverallScoreModel(BaseModel):
    """Overall score with validation for 0-100 range or N/A"""
    score: Union[int, str] = Field(..., description="Score between 0-100 or 'N/A'")
    justification: str = Field(..., description="Explanation for the overall score")
    
    @field_validator('score')
    @classmethod
    def validate_score(cls, v):
        if isinstance(v, str):
            if v.upper() != 'N/A':
                raise ValueError("String score must be 'N/A'")
            return v.upper()
        if isinstance(v, int):
            if not 0 <= v <= 100:
                raise ValueError("Integer score must be between 0 and 100")
            return v
        raise ValueError("Score must be an integer (0-100) or 'N/A'")


class CandidateInfo(BaseModel):
    """Candidate information extracted from resume"""
    name: str = Field(..., description="Candidate's full name")
    email: str = Field(..., description="Candidate's email address")
    phone: str = Field(..., description="Candidate's phone number")
    resume_summary: str = Field(..., description="Brief summary of candidate's background")
    applied_role: str = Field(..., description="Role the candidate applied for")
    applied_company: str = Field(..., description="Company the candidate applied to")


class InterviewOverview(BaseModel):
    """Interview metadata and overview"""
    mode: Literal['mock', 'real'] = Field(..., description="Interview mode")
    date: str = Field(..., description="Interview date")
    duration_minutes: Union[int, str] = Field(..., description="Interview duration in minutes or 'N/A'")
    questions_asked: Union[int, str] = Field(..., description="Number of questions asked or 'N/A'")
    categories: List[str] = Field(..., description="Categories of questions asked")


class ContentAnalysis(BaseModel):
    """Content analysis of interview responses"""
    depth_of_knowledge: str = Field(..., description="Assessment of knowledge depth")
    relevance_to_role: str = Field(..., description="How relevant responses are to the role")
    problem_solving_approach: str = Field(..., description="Candidate's problem-solving methodology")


class CommunicationSkills(BaseModel):
    """Communication skills assessment"""
    clarity: str = Field(..., description="Clarity of communication")
    articulation: str = Field(..., description="Articulation quality")
    listening_skills: str = Field(..., description="Active listening assessment")


class BehavioralTraits(BaseModel):
    """Behavioral traits observed during interview"""
    confidence_level: str = Field(..., description="Confidence level displayed")
    professionalism: str = Field(..., description="Professional demeanor")
    adaptability: str = Field(..., description="Adaptability to different questions")


class LinguisticFeatures(BaseModel):
    """Linguistic features analysis"""
    vocabulary_usage: str = Field(..., description="Quality of vocabulary used")
    grammar_accuracy: str = Field(..., description="Grammar accuracy")
    filler_words_frequency: str = Field(..., description="Frequency of filler words")


class PerformanceMetrics(BaseModel):
    """Comprehensive performance metrics"""
    content_analysis: ContentAnalysis
    communication_skills: CommunicationSkills
    behavioral_traits: BehavioralTraits
    linguistic_features: LinguisticFeatures


class Scores(BaseModel):
    """All scoring categories for the interview"""
    technical_knowledge: ScoreModel = Field(..., description="Technical knowledge score")
    resume_alignment: ScoreModel = Field(..., description="Alignment with resume")
    job_role_fit: ScoreModel = Field(..., description="Fit for the job role")
    communication: ScoreModel = Field(..., description="Communication skills score")
    articulation: ScoreModel = Field(..., description="Articulation quality score")
    confidence: ScoreModel = Field(..., description="Confidence level score")
    clarity: ScoreModel = Field(..., description="Clarity of responses score")
    domain_knowledge: ScoreModel = Field(..., description="Domain knowledge score")
    overall: OverallScoreModel = Field(..., description="Overall interview score")


class AlternativeAnswer(BaseModel):
    """Alternative answer suggestion"""
    answer: str = Field(..., description="Alternative answer text")
    why_better: str = Field(..., description="Explanation of why this answer is better")


class QAPairAnalysis(BaseModel):
    """Individual Q&A pair analysis"""
    question: str = Field(..., description="Interview question")
    answer: str = Field(..., description="Candidate's answer")
    ai_notes: str = Field(..., description="AI analysis notes")
    answer_score: Union[int, str] = Field(..., description="Score for this answer (0-10 or N/A)")
    justification: str = Field(..., description="Justification for the score")
    alternative_answers: List[AlternativeAnswer] = Field(..., description="Suggested alternative answers")
    why_bad: str = Field(..., description="Explanation of weaknesses in the answer")


class TranscriptAnalysis(BaseModel):
    """Detailed transcript analysis"""
    qa_pairs: List[QAPairAnalysis] = Field(..., description="Analysis of each Q&A pair")


class Recommendations(BaseModel):
    """Recommendations for the candidate"""
    areas_for_improvement: List[str] = Field(..., description="Areas needing improvement")
    suggested_resources: List[str] = Field(..., description="Suggested learning resources")
    next_steps: List[str] = Field(..., description="Recommended next steps")


class InterviewReportSchema(BaseModel):
    """Complete interview report structure"""
    candidate_info: CandidateInfo
    interview_overview: InterviewOverview
    performance_metrics: PerformanceMetrics
    scores: Scores
    strengths: List[str] = Field(..., description="Candidate's strengths")
    weaknesses: List[str] = Field(..., description="Candidate's weaknesses")
    recommendations: Recommendations
    transcript_analysis: TranscriptAnalysis


class InterviewReportResponse(BaseModel):
    """API response wrapper for interview report"""
    transcript: str = Field(..., description="Full interview transcript")
    qa_pairs: List[dict] = Field(..., description="Extracted Q&A pairs")
    evaluation_report: InterviewReportSchema = Field(..., description="Comprehensive evaluation report")
    usage_metadata: dict = Field(..., description="Token usage metadata")
    execution_time: float = Field(..., description="Total execution time in seconds")
