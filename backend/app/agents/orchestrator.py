from sqlalchemy.orm import Session

from app.models.user import User
from app.services.student_context_service import StudentContextService


class AcademicLearningAgent:
    name = "Academic Learning Agent"
    key = "academic"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Academic Learning Agent of AI-NEXUS.

Your responsibility is to explain academic concepts clearly,
identify learning difficulties, and provide personalized
educational guidance.

STUDENT CONTEXT:
{student_context}

STUDENT REQUEST:
{question}

Provide an explanation appropriate for the student's
academic level and interests.
""".strip()


class StudyPlanningAgent:
    name = "Personalized Study Planning Agent"
    key = "study"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Personalized Study Planning Agent of AI-NEXUS.

Create practical study strategies based on the student's
academic background, learning interests, available skills,
and learning preferences.

STUDENT CONTEXT:
{student_context}

STUDENT REQUEST:
{question}

Produce a structured and realistic recommendation.
""".strip()


class CareerGuidanceAgent:
    name = "Career Guidance Agent"
    key = "career"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Career Guidance Agent of AI-NEXUS.

Analyze the student's skills, interests, academic background,
and stated career goals.

STUDENT CONTEXT:
{student_context}

STUDENT REQUEST:
{question}

Provide personalized career guidance, relevant skills,
possible career directions, and actionable next steps.
""".strip()


class ResumeEnhancementAgent:
    name = "Resume Enhancement Agent"
    key = "resume"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Resume Enhancement Agent of AI-NEXUS.

Help the student improve their resume according to their
skills, education, interests, projects, and target career.

STUDENT CONTEXT:
{student_context}

STUDENT REQUEST:
{question}

Provide professional, truthful and actionable resume guidance.
""".strip()


class ProjectGuidanceAgent:
    name = "Project Guidance Agent"
    key = "project"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Project Guidance Agent in AI-NEXUS.

IMPORTANT:
The student is asking about an EXISTING software project.
Do NOT tell the student to choose React, FastAPI, PostgreSQL,
Ollama, or other technologies that are already listed in the
project information.
Do NOT pretend that the project has completed features that
were not provided.
Do NOT design a completely new project unless the student
explicitly asks for a new project.

STRICT TECHNOLOGY RULE:
Use only technologies explicitly provided in the project
information or student context.
Do NOT introduce Redis, GraphQL, LDAP, FastRender, WebSockets,
Kafka, Celery, Docker, Kubernetes, AWS, Azure, GCP, or any
other new technology unless the student explicitly asks about
that technology.
Do NOT recommend adding a new infrastructure component merely
because it is commonly used in industry.
If an improvement can be implemented using the existing stack,
prefer the existing stack.
If a technology would genuinely be required, first state that
the requirement needs verification and explain why.

Your job is to analyze the provided project information and
give practical guidance for improving or completing it.

PROJECT INFORMATION:
{question}

STUDENT PROFILE:
{student_context}

For "what should I implement next":
- Analyze the current status and progress.
- Consider the existing technology stack.
- Identify the most important missing work.
- Give a prioritized implementation sequence.
- Start with the highest-value next step.
- Include technical considerations only when relevant.

For "review my technology stack":
- Evaluate the technologies already listed.
- Explain how they work together.
- Identify unnecessary, missing, or incompatible technologies
  only when there is evidence for this.
- Do not recommend replacing technologies without a reason.

For "suggest features":
- Suggest features that fit the existing project.
- Prioritize useful features over unnecessary complexity.
- Explain why each suggested feature is useful.

For "make it industry-ready":
- Consider architecture, security, authentication,
  validation, error handling, testing, documentation,
  version control, deployment, scalability, and UX.
- Only discuss areas relevant to the project.

For debugging questions:
- Focus on the reported problem.
- Give diagnostic steps first.
- Do not recommend major architectural changes without
  justification.

RESPONSE FORMAT:

## Project Assessment
Briefly explain what is known about the existing project.

## Recommended Next Steps
Give 3-6 prioritized practical steps.

## Technical Considerations
Explain the important technical points relevant to the request.

## Improvements
List useful improvements if applicable.

## Risks
Mention important risks or dependencies if applicable.

## Suggested Next Action
Give ONE clear action the student should take next.

Use only information provided in the project information and
student profile. If something is unknown, say that it is
unknown instead of inventing it.

Keep the answer practical, concise, and suitable for a
BCA final-year software project.
""".strip()
class AssessmentAgent:
    name = "Assessment Agent"
    key = "assessment"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Assessment Agent of AI-NEXUS.

Design adaptive assessments appropriate for the student's
academic level and learning requirements.

STUDENT CONTEXT:
{student_context}

STUDENT REQUEST:
{question}

Generate useful questions and explain how the assessment
can identify knowledge gaps.
""".strip()


class InterviewPreparationAgent:
    name = "Interview Preparation Agent"
    key = "interview"

    @staticmethod
    def run(question: str, student_context: str) -> str:
        return f"""
You are the Interview Preparation Agent of AI-NEXUS.

Prepare the student for technical and behavioral interviews
based on their skills, education, projects and career goals.

STUDENT CONTEXT:
{student_context}

STUDENT REQUEST:
{question}

Provide practical interview preparation and improvement
recommendations.
""".strip()


class AIOrchestrator:
    """
    Central decision engine for the AI-NEXUS agentic system.

    Flow:

    Student Request
        -> Intent Detection
        -> AI Decision
        -> Agent Selection
        -> Agent Instruction
        -> Execution Result
    """

    agents = {
        "academic": AcademicLearningAgent,
        "study": StudyPlanningAgent,
        "career": CareerGuidanceAgent,
        "resume": ResumeEnhancementAgent,
        "project": ProjectGuidanceAgent,
        "assessment": AssessmentAgent,
        "interview": InterviewPreparationAgent,
    }

    keyword_groups = {
        "resume": [
            "resume",
            "cv",
            "curriculum vitae",
            "cover letter",
            "linkedin profile",
        ],
        "career": [
            "career",
            "job",
            "employment",
            "career path",
            "career goal",
            "target role",
            "job role",
            "placement",
            "internship",
        ],
        "project": [
            "project",
            "application",
            "system",
            "build",
            "develop",
            "development",
            "implementation",
            "portfolio project",
        ],
        "interview": [
            "interview",
            "hr round",
            "technical round",
            "mock interview",
            "interview question",
            "interview preparation",
        ],
        "assessment": [
            "quiz",
            "test",
            "assessment",
            "mcq",
            "multiple choice",
            "practice questions",
            "knowledge test",
        ],
        "study": [
            "study plan",
            "study schedule",
            "schedule",
            "timetable",
            "study",
            "revision",
            "revision plan",
            "exam preparation",
            "prepare for exam",
        ],
    }

    @staticmethod
    def detect_agent(question: str) -> str:
        decision = AIOrchestrator.analyze_request(question)
        return decision["agent_key"]

    @staticmethod
    def analyze_request(question: str) -> dict:
        """
        Analyze a student request and determine the most relevant
        specialized agent.

        This uses deterministic intent routing so the system remains
        predictable and reliable on local hardware.
        """

        text = " ".join(question.lower().strip().split())

        if not text:
            return {
                "intent": "general_academic",
                "agent_key": "academic",
                "confidence": 0.50,
                "reason": "No specific request was provided.",
            }

        scores = {
            agent_key: 0
            for agent_key in AIOrchestrator.agents
        }

        matched_keywords = {
            agent_key: []
            for agent_key in AIOrchestrator.agents
        }

        for agent_key, keywords in AIOrchestrator.keyword_groups.items():
            for keyword in keywords:
                if keyword in text:
                    scores[agent_key] += 1
                    matched_keywords[agent_key].append(keyword)

        best_agent = max(
            scores,
            key=scores.get,
        )

        best_score = scores[best_agent]

        if best_score == 0:
            return {
                "intent": "general_academic",
                "agent_key": "academic",
                "confidence": 0.55,
                "reason": "No specialized intent was detected, so the Academic Learning Agent was selected.",
                "matched_keywords": [],
                "scores": scores,
            }

        total_matches = sum(scores.values())

        confidence = min(
            0.99,
            0.65 + (
                best_score / max(total_matches, 1)
            ) * 0.30,
        )

        intent_names = {
            "academic": "academic_learning",
            "study": "study_planning",
            "career": "career_guidance",
            "resume": "resume_enhancement",
            "project": "project_guidance",
            "assessment": "assessment",
            "interview": "interview_preparation",
        }

        return {
            "intent": intent_names.get(
                best_agent,
                "general_academic",
            ),
            "agent_key": best_agent,
            "confidence": round(confidence, 2),
            "reason": (
                f"Detected {len(matched_keywords[best_agent])} "
                f"relevant keyword(s) for the "
                f"{AIOrchestrator.agents[best_agent].name}."
            ),
            "matched_keywords": matched_keywords[best_agent],
            "scores": scores,
        }

    @staticmethod
    def execute_agent(
        question: str,
        student_context: str,
        agent_key: str,
    ) -> dict:
        """
        Execute the selected specialized agent.

        The agent produces an instruction that is later passed to
        the local LLM by the AI service.
        """

        agent = AIOrchestrator.agents.get(agent_key)

        if agent is None:
            agent_key = "academic"
            agent = AIOrchestrator.agents[agent_key]

        instruction = agent.run(
            question,
            student_context,
        )

        return {
            "status": "completed",
            "agent": agent.name,
            "agent_key": agent_key,
            "instruction": instruction,
        }

    @staticmethod
    def route(
        db: Session,
        user: User,
        question: str,
    ) -> dict:
        """
        Complete agentic routing pipeline.

        Returns both the final agent instruction and a detailed
        activity trail suitable for the frontend.
        """

        student_context = (
            StudentContextService.build_context(
                db,
                user,
            )
        )

        activity = [
            {
                "step": 1,
                "status": "completed",
                "label": "Request received",
                "detail": "Student request successfully received.",
            },
            {
                "step": 2,
                "status": "completed",
                "label": "Understanding request",
                "detail": "Analyzing the student's intent and requirements.",
            },
        ]

        decision = AIOrchestrator.analyze_request(
            question,
        )

        selected_agent_key = decision["agent_key"]
        selected_agent = AIOrchestrator.agents[
            selected_agent_key
        ]

        activity.append(
            {
                "step": 3,
                "status": "completed",
                "label": "AI decision completed",
                "detail": decision["reason"],
                "intent": decision["intent"],
                "confidence": decision["confidence"],
            }
        )

        activity.append(
            {
                "step": 4,
                "status": "completed",
                "label": "Specialized agent selected",
                "detail": selected_agent.name,
                "agent_key": selected_agent_key,
            }
        )

        execution = AIOrchestrator.execute_agent(
            question=question,
            student_context=student_context,
            agent_key=selected_agent_key,
        )

        activity.append(
            {
                "step": 5,
                "status": execution["status"],
                "label": "Agent instruction generated",
                "detail": (
                    f"{selected_agent.name} prepared the task "
                    "for AI execution."
                ),
                "agent_key": selected_agent_key,
            }
        )

        activity.append(
            {
                "step": 6,
                "status": "ready",
                "label": "AI response generation",
                "detail": (
                    "The selected instruction is ready for "
                    "the local AI model."
                ),
            }
        )

        return {
            "agent": execution["agent"],
            "agent_key": execution["agent_key"],
            "student_context": student_context,
            "instruction": execution["instruction"],
            "decision": decision,
            "activity": activity,
        }



