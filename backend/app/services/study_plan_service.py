from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.study_plan import StudyPlan, StudyTask
from app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanUpdate,
    StudyTaskCreate,
    StudyTaskUpdate,
)


class StudyPlanService:

    @staticmethod
    def create_plan(
        db: Session,
        user_id: int,
        plan_data: StudyPlanCreate,
    ) -> StudyPlan:

        if plan_data.end_date < plan_data.start_date:
            raise ValueError(
                "End date cannot be earlier than start date."
            )

        plan = StudyPlan(
            user_id=user_id,
            title=plan_data.title.strip(),
            description=plan_data.description,
            start_date=plan_data.start_date,
            end_date=plan_data.end_date,
            status=plan_data.status,
        )

        db.add(plan)
        db.commit()
        db.refresh(plan)

        return plan

    @staticmethod
    def get_user_plans(
        db: Session,
        user_id: int,
    ) -> list[StudyPlan]:

        result = db.execute(
            select(StudyPlan)
            .where(
                StudyPlan.user_id == user_id
            )
            .order_by(
                StudyPlan.created_at.desc()
            )
        )

        return list(result.scalars().all())

    @staticmethod
    def get_plan(
        db: Session,
        plan_id: int,
        user_id: int,
    ) -> StudyPlan | None:

        result = db.execute(
            select(StudyPlan).where(
                StudyPlan.id == plan_id,
                StudyPlan.user_id == user_id,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    def update_plan(
        db: Session,
        plan: StudyPlan,
        plan_data: StudyPlanUpdate,
    ) -> StudyPlan:

        data = plan_data.model_dump(
            exclude_unset=True
        )

        start_date = data.get(
            "start_date",
            plan.start_date,
        )

        end_date = data.get(
            "end_date",
            plan.end_date,
        )

        if end_date < start_date:
            raise ValueError(
                "End date cannot be earlier than start date."
            )

        for field, value in data.items():

            if field == "title" and value:
                value = value.strip()

            setattr(
                plan,
                field,
                value,
            )

        db.commit()
        db.refresh(plan)

        return plan

    @staticmethod
    def delete_plan(
        db: Session,
        plan: StudyPlan,
    ) -> None:

        db.delete(plan)
        db.commit()

    @staticmethod
    def add_task(
        db: Session,
        plan: StudyPlan,
        task_data: StudyTaskCreate,
    ) -> StudyTask:

        if (
            task_data.scheduled_date
            < plan.start_date
            or task_data.scheduled_date
            > plan.end_date
        ):
            raise ValueError(
                "Task date must be within the study plan dates."
            )

        task = StudyTask(
            study_plan_id=plan.id,
            subject=task_data.subject.strip(),
            topic=task_data.topic.strip(),
            scheduled_date=task_data.scheduled_date,
            duration_minutes=task_data.duration_minutes,
            priority=task_data.priority,
            status=task_data.status,
            completion_percentage=(
                task_data.completion_percentage
            ),
            notes=task_data.notes,
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    @staticmethod
    def get_plan_tasks(
        db: Session,
        plan_id: int,
    ) -> list[StudyTask]:

        result = db.execute(
            select(StudyTask)
            .where(
                StudyTask.study_plan_id == plan_id
            )
            .order_by(
                StudyTask.scheduled_date.asc(),
                StudyTask.created_at.asc(),
            )
        )

        return list(result.scalars().all())

    @staticmethod
    def get_task(
        db: Session,
        task_id: int,
        plan_id: int,
    ) -> StudyTask | None:

        result = db.execute(
            select(StudyTask).where(
                StudyTask.id == task_id,
                StudyTask.study_plan_id == plan_id,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    def update_task(
        db: Session,
        task: StudyTask,
        task_data: StudyTaskUpdate,
    ) -> StudyTask:

        data = task_data.model_dump(
            exclude_unset=True
        )

        for field, value in data.items():

            if field in {
                "subject",
                "topic",
            } and value:
                value = value.strip()

            setattr(
                task,
                field,
                value,
            )

        db.commit()
        db.refresh(task)

        return task

    @staticmethod
    def delete_task(
        db: Session,
        task: StudyTask,
    ) -> None:

        db.delete(task)
        db.commit()

    @staticmethod
    def calculate_progress(
        db: Session,
        plan_id: int,
    ) -> dict:

        tasks = StudyPlanService.get_plan_tasks(
            db=db,
            plan_id=plan_id,
        )

        total_tasks = len(tasks)

        completed_tasks = sum(
            1
            for task in tasks
            if task.status.lower()
            in {
                "completed",
                "complete",
                "done",
            }
            or task.completion_percentage >= 100
        )

        pending_tasks = (
            total_tasks - completed_tasks
        )

        total_duration = sum(
            task.duration_minutes
            for task in tasks
        )

        completed_duration = sum(
            task.duration_minutes
            * (
                task.completion_percentage
                / 100
            )
            for task in tasks
        )

        if total_tasks == 0:
            progress_percentage = 0.0
        else:
            progress_percentage = round(
                sum(
                    task.completion_percentage
                    for task in tasks
                )
                / total_tasks,
                2,
            )

        return {
            "study_plan_id": plan_id,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "total_duration_minutes": total_duration,
            "completed_duration_minutes": round(
                completed_duration,
                2,
            ),
            "progress_percentage": progress_percentage,
        }

    @staticmethod
    def get_tasks_for_date(
        db: Session,
        plan_id: int,
        scheduled_date: date,
    ) -> list[StudyTask]:

        result = db.execute(
            select(StudyTask)
            .where(
                StudyTask.study_plan_id == plan_id,
                StudyTask.scheduled_date
                == scheduled_date,
            )
            .order_by(
                StudyTask.created_at.asc()
            )
        )

        return list(result.scalars().all())