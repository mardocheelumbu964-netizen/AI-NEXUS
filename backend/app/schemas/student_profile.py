from pydantic import BaseModel, ConfigDict, Field


class StudentProfileCreate(BaseModel):
    degree: str | None = None
    university: str | None = None
    academic_year: str | None = None
    cgpa: float | None = Field(default=None, ge=0, le=10)
    technical_skills: str | None = None
    learning_interests: str | None = None
    career_goals: str | None = None
    learning_preferences: str | None = None
    bio: str | None = None


class StudentProfileResponse(StudentProfileCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
