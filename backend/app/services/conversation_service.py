from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message


class ConversationService:

    @staticmethod
    def create_conversation(
        db: Session,
        user_id: int,
        title: str = "New Conversation",
    ) -> Conversation:

        conversation = Conversation(
            user_id=user_id,
            title=title[:200] or "New Conversation",
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_user_conversations(
        db: Session,
        user_id: int,
    ) -> list[Conversation]:

        return (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user_id
            )
            .order_by(
                Conversation.updated_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: int,
        user_id: int,
    ) -> Conversation | None:

        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: int,
    ) -> list[Message]:

        return (
            db.query(Message)
            .filter(
                Message.conversation_id
                == conversation_id
            )
            .order_by(
                Message.created_at.asc()
            )
            .all()
        )

    @staticmethod
    def add_message(
        db: Session,
        conversation_id: int,
        role: str,
        content: str,
        agent_name: str | None = None,
    ) -> Message:

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            agent_name=agent_name,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def update_conversation(
        db: Session,
        conversation: Conversation,
        title: str | None = None,
        agent_name: str | None = None,
    ) -> Conversation:

        if title is not None:
            conversation.title = title[:200]

        if agent_name is not None:
            conversation.agent_name = agent_name

        conversation.updated_at = datetime.now(
            timezone.utc
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation
