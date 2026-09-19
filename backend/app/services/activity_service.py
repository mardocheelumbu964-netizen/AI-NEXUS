from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.conversation import Conversation
from app.models.document import Document


class ActivityService:

    @staticmethod
    def log_activity(
        db: Session,
        user_id: int,
        title: str,
        description: str,
        activity_type: str = "system",
        agent_key: str | None = None,
        intent: str | None = None,
        confidence: float | None = None,
    ) -> Activity:

        activity = Activity(
            user_id=user_id,
            title=title,
            description=description,
            activity_type=activity_type,
            agent_key=agent_key,
            intent=intent,
            confidence=confidence,
        )

        db.add(activity)
        db.commit()
        db.refresh(activity)

        return activity

    @staticmethod
    def log_agent_stage(
        db: Session,
        user_id: int,
        label: str,
        detail: str,
        agent_key: str | None = None,
        intent: str | None = None,
        confidence: float | None = None,
    ) -> Activity:

        return ActivityService.log_activity(
            db=db,
            user_id=user_id,
            title=label,
            description=detail,
            activity_type="agent_stage",
            agent_key=agent_key,
            intent=intent,
            confidence=confidence,
        )

    @staticmethod
    def log_agent_execution(
        db: Session,
        user_id: int,
        agent_name: str,
        agent_key: str,
        intent: str | None = None,
        confidence: float | None = None,
    ) -> Activity:

        return ActivityService.log_activity(
            db=db,
            user_id=user_id,
            title=f"{agent_name} executed",
            description=(
                f"The {agent_name} processed the student's "
                f"request through the AI agentic workflow."
            ),
            activity_type="agent",
            agent_key=agent_key,
            intent=intent,
            confidence=confidence,
        )

    @staticmethod
    def get_recent_activity(
        db: Session,
        user_id: int,
        limit: int = 8,
    ) -> list[dict]:

        activities: list[dict] = []

        agent_activities = (
            db.query(Activity)
            .filter(Activity.user_id == user_id)
            .order_by(Activity.created_at.desc())
            .limit(limit)
            .all()
        )

        for activity in agent_activities:
            activities.append(
                {
                    "title": activity.title,
                    "description": activity.description,
                    "time": (
                        activity.created_at.isoformat()
                        if activity.created_at
                        else None
                    ),
                    "type": activity.activity_type,
                    "agent_key": activity.agent_key,
                    "intent": activity.intent,
                    "confidence": activity.confidence,
                }
            )

        conversations = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .all()
        )

        for conversation in conversations:
            activities.append(
                {
                    "title": (
                        conversation.title
                        or "AI Copilot conversation"
                    ),
                    "description": (
                        f"AI agent: "
                        f"{conversation.agent_name or 'AI Copilot'}"
                    ),
                    "time": (
                        conversation.updated_at.isoformat()
                        if conversation.updated_at
                        else None
                    ),
                    "type": "conversation",
                }
            )

        documents = (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.created_at.desc())
            .limit(limit)
            .all()
        )

        for document in documents:
            activities.append(
                {
                    "title": "Study material indexed",
                    "description": document.filename,
                    "time": (
                        document.created_at.isoformat()
                        if document.created_at
                        else None
                    ),
                    "type": "document",
                }
            )

        activities.sort(
            key=lambda item: item.get("time") or "",
            reverse=True,
        )

        return activities[:limit]
