from fastapi import APIRouter, Depends, Query

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.activity_service import ActivityService


router = APIRouter(
    prefix="/activity",
    tags=["Activity"],
)


@router.get("/recent")
def get_recent_activity(
    limit: int = Query(
        default=8,
        ge=1,
        le=20,
    ),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    return ActivityService.get_recent_activity(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )
