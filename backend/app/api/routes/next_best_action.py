from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.next_best_action_service import (
    NextBestActionService,
)


router = APIRouter(
    prefix="/next-best-action",
    tags=["Next Best Action"],
)


class NextBestActionRequest(BaseModel):
    career_goal: str | None = Field(
        default=None,
        max_length=500,
    )

    target_role: str | None = Field(
        default=None,
        max_length=300,
    )

    current_skills: str | None = Field(
        default=None,
        max_length=2000,
    )

    current_progress: Any = None

    recent_activity: Any = None


class NextBestActionResponse(BaseModel):
    action: str
    reason: str
    category: str
    priority: str
    estimated_minutes: int
    suggested_timeframe: str
    expected_outcome: str
    next_step: str


@router.post(
    "",
    response_model=NextBestActionResponse,
)
def generate_next_best_action(
    request: NextBestActionRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    try:

        result = (
            NextBestActionService.generate(
                db=db,
                user_id=current_user.id,
                career_goal=request.career_goal,
                target_role=request.target_role,
                current_skills=request.current_skills,
                current_progress=request.current_progress,
                recent_activity=request.recent_activity,
            )
        )

        return NextBestActionResponse(
            **result
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Next Best Action generation failed."
            ),
        ) from exc
