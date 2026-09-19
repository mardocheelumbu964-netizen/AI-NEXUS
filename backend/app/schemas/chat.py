from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=5000,
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
    )

    conversation_id: int | None = Field(
        default=None,
        ge=1,
    )


class SourceDocument(BaseModel):
    document_id: int
    filename: str
    chunk_index: int
    content: str


class ChatResponse(BaseModel):
    question: str
    conversation_id: int
    agent: str
    answer: str
    sources: list[SourceDocument]
