import google.generativeai as genai
import os
import json
import time
from dotenv import load_dotenv

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union, Literal
from datetime import datetime

load_dotenv()

gemini_api_key = os.environ.get('GOOGLE_GEMINI_API_KEY')
if not gemini_api_key:
    raise ValueError("GOOGLE_GEMINI_API_KEY environment variable is not set")

# Configure genai library
genai.configure(api_key=gemini_api_key)


# PYDANTIC SCHEMAS FOR VALIDATION
class ScoreModel(BaseModel):
    """Score model with justification"""
    score: Union[int, str] = Field(..., description="Score from 0-10 or 'N/A'")
    justification: str = Field(..., description="Justification for the score")
    
    @validator('score')
    def validate_score(cls, v):
        if isinstance(v, str) and v.upper() == 'N/A':
            return v
        if isinstance(v, int) and 0 <= v <= 10:
            return v
        if isinstance(v, str) and v.isdigit():
            score_int = int(v)
            if 0 <= score_int <= 10:
                return score_int
        raise ValueError('Score must be between 0-10 or "N/A"')


class OverallScoreModel(BaseModel):
    """Overall score model (0-100)"""
    score: Union[int, str] = Field(..., description="Overall score from 0-100 or 'N/A'")
    justification: str = Field(..., description="Overall justification")
    
    @validator('score')
    def validate_score(cls, v):
        if isinstance(v, str) and v.upper() == 'N/A':
            return v
        if isinstance(v, int) and 0 <= v <= 100:
            return v
        if isinstance(v, str) and v.isdigit():
            score_int = int(v)
            if 0 <= score_int <= 100:
                return score_int
        raise ValueError('Overall score must be between 0-100 or "N/A"')


class CandidateInfo(BaseModel):
    """Candidate information model"""
    name: str = Field(..., description="Candidate full name")
    email: str = Field(..., description="Candidate email")
    phone: str = Field(..., description="Candidate phone")
    resume_summary: str = Field(..., description="Brief summary extracted from resume")
    applied_role: str = Field(..., description="Job role candidate applied for")
    applied_company: str = Field(..., description="Company candidate applied for")


class InterviewOverview(BaseModel):
    """Interview overview model"""
    mode: Literal['mock', 'real'] = Field(..., description="Interview mode")
    date: str = Field(..., description="Interview date in YYYY-MM-DD format")
    duration_minutes: Union[int, str] = Field(..., description="Total duration in minutes")
    questions_asked: Union[int, str] = Field(..., description="Number of questions asked")
    categories: List[str] = Field(..., description="Question categories")


class ContentAnalysis(BaseModel):
    """Content analysis model"""
    resume_understanding: str = Field(..., description="Summary of how well candidate explained resume projects")
    job_role_fit: str = Field(..., description="How well candidate fits the role based on answers")
    technical_knowledge: str = Field(..., description="Evaluation of technical skills")
    problem_solving: str = Field(..., description="Problem-solving approach and depth")


class CommunicationSkills(BaseModel):
    """Communication skills model"""
    clarity: str = Field(..., description="Was the candidate clear or confusing?")
    conciseness: str = Field(..., description="Were answers concise or verbose?")
    confidence_indicators: str = Field(..., description="Phrases or tone showing confidence/hesitation")
    consistency: str = Field(..., description="Consistency with resume and answers")


class BehavioralTraits(BaseModel):
    """Behavioral traits model"""
    professionalism: str = Field(..., description="Politeness, tone, and behavior")
    adaptability: str = Field(..., description="How candidate handled follow-up questions")
    teamwork_leadership: str = Field(..., description="Examples of teamwork or leadership")


class LinguisticFeatures(BaseModel):
    """Linguistic features model"""
    filler_words: List[str] = Field(..., description="List of filler words used")
    answer_length: Literal['Short', 'Medium', 'Long'] = Field(..., description="Answer length category")
    vocabulary_richness: str = Field(..., description="Use of technical or diverse vocabulary")
    tone: Literal['Positive', 'Neutral', 'Negative'] = Field(..., description="Overall tone")


class PerformanceMetrics(BaseModel):
    """Performance metrics model"""
    content_analysis: ContentAnalysis
    communication_skills: CommunicationSkills
    behavioral_traits: BehavioralTraits
    linguistic_features: LinguisticFeatures


class Scores(BaseModel):
    """Scores model"""
    technical_knowledge: ScoreModel
    resume_alignment: ScoreModel
    job_role_fit: ScoreModel
    communication: ScoreModel
    articulation: ScoreModel
    confidence: ScoreModel
    clarity: ScoreModel
    domain_knowledge: ScoreModel
    overall: OverallScoreModel


class AlternativeAnswer(BaseModel):
    """Alternative answer model"""
    better_answer: str = Field(..., description="Improved answer candidate could have given")
    why_better: str = Field(..., description="Why this alternative is stronger")


class QAPairAnalysis(BaseModel):
    """Q/A pair analysis model"""
    question: str = Field(..., description="Question asked by AI interviewer")
    answer: str = Field(..., description="Candidate's response")
    ai_notes: str = Field(..., description="Analysis notes by AI")
    answer_score: Union[int, str] = Field(..., description="Answer score 0-10")
    justification: str = Field(..., description="Why this score was given")
    alternative_answers: List[AlternativeAnswer] = Field(..., description="Alternative better answers")
    why_bad: str = Field(..., description="Why original answer was weak")
    
    @validator('answer_score')
    def validate_answer_score(cls, v):
        if isinstance(v, str) and v.upper() == 'N/A':
            return v
        if isinstance(v, int) and 0 <= v <= 10:
            return v
        if isinstance(v, str) and v.isdigit():
            score_int = int(v)
            if 0 <= score_int <= 10:
                return score_int
        raise ValueError('Answer score must be between 0-10 or "N/A"')


class TranscriptAnalysis(BaseModel):
    """Transcript analysis model"""
    qa_pairs: List[QAPairAnalysis]


class Recommendations(BaseModel):
    """Recommendations model"""
    job_fit: Literal['low', 'moderate', 'high'] = Field(..., description="Job fit assessment")
    improvement_suggestions: List[str] = Field(..., description="Improvement suggestions")
    resources: List[str] = Field(..., description="Recommended resources")


class InterviewReportSchema(BaseModel):
    """Main interview report schema for validation"""
    candidate_info: CandidateInfo
    interview_overview: InterviewOverview
    performance_metrics: PerformanceMetrics
    scores: Scores
    strengths: List[str] = Field(..., description="List of candidate strengths")
    weaknesses: List[str] = Field(..., description="List of candidate weaknesses")
    recommendations: Recommendations
    transcript_analysis: TranscriptAnalysis
    
    class Config:
        extra = "forbid"  # Don't allow extra fields
        validate_assignment = True  # Validate on assignment


class QAPair(BaseModel):
    """Q/A pair model for extraction validation"""
    Q: str = Field(..., description="Interview question")
    A: str = Field(..., description="Candidate answer")


# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

evaluation_schema = {
    "candidate_info": {
        "name": "<Candidate Full Name>",
        "email": "<Candidate Email>",
        "phone": "<Candidate Phone>",
        "resume_summary": "<Brief summary extracted from resume>",
        "applied_role": "<Job role candidate applied for>",
        "applied_company": "<Company candidate applied for>"
    },
    "interview_overview": {
        "mode": "<mock | real>",
        "date": "<YYYY-MM-DD>",
        "duration_minutes": "<Total duration in minutes>",
        "questions_asked": "<Number of questions asked>",
        "categories": ["<Category1>", "<Category2>", "<Category3>"]
    },
    "performance_metrics": {
        "content_analysis": {
            "resume_understanding": "<Summary of how well candidate explained resume projects>",
            "job_role_fit": "<How well candidate fits the role based on answers>",
            "technical_knowledge": "<Evaluation of technical skills>",
            "problem_solving": "<Problem-solving approach and depth>"
        },
        "communication_skills": {
            "clarity": "<Was the candidate clear or confusing?>",
            "conciseness": "<Were answers concise or verbose?>",
            "confidence_indicators": "<Phrases or tone showing confidence/hesitation>",
            "consistency": "<Consistency with resume and answers>"
        },
        "behavioral_traits": {
            "professionalism": "<Politeness, tone, and behavior>",
            "adaptability": "<How candidate handled follow-up questions>",
            "teamwork_leadership": "<Examples of teamwork or leadership>"
        },
        "linguistic_features": {
            "filler_words": ["<um>", "<like>", "<etc>"],
            "answer_length": "<Short | Medium | Long>",
            "vocabulary_richness": "<Use of technical or diverse vocabulary>",
            "tone": "<Positive | Neutral | Negative>"
        }
    },
    "scores": {
        "technical_knowledge": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "resume_alignment": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "job_role_fit": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "communication": {"score": "<0-10>", "justification": "<Covers professionalism, articulation, fluency, vocab>"},
        "articulation": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "confidence": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "clarity": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "domain_knowledge": {"score": "<0-10>", "justification": "<Why this score was given>"},
        "overall": {"score": "<0-100>", "justification": "<Overall justification>"}
    },
    "strengths": [
        "<Strength 1>",
        "<Strength 2>",
        "<Strength 3>"
    ],
    "weaknesses": [
        "<Weakness 1>",
        "<Weakness 2>"
    ],
    "recommendations": {
        "job_fit": "<low | moderate | high>",
        "improvement_suggestions": [
            "<Suggestion 1>",
            "<Suggestion 2>",
            "<Suggestion 3>"
        ],
        "resources": [
            "<Resource 1>",
            "<Resource 2>"
        ]
    },
    "transcript_analysis": {
        "qa_pairs": [
            {
                "question": "<Question asked by AI interviewer>",
                "answer": "<Candidate's response>",
                "ai_notes": "<Analysis notes by AI>",
                "answer_score": "<0-10>",
                "justification": "<Why this score was given>",
                "alternative_answers": [
                    {
                        "better_answer": "<Improved answer candidate could have given>",
                        "why_better": "<Why this alternative is stronger>"
                    }
                ],
                "why_bad": "<Why original answer was weak>"
            }
        ]
    }
}


