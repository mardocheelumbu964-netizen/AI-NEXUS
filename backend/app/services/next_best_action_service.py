import json
import re
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.student_profile import StudentProfile


class NextBestActionService:
    """
    AI-NEXUS Next Best Action Engine.

    Converts the student's current learning and career state
    into one practical next action.
    """

    @staticmethod
    def get_profile(
        db: Session,
        user_id: int,
    ) -> StudentProfile | None:

        return (
            db.query(StudentProfile)
            .filter(
                StudentProfile.user_id == user_id
            )
            .first()
        )

    @staticmethod
    def build_profile_context(
        profile: StudentProfile | None,
    ) -> str:

        if profile is None:
            return (
                "No student profile is currently available."
            )

        fields = [
            ("degree", "Degree"),
            ("university", "University"),
            ("academic_year", "Academic Year"),
            ("cgpa", "CGPA"),
            ("technical_skills", "Technical Skills"),
            ("learning_interests", "Learning Interests"),
            ("career_goals", "Career Goals"),
            ("learning_preferences", "Learning Preferences"),
            ("bio", "Professional Summary"),
        ]

        context = []

        for field_name, label in fields:

            if not hasattr(profile, field_name):
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

            context.append(
                f"{label}: {value}"
            )

        if not context:
            return (
                "The student profile exists, but "
                "no additional information has been provided."
            )

        return "\n".join(context)

    @staticmethod
    def build_prompt(
        profile_context: str,
        current_progress: Any,
        recent_activity: Any,
        career_goal: str | None,
        target_role: str | None,
        current_skills: str | None,
    ) -> str:

        return f"""
You are the Next Best Action Engine of AI-NEXUS.

Your job is to determine ONE practical next action
that would provide the highest immediate value to
a university student's learning and career journey.

STUDENT PROFILE
================
{profile_context}

CAREER GOAL
===========
{career_goal or "Not specified"}

TARGET ROLE
===========
{target_role or "Not specified"}

CURRENT SKILLS
==============
{current_skills or "Not specified"}

CURRENT LEARNING PROGRESS
=========================
{current_progress}

RECENT ACTIVITY
===============
{recent_activity}

DECISION RULES
==============

1. Recommend exactly ONE next action.

2. The action must be realistic and immediately actionable.

3. Prefer actions that address a clear learning or
   employability gap.

4. Consider both the student's current progress and
   stated career direction.

5. Do not recommend something that requires information
   that is not available.

6. Keep the recommendation concise.

7. Do not invent achievements, skills, grades or experience.

8. If the student has an unfinished learning task,
   consider whether completing it should be the next action.

9. If the student is progressing academically but has
   a clear career goal, consider a career-readiness action.

10. The recommendation should be useful for the next
    24 to 72 hours.

RETURN ONLY VALID JSON.

Use exactly this structure:

{{
  "action": "Complete Network Security revision",
  "reason": "Your recent learning activity shows that this topic is currently active and needs reinforcement.",
  "category": "learning",
  "priority": "high",
  "estimated_minutes": 60,
  "suggested_timeframe": "Today",
  "expected_outcome": "Stronger understanding of Network Security fundamentals.",
  "next_step": "Review the key concepts and complete five practice questions."
}}

Allowed category values:

- learning
- career
- skills
- resume
- interview
- project
- assessment

Allowed priority values:

- low
- medium
- high
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
            "options": {
                "num_ctx": 2048,
            },
        }

        try:

            response = requests.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload,
                timeout=180,
            )

            response.raise_for_status()

            data = response.json()

            result = data.get(
                "response",
                "",
            ).strip()

            if not result:
                raise RuntimeError(
                    "Ollama returned an empty response."
                )

            return result

        except requests.exceptions.ConnectionError as exc:

            raise RuntimeError(
                "Could not connect to Ollama."
            ) from exc

        except requests.exceptions.Timeout as exc:

            raise RuntimeError(
                "Next Best Action generation timed out."
            ) from exc

        except requests.exceptions.RequestException as exc:

            raise RuntimeError(
                f"Ollama request failed: {exc}"
            ) from exc

    @staticmethod
    def clean_json(
        response: str,
    ) -> str:

        cleaned = response.strip()

        cleaned = re.sub(
            r"^```json\s*",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )

        cleaned = re.sub(
            r"^```\s*",
            "",
            cleaned,
        )

        cleaned = re.sub(
            r"\s*```$",
            "",
            cleaned,
        )

        return cleaned.strip()

    @staticmethod
    def parse_response(
        response: str,
    ) -> dict:

        cleaned = (
            NextBestActionService
            .clean_json(response)
        )

        try:

            result = json.loads(
                cleaned
            )

        except json.JSONDecodeError as exc:

            raise ValueError(
                "The AI returned invalid Next Best Action data."
            ) from exc

        if not isinstance(
            result,
            dict,
        ):

            raise ValueError(
                "Next Best Action response must be a JSON object."
            )

        required_fields = [
            "action",
            "reason",
            "category",
            "priority",
            "estimated_minutes",
            "suggested_timeframe",
            "expected_outcome",
            "next_step",
        ]

        for field in required_fields:

            if field not in result:

                raise ValueError(
                    f"Next Best Action is missing field: {field}"
                )

        category = str(
            result["category"]
        ).lower().strip()

        allowed_categories = {
            "learning",
            "career",
            "skills",
            "resume",
            "interview",
            "project",
            "assessment",
        }

        if category not in allowed_categories:
            category = "learning"

        priority = str(
            result["priority"]
        ).lower().strip()

        if priority not in {
            "low",
            "medium",
            "high",
        }:
            priority = "medium"

        try:

            estimated_minutes = int(
                result["estimated_minutes"]
            )

        except (
            TypeError,
            ValueError,
        ) as exc:

            raise ValueError(
                "Next Best Action has an invalid duration."
            ) from exc

        estimated_minutes = max(
            5,
            min(480, estimated_minutes),
        )

        return {
            "action": str(
                result["action"]
            ).strip()[:300],
            "reason": str(
                result["reason"]
            ).strip()[:600],
            "category": category,
            "priority": priority,
            "estimated_minutes": estimated_minutes,
            "suggested_timeframe": str(
                result["suggested_timeframe"]
            ).strip()[:100],
            "expected_outcome": str(
                result["expected_outcome"]
            ).strip()[:400],
            "next_step": str(
                result["next_step"]
            ).strip()[:400],
        }

    @staticmethod
    def generate(
        db: Session,
        user_id: int,
        career_goal: str | None = None,
        target_role: str | None = None,
        current_skills: str | None = None,
        current_progress: Any = None,
        recent_activity: Any = None,
    ) -> dict:

        profile = (
            NextBestActionService.get_profile(
                db=db,
                user_id=user_id,
            )
        )

        profile_context = (
            NextBestActionService
            .build_profile_context(
                profile
            )
        )

        prompt = (
            NextBestActionService
            .build_prompt(
                profile_context=profile_context,
                current_progress=(
                    current_progress
                    if current_progress is not None
                    else "No current progress data available."
                ),
                recent_activity=(
                    recent_activity
                    if recent_activity is not None
                    else "No recent activity data available."
                ),
                career_goal=career_goal,
                target_role=target_role,
                current_skills=current_skills,
            )
        )

        raw_response = (
            NextBestActionService
            .call_ollama(prompt)
        )

        return (
            NextBestActionService
            .parse_response(raw_response)
        )
