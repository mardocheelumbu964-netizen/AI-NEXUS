from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile


class StudentContextService:

    @staticmethod
    def get_student_context(
        db: Session,
        user_id: int,
    ) -> str:
        """
        Build a safe, readable AI context from the
        currently authenticated student's profile.

        Only profile data belonging to the supplied
        user_id is included.
        """

        profile = (
            db.query(StudentProfile)
            .filter(
                StudentProfile.user_id == user_id
            )
            .first()
        )

        if profile is None:
            return (
                "No student profile information is "
                "currently available."
            )

        excluded_fields = {
            "id",
            "user_id",
            "created_at",
            "updated_at",
        }

        context_lines = []

        for column in StudentProfile.__table__.columns:

            field_name = column.name

            if field_name in excluded_fields:
                continue

            value = getattr(
                profile,
                field_name,
                None,
            )

            if value is None:
                continue

            if isinstance(value, str):
                value = value.strip()

                if not value:
                    continue

            if isinstance(value, (list, tuple, set)):
                value = ", ".join(
                    str(item)
                    for item in value
                )

            elif isinstance(value, dict):
                value = ", ".join(
                    f"{key}: {item}"
                    for key, item in value.items()
                )

            display_name = (
                field_name
                .replace("_", " ")
                .title()
            )

            context_lines.append(
                f"{display_name}: {value}"
            )

        if not context_lines:
            return (
                "The student has a profile, but no "
                "additional profile information has "
                "been provided yet."
            )

        return "\n".join(context_lines)
