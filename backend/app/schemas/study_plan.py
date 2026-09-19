from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class StudyPlanCreate(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=200,
    )

    description: str | None = None

    start_date: date

    end_date: date

    status: str = Field(
        default="active",
        min_length=1,
        max_length=30,
    )


class StudyPlanUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    description: str | None = None

    start_date: date | None = None

    end_date: date | None = None

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )


class StudyTaskCreate(BaseModel):
    subject: str = Field(
        min_length=1,
        max_length=150,
    )

    topic: str = Field(
        min_length=1,
        max_length=200,
    )

    scheduled_date: date

    duration_minutes: int = Field(
        ge=1,
        le=1440,
    )

    priority: str = Field(
        default="medium",
        min_length=1,
        max_length=30,
    )

    status: str = Field(
        default="pending",
        min_length=1,
        max_length=30,
    )

    completion_percentage: int = Field(
        default=0,
        ge=0,
        le=100,
    )

    notes: str | None = None


class StudyTaskUpdate(BaseModel):
    subject: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    topic: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    scheduled_date: date | None = None

    duration_minutes: int | None = Field(
        default=None,
        ge=1,
        le=1440,
    )

    priority: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    completion_percentage: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    notes: str | None = None


class StudyTaskResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    study_plan_id: int
    subject: str
    topic: str
    scheduled_date: date
    duration_minutes: int
    priority: str
    status: str
    completion_percentage: int
    notes: str | None
    created_at: datetime
    updated_at: datetime


class StudyPlanResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int
    title: str
    description: str | None
    start_date: date
    end_date: date
    status: str
    created_at: datetime
    updated_at: datetime


class StudyPlanDetailResponse(BaseModel):
    plan: StudyPlanResponse
    tasks: list[StudyTaskResponse]


class StudyPlanProgressResponse(BaseModel):
    study_plan_id: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    total_duration_minutes: int
    completed_duration_minutes: int
    progress_percentage: float