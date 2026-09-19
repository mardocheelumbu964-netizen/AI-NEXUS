from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.schemas.student_profile import StudentProfileCreate


class ProfileService:

    @staticmethod
    def get_profile(
        db: Session,
        user_id: int,
    ) -> StudentProfile | None:

        result = db.execute(
            select(StudentProfile).where(
                StudentProfile.user_id == user_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    def create_or_update_profile(
        db: Session,
        user_id: int,
        profile_data: StudentProfileCreate,
    ) -> StudentProfile:

        profile = ProfileService.get_profile(
            db=db,
            user_id=user_id,
        )

        data = profile_data.model_dump()

        if profile:

            for field, value in data.items():
                setattr(
                    profile,
                    field,
                    value,
                )

        else:

            profile = StudentProfile(
                user_id=user_id,
                **data,
            )

            db.add(profile)

        db.commit()
        db.refresh(profile)

        return profile
