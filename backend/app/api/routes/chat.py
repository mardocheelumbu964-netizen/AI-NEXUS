import json
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.rag.retriever import retrieve_context
from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService
from app.services.student_context_service import StudentContextService
from app.services.activity_service import ActivityService
from app.agents.orchestrator import AIOrchestrator


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=10000,
    )
    conversation_id: int | None = None


class ChatActivity(BaseModel):
    step: int
    status: str
    label: str
    detail: str
    intent: str | None = None
    confidence: float | None = None
    agent_key: str | None = None


class ChatResponse(BaseModel):
    agent: str
    agent_key: str
    answer: str
    sources: list[str] = []
    activity: list[ChatActivity] = []
    conversation_id: int


def create_title(question: str) -> str:
    clean_question = " ".join(
        question.strip().split()
    )

    if not clean_question:
        return "New Conversation"

    if len(clean_question) <= 60:
        return clean_question

    return clean_question[:57].rstrip() + "..."


def persist_stage(
    db: Session,
    user_id: int,
    label: str,
    detail: str,
    agent_key: str | None = None,
    intent: str | None = None,
    confidence: float | None = None,
) -> None:
    try:
        ActivityService.log_agent_stage(
            db=db,
            user_id=user_id,
            label=label,
            detail=detail,
            agent_key=agent_key,
            intent=intent,
            confidence=confidence,
        )
    except Exception:
        db.rollback()