def generate_transcript(file_path):
    """
    Generate a transcript from an audio file using Google Generative AI.

    Args:
        file_path (str): Path to the audio file.

    Returns:
        dict: Contains transcript text.
    """
    # Upload the file using the File API
    uploaded_file = genai.upload_file(path=file_path)
    
    # Wait for file to be processed
    while uploaded_file.state.name == "PROCESSING":
        time.sleep(1)
        uploaded_file = genai.get_file(uploaded_file.name)
    
    if uploaded_file.state.name == "FAILED":
        raise Exception("File processing failed")

    # Create transcript
    prompt = "Generate a transcript of the speech. Only output the transcript with candidate names correctly spelled. If you hear , Hi, I'm Rahul from {company}, conducting your interview. kindly always replace company with Kcron.No extra text"

    generation_config = {
        "temperature": 0.1,
        "top_p": 0.95,
        "top_k": 1
    }

    # Get response using the uploaded file
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    response = model.generate_content(
        [prompt, uploaded_file],
        generation_config=generation_config
    )
    
    # Clean up uploaded file
    genai.delete_file(uploaded_file.name)

    return {"transcript": response.text}


def get_qa_pairs(transcript):
    """
    Extracts Q/A pairs from the transcript in the format {Q:, A:}.
    Returns Q/A pairs and usage metadata.
    """
    prompt = f"""
    Task 1: Extract Q/A Pairs
    Carefully read the transcript and extract clear interviewer questions (Q) and candidate answers (A) as Q/A pairs.
    If the transcript is conversational or not strictly formatted, infer the most likely questions and answers based on context.
    Present the Q/A pairs in the following JSON-like format:
    [
        {{ "Q": "Question 1", "A": "Answer 1" }},
        {{ "Q": "Question 2", "A": "Answer 2" }},
        ...
    ]
    Transcript:
    {transcript}
    """

    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.0,
        "top_p": 0.95,
        "top_k": 1
    }

    try:
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content(prompt, generation_config=generation_config)
        qa_pairs = json.loads(response.text.strip())
        usage_metadata = {
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "completion_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count
        }
        return qa_pairs, usage_metadata
    except Exception as e:
        raise ValueError(f"Error extracting Q/A pairs: {e}")


def generate_interview_report_from_transcript(transcript, parsed_resume_data):
    """
    Generates a detailed interview report based on transcript.
    Returns evaluation report and Q/A pairs.
    
    Args:
        transcript (str): The interview transcript
        parsed_resume_data (dict): Parsed resume data containing candidate information
    """
    # Extract Q/A pairs
    print("Extracting Q/A pairs...")
    qa_pairs, qa_usage = get_qa_pairs(transcript)
    print(f"✓ Extracted {len(qa_pairs)} Q/A pairs")
    print(f"  Q/A Extraction Usage - Tokens: {qa_usage['total_tokens']}")

    # Generate evaluation report using the evaluation schema from finalInterviewReport.py
    print("Generating evaluation report...")
    prompt = f"""
    Task 2: Interview Evaluation
    Using only the extracted Q/A pairs and the provided parsed resume data, generate a detailed interview report as described below.

    CRITICAL INSTRUCTION: The entire evaluation report MUST be grounded and synchronized with the parsed resume data provided below.
    All candidate information, technical knowledge assessment, skills evaluation, experience validation, and project analysis must be 
    derived from and aligned with this resume data. If any field is present in the parsed resume data, it MUST be included in the report.
    This ensures accuracy and prevents hallucination or manipulation by the LLM or any other entity.

    Parsed Resume Data (SOURCE OF TRUTH):
    {json.dumps(parsed_resume_data, indent=4)}

    Use this resume data as the authoritative source for:
    - Candidate full name, email, phone, and all contact information
    - Professional title and applied role/company
    - Technical skills inventory and assessment
    - Work experience history and validation
    - Project details, descriptions, and technologies used
    - Educational background and certifications
    - All strengths must be based on skills and experience from the resume
    - All weaknesses assessments must reference resume skills gaps
    - Job fit recommendations must consider resume-to-role alignment

    Report Structure:
    1. Candidate Info  
       - Name (extract from parsed resume data - MUST match resume)
       - Email (extract from parsed resume data - MUST match resume)
       - Phone (extract from parsed resume data - MUST match resume)
       - Resume Summary (use resume summary from parsed data)
       - Role/Company applied (extract from parsed resume data)  

    2. Interview Overview  
       - Mode (mock | real - determine based on context)
       - Date (extract if mentioned, otherwise use current date format YYYY-MM-DD)
       - Duration in minutes (estimate based on transcript length if not mentioned)
       - Total number of questions asked (count Q entries)  
       - Question categories (e.g., technical: coding, system design; behavioral: teamwork, leadership; resume-based: work experience, projects; role-specific: job-relevant skills). Provide counts and examples for each category.  

    3. Performance Metrics (based solely on transcript and grounded in resume)
       Content Analysis:
       - Resume Understanding: Evaluate how well candidate explained resume projects and experience
       - Job Role Fit: How well candidate's resume skills fit the role based on answers
       - Technical Knowledge: Evaluation of technical skills mentioned in resume and demonstrated in answers
       - Problem Solving: Problem-solving approach and depth related to resume projects and experience
       
       Communication Skills:
       - Clarity: Was the candidate clear or confusing?
       - Conciseness: Were answers concise or verbose?
       - Confidence Indicators: Phrases or tone showing confidence/hesitation
       - Consistency: Consistency between resume claims and interview answers
       
       Behavioral Traits:
       - Professionalism: Politeness, tone, and behavior
       - Adaptability: How candidate handled follow-up questions
       - Teamwork Leadership: Examples of teamwork or leadership from resume experience
       
       Linguistic Features:
       - Filler Words: List any filler words used (um, like, etc.)
       - Answer Length: Short | Medium | Long
       - Vocabulary Richness: Use of technical or diverse vocabulary
       - Tone: Positive | Neutral | Negative

    4. Scoring (0 to 10 per category, adjusted for data availability)  
       - Technical Knowledge: Assess depth, correctness, and relevance of technical answers based on resume skills (weight: 10/10)
       - Resume Alignment: How well interview answers align with experience stated in resume
       - Job Role Fit: Suitability for the applied position based on resume qualifications
       - Communication: Covers professionalism, articulation, fluency, vocab
       - Articulation: Structure, clarity, and logical flow of answers
       - Confidence: Self-assurance in responses without arrogance
       - Clarity: Clear expression of ideas
       - Domain Knowledge: Knowledge specific to the field/industry based on resume expertise
       - Overall: Comprehensive score out of 100
       
       For each category, provide a score (0 to 10) and a brief justification (1 to 2 sentences) citing specific transcript examples.  
       If insufficient data exists for a category, assign a score of "N/A" with an explanation (e.g., "No technical questions asked").  

    5. Strengths & Weaknesses  
       - List 3 to 5 key strengths from resume and demonstrated in interview, supported by specific transcript examples.  
       - List 3 to 5 areas for improvement based on resume skills gaps, supported by specific examples from transcript.  

    6. Recommendations  
       - Job Fit: low | moderate | high (based on resume-to-role alignment)
       - Provide 2 to 3 personalized, actionable improvement suggestions based on resume gaps
       - Include relevant resources for improvement

    7. Transcript Analysis
       - For each Q/A pair, provide:
         * Question asked by interviewer
         * Candidate's response
         * AI analysis notes grounded in resume experience
         * Answer score (0-10)
         * Justification for the score citing resume alignment
         * Alternative better answers (if applicable)
         * Why the original answer was weak (if applicable)

    Guidelines for Accurate Evaluation:
    - Resume Grounding: Every assessment must reference and align with the parsed resume data
    - Weighting: Reflect the provided weights in scoring and emphasis.
    - Evidence-Based: Base all assessments on Q/A pairs and resume data, quoting or referencing specific elements
    - Fairness: Avoid bias from personal details unless explicitly relevant to role fit
    - Incomplete Data: If a metric cannot be evaluated, note "Insufficient data" and exclude from overall fit assessment
    - Consistency: Ensure scores align with evaluation metrics, Q/A evidence, and resume data
    - Industry Standards: Model evaluations on rubrics from top tech companies
    - No Hallucination: Do not invent skills, experience, or projects not present in the resume

    Output Format:
    - Use json {evaluation_schema} for clarity, with clear section headers and bullet points. You have to do it, do no deviate from the format.
    - Ensure scores reflect the weighted importance of each metric.
    - Provide concise, evidence-based justifications for all scores and observations grounded in resume data.

    Q/A Pairs:
    {json.dumps(qa_pairs, indent=4)}

    Output: A single valid JSON object matching the provided schema. Ensure all candidate information matches the parsed resume data exactly.
    """

    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.0,
        "top_p": 0.95,
        "top_k": 1
    }

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt, generation_config=generation_config)

        response_text = response.text.strip()
        evaluation_report = json.loads(response_text)
        print("✓ Evaluation report generated successfully")

    except json.JSONDecodeError as e:
        print(f"✗ JSON Parse Error: {e}")
        print(f"  Response preview: {response.text[:500]}")
        raise ValueError(f"Failed to parse evaluation report JSON: {e}")
    except Exception as e:
        raise ValueError(f"Error generating evaluation report: {e}")

    # Validate using InterviewReportSchema from finalInterviewReport.py
    try:
        validated_report = InterviewReportSchema(**evaluation_report)
        evaluation_report = validated_report.dict()
    except Exception as validation_error:
        print(f"Warning: Evaluation report validation failed: {validation_error}")
        # Continue with unvalidated data but log the issue

    eval_usage = {
        "prompt_tokens": response.usage_metadata.prompt_token_count,
        "completion_tokens": response.usage_metadata.candidates_token_count,
        "total_tokens": response.usage_metadata.total_token_count
    }
    print(f"  Evaluation Usage - Tokens: {eval_usage['total_tokens']}")

    return qa_pairs, qa_usage, evaluation_report, eval_usage


