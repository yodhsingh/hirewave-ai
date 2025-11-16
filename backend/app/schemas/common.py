from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """
    Standard API response wrapper for all endpoints.

    All API responses follow this consistent structure for predictable error handling
    and data extraction on the client side.

    **Success Response:**
    - success: true
    - data: Contains the requested resource(s)
    - meta: Optional metadata (pagination, counts, etc.)

    **Error Response:**
    - success: false
    - error: Contains error code, message, and details
    """

    success: bool = Field(
        ...,
        description="Indicates if the request was successful",
        example=True
    )
    data: Optional[T] = Field(
        None,
        description="Response payload (type varies by endpoint)"
    )
    error: Optional[dict] = Field(
        None,
        description="Error information (only present when success=false)",
        example={
            "code": "VALIDATION_ERROR",
            "message": "Invalid input data",
            "details": "Email already exists"
        }
    )
    meta: Optional[dict] = Field(
        None,
        description="Additional metadata (pagination, counts, timestamps, etc.)",
        example={
            "total": 100,
            "page": 1,
            "limit": 20
        }
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "success": True,
                    "data": {"id": 1, "name": "Example"},
                    "meta": {"total": 1}
                },
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Resource not found",
                        "details": "User with ID 999 does not exist"
                    }
                }
            ]
        }


class ErrorDetail(BaseModel):
    """
    Structured error information.

    Provides consistent error reporting across all API endpoints.
    """

    code: str = Field(
        ...,
        description="Machine-readable error code (e.g., VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED)",
        example="VALIDATION_ERROR"
    )
    message: str = Field(
        ...,
        description="Human-readable error message",
        example="Invalid input data provided"
    )
    details: Optional[Any] = Field(
        None,
        description="Additional error context (field errors, stack trace in debug mode, etc.)",
        example="Email field: must be a valid email address"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": {
                    "email": "must be a valid email address",
                    "password": "must be at least 8 characters"
                }
            }
        }


class PaginationMeta(BaseModel):
    """
    Pagination metadata for list endpoints.

    Helps clients navigate through large datasets efficiently.
    """

    page: int = Field(
        ...,
        ge=1,
        description="Current page number (1-indexed)",
        example=1
    )
    limit: int = Field(
        ...,
        ge=1,
        le=100,
        description="Number of items per page",
        example=20
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total number of items across all pages",
        example=100
    )
    has_more: bool = Field(
        ...,
        description="Indicates if there are more pages available",
        example=True
    )

    class Config:
        json_schema_extra = {
            "example": {
                "page": 1,
                "limit": 20,
                "total": 100,
                "has_more": True
            }
        }
