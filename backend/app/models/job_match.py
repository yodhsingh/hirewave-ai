from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base


class JobMatch(Base):
    """
    Stores calculated match scores between candidates and jobs.
    Match scores are recalculated when profile is updated after last calculation.
    """
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)

    match_score = Column(Integer, nullable=False, default=0)  # 0-100
    match_reasons = Column(JSONB, nullable=True)  # List of reasons for match
    missing_skills = Column(JSONB, nullable=True)  # Skills the candidate lacks

    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    profile_updated_at = Column(DateTime, nullable=True)  # Timestamp of profile when calculated

    # Relationships
    user = relationship("User", backref="job_matches")
    job = relationship("Job", backref="job_matches")

    def __repr__(self):
        return f"<JobMatch user={self.user_id} job={self.job_id} score={self.match_score}>"
