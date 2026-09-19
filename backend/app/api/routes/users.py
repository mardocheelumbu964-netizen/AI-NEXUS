from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileResponse,
)
from app.services.profile_service import ProfileService


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
)
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return the authenticated user's basic account
    information.
    """

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }


@router.get(
    "/me/profile",
    response_model=StudentProfileResponse,
)
def get_my_student_profile(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated student's
    personalization profile.
    """

    profile = ProfileService.get_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile:
        return profile

    return StudentProfileResponse(
        id=0,
        user_id=current_user.id,
        course=None,
        specialization=None,
        university=None,
        graduation_year=None,
        skills=[],
        interests=[],
        career_goals=None,
        target_roles=[],
        preferred_learning_style=None,
        available_study_hours=None,
        experience_summary=None,
        bio=None,
        created_at=current_user.created_at,
        updated_at=current_user.created_at,
    )


@router.put(
    "/me/profile",
    response_model=StudentProfileResponse,
    status_code=status.HTTP_200_OK,
)
def update_my_student_profile(
    profile_data: StudentProfileCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Create or update the authenticated student's
    personalization profile.
    """

    profile = ProfileService.create_or_update_profile(
        db=db,
        user_id=current_user.id,
        profile_data=profile_data,
    )

    return profile
