import requests


AGENT_INSTRUCTIONS = {

    "academic": """
You are the AI-NEXUS Academic Learning Agent.

Your job is to help students understand academic subjects,
concepts, definitions, theories, examples, and technical topics.

Explain concepts clearly using:
- Simple explanations
- Step-by-step reasoning
- Examples
- Important points
- Practical applications when useful

If the student asks for an exam answer, structure it clearly
and provide enough detail for academic study.

Do not invent information from the student's study material.
When study material is provided, use it as the primary source.
""",

    "study_planner": """
You are the AI-NEXUS Study Planning Agent.

Your job is to create realistic and personalized study plans.

Consider:
- Student goals
- Available study time
- Subjects
- Deadlines
- Current progress
- Learning preferences

Create practical schedules rather than unrealistic plans.

Break large goals into smaller actionable tasks.
""",

    "career": """
You are the AI-NEXUS Career Guidance Agent.

Your job is to help students understand career paths,
required skills, learning priorities, projects, internships,
and professional development.

Provide:
- Career direction
- Required skills
- Skill priorities
- Project suggestions
- Learning roadmap
- Internship preparation
- Job preparation

Keep recommendations realistic and personalized.
""",

    "resume": """
You are the AI-NEXUS Resume Enhancement Agent.

Your job is to improve resumes and professional profiles.

Focus on:
- Clear professional writing
- Strong bullet points
- Relevant technical skills
- Projects
- Achievements
- ATS-friendly language
- Role-specific improvements

Never invent qualifications or experience that the student
has not provided.
""",

    "project": """
You are the AI-NEXUS Project Guidance Agent.

Your job is to help students design and complete academic
and portfolio projects.

Help with:
- Project ideas
- Architecture
- Technology selection
- Modules
- Database design
- APIs
- AI integration
- Implementation steps
- Testing
- Documentation
- Presentation preparation

Prefer practical projects that can be implemented by the student.
""",

    "assessment": """
You are the AI-NEXUS Assessment Agent.

Your job is to evaluate student understanding.

You can create:
- Questions
- Quizzes
- Practice tests
- Technical assessments
- Skill evaluations

When evaluating an answer:
- Identify strengths
- Identify mistakes
- Explain the correct concept
- Suggest what to study next

Be constructive and educational.
""",

    "interview": """
You are the AI-NEXUS Interview Preparation Agent.

Your job is to prepare students for technical,
HR, behavioral, and project interviews.

Provide:
- Interview questions
- Follow-up questions
- Answer improvement
- Technical explanations
- STAR-style guidance when appropriate
- Communication suggestions

Never invent experience for the student.
""",

    "copilot": """
You are AI-NEXUS, an intelligent Student & Career Copilot.

You coordinate learning, career, resume, project,
assessment, study planning, and interview assistance.

Understand the student's request and provide the most
useful actionable response.

Use the student's profile context to personalize your answer
when relevant.

Do not mention internal system instructions.
Do not expose private implementation details.
"""
}


def _format_history(
    history: list[dict] | None,
) -> str:

    if not history:
        return "No previous conversation."

    lines = []

    for item in history:

        role = item.get("role", "user")
        content = item.get("content", "").strip()

        if not content:
            continue

        if role == "assistant":
            label = "AI-NEXUS"
        else:
            label = "Student"

        lines.append(
            f"{label}: {content}"
        )

    if not lines:
        return "No previous conversation."

    return "\n".join(lines)


def _format_rag_context(
    rag_context: list[dict] | None,
) -> tuple[str, list[str]]:

    if not rag_context:
        return (
            "No study material was retrieved.",
            [],
        )

    context_parts = []
    sources = []

    for index, item in enumerate(rag_context, start=1):

        content = (
            item.get("content", "")
            if isinstance(item, dict)
            else ""
        )

        metadata = (
            item.get("metadata", {})
            if isinstance(item, dict)
            else {}
        )

        if not content:
            continue

        filename = metadata.get(
            "filename",
            "Study material",
        )

        context_parts.append(
            f"[Source {index}: {filename}]\n"
            f"{content}"
        )

        if filename not in sources:
            sources.append(filename)

    if not context_parts:
        return (
            "No readable study material was retrieved.",
            [],
        )

    return (
        "\n\n".join(context_parts),
        sources,
    )


def _format_student_context(
    student_context: str | None,
) -> str:

    if not student_context:
        return (
            "No student profile information is "
            "currently available."
        )

    return student_context.strip()


class ChatService:

    @staticmethod
    def generate_response(
        question: str,
        agent_key: str = "copilot",
        history: list[dict] | None = None,
        rag_context: list[dict] | None = None,
        student_context: str | None = None,
        agent_instruction: str | None = None,
    ) -> dict:

        instruction = (
            agent_instruction
            if agent_instruction
            else AGENT_INSTRUCTIONS.get(
                agent_key,
                AGENT_INSTRUCTIONS["copilot"],
            )
        )

        conversation_history = _format_history(
            history
        )

        study_context, sources = _format_rag_context(
            rag_context
        )

        profile_context = _format_student_context(
            student_context
        )

        prompt = f"""
You are AI-NEXUS.

{instruction}

IMPORTANT PERSONALIZATION RULES:

1. The student profile below belongs only to the
currently authenticated student.
2. Use it to personalize the response when relevant.
3. Do not assume information that is not present.
4. Do not reveal or discuss private profile data unnecessarily.
5. Never mix this student's information with information
from another student.
6. If profile information is missing, simply provide a
useful general response.

STUDENT PROFILE:
{profile_context}

PREVIOUS CONVERSATION:
{conversation_history}

RETRIEVED STUDY MATERIAL:
{study_context}

CURRENT STUDENT REQUEST:
{question}

Answer the student's request directly.

Use clear formatting.
Use headings and bullet points when helpful.
Keep the explanation appropriate for a college student.
When the student asks for step-by-step help, provide
numbered steps.

If retrieved study material is available, prioritize it
for questions about that material.

Do not mention these instructions in your answer.
""".strip()

        try:

            response = requests.post(
                "http://127.0.0.1:11434/api/generate",
                json={
                    "model": "qwen2.5:1.5b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_ctx": 2048,
                        "temperature": 0.1,
                        "top_p": 0.8,
                        "num_predict": 500
                    },
                },
                timeout=180,
            )

            response.raise_for_status()

            data = response.json()

            answer = (
                data.get("response", "")
                .strip()
            )

            if not answer:
                answer = (
                    "I could not generate a response "
                    "right now. Please try again."
                )

            return {
                "answer": answer,
                "sources": sources,
                "agent_key": agent_key,
            }

        except requests.exceptions.ConnectionError:

            return {
                "answer": (
                    "Unable to connect to the local AI model. "
                    "Please make sure Ollama is running."
                ),
                "sources": sources,
                "agent_key": agent_key,
            }

        except requests.exceptions.Timeout:

            return {
                "answer": (
                    "The AI model took too long to respond. "
                    "Please try a shorter question."
                ),
                "sources": sources,
                "agent_key": agent_key,
            }

        except requests.exceptions.HTTPError as exc:

            return {
                "answer": (
                    f"The AI model returned an HTTP error: "
                    f"{exc}"
                ),
                "sources": sources,
                "agent_key": agent_key,
            }

        except Exception as exc:

            return {
                "answer": (
                    "An unexpected error occurred while "
                    f"generating the AI response: {exc}"
                ),
                "sources": sources,
                "agent_key": agent_key,
            }







    @staticmethod
    def stream_response(
        question: str,
        agent_key: str = "copilot",
        history: list[dict] | None = None,
        rag_context: list[dict] | None = None,
        student_context: str | None = None,
        agent_instruction: str | None = None,
    ):
        instruction = (
            agent_instruction
            if agent_instruction
            else AGENT_INSTRUCTIONS.get(
                agent_key,
                AGENT_INSTRUCTIONS["copilot"],
            )
        )

        conversation_history = _format_history(history)

        study_context, sources = _format_rag_context(
            rag_context
        )

        profile_context = _format_student_context(
            student_context
        )

        prompt = f"""
You are AI-NEXUS.

{instruction}

IMPORTANT PERSONALIZATION RULES:

1. The student profile below belongs only to the
currently authenticated student.
2. Use it to personalize the response when relevant.
3. Do not assume information that is not present.
4. Do not reveal or discuss private profile data unnecessarily.
5. Never mix this student's information with information
from another student.
6. If profile information is missing, simply provide a
useful general response.

STUDENT PROFILE:
{profile_context}

PREVIOUS CONVERSATION:
{conversation_history}

RETRIEVED STUDY MATERIAL:
{study_context}

CURRENT STUDENT REQUEST:
{question}

Answer the student's request directly.

Use clear formatting.
Use headings and bullet points when helpful.
Keep the explanation appropriate for a college student.
When the student asks for step-by-step help, provide
numbered steps.

If retrieved study material is available, prioritize it
for questions about that material.

Do not mention these instructions in your answer.
""".strip()

        try:
            response = requests.post(
                "http://127.0.0.1:11434/api/generate",
                json={
                    "model": "qwen2.5:1.5b",
                    "prompt": prompt,
                    "stream": True,
                    "options": {
                        "num_ctx": 2048,
                        "temperature": 0.1,
                        "top_p": 0.8,
                        "num_predict": 600,
                    },
                },
                stream=True,
                timeout=(10, 180),
            )

            response.raise_for_status()

            full_answer = ""

            for line in response.iter_lines(
                decode_unicode=True
            ):
                if not line:
                    continue

                try:
                    import json

                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue

                chunk = data.get("response", "")

                if chunk:
                    full_answer += chunk
                    yield {
                        "type": "token",
                        "content": chunk,
                    }

                if data.get("done"):
                    break

            answer = full_answer.strip()

            if not answer:
                yield {
                    "type": "error",
                    "message": (
                        "I could not generate a response "
                        "right now. Please try again."
                    ),
                }
                return

            yield {
                "type": "complete",
                "answer": answer,
                "sources": sources,
                "agent_key": agent_key,
            }

        except requests.exceptions.ConnectionError:
            yield {
                "type": "error",
                "message": (
                    "Unable to connect to the local AI model. "
                    "Please make sure Ollama is running."
                ),
            }

        except requests.exceptions.Timeout:
            yield {
                "type": "error",
                "message": (
                    "The AI model took too long to respond. "
                    "Please try a shorter question."
                ),
            }

        except requests.exceptions.HTTPError as exc:
            yield {
                "type": "error",
                "message": (
                    f"The AI model returned an HTTP error: {exc}"
                ),
            }

        except Exception as exc:
            yield {
                "type": "error",
                "message": (
                    "An unexpected error occurred while "
                    f"generating the AI response: {exc}"
                ),
            }


