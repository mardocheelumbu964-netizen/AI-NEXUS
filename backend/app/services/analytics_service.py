from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.project import Project
from app.models.document import Document
from app.models.student_profile import StudentProfile
from app.models.study_plan import StudyPlan, StudyTask


class AnalyticsService:

    @staticmethod
    def get_overview(db: Session, user_id: int) -> dict:
        """
        Build personalized analytics from the student's actual
        PostgreSQL data.

        No hard-coded progress percentages are used for the
        student's learning activity.
        """

        # ========================================================
        # STUDY TASKS
        # ========================================================

        tasks = (
            db.query(StudyTask)
            .join(
                StudyPlan,
                StudyTask.study_plan_id == StudyPlan.id,
            )
            .filter(
                StudyPlan.user_id == user_id
            )
            .all()
        )

        if tasks:
            study_progress = round(
                sum(
                    max(
                        0,
                        min(
                            100,
                            int(task.completion_percentage or 0),
                        ),
                    )
                    for task in tasks
                )
                / len(tasks)
            )

            completed_tasks = [
                task
                for task in tasks
                if (
                    str(task.status or "").lower()
                    in {"completed", "complete", "done"}
                    or int(task.completion_percentage or 0) >= 100
                )
            ]

            study_hours = round(
                sum(
                    max(0, int(task.duration_minutes or 0))
                    * (
                        max(
                            0,
                            min(
                                100,
                                int(task.completion_percentage or 0),
                            ),
                        )
                        / 100
                    )
                    for task in tasks
                )
                / 60,
                1,
            )
        else:
            study_progress = 0
            completed_tasks = []
            study_hours = 0.0

        # ========================================================
        # WEEKLY STUDY ACTIVITY
        # ========================================================

        today = date.today()
        week_start = today - timedelta(days=6)

        weekly_activity = []

        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        for offset in range(7):
            current_day = week_start + timedelta(days=offset)

            day_tasks = [
                task
                for task in tasks
                if task.scheduled_date == current_day
            ]

            day_hours = sum(
                max(0, int(task.duration_minutes or 0))
                * (
                    max(
                        0,
                        min(
                            100,
                            int(task.completion_percentage or 0),
                        ),
                    )
                    / 100
                )
                for task in day_tasks
            ) / 60

            weekly_activity.append(
                {
                    "day": day_names[current_day.weekday()],
                    "date": current_day.isoformat(),
                    "hours": round(day_hours, 1),
                }
            )

        # ========================================================
        # STUDENT PROFILE / SKILLS
        # ========================================================

        profile = (
            db.query(StudentProfile)
            .filter(
                StudentProfile.user_id == user_id
            )
            .first()
        )

        technical_skills = ""

        if profile and profile.technical_skills:
            technical_skills = profile.technical_skills.strip()

        declared_skills = {
            skill.strip().lower()
            for skill in technical_skills
            .replace(";", ",")
            .split(",")
            if skill.strip()
        }

        skill_catalog = [
            (
                "Python",
                {"python"},
            ),
            (
                "SQL",
                {"sql", "mysql", "postgresql", "postgres"},
            ),
            (
                "Machine Learning",
                {
                    "machine learning",
                    "ml",
                    "scikit-learn",
                    "sklearn",
                },
            ),
            (
                "Generative AI",
                {
                    "generative ai",
                    "genai",
                    "llm",
                    "large language model",
                    "ollama",
                },
            ),
            (
                "Cloud",
                {
                    "aws",
                    "azure",
                    "gcp",
                    "cloud",
                    "docker",
                },
            ),
            (
                "Communication",
                {
                    "communication",
                    "presentation",
                    "public speaking",
                },
            ),
        ]

        skill_breakdown = []

        for name, aliases in skill_catalog:

            matched = any(
                alias in declared_skill
                for alias in aliases
                for declared_skill in declared_skills
            )

            level = 75 if matched else 25
            status = "Developing" if matched else "Gap"

            skill_breakdown.append(
                {
                    "name": name,
                    "progress": level,
                    "status": status,
                }
            )

        if skill_breakdown:
            skill_progress = round(
                sum(
                    item["progress"]
                    for item in skill_breakdown
                )
                / len(skill_breakdown)
            )
        else:
            skill_progress = 0

        # ========================================================
        # RESUME READINESS
        # ========================================================

        resume_documents = (
            db.query(Document)
            .filter(
                Document.user_id == user_id,
                func.lower(
                    Document.original_filename
                ).like("%resume%"),
            )
            .all()
        )

        if resume_documents:
            indexed_resume = any(
                str(document.status or "").lower()
                in {
                    "indexed",
                    "processed",
                    "uploaded",
                    "ready",
                }
                for document in resume_documents
            )

            resume_readiness = 100 if indexed_resume else 50
        else:
            resume_readiness = 0

        # ========================================================
        # CAREER READINESS
        # ========================================================

        # Career readiness is derived from available measurable
        # signals instead of using a fake fixed percentage.
        readiness_components = [
            study_progress,
            skill_progress,
            resume_readiness,
        ]

        career_readiness = round(
            sum(readiness_components)
            / len(readiness_components)
        )

        # ========================================================
        # ACTIVITY / ASSESSMENT SIGNALS
        # ========================================================

        activity_count = (
            db.query(func.count(Activity.id))
            .filter(
                Activity.user_id == user_id
            )
            .scalar()
            or 0
        )

        # The current assessment model does not contain persisted
        # assessment records, so we expose zero rather than inventing
        # completed assessments.
        assessments_completed = 0

        # The current project model is not persisted in the database,
        # so we expose zero rather than inventing completed projects.
        projects_completed = (
            db.query(Project)
            .filter(
                Project.user_id == user_id,
                Project.status.ilike("completed"),
            )
            .count()
        )

        # ========================================================
        # LEARNING STREAK
        # ========================================================

        scheduled_dates = sorted(
            {
                task.scheduled_date
                for task in tasks
                if (
                    int(task.completion_percentage or 0) >= 100
                    or str(task.status or "").lower()
                    in {"completed", "complete", "done"}
                )
                and task.scheduled_date is not None
            },
            reverse=True,
        )

        learning_streak = 0

        if scheduled_dates:
            expected_day = scheduled_dates[0]

            for completed_date in scheduled_dates:
                if completed_date == expected_day:
                    learning_streak += 1
                    expected_day -= timedelta(days=1)
                else:
                    break

        # ========================================================
        # WEEKLY TARGET
        # ========================================================

        weekly_target = 18.0

        weekly_hours = round(
            sum(
                item["hours"]
                for item in weekly_activity
            ),
            1,
        )

        weekly_target_progress = min(
            100,
            round(
                (weekly_hours / weekly_target) * 100
            )
            if weekly_target > 0
            else 0,
        )

        # ========================================================
        # RESPONSE
        # ========================================================

        return {
            "study_progress": study_progress,
            "learning_progress": study_progress,

            "study_consistency": weekly_target_progress,

            "career_readiness": career_readiness,

            "skill_progress": skill_progress,

            "resume_readiness": resume_readiness,
            "resume_score": resume_readiness,

            "assessment_average": 0,
            "assessments_completed": assessments_completed,

            "projects_completed": projects_completed,

            "study_hours": study_hours,
            "weekly_hours": weekly_hours,
            "weekly_target": weekly_target,
            "weekly_target_progress": weekly_target_progress,

            "learning_streak": learning_streak,

            "activity_count": int(activity_count),

            "weekly_activity": weekly_activity,

            "skill_breakdown": skill_breakdown,

            "completed_tasks": len(completed_tasks),
            "total_tasks": len(tasks),
        }
