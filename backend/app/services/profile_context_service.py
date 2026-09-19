from app.models.student_profile import StudentProfile


class ProfileContextService:

    @staticmethod
    def build_context(
        profile: StudentProfile | None,
    ) -> str:

        if not profile:
            return (
                "No student profile information is "
                "currently available."
            )

        sections = []

        if profile.course:
            sections.append(
                f"Course: {profile.course}"
            )

        if profile.specialization:
            sections.append(
                f"Specialization: "
                f"{profile.specialization}"
            )

        if profile.university:
            sections.append(
                f"University: {profile.university}"
            )

        if profile.graduation_year:
            sections.append(
                f"Graduation Year: "
                f"{profile.graduation_year}"
            )

        if profile.skills:
            sections.append(
                "Skills: "
                + ", ".join(profile.skills)
            )

        if profile.interests:
            sections.append(
                "Interests: "
                + ", ".join(profile.interests)
            )

        if profile.career_goals:
            sections.append(
                f"Career Goals: "
                f"{profile.career_goals}"
            )

        if profile.target_roles:
            sections.append(
                "Target Roles: "
                + ", ".join(profile.target_roles)
            )

        if profile.preferred_learning_style:
            sections.append(
                "Preferred Learning Style: "
                f"{profile.preferred_learning_style}"
            )

        if profile.available_study_hours is not None:
            sections.append(
                "Available Study Hours Per Day: "
                f"{profile.available_study_hours}"
            )

        if profile.experience_summary:
            sections.append(
                "Experience: "
                f"{profile.experience_summary}"
            )

        if profile.bio:
            sections.append(
                f"Student Background: {profile.bio}"
            )

        if not sections:
            return (
                "The student profile exists but "
                "does not contain personalization data."
            )

        return "\n".join(sections)