@router.post(
    "",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    # ---------------------------------------------------------
    # 1. Conversation
    # ---------------------------------------------------------

    conversation = None

    if request.conversation_id is not None:
        conversation = (
            ConversationService.get_conversation(
                db=db,
                conversation_id=request.conversation_id,
                user_id=current_user.id,
            )
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found.",
            )

    if conversation is None:
        conversation = (
            ConversationService.create_conversation(
                db=db,
                user_id=current_user.id,
                title=create_title(question),
            )
        )

    # ---------------------------------------------------------
    # 2. Previous conversation history
    # ---------------------------------------------------------

    previous_messages = (
        ConversationService.get_messages(
            db=db,
            conversation_id=conversation.id,
        )
    )

    history = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in previous_messages
    ]

    # ---------------------------------------------------------
    # 3. Save student message
    # ---------------------------------------------------------

    ConversationService.add_message(
        db=db,
        conversation_id=conversation.id,
        role="user",
        content=question,
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Request received",
        detail="Student request successfully received by AI-NEXUS.",
    )

    # ---------------------------------------------------------
    # 4. Load personalized student context
    # ---------------------------------------------------------

    student_context = (
        StudentContextService.get_student_context(
            db=db,
            user_id=current_user.id,
        )
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Student context loaded",
        detail=(
            "Personalized student profile information was "
            "loaded for the AI workflow."
        ),
    )

    # ---------------------------------------------------------
    # 5. AGENTIC DECISION ENGINE
    # ---------------------------------------------------------

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Understanding request",
        detail=(
            "The AI decision engine is analyzing the student's "
            "intent and task requirements."
        ),
    )

    decision = AIOrchestrator.analyze_request(
        question
    )

    agent_key = decision["agent_key"]

    agent_class = AIOrchestrator.agents.get(
        agent_key
    )

    if agent_class is None:
        agent_key = "academic"
        agent_class = AIOrchestrator.agents[
            agent_key
        ]

    agent_name = agent_class.name

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="AI decision completed",
        detail=decision.get(
            "reason",
            "Request intent analyzed.",
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    # ---------------------------------------------------------
    # 6. Build agent instruction
    # ---------------------------------------------------------

    execution = AIOrchestrator.execute_agent(
        question=question,
        student_context=student_context,
        agent_key=agent_key,
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Specialized agent selected",
        detail=(
            f"{agent_name} was selected to handle "
            "the student's request."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Agent instruction prepared",
        detail=(
            f"{agent_name} prepared a personalized "
            "execution instruction."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    # ---------------------------------------------------------
    # 7. Agentic activity trail for current response
    # ---------------------------------------------------------

    activity = []

    activity.extend(
        decision_activity(
            decision=decision,
            agent_name=agent_name,
            agent_key=agent_key,
        )
    )

    # ---------------------------------------------------------
    # 8. Retrieve uploaded study material
    # ---------------------------------------------------------

    rag_agents = {
        "academic",
        "study",
        "assessment",
        "project",
        "interview",
        "copilot",
    }

    rag_context = []

    if agent_key in rag_agents:

        activity.append(
            {
                "step": len(activity) + 1,
                "status": "completed",
                "label": "Checking study knowledge",
                "detail": (
                    "Searching the student's uploaded "
                    "learning material."
                ),
                "agent_key": agent_key,
            }
        )

        persist_stage(
            db=db,
            user_id=current_user.id,
            label="Checking study knowledge",
            detail=(
                "Searching the student's uploaded "
                "learning material."
            ),
            agent_key=agent_key,
            intent=decision.get("intent"),
            confidence=decision.get("confidence"),
        )

        try:
            rag_context = retrieve_context(
                query=question,
                user_id=current_user.id,
                top_k=5,
            )

            if rag_context:

                detail = (
                    f"Retrieved {len(rag_context)} "
                    "relevant study context item(s)."
                )

                activity.append(
                    {
                        "step": len(activity) + 1,
                        "status": "completed",
                        "label": "Relevant material found",
                        "detail": detail,
                        "agent_key": agent_key,
                    }
                )

                persist_stage(
                    db=db,
                    user_id=current_user.id,
                    label="Relevant material found",
                    detail=detail,
                    agent_key=agent_key,
                    intent=decision.get("intent"),
                    confidence=decision.get("confidence"),
                )

            else:

                detail = (
                    "No relevant uploaded material was found. "
                    "The AI will continue using student context."
                )

                activity.append(
                    {
                        "step": len(activity) + 1,
                        "status": "completed",
                        "label": "No matching material",
                        "detail": detail,
                        "agent_key": agent_key,
                    }
                )

                persist_stage(
                    db=db,
                    user_id=current_user.id,
                    label="No matching material",
                    detail=detail,
                    agent_key=agent_key,
                    intent=decision.get("intent"),
                    confidence=decision.get("confidence"),
                )

        except Exception:

            rag_context = []

            detail = (
                "Uploaded material could not be retrieved, "
                "so the AI will continue without RAG context."
            )

            activity.append(
                {
                    "step": len(activity) + 1,
                    "status": "completed",
                    "label": "Knowledge search skipped",
                    "detail": detail,
                    "agent_key": agent_key,
                }
            )

            persist_stage(
                db=db,
                user_id=current_user.id,
                label="Knowledge search skipped",
                detail=detail,
                agent_key=agent_key,
                intent=decision.get("intent"),
                confidence=decision.get("confidence"),
            )

    # ---------------------------------------------------------
    # 9. Generate AI response
    # ---------------------------------------------------------

    activity.append(
        {
            "step": len(activity) + 1,
            "status": "in_progress",
            "label": "Generating AI response",
            "detail": (
                f"{agent_name} is processing the request "
                "with the local AI model."
            ),
            "agent_key": agent_key,
        }
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Generating AI response",
        detail=(
            f"{agent_name} is processing the request "
            "with the local AI model."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    result = ChatService.generate_response(
        question=question,
        agent_key=agent_key,
        history=history,
        rag_context=rag_context,
        student_context=student_context,
        agent_instruction=execution["instruction"],
    )

    answer = result.get(
        "answer",
        "",
    ).strip()

    sources = result.get(
        "sources",
        [],
    )

    if not answer:
        raise HTTPException(
            status_code=500,
            detail="AI returned an empty response.",
        )

    # ---------------------------------------------------------
    # 10. Mark execution completed
    # ---------------------------------------------------------

    activity.append(
        {
            "step": len(activity) + 1,
            "status": "completed",
            "label": "AI response generated",
            "detail": (
                f"{agent_name} completed the request "
                "successfully."
            ),
            "agent_key": agent_key,
        }
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="AI response generated",
        detail=(
            f"{agent_name} completed the request "
            "successfully."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    ActivityService.log_agent_execution(
        db=db,
        user_id=current_user.id,
        agent_name=agent_name,
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    # ---------------------------------------------------------
    # 11. Save assistant response
    # ---------------------------------------------------------

    ConversationService.add_message(
        db=db,
        conversation_id=conversation.id,
        role="assistant",
        content=answer,
        agent_name=agent_name,
    )

    ConversationService.update_conversation(
        db=db,
        conversation=conversation,
        agent_name=agent_name,
    )

    # ---------------------------------------------------------
    # 12. Return structured agentic response
    # ---------------------------------------------------------

    return ChatResponse(
        agent=agent_name,
        agent_key=agent_key,
        answer=answer,
        sources=sources,
        activity=[
            ChatActivity(**item)
            for item in activity
        ],
        conversation_id=conversation.id,
    )


def decision_activity(
    decision: dict,
    agent_name: str,
    agent_key: str,
) -> list[dict]:

    return [
        {
            "step": 1,
            "status": "completed",
            "label": "Request received",
            "detail": (
                "Student request successfully received."
            ),
        },
        {
            "step": 2,
            "status": "completed",
            "label": "Understanding request",
            "detail": (
                "Analyzing the student's intent, "
                "context and requirements."
            ),
        },
        {
            "step": 3,
            "status": "completed",
            "label": "AI decision completed",
            "detail": decision.get(
                "reason",
                "Request intent analyzed.",
            ),
            "intent": decision.get(
                "intent",
                "general_academic",
            ),
            "confidence": decision.get(
                "confidence",
                0.50,
            ),
        },
        {
            "step": 4,
            "status": "completed",
            "label": "Specialized agent selected",
            "detail": agent_name,
            "agent_key": agent_key,
        },
        {
            "step": 5,
            "status": "completed",
            "label": "Agent instruction prepared",
            "detail": (
                f"{agent_name} prepared a "
                "personalized execution instruction."
            ),
            "agent_key": agent_key,
        },
    ]



# ---------------------------------------------------------
# COPILOT STREAMING ENDPOINT
# ---------------------------------------------------------

@router.post(
    "/stream",
)
def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    # -----------------------------------------------------
    # 1. Conversation
    # -----------------------------------------------------

    conversation = None

    if request.conversation_id is not None:
        conversation = ConversationService.get_conversation(
            db=db,
            conversation_id=request.conversation_id,
            user_id=current_user.id,
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found.",
            )

    if conversation is None:
        conversation = ConversationService.create_conversation(
            db=db,
            user_id=current_user.id,
            title=create_title(question),
        )

    conversation_id = conversation.id

    # -----------------------------------------------------
    # 2. Previous conversation history
    # -----------------------------------------------------

    previous_messages = ConversationService.get_messages(
        db=db,
        conversation_id=conversation_id,
    )

    history = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in previous_messages
    ]

    # -----------------------------------------------------
    # 3. Save student message
    # -----------------------------------------------------

    ConversationService.add_message(
        db=db,
        conversation_id=conversation_id,
        role="user",
        content=question,
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Request received",
        detail="Student request successfully received by AI-NEXUS.",
    )

    # -----------------------------------------------------
    # 4. Student context
    # -----------------------------------------------------

    student_context = StudentContextService.get_student_context(
        db=db,
        user_id=current_user.id,
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Student context loaded",
        detail=(
            "Personalized student profile information was "
            "loaded for the AI workflow."
        ),
    )

    # -----------------------------------------------------
    # 5. Agent decision
    # -----------------------------------------------------

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Understanding request",
        detail=(
            "The AI decision engine is analyzing the student's "
            "intent and task requirements."
        ),
    )

    decision = AIOrchestrator.analyze_request(question)

    agent_key = decision["agent_key"]

    agent_class = AIOrchestrator.agents.get(agent_key)

    if agent_class is None:
        agent_key = "academic"
        agent_class = AIOrchestrator.agents[agent_key]

    agent_name = agent_class.name

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="AI decision completed",
        detail=decision.get(
            "reason",
            "Request intent analyzed.",
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    # -----------------------------------------------------
    # 6. Agent instruction
    # -----------------------------------------------------

    execution = AIOrchestrator.execute_agent(
        question=question,
        student_context=student_context,
        agent_key=agent_key,
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Specialized agent selected",
        detail=(
            f"{agent_name} was selected to handle "
            "the student's request."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Agent instruction prepared",
        detail=(
            f"{agent_name} prepared a personalized "
            "execution instruction."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    # -----------------------------------------------------
    # 7. Activity information
    # -----------------------------------------------------

    activity = decision_activity(
        decision=decision,
        agent_name=agent_name,
        agent_key=agent_key,
    )

    # -----------------------------------------------------
    # 8. RAG
    # -----------------------------------------------------

    rag_agents = {
        "academic",
        "study",
        "assessment",
        "project",
        "interview",
        "copilot",
    }

    rag_context = []

    if agent_key in rag_agents:

        activity.append(
            {
                "step": len(activity) + 1,
                "status": "completed",
                "label": "Checking study knowledge",
                "detail": (
                    "Searching the student's uploaded "
                    "learning material."
                ),
                "agent_key": agent_key,
            }
        )

        persist_stage(
            db=db,
            user_id=current_user.id,
            label="Checking study knowledge",
            detail=(
                "Searching the student's uploaded "
                "learning material."
            ),
            agent_key=agent_key,
            intent=decision.get("intent"),
            confidence=decision.get("confidence"),
        )

        try:
            rag_context = retrieve_context(
                query=question,
                user_id=current_user.id,
                top_k=5,
            )

            if rag_context:
                detail = (
                    f"Retrieved {len(rag_context)} "
                    "relevant study context item(s)."
                )

                activity.append(
                    {
                        "step": len(activity) + 1,
                        "status": "completed",
                        "label": "Relevant material found",
                        "detail": detail,
                        "agent_key": agent_key,
                    }
                )

                persist_stage(
                    db=db,
                    user_id=current_user.id,
                    label="Relevant material found",
                    detail=detail,
                    agent_key=agent_key,
                    intent=decision.get("intent"),
                    confidence=decision.get("confidence"),
                )

            else:
                detail = (
                    "No relevant uploaded material was found. "
                    "The AI will continue using student context."
                )

                activity.append(
                    {
                        "step": len(activity) + 1,
                        "status": "completed",
                        "label": "No matching material",
                        "detail": detail,
                        "agent_key": agent_key,
                    }
                )

                persist_stage(
                    db=db,
                    user_id=current_user.id,
                    label="No matching material",
                    detail=detail,
                    agent_key=agent_key,
                    intent=decision.get("intent"),
                    confidence=decision.get("confidence"),
                )

        except Exception:
            rag_context = []

            detail = (
                "Uploaded material could not be retrieved, "
                "so the AI will continue without RAG context."
            )

            activity.append(
                {
                    "step": len(activity) + 1,
                    "status": "completed",
                    "label": "Knowledge search skipped",
                    "detail": detail,
                    "agent_key": agent_key,
                }
            )

            persist_stage(
                db=db,
                user_id=current_user.id,
                label="Knowledge search skipped",
                detail=detail,
                agent_key=agent_key,
                intent=decision.get("intent"),
                confidence=decision.get("confidence"),
            )

    # -----------------------------------------------------
    # 9. Stream AI response
    # -----------------------------------------------------

    activity.append(
        {
            "step": len(activity) + 1,
            "status": "in_progress",
            "label": "Generating AI response",
            "detail": (
                f"{agent_name} is processing the request "
                "with the local AI model."
            ),
            "agent_key": agent_key,
        }
    )

    persist_stage(
        db=db,
        user_id=current_user.id,
        label="Generating AI response",
        detail=(
            f"{agent_name} is processing the request "
            "with the local AI model."
        ),
        agent_key=agent_key,
        intent=decision.get("intent"),
        confidence=decision.get("confidence"),
    )

    def generate_stream():
        full_answer = ""

        try:
            for event in ChatService.stream_response(
                question=question,
                agent_key=agent_key,
                history=history,
                rag_context=rag_context,
                student_context=student_context,
                agent_instruction=execution["instruction"],
            ):

                event_type = event.get("type")

                if event_type == "token":
                    chunk = event.get("content", "")
                    full_answer += chunk

                    yield (
                        json.dumps(
                            {
                                "type": "token",
                                "content": chunk,
                            },
                            ensure_ascii=False,
                        )
                        + "\n"
                    )

                elif event_type == "complete":

                    answer = (
                        event.get("answer", full_answer)
                        .strip()
                    )

                    if not answer:
                        yield (
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": (
                                        "AI returned an empty response."
                                    ),
                                }
                            )
                            + "\n"
                        )
                        return

                    # -----------------------------------------
                    # Completion activity
                    # -----------------------------------------

                    completed_activity = list(activity)

                    completed_activity.append(
                        {
                            "step": len(completed_activity) + 1,
                            "status": "completed",
                            "label": "AI response generated",
                            "detail": (
                                f"{agent_name} completed the "
                                "request successfully."
                            ),
                            "agent_key": agent_key,
                        }
                    )

                    persist_stage(
                        db=db,
                        user_id=current_user.id,
                        label="AI response generated",
                        detail=(
                            f"{agent_name} completed the "
                            "request successfully."
                        ),
                        agent_key=agent_key,
                        intent=decision.get("intent"),
                        confidence=decision.get("confidence"),
                    )

                    ActivityService.log_agent_execution(
                        db=db,
                        user_id=current_user.id,
                        agent_name=agent_name,
                        agent_key=agent_key,
                        intent=decision.get("intent"),
                        confidence=decision.get("confidence"),
                    )

                    # -----------------------------------------
                    # Save complete assistant response
                    # -----------------------------------------

                    ConversationService.add_message(
                        db=db,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=answer,
                        agent_name=agent_name,
                    )

                    ConversationService.update_conversation(
                        db=db,
                        conversation=conversation,
                        agent_name=agent_name,
                    )

                    yield (
                        json.dumps(
                            {
                                "type": "complete",
                                "agent": agent_name,
                                "agent_key": agent_key,
                                "answer": answer,
                                "sources": event.get(
                                    "sources",
                                    [],
                                ),
                                "activity": completed_activity,
                                "conversation_id": conversation_id,
                            },
                            ensure_ascii=False,
                        )
                        + "\n"
                    )

                elif event_type == "error":
                    yield (
                        json.dumps(
                            {
                                "type": "error",
                                "message": event.get(
                                    "message",
                                    "AI generation failed.",
                                ),
                            },
                            ensure_ascii=False,
                        )
                        + "\n"
                    )

        except Exception as exc:
            db.rollback()

            yield (
                json.dumps(
                    {
                        "type": "error",
                        "message": (
                            "An unexpected error occurred while "
                            f"streaming the AI response: {exc}"
                        ),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )

    return StreamingResponse(
        generate_stream(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
