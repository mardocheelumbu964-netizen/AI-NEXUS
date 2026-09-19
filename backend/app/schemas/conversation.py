from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):

    title: str = Field(
        default="New Conversation",
        min_length=1,
        max_length=200,
    )


class ConversationResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    user_id: int
    title: str
    agent_name: str | None = None
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    conversation_id: int
    role: str
    content: str
    agent_name: str | None = None
    created_at: datetime


class ConversationDetailResponse(BaseModel):

    conversation: ConversationResponse
    messages: list[MessageResponse]
