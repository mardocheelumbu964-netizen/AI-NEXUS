import apiClient from "./apiClient";

export interface ChatActivity {
  step: number;
  status: string;
  label: string;
  detail: string;
  intent?: string | null;
  confidence?: number | null;
  agent_key?: string | null;
}

export interface ChatResponse {
  agent: string;
  agent_key: string;
  answer: string;
  sources: string[];
  activity: ChatActivity[];
  conversation_id: number | null;
}

export async function sendCopilotMessage(
  question: string,
  conversationId?: number | null
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>("/chat", {
    question,
    conversation_id: conversationId ?? null,
  });

  return response.data;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  agent_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  agent_name: string | null;
  created_at: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: ConversationMessage[];
}

export async function sendChatMessage(
  question: string,
  conversationId?: number | null
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>(
    "/chat",
    {
      question: question.trim(),
      conversation_id: conversationId ?? null,
    }
  );

  return response.data;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<Conversation[]>(
    "/conversations/"
  );

  return response.data;
}

export async function getConversation(
  conversationId: number
): Promise<ConversationDetail> {
  const response = await apiClient.get<ConversationDetail>(
    `/conversations/${conversationId}`
  );

  return response.data;
}

export async function createConversation(
  title = "New Conversation"
): Promise<Conversation> {
  const response = await apiClient.post<Conversation>(
    "/conversations/",
    { title }
  );

  return response.data;
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  targetRole: string
): Promise<ChatResponse> {
  const prompt = `
You are the AI Interview Agent inside AI-NEXUS.

Target role:
${targetRole}

Interview question:
${question}

Candidate answer:
${answer}

Evaluate the candidate answer professionally.

Return the response using exactly these sections:

## Overall Evaluation
Give a score out of 100 and briefly explain the quality of the answer.

## Technical Knowledge
Evaluate technical correctness and understanding.

## Communication
Evaluate clarity, structure, and ability to explain the answer.

## Strengths
Give 3 specific strengths.

## Improvements
Give 3 specific improvements.

## Ideal Answer Structure
Explain how the candidate could structure a stronger answer.

Use simple language.
Be constructive.
Do not invent information about the candidate.
`.trim();

  const response = await apiClient.post<ChatResponse>(
    "/chat",
    {
      question: prompt,
      conversation_id: null,
    }
  );

  return response.data;
}

export async function generateCareerGuidance(
  careerGoal: string,
  currentSkills: string,
  preferredRole: string
): Promise<ChatResponse> {
  const prompt = `
You are the Career Guidance Agent inside AI-NEXUS.

Provide practical and personalized career guidance for the student.

CAREER GOAL:
${careerGoal}

CURRENT SKILLS:
${currentSkills}

PREFERRED ROLE:
${preferredRole}

Return the response using exactly these sections:

## Career Assessment
Briefly assess the student's current direction based only on the information provided.

## Recommended Career Direction
Explain the most relevant career direction and why it fits the stated goal and skills.

## Skills to Strengthen
List the most important technical and professional skills to develop.

## Career Roadmap
Create a practical progression from the student's current level toward the target role.

## Portfolio Projects
Suggest 3 practical projects that would strengthen employability for the target role.

## Learning Priorities
Give a prioritized list of what the student should learn next.

## Interview Preparation
List important areas the student should prepare for interviews.

## AI Career Recommendations
Give 3 actionable recommendations for improving career readiness.

Rules:
- Use simple and clear language.
- Be practical and realistic.
- Do not invent qualifications, experience, achievements, or skills that were not provided.
- Do not claim that the student has completed anything unless explicitly stated.
- Focus on actionable career development.
`.trim();

  const response = await apiClient.post<ChatResponse>(
    "/chat",
    {
      question: prompt,
      conversation_id: null,
    }
  );

  return response.data;
}

export async function generateResumeGuidance(
  targetRole: string,
  resumeContent: string,
  skills: string
): Promise<ChatResponse> {
  const prompt = `
You are the AI Resume Agent inside AI-NEXUS.

Help the student improve their resume for a target role.

TARGET ROLE:
${targetRole}

CURRENT SKILLS:
${skills}

RESUME CONTENT:
${resumeContent}

Return the response using exactly these sections:

## Resume Assessment
Briefly assess the current resume based only on the information provided.

## Resume Score
Give an estimated score out of 100 and explain the main reasons.

## Strengths
List the strongest parts of the resume.

## Areas to Improve
Identify specific weaknesses or missing information.

## Skills Analysis
Explain which skills are relevant to the target role and which skills should be strengthened.

## Experience and Projects
Suggest how the student can present projects, internships, academic work, or experience more effectively.

## ATS Optimization
Give practical suggestions for improving ATS readability, keywords, structure, and formatting.

## Improved Resume Suggestions
Provide specific examples of how important sections could be rewritten.

## AI Resume Recommendations
Give 5 actionable recommendations for improving the resume.

Rules:
- Use simple and professional language.
- Do not invent work experience, qualifications, achievements, projects, or skills.
- Clearly distinguish suggestions from facts.
- Do not claim the student has experience that was not provided.
- Focus on practical resume improvement.
`.trim();

  const response = await apiClient.post<ChatResponse>(
    "/chat",
    {
      question: prompt,
      conversation_id: null,
    }
  );

  return response.data;
}

export async function generateSkillGapAnalysis(
  targetRole: string,
  currentSkills: string,
  careerGoal: string,
  experienceLevel: string
): Promise<ChatResponse> {
  const prompt = `
You are the AI Assessment Agent inside AI-NEXUS.

Perform a practical skill gap analysis for the student.

TARGET ROLE:
${targetRole}

CURRENT SKILLS:
${currentSkills}

CAREER GOAL:
${careerGoal}

EXPERIENCE LEVEL:
${experienceLevel}

Return the response using exactly these sections:

## Skill Gap Overview
Briefly explain the student's current position relative to the target role.

## Current Strengths
Identify the skills that already provide a useful foundation.

## Critical Skill Gaps
Identify the most important missing or underdeveloped skills.

## Skill Gap Priorities
Classify each important gap as:
- High Priority
- Medium Priority
- Low Priority

Explain why each priority level matters.

## Technical Skills to Develop
List the technical skills the student should learn or strengthen.

## Professional Skills to Develop
List communication, problem-solving, teamwork, interview, or other employability skills that should be strengthened.

## Learning Action Plan
Create a practical step-by-step plan for closing the most important skill gaps.

## Recommended Projects
Suggest practical projects that can help the student develop and demonstrate the missing skills.

## Assessment Strategy
Suggest tests, exercises, coding tasks, projects, or other checkpoints that can measure improvement.

## AI Recommendations
Give 5 actionable recommendations for improving career readiness.

Rules:
- Use simple and clear language.
- Do not invent skills, experience, qualifications, or achievements.
- Base the analysis only on the information provided.
- Do not claim that a skill is mastered unless the information supports it.
- Clearly distinguish current abilities from recommended future learning.
- Focus on practical and measurable development.
`.trim();

  const response = await apiClient.post<ChatResponse>(
    "/chat",
    {
      question: prompt,
      conversation_id: null,
    }
  );

  return response.data;
}

export async function generateRoadmapGuidance(
  careerGoal: string,
  targetRole: string,
  currentSkills: string,
  experienceLevel: string
): Promise<ChatResponse> {
  const prompt = `
You are the AI Roadmap Agent inside AI-NEXUS.

Create a personalized career and learning roadmap for the student.

CAREER GOAL:
${careerGoal}

TARGET ROLE:
${targetRole}

CURRENT SKILLS:
${currentSkills}

EXPERIENCE LEVEL:
${experienceLevel}

Return the response using exactly these sections:

## Roadmap Overview
Explain the overall journey from the student's current level toward the target role.

## Phase 1 - Foundation
List the most important concepts and skills to establish first.

## Phase 2 - Skill Development
List the technical and professional skills that should be developed next.

## Phase 3 - Practical Projects
Suggest practical projects that demonstrate the required skills.

## Phase 4 - Portfolio and Resume
Explain what the student should add to their portfolio and resume.

## Phase 5 - Interview Preparation
List the technical, behavioral, and communication areas to prepare.

## Milestones
Create measurable milestones that indicate progress through the roadmap.

## Recommended Timeline
Provide a realistic sequence for completing the roadmap.

## AI Roadmap Recommendations
Give 5 actionable recommendations.

Rules:
- Use simple and practical language.
- Do not invent qualifications, experience, projects, or achievements.
- Base the roadmap only on the information provided.
- Make recommendations realistic for the stated experience level.
- Clearly distinguish current skills from future goals.
`.trim();

  const response = await apiClient.post<ChatResponse>(
    "/chat",
    {
      question: prompt,
      conversation_id: null,
    }
  );

  return response.data;
}

export async function generateNextBestAction(
  careerGoal?: string,
  targetRole?: string,
  currentSkills?: string,
  currentProgress?: unknown,
  recentActivity?: unknown
) {
  const response = await apiClient.post(
    "/next-best-action",
    {
      career_goal: careerGoal ?? null,
      target_role: targetRole ?? null,
      current_skills: currentSkills ?? null,
      current_progress: currentProgress ?? null,
      recent_activity: recentActivity ?? null,
    }
  );

  return response.data;
}


export async function sendCopilotMessageStream(
  question: string,
  conversationId: number | null | undefined,
  onToken: (token: string) => void,
): Promise<ChatResponse> {
  const token = localStorage.getItem("ai_nexus_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"}/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify({
        question,
        conversation_id: conversationId ?? null,
      }),
    },
  );

  if (!response.ok) {
    let detail = "Unable to connect to AI-NEXUS.";

    try {
      const errorData = await response.json();
      detail = errorData?.detail || detail;
    } catch {
      // Keep the default error message.
    }

    if (response.status === 401) {
      throw new Error(
        "Your login session has expired. Please sign in again.",
      );
    }

    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error(
      "The AI streaming response is not available.",
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let finalResponse: ChatResponse | null = null;

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const lines = buffer.split("\n");

    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      let event: any;

      try {
        event = JSON.parse(trimmed);
      } catch {
        continue;
      }

      if (event.type === "token") {
        onToken(event.content || "");
        continue;
      }

      if (event.type === "error") {
        throw new Error(
          event.message ||
            "The AI model failed to generate a response.",
        );
      }

      if (event.type === "complete") {
        finalResponse = event as ChatResponse;
      }
    }
  }

  if (buffer.trim()) {
    try {
      const event = JSON.parse(buffer.trim());

      if (event.type === "token") {
        onToken(event.content || "");
      }

      if (event.type === "error") {
        throw new Error(
          event.message ||
            "The AI model failed to generate a response.",
        );
      }

      if (event.type === "complete") {
        finalResponse = event as ChatResponse;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  if (!finalResponse) {
    throw new Error(
      "The AI model ended the stream without a complete response.",
    );
  }

  return finalResponse;
}

