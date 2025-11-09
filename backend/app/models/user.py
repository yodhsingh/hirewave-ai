from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Integer
from app.db.base import Base
import enum


class UserRole(str, enum.Enum):
    HR = "HR"
    CANDIDATE = "CANDIDATE"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, native_enum=True, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=UserRole.CANDIDATE)
    company_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User {self.email}>"
