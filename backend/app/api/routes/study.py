from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanDetailResponse,
    StudyPlanProgressResponse,
    StudyPlanResponse,
    StudyPlanUpdate,
    StudyTaskCreate,
    StudyTaskResponse,
    StudyTaskUpdate,
)
from app.services.ai_study_planner_service import (
    AIStudyPlannerService,
)
from app.services.study_plan_service import (
    StudyPlanService,
)


router = APIRouter(
    prefix="/study-plans",
    tags=["Study Planner"],
)


# ============================================================
# AI STUDY PLAN GENERATION
# ============================================================

@router.post(
    "/generate",
    response_model=StudyPlanDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_ai_study_plan(
    question: str,
    start_date: date,
    end_date: date,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    if len(question.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study plan request is too short.",
        )

    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "End date cannot be earlier "
                "than start date."
            ),
        )

    try:

        plan, tasks = (
            AIStudyPlannerService
            .generate_and_save_plan(
                db=db,
                user_id=current_user.id,
                question=question.strip(),
                start_date=start_date,
                end_date=end_date,
            )
        )

        return StudyPlanDetailResponse(
            plan=plan,
            tasks=tasks,
        )

    except (
        ValueError,
        RuntimeError,
    ) as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Failed to generate the study plan. "
                f"{str(exc)}"
            ),
        )


# ============================================================
# CREATE STUDY PLAN MANUALLY
# ============================================================

@router.post(
    "/",
    response_model=StudyPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_study_plan(
    plan_data: StudyPlanCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    try:

        return StudyPlanService.create_plan(
            db=db,
            user_id=current_user.id,
            plan_data=plan_data,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ============================================================
# LIST USER STUDY PLANS
# ============================================================

@router.get(
    "/",
    response_model=list[StudyPlanResponse],
)
def list_study_plans(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    return StudyPlanService.get_user_plans(
        db=db,
        user_id=current_user.id,
    )


# ============================================================
# GET STUDY PLAN
# ============================================================

@router.get(
    "/{plan_id}",
    response_model=StudyPlanDetailResponse,
)
def get_study_plan(
    plan_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    tasks = StudyPlanService.get_plan_tasks(
        db=db,
        plan_id=plan.id,
    )

    return StudyPlanDetailResponse(
        plan=plan,
        tasks=tasks,
    )


# ============================================================
# UPDATE STUDY PLAN
# ============================================================

@router.put(
    "/{plan_id}",
    response_model=StudyPlanResponse,
)
def update_study_plan(
    plan_id: int,
    plan_data: StudyPlanUpdate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    try:

        return StudyPlanService.update_plan(
            db=db,
            plan=plan,
            plan_data=plan_data,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ============================================================
# DELETE STUDY PLAN
# ============================================================

@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_study_plan(
    plan_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    StudyPlanService.delete_plan(
        db=db,
        plan=plan,
    )

    return None


# ============================================================
# CREATE STUDY TASK
# ============================================================

@router.post(
    "/{plan_id}/tasks",
    response_model=StudyTaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_study_task(
    plan_id: int,
    task_data: StudyTaskCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    try:

        return StudyPlanService.add_task(
            db=db,
            plan=plan,
            task_data=task_data,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ============================================================
# LIST STUDY TASKS
# ============================================================

@router.get(
    "/{plan_id}/tasks",
    response_model=list[StudyTaskResponse],
)
def list_study_tasks(
    plan_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    return StudyPlanService.get_plan_tasks(
        db=db,
        plan_id=plan.id,
    )


# ============================================================
# GET TASKS FOR SPECIFIC DATE
# ============================================================

@router.get(
    "/{plan_id}/tasks/date/{scheduled_date}",
    response_model=list[StudyTaskResponse],
)
def list_tasks_for_date(
    plan_id: int,
    scheduled_date: date,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    return StudyPlanService.get_tasks_for_date(
        db=db,
        plan_id=plan.id,
        scheduled_date=scheduled_date,
    )


# ============================================================
# UPDATE STUDY TASK
# ============================================================

@router.put(
    "/{plan_id}/tasks/{task_id}",
    response_model=StudyTaskResponse,
)
def update_study_task(
    plan_id: int,
    task_id: int,
    task_data: StudyTaskUpdate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    task = StudyPlanService.get_task(
        db=db,
        task_id=task_id,
        plan_id=plan.id,
    )

    if not task:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study task not found.",
        )

    return StudyPlanService.update_task(
        db=db,
        task=task,
        task_data=task_data,
    )


# ============================================================
# DELETE STUDY TASK
# ============================================================

@router.delete(
    "/{plan_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_study_task(
    plan_id: int,
    task_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    task = StudyPlanService.get_task(
        db=db,
        task_id=task_id,
        plan_id=plan.id,
    )

    if not task:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study task not found.",
        )

    StudyPlanService.delete_task(
        db=db,
        task=task,
    )

    return None


# ============================================================
# STUDY PLAN PROGRESS
# ============================================================

@router.get(
    "/{plan_id}/progress",
    response_model=StudyPlanProgressResponse,
)
def get_study_plan_progress(
    plan_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    plan = StudyPlanService.get_plan(
        db=db,
        plan_id=plan_id,
        user_id=current_user.id,
    )

    if not plan:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found.",
        )

    return StudyPlanService.calculate_progress(
        db=db,
        plan_id=plan.id,
    )