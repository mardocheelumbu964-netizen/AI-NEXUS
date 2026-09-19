import requests

from app.core.config import settings


class AgentAIService:

    @staticmethod
    def generate(
        instruction: str,
    ) -> str:

        system_prompt = """
You are the central Generative AI engine of AI-NEXUS.

AI-NEXUS is an Agentic Generative AI platform for
personalized student learning, career guidance,
and employability enhancement.

Follow the specialized agent instruction provided
to you.

Rules:

1. Use the student's provided context.
2. Never invent student information.
3. Give practical and structured answers.
4. Use headings and bullet points where useful.
5. Explain technical concepts clearly.
6. Adapt recommendations to the student's academic level.
7. If information is missing, explicitly state that it
   is missing instead of making it up.
""".strip()

        payload = {
            "model": settings.LLM_MODEL,
            "system": system_prompt,
            "prompt": instruction,
            "stream": False,
        }

        try:
            response = requests.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload,
                timeout=180,
            )

            response.raise_for_status()

            result = response.json()

            answer = result.get(
                "response",
                "",
            ).strip()

            if not answer:
                return (
                    "The AI model did not return a response. "
                    "Please try again."
                )

            return answer

        except requests.exceptions.ConnectionError:
            return (
                "AI-NEXUS could not connect to Ollama. "
                "Please make sure Ollama is running."
            )

        except requests.exceptions.Timeout:
            return (
                "The AI model took too long to respond. "
                "Please try again."
            )

        except requests.exceptions.RequestException as exc:
            return (
                "An error occurred while communicating "
                f"with the AI model: {str(exc)}"
            )
