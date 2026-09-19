from datetime import datetime

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    project_type: str = "Academic Project"
    status: str = "planning"
    progress: float = Field(default=0, ge=0, le=100)
    technologies: str | None = None
    github_url: str | None = None
    live_url: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    project_type: str | None = None
    status: str | None = None
    progress: float | None = Field(default=None, ge=0, le=100)
    technologies: str | None = None
    github_url: str | None = None
    live_url: str | None = None


class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

