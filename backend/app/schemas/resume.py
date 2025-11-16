from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr, field_validator, Field


class SocialProfileLink(BaseModel):
    """
    Social media profile link extracted from resume.

    Supports platforms like LinkedIn, GitHub, Twitter, etc.
    """
    platform: Optional[str] = Field(
        None,
        description="Platform name (LinkedIn, GitHub, Twitter, etc.)",
        example="LinkedIn"
    )
    url: Optional[str] = Field(
        None,
        description="Profile URL",
        example="https://linkedin.com/in/johndoe"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "platform": "GitHub",
                "url": "https://github.com/johndoe"
            }
        }


class Certificate(BaseModel):
    """
    Professional certification or course completion.

    Extracted from resume certificates section.
    """
    name: Optional[str] = Field(
        None,
        description="Certificate or course name",
        example="AWS Certified Solutions Architect"
    )
    link: Optional[str] = Field(
        None,
        description="Verification or credential URL",
        example="https://www.credly.com/badges/xyz123"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Google Cloud Professional Data Engineer",
                "link": "https://www.credential.net/abc456"
            }
        }


class ContactInformation(BaseModel):
    """
    Candidate contact details extracted from resume.

    Used for communication and verification.
    """
    email: Optional[str] = Field(
        None,
        description="Email address",
        example="john.doe@email.com"
    )
    phone: Optional[str] = Field(
        None,
        description="Phone number with country code",
        example="+1 (555) 123-4567"
    )
    address: Optional[str] = Field(
        None,
        description="Physical address or city/state",
        example="San Francisco, CA"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "jane.smith@email.com",
                "phone": "+1 (415) 555-0123",
                "address": "Seattle, WA"
            }
        }


class Education(BaseModel):
    """
    Educational qualification entry from resume.

    Includes degree, institution, and dates.
    """
    college_name: Optional[str] = Field(
        None,
        description="University or college name",
        example="Stanford University"
    )
    degree: Optional[str] = Field(
        None,
        description="Degree and major",
        example="Bachelor of Science in Computer Science"
    )
    start_date: Optional[str] = Field(
        None,
        description="Start date (flexible format)",
        example="2015"
    )
    end_date: Optional[str] = Field(
        None,
        description="End date or 'Present' for ongoing",
        example="2019"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "college_name": "MIT",
                "degree": "Master of Science in Artificial Intelligence",
                "start_date": "2019",
                "end_date": "2021"
            }
        }


class Experience(BaseModel):
    """
    Work experience entry from resume.

    Includes company, role, dates, and accomplishments.
    """
    company_name: Optional[str] = Field(
        None,
        description="Company or organization name",
        example="Google"
    )
    start_date: Optional[str] = Field(
        None,
        description="Employment start date",
        example="Jan 2020"
    )
    end_date: Optional[str] = Field(
        None,
        description="Employment end date or 'Present'",
        example="Present"
    )
    job_title: Optional[str] = Field(
        None,
        description="Job title or role",
        example="Senior Software Engineer"
    )
    work_description: Optional[List[str]] = Field(
        None,
        description="List of responsibilities and achievements",
        example=["Led development of microservices architecture", "Reduced API latency by 40%"]
    )
    project_links: Optional[str] = Field(
        None,
        description="Links to relevant projects or portfolios",
        example="https://github.com/johndoe/project"
    )

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "company_name": "Microsoft",
                "start_date": "June 2019",
                "end_date": "Dec 2022",
                "job_title": "Cloud Solutions Architect",
                "work_description": [
                    "Designed and deployed Azure-based solutions for enterprise clients",
                    "Led team of 5 engineers in cloud migration projects",
                    "Achieved 99.9% uptime across all deployed services"
                ],
                "project_links": "https://example.com/portfolio"
            }
        }

    def __init__(self, **data):
        if "company name" in data:
            data["company_name"] = data.pop("company name")
        if "start date" in data:
            data["start_date"] = data.pop("start date")
        if "end date" in data:
            data["end_date"] = data.pop("end date")
        if "job title" in data:
            data["job_title"] = data.pop("job title")
        if "work description" in data:
            data["work_description"] = data.pop("work description")
        if "project links" in data:
            data["project_links"] = data.pop("project links")
        super().__init__(**data)


class Project(BaseModel):
    """
    Personal or professional project from resume.

    Showcases technical skills and initiative.
    """
    name: Optional[str] = Field(
        None,
        description="Project name",
        example="E-commerce Platform"
    )
    description: Optional[List[str]] = Field(
        None,
        description="Project description and features",
        example=["Built full-stack e-commerce site", "Integrated Stripe payment processing"]
    )
    links: Optional[List[str]] = Field(
        None,
        description="Project URLs (GitHub, live demo, etc.)",
        example=["https://github.com/user/project", "https://demo.example.com"]
    )
    technologies: Optional[List[str]] = Field(
        None,
        description="Technologies and tools used",
        example=["React", "Node.js", "PostgreSQL", "Docker"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "AI-Powered Interview Platform",
                "description": [
                    "Developed asynchronous interview system with AI evaluation",
                    "Reduced hiring time by 60%"
                ],
                "links": ["https://github.com/user/hivewave"],
                "technologies": ["FastAPI", "React", "OpenAI", "PostgreSQL"]
            }
        }