def generate_interview_report(audio_path, parsed_resume_data):
    """
    Complete pipeline: audio file -> transcript -> Q/A pairs -> interview report.

    Args:
        audio_path (str): Path to the audio file.
        parsed_resume_data (dict): Parsed resume data containing candidate information

    Returns:
        dict: Complete interview report with transcript, Q/A pairs, evaluation, and metadata.
    """
    start_time = time.time()

    try:
        # generate transcript from audio
        print(f"\n{'='*60}")
        print(f"Generating transcript from {audio_path}...")
        transcript_data = generate_transcript(audio_path)
        transcript = transcript_data["transcript"]
        print(f"✓ Transcript generated ({len(transcript)} characters)")
        print(f"  Preview: {transcript[:100]}...")

        # generate interview report from transcript
        print(f"\nGenerating interview report...")
        qa_pairs, qa_usage, evaluation_report, eval_usage = generate_interview_report_from_transcript(
            transcript, 
            parsed_resume_data
        )

        elapsed_time = round(time.time() - start_time, 4)
        print(f"\n✓ Complete! Execution time: {elapsed_time}s")
        print(f"{'='*60}\n")

        # return all data
        return {
            "transcript": transcript,
            "qa_pairs": qa_pairs,
            "evaluation_report": evaluation_report,
            "usage_metadata": {
                "qa_extraction": qa_usage,
                "evaluation": eval_usage
            },
            "execution_time": elapsed_time
        }

    except Exception as e:
        print(f"✗ Error: {e}")
        raise ValueError(f"Error generating interview report: {e}")


# driver code
# report = generate_interview_report(audio_path='audio.mp3', parsed_resume_data)