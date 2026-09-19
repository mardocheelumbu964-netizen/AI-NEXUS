from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.chat_service import ChatService
from app.services.student_context_service import StudentContextService

router = APIRouter(prefix="/assessment", tags=["Assessment"])


class AssessmentRequest(BaseModel):
    question: str


class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: str
    career_goal: str
    experience_level: str


class AssessmentResponse(BaseModel):
    answer: str


class SkillIntelligenceItem(BaseModel):
    name: str
    level: int
    status: str
    description: str


class SkillIntelligenceResponse(BaseModel):
    overall_score: int
    skills: list[SkillIntelligenceItem]


@router.post("/skill-gap", response_model=AssessmentResponse)
def generate_skill_gap_analysis(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_context = StudentContextService.get_student_context(
        db=db,
        user_id=current_user.id,
    )

    prompt = f"""
You are an AI Skill Gap Analysis Agent for a student career platform.

Analyze the student's current skills against the target role.

TARGET ROLE:
{request.target_role}

CURRENT SKILLS:
{request.current_skills}

CAREER GOAL:
{request.career_goal}

EXPERIENCE LEVEL:
{request.experience_level}

STUDENT PROFILE CONTEXT:
{student_context}

Provide a practical and personalized skill gap analysis using exactly these sections:

## Skill Gap Overview
Briefly explain the gap between the student's current skills and the target role.

## Current Strengths
List the skills the student already has that are relevant.

## Critical Skill Gaps
Identify the most important missing or underdeveloped skills.

## Skill Gap Priorities
Organize gaps into:
- High Priority
- Medium Priority
- Low Priority

## Technical Skills to Develop
Explain the technical skills the student should develop and why.

## Professional Skills to Develop
Explain relevant communication, problem-solving, teamwork, interview, or other professional skills.

## Learning Action Plan
Give a practical step-by-step plan.

## Recommended Projects
Suggest practical projects that help develop the identified skills.

## Assessment Strategy
Explain how the student can measure improvement.

## AI Recommendations
Give concise next steps.

Rules:
- Use simple and clear language.
- Be practical and specific.
- Do not invent information about the student.
- Base recommendations only on the information provided.
- Focus on measurable skill development.
"""

    result = ChatService.generate_response(
        question=prompt,
        agent_key="assessment",
        history=[],
        rag_context=[],
        student_context=student_context,
    )

    answer = result.get("answer", "")

    return AssessmentResponse(answer=answer)


@router.get("/skill-intelligence", response_model=SkillIntelligenceResponse)
def get_skill_intelligence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = StudentContextService.get_student_context(
        db=db,
        user_id=current_user.id,
    )

    skills = []

    # Parse the student's declared technical skills.
    technical_skills = ""
    for line in profile.splitlines():
        if line.lower().startswith("technical skills:"):
            technical_skills = line.split(":", 1)[1].strip()
            break

    declared_skills = {
        skill.strip().lower()
        for skill in technical_skills.replace(";", ",").split(",")
        if skill.strip()
    }

    skill_catalog = [
        (
            "Python",
            {"python"},
            "Useful for backend development, automation, data work, and AI."
        ),
        (
            "SQL",
            {"sql", "mysql", "postgresql", "postgres"},
            "Important for databases, analytics, and backend applications."
        ),
        (
            "Machine Learning",
            {"machine learning", "ml", "scikit-learn", "sklearn"},
            "Important for building predictive and intelligent applications."
        ),
        (
            "Generative AI",
            {"generative ai", "genai", "llm", "large language model", "ollama"},
            "Useful for modern AI applications using language models."
        ),
        (
            "Cloud",
            {"aws", "azure", "gcp", "cloud", "docker"},
            "Useful for deploying and operating production applications."
        ),
        (
            "Communication",
            {"communication", "presentation", "public speaking"},
            "Important for teamwork, interviews, and professional growth."
        ),
    ]

    for name, aliases, description in skill_catalog:
        matched = any(
            alias in declared_skill
            for alias in aliases
            for declared_skill in declared_skills
        )

        if matched:
            level = 75
            status = "Developing"
        else:
            level = 25
            status = "Gap"

        skills.append(
            SkillIntelligenceItem(
                name=name,
                level=level,
                status=status,
                description=description,
            )
        )

    overall_score = round(
        sum(item.level for item in skills) / len(skills)
    ) if skills else 0

    return SkillIntelligenceResponse(
        overall_score=overall_score,
        skills=skills,
    )
