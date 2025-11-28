from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.db.base import get_db
from app.models.user import User, UserRole
from app.models.company import Company
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.common import ApiResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": {
                            "code": "VALIDATION_ERROR",
                            "message": "Invalid input data",
                            "details": "Email already registered"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized - Invalid credentials",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": {
                            "code": "UNAUTHORIZED",
                            "message": "Incorrect email or password"
                        }
                    }
                }
            }
        },
        500: {
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": {
                            "code": "INTERNAL_SERVER_ERROR",
                            "message": "An unexpected error occurred"
                        }
                    }
                }
            }
        }
    }
)


@router.post(
    "/register",
    response_model=ApiResponse[TokenResponse],
    summary="Register a new user",
    description="""
    Register a new user account in the system.

    This endpoint creates a new user account with the provided credentials and returns
    authentication tokens for immediate login.

    **Requirements:**
    - Email must be unique and valid
    - Password must meet security requirements (min 8 characters)
    - Role must be either HR, CANDIDATE, or ADMIN

    **Returns:**
    - Access token (JWT) valid for 1 year
    - Refresh token for token renewal
    - User profile information

    **Example Use Case:**
    A new candidate signs up to access practice interviews and track job applications.
    """,
    response_description="User successfully registered with authentication tokens",
    responses={
        200: {
            "description": "Successful registration",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "data": {
                            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "token_type": "bearer",
                            "user": {
                                "id": 42,
                                "email": "jane.smith@example.com",
                                "name": "Jane Smith",
                                "role": "CANDIDATE",
                                "company_id": None,
                                "created_at": "2024-01-15T10:30:00Z",
                                "updated_at": "2024-01-15T10:30:00Z",
                                "last_login": None
                            }
                        }
                    }
                }
            }
        }
    }
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Handle company for HR users
    company_id = None
    if user_data.role == UserRole.HR and user_data.company_name:
        # Check if company exists, create if not
        result = await db.execute(select(Company).filter(Company.name == user_data.company_name))
        company = result.scalar_one_or_none()
        if not company:
            company = Company(name=user_data.company_name)
            db.add(company)
            await db.flush()  # Get the ID without committing
        company_id = company.id

    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        password_hash=get_password_hash(user_data.password),
        company_id=company_id,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate tokens (convert user.id to string for JWT standard compliance)
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return ApiResponse(
        success=True,
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        ),
    )


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
    summary="Login user",
    description="""
    Authenticate a user and receive access tokens.

    This endpoint validates user credentials and returns JWT tokens for authenticated API access.

    **Process:**
    1. Validates email and password
    2. Updates last login timestamp
    3. Generates fresh authentication tokens

    **Returns:**
    - Access token (JWT) for API authentication
    - Refresh token for renewing access
    - User profile information

    **Example Use Case:**
    An HR manager logs in to review candidate applications and schedule interviews.
    """,
    response_description="User successfully authenticated with tokens",
    responses={
        200: {
            "description": "Successful authentication",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "data": {
                            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "token_type": "bearer",
                            "user": {
                                "id": 15,
                                "email": "hr.manager@company.com",
                                "name": "Sarah Johnson",
                                "role": "HR",
                                "company_id": 5,
                                "created_at": "2023-12-01T08:00:00Z",
                                "updated_at": "2024-01-20T14:30:00Z",
                                "last_login": "2024-01-21T09:15:00Z"
                            }
                        }
                    }
                }
            }
        }
    }
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    # Find user
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()

    # Generate tokens (convert user.id to string for JWT standard compliance)
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return ApiResponse(
        success=True,
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        ),
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    summary="Get current user profile",
    description="""
    Retrieve the authenticated user's profile information.

    This endpoint returns the profile data for the currently logged-in user
    based on the JWT token provided in the Authorization header.

    **Authentication Required:** Yes (Bearer token)

    **Returns:**
    - User ID, email, name
    - User role (HR, CANDIDATE, or ADMIN)
    - Account creation and last login timestamps
    """,
    response_description="Current user profile data",
)
async def get_me(
    db: AsyncSession = Depends(get_db),
    # Simplified for now - add get_current_user dependency later
):
    # TODO: Implement with get_current_user dependency
    return ApiResponse(
        success=True,
        data=None,
    )
