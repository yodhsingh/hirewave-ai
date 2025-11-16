"""User Insights Model - Stores consolidated AI-generated insights for users"""

from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, ARRAY, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base


class UserInsight(Base):
    """Consolidated AI-generated insights for a user based on their practice sessions"""

    __tablename__ = "user_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    insights = Column(JSONB, nullable=False, default=[])  # Array of insight strings
    sessions_analyzed = Column(Integer, default=0)
    last_session_id = Column(Integer, ForeignKey("practice_sessions.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    updated_at = Column(DateTime(timezone=False), server_default=func.now(), onupdate=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="insights")
    last_session = relationship("PracticeSession", foreign_keys=[last_session_id])
