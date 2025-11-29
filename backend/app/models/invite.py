from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Integer
from app.db.base import Base
import enum

# Enum class defining possible invitation statuses
class InviteStatus(str, enum.Enum):
    PENDING = "PENDING"  # Invitation created but not yet sent
    SENT = "SENT"  # Invitation email has been sent
    OPENED = "OPENED"  # Invitation link has been opened
    USED = "USED"  # Invitation has been used for registration
    EXPIRED = "EXPIRED"  # Invitation token has expired


class Invite(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)

    status = Column(Enum(InviteStatus, native_enum=True, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=InviteStatus.PENDING)

    sent_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=False)

    reminder_count = Column(Integer, default=0, nullable=False)
    last_reminder_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Invite {self.email}>"
