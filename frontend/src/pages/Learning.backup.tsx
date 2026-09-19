import {
  Bot,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Loader2,
  Send,
  Sparkles,
  Target,
  UserRound,
  Zap,
} from "lucide-react";

import { useState } from "react";

import type { FormEvent } from "react";

import { sendChatMessage } from "../services/chatApi";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  agent?: string;
}

const quickPrompts = [
  "Explain machine learning in simple terms",
  "Create a study plan for my exams",
  "Suggest a project for my career goals",
  "Help me prepare for a technical interview",
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I am your AI Learning Tutor. Ask me an academic question, request a study plan, explore a project idea, or get career and interview guidance. I will route your request to the appropriate AI-NEXUS agent.",
    agent: "AI-NEXUS Learning Engine",
  },
];

export default function Learning() {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [activeAgent, setActiveAgent] = useState(
    "AI-NEXUS Learning Engine",
  );

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    const question = input.trim();

    if (!question || loading) {
      return;
    }

    setError("");

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response =
        await sendChatMessage(question);

      setActiveAgent(response.agent);

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.answer,
        agent: response.agent,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the AI Tutor. Please make sure the AI-NEXUS backend and Ollama are running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (
    prompt: string,
  ) => {
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages(initialMessages);
    setActiveAgent("AI-NEXUS Learning Engine");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">

        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-100/60 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-200">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>

              <div>

                <div className="mb-2 flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-600">
                    GENERATIVE AI
                  </span>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AI Engine Online
                  </span>

                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  AI Learning Studio
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Your personalized AI-powered learning environment
                  for academic understanding, study planning,
                  projects, assessments and career preparation.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-3 gap-3">

              <Metric
                icon={<BookOpen className="h-4 w-4" />}
                value="24"
                label="Topics"
              />

              <Metric
                icon={<Clock3 className="h-4 w-4" />}
                value="18h"
                label="Learning"
              />

              <Metric
                icon={<Target className="h-4 w-4" />}
                value="78%"
                label="Progress"
              />

            </div>

          </div>

        </div>

      </section>

      {/* Learning Modes */}
      <section className="mt-6">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Intelligent Learning Modes
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              AI-NEXUS adapts the experience to your learning needs
            </p>
          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <ModeCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="AI Tutor"
            description="Ask questions and receive personalized explanations."
            active
          />

          <ModeCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Concept Learning"
            description="Understand difficult academic concepts step by step."
          />

          <ModeCard
            icon={<Target className="h-5 w-5" />}
            title="Adaptive Practice"
            description="Practice questions based on your learning needs."
          />

          <ModeCard
            icon={<Sparkles className="h-5 w-5" />}
            title="AI Recommendations"
            description="Discover personalized learning opportunities."
          />

        </div>

      </section>

      {/* Main Workspace */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">

        {/* AI Tutor */}
        <div className="flex min-h-[680px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Chat Header */}
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    AI Tutor
                  </h2>

                  <div className="mt-0.5 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-medium text-slate-400">
                      Personalized AI learning assistant
                    </span>

                  </div>

                </div>

              </div>

              <button
                onClick={clearChat}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              >
                New Chat
              </button>

            </div>

          </div>

          {/* Active Agent */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active AI Agent
              </span>

              <span className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600">

                <Zap className="h-3.5 w-3.5" />

                {activeAgent}

              </span>

            </div>

          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">

            {messages.map((message) => (

              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {message.role === "assistant" && (

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>

                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "rounded-br-md bg-slate-900 text-white"
                      : "rounded-bl-md border border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >

                  {message.agent && (
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-violet-500">
                      <Sparkles className="h-3 w-3" />
                      {message.agent}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>

                </div>

                {message.role === "user" && (

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <UserRound className="h-4 w-4 text-slate-500" />
                  </div>

                )}

              </div>

            ))}

            {loading && (

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-2">

                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />

                    <span className="text-xs font-semibold text-slate-500">
                      AI-NEXUS is thinking...
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>

          {/* Error */}
          {error && (

            <div className="mx-5 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600 sm:mx-6">
              {error}
            </div>

          )}

          {/* Quick Prompts */}
          <div className="border-t border-slate-100 px-5 py-3 sm:px-6">

            <div className="mb-2 flex items-center gap-2">

              <Sparkles className="h-3.5 w-3.5 text-violet-500" />

              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Quick Prompts
              </span>

            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">

              {quickPrompts.map((prompt) => (

                <button
                  key={prompt}
                  onClick={() =>
                    handleQuickPrompt(prompt)
                  }
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  {prompt}
                </button>

              ))}

            </div>

          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-white p-4 sm:p-5"
          >

            <div className="flex items-end gap-3">

              <div className="relative flex-1">

                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (!loading) {
                        handleSubmit(
                          event as unknown as FormEvent,
                        );
                      }
                    }
                  }}
                  rows={2}
                  placeholder="Ask your AI Tutor anything..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />

              </div>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-100 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}

              </button>

            </div>

            <p className="mt-2 text-[10px] text-slate-400">
              Press Enter to send • Shift + Enter for a new line
            </p>

          </form>

        </div>

        {/* Learning Intelligence */}
        <div className="space-y-6">

          {/* Current Focus */}
          <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Target className="h-5 w-5 text-cyan-600" />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                  Current Focus
                </p>

                <h3 className="font-bold text-slate-900">
                  Personalized Learning
                </h3>

              </div>

            </div>

            <div className="mt-5 rounded-2xl border border-white bg-white/80 p-4">

              <p className="text-xs font-bold text-slate-400">
                RECOMMENDED TOPIC
              </p>

              <p className="mt-1 text-base font-bold text-slate-800">
                Generative AI Fundamentals
              </p>

              <div className="mt-4 flex items-center justify-between text-xs">

                <span className="font-medium text-slate-400">
                  Progress
                </span>

                <span className="font-bold text-cyan-600">
                  72%
                </span>

              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                  style={{
                    width: "72%",
                  }}
                />

              </div>

            </div>

          </div>

          {/* Subject Progress */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h3 className="font-bold text-slate-900">
                  Subject Progress
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  AI-monitored learning performance
                </p>

              </div>

              <BookOpen className="h-5 w-5 text-slate-300" />

            </div>

            <div className="space-y-4">

              <ProgressRow
                subject="Python"
                progress={86}
              />

              <ProgressRow
                subject="Database Systems"
                progress={78}
              />

              <ProgressRow
                subject="Machine Learning"
                progress={72}
              />

              <ProgressRow
                subject="Cybersecurity"
                progress={64}
              />

            </div>

          </div>

          {/* AI Capabilities */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  AI Capabilities
                </h3>

                <p className="text-xs text-slate-400">
                  Agentic learning intelligence
                </p>

              </div>

            </div>

            <div className="space-y-2">

              <Capability text="Personalized explanations" />

              <Capability text="Adaptive study guidance" />

              <Capability text="Career-aware learning" />

              <Capability text="Project recommendations" />

              <Capability text="Interview preparation" />

            </div>

          </div>

        </div>

      </section>

      {/* Learning Engine Architecture */}
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <BrainCircuit className="h-5 w-5 text-violet-600" />

              <h2 className="font-bold text-slate-900">
                Agentic Learning Engine
              </h2>

            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              AI-NEXUS analyzes your request, identifies the
              appropriate specialized AI agent, incorporates
              your personalization context, and generates a
              response using the local Generative AI engine.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <EngineStep
              label="Student"
              icon={<UserRound className="h-4 w-4" />}
            />

            <ChevronRight className="h-4 w-4 text-slate-300" />

            <EngineStep
              label="Orchestrator"
              icon={<BrainCircuit className="h-4 w-4" />}
            />

            <ChevronRight className="h-4 w-4 text-slate-300" />

            <EngineStep
              label="AI Agent"
              icon={<Bot className="h-4 w-4" />}
            />

            <ChevronRight className="h-4 w-4 text-slate-300" />

            <EngineStep
              label="LLM"
              icon={<Sparkles className="h-4 w-4" />}
            />

          </div>

        </div>

      </section>

      {/* Footer */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">

        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            AI-NEXUS Generative AI Learning Engine
          </p>

          <p>
            Powered by Agentic AI + Local LLM
          </p>

          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            AI System Ready
          </span>

        </div>

      </section>

    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">

      <div className="flex justify-center text-cyan-600">
        {icon}
      </div>

      <p className="mt-1 text-lg font-black text-slate-900">
        {value}
      </p>

      <p className="text-[10px] font-semibold text-slate-400">
        {label}
      </p>

    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        active
          ? "border-cyan-200 bg-gradient-to-br from-cyan-50 to-white"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? "bg-cyan-500 text-white"
            : "bg-slate-50 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>

      {active && (
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-cyan-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Active
        </div>
      )}

    </div>
  );
}

function ProgressRow({
  subject,
  progress,
}: {
  subject: string;
  progress: number;
}) {
  return (
    <div>

      <div className="mb-1.5 flex items-center justify-between">

        <span className="text-xs font-semibold text-slate-600">
          {subject}
        </span>

        <span className="text-xs font-bold text-slate-500">
          {progress}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
}

function Capability({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">

      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

      <span className="text-xs font-semibold text-slate-600">
        {text}
      </span>

    </div>
  );
}

function EngineStep({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

      <span className="text-violet-600">
        {icon}
      </span>

      <span className="text-xs font-bold text-slate-600">
        {label}
      </span>

    </div>
  );
}