class ResumeData(BaseModel):
    """
    Complete structured resume data extracted by AI.

    Contains all sections typically found in a professional resume.
    """
    name: Optional[str] = Field(
        None,
        description="Candidate's full name",
        example="John Doe"
    )
    contact_information: Optional[ContactInformation] = Field(
        None,
        description="Contact details"
    )
    social_profile_links: Optional[List[Union[SocialProfileLink, str]]] = Field(
        None,
        description="Social media and professional profiles"
    )
    professional_title: Optional[List[str]] = Field(
        None,
        description="Current titles or roles",
        example=["Senior Software Engineer", "Tech Lead"]
    )
    education: Optional[List[Education]] = Field(
        None,
        description="Educational background"
    )
    experience: Optional[List[Experience]] = Field(
        None,
        description="Work experience history"
    )
    skills: Optional[List[str]] = Field(
        None,
        description="Technical and soft skills",
        example=["Python", "FastAPI", "React", "AWS", "Team Leadership"]
    )
    achivements: Optional[List[str]] = Field(
        None,
        description="Notable achievements and awards",
        example=["Employee of the Year 2022", "Published 3 research papers"]
    )
    projects: Optional[List[Project]] = Field(
        None,
        description="Personal or professional projects"
    )
    certificates: Optional[List[Union[Certificate, str]]] = Field(
        None,
        description="Professional certifications"
    )
    volunteer: Optional[List[str]] = Field(
        None,
        description="Volunteer work and community involvement",
        example=["Mentor at Code.org", "Tech advisor for non-profit"]
    )

    class Config:
        # Allow field names with spaces from the parser
        populate_by_name = True
        
    @field_validator('social_profile_links', mode='before')
    @classmethod
    def normalize_social_links(cls, v):
        """Normalize social profile links to handle both dict and string formats"""
        if v is None:
            return v
        
        normalized = []
        for item in v:
            if isinstance(item, dict):
                # Convert dict to SocialProfileLink
                normalized.append(item)
            elif isinstance(item, str):
                # Keep string as is, wrap in dict format
                normalized.append({"platform": "Unknown", "url": item})
            else:
                # Skip invalid items
                continue
        
        return normalized if normalized else None
    
    @field_validator('certificates', mode='before')
    @classmethod
    def normalize_certificates(cls, v):
        """Normalize certificates to handle both dict and string formats"""
        if v is None:
            return v
        
        normalized = []
        for item in v:
            if isinstance(item, dict):
                # Convert dict to Certificate
                normalized.append(item)
            elif isinstance(item, str):
                # Keep string as is, wrap in dict format
                normalized.append({"name": item, "link": None})
            else:
                # Skip invalid items
                continue
        
        return normalized if normalized else None
        
    def __init__(self, **data):
        # Map the parser's field names to our schema
        if "social profile links" in data:
            data["social_profile_links"] = data.pop("social profile links")
        if "professional title" in data:
            data["professional_title"] = data.pop("professional title")
        super().__init__(**data)


class UsageMetadata(BaseModel):
    """
    AI model token usage metadata from Gemini API.

    Used for tracking costs and API usage.
    """
    prompt_tokens: int = Field(
        ...,
        description="Number of tokens in the input (resume file)",
        example=1250
    )
    completion_tokens: int = Field(
        ...,
        description="Number of tokens in the AI response (structured data)",
        example=850
    )
    total_tokens: int = Field(
        ...,
        description="Total tokens used (prompt + completion)",
        example=2100
    )

    class Config:
        json_schema_extra = {
            "example": {
                "prompt_tokens": 2500,
                "completion_tokens": 1200,
                "total_tokens": 3700
            }
        }


class ResumeParseResponse(BaseModel):
    """
    Complete response from AI resume parsing endpoint.

    Returns structured resume data, usage metrics, and performance stats.
    """
    content: ResumeData = Field(
        ...,
        description="Extracted and structured resume data"
    )
    usage_metadata: UsageMetadata = Field(
        ...,
        description="AI API token usage statistics"
    )
    execution_time: float = Field(
        ...,
        description="Processing time in seconds",
        example=2.45
    )

    class Config:
        json_schema_extra = {
            "example": {
                "content": {
                    "name": "Sarah Johnson",
                    "contact_information": {
                        "email": "sarah.johnson@email.com",
                        "phone": "+1 (415) 555-0198",
                        "address": "San Francisco, CA"
                    },
                    "professional_title": ["Senior Backend Engineer", "Tech Lead"],
                    "education": [
                        {
                            "college_name": "Stanford University",
                            "degree": "Master of Science in Computer Science",
                            "start_date": "2015",
                            "end_date": "2017"
                        }
                    ],
                    "experience": [
                        {
                            "company_name": "Google",
                            "job_title": "Senior Software Engineer",
                            "start_date": "2018",
                            "end_date": "Present",
                            "work_description": [
                                "Led development of distributed systems handling 10M+ requests/day",
                                "Mentored team of 8 junior engineers"
                            ]
                        }
                    ],
                    "skills": ["Python", "Go", "Kubernetes", "PostgreSQL", "System Design"],
                    "projects": [
                        {
                            "name": "Open Source Distributed Cache",
                            "description": ["Built high-performance caching system"],
                            "technologies": ["Go", "Redis", "Docker"],
                            "links": ["https://github.com/user/cache-project"]
                        }
                    ],
                    "certificates": [
                        {
                            "name": "AWS Solutions Architect Professional",
                            "link": "https://www.credly.com/badges/xyz"
                        }
                    ]
                },
                "usage_metadata": {
                    "prompt_tokens": 3200,
                    "completion_tokens": 1500,
                    "total_tokens": 4700
                },
                "execution_time": 3.25
            }
        }
