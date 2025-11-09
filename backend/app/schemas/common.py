from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""

    success: bool
    data: Optional[T] = None
    error: Optional[dict] = None
    meta: Optional[dict] = None


class ErrorDetail(BaseModel):
    """Error detail schema"""

    code: str
    message: str
    details: Optional[Any] = None


class PaginationMeta(BaseModel):
    """Pagination metadata"""

    page: int
    limit: int
    total: int
    has_more: bool
