from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserBase(BaseModel):
    """
    Base user schema with common fields.

    Used as foundation for user creation and response models.
    """

    email: EmailStr = Field(
        ...,
        description="User's email address (must be unique)",
        example="john.doe@company.com"
    )
    name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="User's full name",
        example="John Doe"
    )
    role: UserRole = Field(
        default=UserRole.CANDIDATE,
        description="User role: HR (recruiter), CANDIDATE (job applicant), or ADMIN (platform admin)",
        example="CANDIDATE"
    )


class UserCreate(UserBase):
    """
    Schema for creating a new user account.

    Requires email, name, role, and password. Password must be at least 8 characters.
    For HR users, company_name is required to associate them with a company.
    """

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User password (min 8 characters, will be securely hashed)",
        example="SecureP@ssw0rd"
    )
    company_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=255,
        description="Company name (required for HR users)",
        example="TechCorp Inc."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "jane.smith@example.com",
                "name": "Jane Smith",
                "role": "HR",
                "password": "SecureP@ssw0rd123",
                "company_name": "TechCorp Inc."
            }
        }


class UserLogin(BaseModel):
    """
    Schema for user authentication.

    Accepts email and password credentials to obtain JWT tokens.
    """

    email: EmailStr = Field(
        ...,
        description="Registered email address",
        example="john.doe@company.com"
    )
    password: str = Field(
        ...,
        description="User password",
        example="SecureP@ssw0rd"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@company.com",
                "password": "SecureP@ssw0rd123"
            }
        }


class UserResponse(UserBase):
    """
    User profile response schema.

    Returns user information without sensitive data like password.
    Includes timestamps for account creation, updates, and last login.
    """

    id: int = Field(..., description="Unique user identifier", example=42)
    company_id: Optional[int] = Field(
        None,
        description="Associated company ID (for HR users)",
        example=1
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp (UTC)",
        example="2024-01-15T10:30:00Z"
    )
    updated_at: datetime = Field(
        ...,
        description="Last profile update timestamp (UTC)",
        example="2024-01-20T14:45:00Z"
    )
    last_login: Optional[datetime] = Field(
        None,
        description="Last successful login timestamp (UTC)",
        example="2024-01-21T09:15:00Z"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 42,
                "email": "john.doe@company.com",
                "name": "John Doe",
                "role": "CANDIDATE",
                "company_id": None,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T14:45:00Z",
                "last_login": "2024-01-21T09:15:00Z"
            }
        }


class TokenResponse(BaseModel):
    """
    Authentication token response.

    Contains JWT access and refresh tokens for API authentication,
    along with user profile information.
    """

    access_token: str = Field(
        ...,
        description="JWT access token for API authentication (valid for 1 year)",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    refresh_token: str = Field(
        ...,
        description="JWT refresh token for obtaining new access tokens",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    token_type: str = Field(
        default="bearer",
        description="Token type for Authorization header",
        example="bearer"
    )
    user: UserResponse = Field(
        ...,
        description="Authenticated user's profile information"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsImV4cCI6MTczNTY1NjAwMH0.xyz",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsImV4cCI6MTczNTY1NjAwMH0.abc",
                "token_type": "bearer",
                "user": {
                    "id": 42,
                    "email": "john.doe@company.com",
                    "name": "John Doe",
                    "role": "CANDIDATE",
                    "company_id": None,
                    "created_at": "2024-01-15T10:30:00Z",
                    "updated_at": "2024-01-20T14:45:00Z",
                    "last_login": "2024-01-21T09:15:00Z"
                }
            }
        }
