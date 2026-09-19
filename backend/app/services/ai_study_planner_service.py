
import json
import re
from datetime import date, timedelta

import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.student_profile import StudentProfile
from app.models.study_plan import StudyPlan, StudyTask
from app.rag.retriever import retrieve_context
from app.services.study_plan_service import StudyPlanService


class AIStudyPlannerService:
    """
    Generates structured study plans using the local
    Ollama LLM and stores them in PostgreSQL.
    """

    @staticmethod
    def get_profile(
        db: Session,
        user_id: int,
    ) -> StudentProfile | None:

        from sqlalchemy import select

        result = db.execute(
            select(StudentProfile).where(
                StudentProfile.user_id == user_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    def build_profile_context(
        profile: StudentProfile | None,
    ) -> str:

        if not profile:
            return (
                "No student profile is available."
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
                "Learning Style: "
                f"{profile.preferred_learning_style}"
            )

        if profile.available_study_hours is not None:
            sections.append(
                "Available Study Hours Per Day: "
                f"{profile.available_study_hours}"
            )

        if profile.experience_summary:
            sections.append(
                f"Experience: "
                f"{profile.experience_summary}"
            )

        return "\n".join(sections)

    @staticmethod
    def build_material_context(
        question: str,
        user_id: int,
        top_k: int = 8,
    ) -> str:

        contexts = retrieve_context(
            query=question,
            user_id=user_id,
            top_k=top_k,
        )

        if not contexts:
            return (
                "No relevant uploaded study material "
                "was found."
            )

        sections = []

        for index, item in enumerate(
            contexts,
            start=1,
        ):

            metadata = item.get(
                "metadata",
                {},
            )

            filename = metadata.get(
                "filename",
                "Unknown document",
            )

            sections.append(
                f"[Material {index}]\n"
                f"Document: {filename}\n"
                f"{item.get('content', '')}"
            )

        return "\n\n".join(sections)

    @staticmethod
    def build_prompt(
        question: str,
        profile_context: str,
        material_context: str,
        start_date: date,
        end_date: date,
    ) -> str:

        return f"""
You are the AI Study Planning Engine of AI-NEXUS.

Create a personalized study plan for a university
student.

STUDENT PROFILE
================
{profile_context}

UPLOADED STUDY MATERIAL
========================
{material_context}

STUDENT REQUEST
================
{question}

PLAN PERIOD
============
Start date: {start_date.isoformat()}
End date: {end_date.isoformat()}

IMPORTANT:

1. Create a realistic study plan.

2. Respect the student's available study hours.

3. Break subjects into specific topics.

4. Include revision and practice.

5. Use uploaded study material when relevant.

6. Do not invent topics and claim they came from
   uploaded material.

7. If no study material is available, create a
   reasonable plan based on the student's request.

8. Return ONLY valid JSON.

9. Do not use Markdown.

10. Do not put JSON inside code fences.

Use exactly this JSON structure:

{{
  "title": "Personalized Study Plan",
  "description": "Short description of the plan",
  "tasks": [
    {{
      "subject": "Subject name",
      "topic": "Topic name",
      "scheduled_date": "YYYY-MM-DD",
      "duration_minutes": 60,
      "priority": "high",
      "status": "pending",
      "completion_percentage": 0,
      "notes": "What the student should do"
    }}
  ]
}}

Allowed priority values:

- low
- medium
- high

Allowed status values:

- pending
- in_progress
- completed

Each task must have a scheduled date between
the start and end dates.

Create enough tasks to make the plan useful,
but do not create an excessive number of tasks.
"""

    @staticmethod
    def call_ollama(
        prompt: str,
    ) -> str:

        payload = {
            "model": settings.LLM_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        }

        try:

            response = requests.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload,
                timeout=300,
            )

            response.raise_for_status()

            data = response.json()

            result = data.get(
                "response",
                "",
            ).strip()

            if not result:
                raise ValueError(
                    "Ollama returned an empty response."
                )

            return result

        except requests.exceptions.ConnectionError:
            raise RuntimeError(
                "Could not connect to Ollama. "
                "Please make sure Ollama is running."
            )

        except requests.exceptions.Timeout:
            raise RuntimeError(
                "The AI study planner took too long "
                "to generate a plan."
            )

        except requests.exceptions.RequestException as exc:
            raise RuntimeError(
                "Ollama request failed: "
                f"{str(exc)}"
            )

    @staticmethod
    def clean_json_response(
        response: str,
    ) -> str:

        response = response.strip()

        # Remove accidental Markdown code fences.
        response = re.sub(
            r"^```json\s*",
            "",
            response,
            flags=re.IGNORECASE,
        )

        response = re.sub(
            r"^```\s*",
            "",
            response,
        )

        response = re.sub(
            r"\s*```$",
            "",
            response,
        )

        return response.strip()

    @staticmethod
    def parse_plan(
        response: str,
    ) -> dict:

        cleaned = (
            AIStudyPlannerService
            .clean_json_response(response)
        )

        try:

            plan_data = json.loads(
                cleaned
            )

        except json.JSONDecodeError as exc:

            raise ValueError(
                "The AI returned invalid plan data."
            ) from exc

        if not isinstance(
            plan_data,
            dict,
        ):
            raise ValueError(
                "The AI plan must be a JSON object."
            )

        if "tasks" not in plan_data:

            raise ValueError(
                "The AI plan does not contain tasks."
            )

        if not isinstance(
            plan_data["tasks"],
            list,
        ):

            raise ValueError(
                "AI plan tasks must be a list."
            )

        return plan_data

    @staticmethod
    def validate_task(
        task: dict,
        start_date: date,
        end_date: date,
    ) -> dict:

        required_fields = [
            "subject",
            "topic",
            "scheduled_date",
            "duration_minutes",
        ]

        for field in required_fields:

            if field not in task:

                raise ValueError(
                    f"AI task is missing field: {field}"
                )

        try:

            scheduled_date = date.fromisoformat(
                str(task["scheduled_date"])
            )

        except ValueError as exc:

            raise ValueError(
                "AI generated an invalid task date."
            ) from exc

        if (
            scheduled_date < start_date
            or scheduled_date > end_date
        ):

            raise ValueError(
                "AI generated a task outside "
                "the study plan period."
            )

        try:

            duration = int(
                task["duration_minutes"]
            )

        except (
            TypeError,
            ValueError,
        ) as exc:

            raise ValueError(
                "AI generated an invalid duration."
            ) from exc

        if duration < 1 or duration > 1440:

            raise ValueError(
                "AI generated an invalid task duration."
            )

        completion = task.get(
            "completion_percentage",
            0,
        )

        try:

            completion = int(
                completion
            )

        except (
            TypeError,
            ValueError,
        ) as exc:

            raise ValueError(
                "AI generated an invalid "
                "completion percentage."
            ) from exc

        completion = max(
            0,
            min(100, completion),
        )

        priority = str(
            task.get(
                "priority",
                "medium",
            )
        ).lower()

        if priority not in {
            "low",
            "medium",
            "high",
        }:

            priority = "medium"

        status = str(
            task.get(
                "status",
                "pending",
            )
        ).lower()

        if status not in {
            "pending",
            "in_progress",
            "completed",
        }:

            status = "pending"

        if completion >= 100:
            status = "completed"

        return {
            "subject": str(
                task["subject"]
            ).strip()[:150],
            "topic": str(
                task["topic"]
            ).strip()[:200],
            "scheduled_date": scheduled_date,
            "duration_minutes": duration,
            "priority": priority,
            "status": status,
            "completion_percentage": completion,
            "notes": (
                str(task.get("notes", "")).strip()
                or None
            ),
        }

    @staticmethod
    def generate_and_save_plan(
        db: Session,
        user_id: int,
        question: str,
        start_date: date,
        end_date: date,
    ) -> tuple[StudyPlan, list[StudyTask]]:

        if end_date < start_date:

            raise ValueError(
                "End date cannot be earlier than start date."
            )

        profile = (
            AIStudyPlannerService.get_profile(
                db=db,
                user_id=user_id,
            )
        )

        profile_context = (
            AIStudyPlannerService
            .build_profile_context(profile)
        )

        material_context = (
            AIStudyPlannerService
            .build_material_context(
                question=question,
                user_id=user_id,
            )
        )

        prompt = (
            AIStudyPlannerService.build_prompt(
                question=question,
                profile_context=profile_context,
                material_context=material_context,
                start_date=start_date,
                end_date=end_date,
            )
        )

        raw_response = (
            AIStudyPlannerService
            .call_ollama(prompt)
        )

        plan_data = (
            AIStudyPlannerService
            .parse_plan(raw_response)
        )

        title = str(
            plan_data.get(
                "title",
                "Personalized Study Plan",
            )
        ).strip()

        description = str(
            plan_data.get(
                "description",
                "",
            )
        ).strip()

        if not title:
            title = "Personalized Study Plan"

        plan = StudyPlanService.create_plan(
            db=db,
            user_id=user_id,
            plan_data=type(
                "PlanData",
                (),
                {
                    "title": title,
                    "description": description or None,
                    "start_date": start_date,
                    "end_date": end_date,
                    "status": "active",
                },
            )(),
        )

        saved_tasks = []

        try:

            for raw_task in plan_data["tasks"]:

                task_data = (
                    AIStudyPlannerService
                    .validate_task(
                        task=raw_task,
                        start_date=start_date,
                        end_date=end_date,
                    )
                )

                task = StudyTask(
                    study_plan_id=plan.id,
                    **task_data,
                )

                db.add(task)

                saved_tasks.append(task)

            db.commit()

            for task in saved_tasks:
                db.refresh(task)

            db.refresh(plan)

            return plan, saved_tasks

        except Exception:

            db.rollback()

            db.delete(plan)
            db.commit()

            raise
