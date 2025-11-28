from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company")

    def __repr__(self):
        return f"<Company {self.name}>"
