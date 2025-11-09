from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import verify_token
from app.db.base import get_db
from app.models.user import User, UserRole

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user"""
    import logging
    logger = logging.getLogger(__name__)

    token = credentials.credentials
    logger.info(f"[Auth] Verifying token: {token[:20]}...")

    payload = verify_token(token)
    logger.info(f"[Auth] Token payload: {payload}")

    if not payload:
        logger.error("[Auth] Token verification failed - invalid or expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    logger.info(f"[Auth] User ID from token: {user_id} (type: {type(user_id)})")

    if not user_id:
        logger.error("[Auth] No 'sub' in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Convert string user_id to integer for database query if needed
    try:
        if isinstance(user_id, str):
            user_id = int(user_id)
    except (ValueError, TypeError) as e:
        logger.error(f"[Auth] Invalid user ID format: {user_id}, error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    logger.info(f"[Auth] User ID (converted): {user_id} (type: {type(user_id)})")
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    logger.info(f"[Auth] User found: {user.email if user else 'None'}")

    if not user:
        logger.error(f"[Auth] User with ID {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


async def get_current_hr_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require HR or Admin role"""
    if current_user.role not in [UserRole.HR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user if authenticated, otherwise None"""
    if not credentials:
        return None

    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
