from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.chat_service import ChatService

router = APIRouter(prefix="/career", tags=["Career Guidance"])


class CareerGuidanceRequest(BaseModel):
    career_goal: str = ""
    current_skills: str = ""
    preferred_role: str = ""


class CareerGuidanceResponse(BaseModel):
    answer: str


@router.post("/guidance", response_model=CareerGuidanceResponse)
def generate_career_guidance(
    request: CareerGuidanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = f"""
You are the Career Guidance Agent inside AI-NEXUS.

Provide practical and personalized career guidance.

CAREER GOAL:
{request.career_goal}

CURRENT SKILLS:
{request.current_skills}

PREFERRED ROLE:
{request.preferred_role}

Return your response using exactly these sections:

## Career Assessment
Assess the student's current direction based only on the information provided.

## Recommended Career Direction
Explain the relevant career direction and why it fits the stated goal and skills.

## Skills to Strengthen
List the most important technical and professional skills to develop.

## Career Roadmap
Create a practical progression toward the preferred role.

## Portfolio Projects
Suggest 3 practical projects that can strengthen employability.

## Learning Priorities
Give a prioritized list of what the student should learn next.

## Interview Preparation
List important areas to prepare for interviews.

## AI Career Recommendations
Give 3 actionable recommendations for improving career readiness.

Rules:
- Use simple and clear language.
- Be practical and realistic.
- Do not invent qualifications, experience, achievements, or skills.
- Do not claim the student completed anything unless explicitly stated.
- Base recommendations only on the provided information.
""".strip()

    result = ChatService.generate_response(
        db=db,
        user=current_user,
        question=prompt,
    )

    if isinstance(result, dict):
        answer = result.get("answer", "")
    else:
        answer = str(result)

    return CareerGuidanceResponse(answer=answer)