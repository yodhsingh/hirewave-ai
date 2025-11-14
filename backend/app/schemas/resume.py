from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr, field_validator


class SocialProfileLink(BaseModel):
    """Social profile link schema - supports both dict and string formats"""
    platform: Optional[str] = None
    url: Optional[str] = None


class Certificate(BaseModel):
    """Certificate schema - supports both dict and string formats"""
    name: Optional[str] = None
    link: Optional[str] = None


class ContactInformation(BaseModel):
    """Contact information schema"""
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class Education(BaseModel):
    """Education entry schema"""
    college_name: Optional[str] = None
    degree: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class Experience(BaseModel):
    """Work experience entry schema"""
    company_name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    job_title: Optional[str] = None
    work_description: Optional[List[str]] = None
    project_links: Optional[str] = None

    class Config:
        # Allow field names with spaces from the parser
        populate_by_name = True
        
    def __init__(self, **data):
        # Map the parser's field names to our schema
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
    """Project entry schema"""
    name: Optional[str] = None
    description: Optional[List[str]] = None
    links: Optional[List[str]] = None
    technologies: Optional[List[str]] = None


class ResumeData(BaseModel):
    """Complete resume data structure"""
    name: Optional[str] = None
    contact_information: Optional[ContactInformation] = None
    social_profile_links: Optional[List[Union[SocialProfileLink, str]]] = None
    professional_title: Optional[List[str]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    skills: Optional[List[str]] = None
    achivements: Optional[List[str]] = None
    projects: Optional[List[Project]] = None
    certificates: Optional[List[Union[Certificate, str]]] = None
    volunteer: Optional[List[str]] = None

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
    """Token usage metadata from Gemini API"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ResumeParseResponse(BaseModel):
    """Response schema for resume parsing endpoint"""
    content: ResumeData
    usage_metadata: UsageMetadata
    execution_time: float
