from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileResponse,
)

router = APIRouter(
    prefix="/profile",
    tags=["Student Profile"],
)


@router.get(
    "",
    response_model=StudentProfileResponse | None,
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(StudentProfile).where(
            StudentProfile.user_id == current_user.id
        )
    )

    return result.scalar_one_or_none()


@router.post(
    "",
    response_model=StudentProfileResponse,
)
def create_or_update_profile(
    profile_data: StudentProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(StudentProfile).where(
            StudentProfile.user_id == current_user.id
        )
    )

    profile = result.scalar_one_or_none()

    if profile is None:
        profile = StudentProfile(
            user_id=current_user.id,
            **profile_data.model_dump(),
        )

        db.add(profile)

    else:
        for field, value in profile_data.model_dump().items():
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile
