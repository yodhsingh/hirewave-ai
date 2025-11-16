from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

# -------------------------------------------------
# ENUM CLASS: Defines the role of a user in the system
# -------------------------------------------------
class UserRole(str, enum.Enum):
    HR = "HR" # Human Resources user – can post jobs, view candidates, manage invites
    CANDIDATE = "CANDIDATE" # Job applicant – can apply for jobs and participate in interviews
    ADMIN = "ADMIN" # Administrator – has full control over the system

# -------------------------------------------------
# USER MODEL: Represents a system user (HR, Candidate, or Admin)
# -------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name='user_role', native_enum=True, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=UserRole.CANDIDATE)
    company_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    insights = relationship("UserInsight", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email}>"
