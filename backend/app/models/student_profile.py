from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    degree: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    university: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    academic_year: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    cgpa: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    technical_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    learning_interests: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    career_goals: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    learning_preferences: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
