import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  User,
  X,
  Zap,
} from "lucide-react";

import apiClient from "../services/apiClient";
import {
  sendCopilotMessageStream,
  type ChatActivity,
} from "../services/chatApi";

interface Conversation {
  id: number;
  title: string;
  agent_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ConversationMessage {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  agent_name?: string | null;
  created_at?: string;
}

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  agentKey?: string;
  sources?: string[];
  activity?: ChatActivity[];
  confidence?: number | null;
  intent?: string | null;
}

const agentLabels: Record<string, string> = {
  academic: "Academic Learning Agent",
  study: "Study Planning Agent",
  career: "Career Guidance Agent",
  resume: "Resume Enhancement Agent",
  project: "Project Guidance Agent",
  assessment: "Assessment Agent",
  interview: "Interview Preparation Agent",
  copilot: "AI Copilot",
};

const contextOptions = [
  {
    key: "copilot",
    label: "AI Copilot",
    description: "General personalized student assistance",
    icon: Sparkles,
  },
  {
    key: "academic",
    label: "Study",
    description: "Concepts, exams, notes and learning",
    icon: MessageSquare,
  },
  {
    key: "career",
    label: "Career",
    description: "Career direction and employability",
    icon: Target,
  },
  {
    key: "resume",
    label: "Resume",
    description: "Resume and professional profile",
    icon: FileText,
  },
  {
    key: "project",
    label: "Projects",
    description: "Project development and guidance",
    icon: Clipboard,
  },
  {
    key: "study",
    label: "Roadmap",
    description: "Personalized study planning",
    icon: ArrowRight,
  },
];

const suggestions = [
  "Teach me Python from the basics",
  "What should I learn next for my career?",
  "Analyze my current skill gap",
  "Create a study plan for my exams",
  "Explain this topic in simple language",
  "Help me prepare for a technical interview",
];

function formatAnswer(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h3>$1</h3>")
    .replace(/^# (.*)$/gm, "<h2>$1</h2>")
    .replace(/^\s*[-*]\s+(.*)$/gm, "• $1")
    .replace(/\n/g, "<br />");
}

function conversationToMessages(
  messages: ConversationMessage[],
): UIMessage[] {
  return messages.map((message) => ({
    id: `saved-${message.id}`,
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
    agentName: message.agent_name || undefined,
  }));
}

export default function Copilot() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activity, setActivity] = useState<ChatActivity[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [selectedContext, setSelectedContext] = useState("copilot");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedMode =
    contextOptions.find((item) => item.key === selectedContext) ||
    contextOptions[0];

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  const latestAssistant = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant"),
    [messages],
  );

  async function loadConversations() {
    try {
      setLoadingConversations(true);

      const response = await apiClient.get<Conversation[]>(
        "/conversations/",
      );

      setConversations(response.data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function openConversation(id: number) {
    try {
      setError("");
      setLoading(true);

      const response = await apiClient.get<{
        conversation: Conversation;
        messages: ConversationMessage[];
      }>(`/conversations/${id}`);

      setConversationId(response.data.conversation.id);
      setMessages(conversationToMessages(response.data.messages));
      setActivity([]);
      setSources([]);
      setShowSources(false);
      setShowMobileHistory(false);
    } catch (err) {
      console.error("Failed to open conversation:", err);
      setError("Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setActivity([]);
    setSources([]);
    setError("");
    setInput("");
    setShowSources(false);
    setShowMobileHistory(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  async function handleSend(forcedMessage?: string) {
    const question = (forcedMessage ?? input).trim();

    if (!question || loading) {
      return;
    }

    setError("");
    setLoading(true);
    setInput("");

    const userMessage: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const contextInstruction =
        selectedContext === "copilot"
          ? ""
          : `Respond specifically as my ${selectedMode.label}. ${selectedMode.description}.`;

      const finalQuestion = contextInstruction
        ? `${contextInstruction}\n\nStudent request:\n${question}`
        : question;

      const assistantId = `assistant-${Date.now()}`;

      const streamingMessage: UIMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        agentName: "AI Copilot",
        agentKey: "copilot",
        sources: [],
        activity: [],
        confidence: null,
        intent: null,
      };

      setMessages((previous) => [
        ...previous,
        streamingMessage,
      ]);

      let streamedAnswer = "";

      const response = await sendCopilotMessageStream(
        finalQuestion,
        conversationId,
        (token) => {
          streamedAnswer += token;

          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: streamedAnswer,
                  }
                : message,
            ),
          );
        },
      );

      const responseActivity = response.activity || [];

      const confidence =
        responseActivity.find(
          (item) =>
            item.confidence !== null &&
            item.confidence !== undefined,
        )?.confidence ?? null;

      const intent =
        responseActivity.find(
          (item) => item.intent,
        )?.intent ?? null;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: response.answer || streamedAnswer,
                agentName:
                  response.agent ||
                  agentLabels[response.agent_key] ||
                  "AI Copilot",
                agentKey: response.agent_key,
                sources: response.sources || [],
                activity: responseActivity,
                confidence,
                intent,
              }
            : message,
        ),
      );

      setActivity(responseActivity);
      setSources(response.sources || []);

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      await loadConversations();

    } catch (err: any) {
      console.error(
        "AI Copilot streaming request failed:",
        err,
      );

      const message =
        err?.message ||
        "Unable to connect to AI-NEXUS. Please make sure the backend and Ollama are running.";

      setError(message);

      setMessages((previous) => {
        const lastMessage =
          previous[previous.length - 1];

        if (
          lastMessage?.role === "assistant" &&
          lastMessage.content === ""
        ) {
          return previous.slice(0, -1);
        }

        return previous;
      });

    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }
  async function copyMessage(message: UIMessage) {
    try {
      await navigator.clipboard.writeText(message.content);

      setCopiedId(message.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  async function regenerate() {
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage || loading) {
      return;
    }

    await handleSend(lastUserMessage.content);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="status-dot status-dot-success" />

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Agentic AI
            </span>

            <span className="text-xs text-slate-400">
              Local AI online
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            AI Copilot
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Your intelligent partner for learning, career growth,
            projects, skills, and employability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/agent-activity")}
          className="saas-button saas-button-secondary self-start lg:self-auto"
        >
          <Activity size={15} />
          Agent Activity
        </button>
      </div>

      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_285px]">
        <aside className="hidden border-r border-slate-200 bg-slate-50/70 lg:block">
          <div className="border-b border-slate-200 p-4">
            <button
              type="button"
              onClick={startNewConversation}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
            >
              <Plus size={15} />
              New conversation
            </button>
          </div>

          <div className="border-b border-slate-200 p-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
            />
          </div>

          <div className="border-b border-slate-200 p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Context
            </p>

            <div className="space-y-1">
              {contextOptions.slice(0, 6).map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedContext(item.key)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-medium transition ${
                      selectedContext === item.key
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Recent conversations
            </p>

            <div className="space-y-1">
              {loadingConversations ? (
                <div className="px-2 py-3 text-[10px] text-slate-400">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-2 py-3 text-[10px] text-slate-400">
                  No conversations yet.
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                      conversationId === conversation.id
                        ? "bg-white shadow-sm"
                        : "hover:bg-white"
                    }`}
                  >
                    <MessageSquare
                      size={13}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <span className="line-clamp-2 text-[10px] leading-4 text-slate-600">
                      {conversation.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileHistory(true)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <MessageSquare size={17} />
              </button>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {selectedMode.label}
                </p>

                <p className="text-[10px] text-slate-400">
                  {selectedMode.description}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowContextMenu((value) => !value)
                }
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Context
                <ChevronDown size={13} />
              </button>

              {showContextMenu && (
                <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {contextOptions.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setSelectedContext(item.key);
                        setShowContextMenu(false);
                      }}
                      className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
                    >
                      <item.icon
                        size={14}
                        className="mt-0.5 text-indigo-500"
                      />

                      <span>
                        <span className="block text-[10px] font-semibold text-slate-700">
                          {item.label}
                        </span>

                        <span className="block text-[9px] leading-4 text-slate-400">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={startNewConversation}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="New conversation"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <div className="w-full max-w-2xl">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Sparkles size={30} />
                  </div>

                  <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900">
                      How can I help you today?
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Ask about your subjects, study plan, career,
                      resume, projects, skills, or interview
                      preparation.
                    </p>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        className="rounded-xl border border-slate-200 bg-white p-4 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/40"
                      >
                        <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <Zap size={14} />
                        </div>

                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Bot size={16} />
                        </div>
                      )}

                      <div className="max-w-[88%]">
                        {!isUser && message.agentName && (
                          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                            {message.agentName}
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                            isUser
                              ? "rounded-br-md bg-slate-900 text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                          }`}
                        >
                          {isUser ? (
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          ) : (
                            <div
                              className="prose prose-sm max-w-none prose-headings:mb-2 prose-headings:mt-3"
                              dangerouslySetInnerHTML={{
                                __html: formatAnswer(
                                  message.content,
                                ),
                              }}
                            />
                          )}
                        </div>

                        {!isUser && (
                          <div className="mt-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyMessage(message)}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Copy"
                            >
                              {copiedId === message.id ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Bot size={16} />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 sm:mx-6">
              {error}
            </div>
          )}

          <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ask AI Copilot anything..."
                  className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <div className="flex items-center justify-between px-2 pb-1">
                  <p className="text-[10px] text-slate-400">
                    Enter to send • Shift + Enter for a new line
                  </p>

                  <button
                    type="button"
                    disabled={loading || !input.trim()}
                    onClick={() => handleSend()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-slate-200 bg-slate-50/50 xl:block">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={17}
                className="text-indigo-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  AI Decision Engine
                </p>

                <p className="text-[10px] text-slate-400">
                  Live agent orchestration
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-4">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Agent Activity
                </p>

                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                  LIVE
                </span>
              </div>

              <div className="space-y-2">
                {activity.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-medium text-slate-500">
                      Waiting for request
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-slate-400">
                      The AI pipeline will appear here when you
                      send a request.
                    </p>
                  </div>
                ) : (
                  activity.map((item, index) => {
                    const isCompleted =
                      item.status
                        ?.toLowerCase()
                        .includes("completed") ||
                      item.status
                        ?.toLowerCase()
                        .includes("generated");

                    const isProcessing =
                      item.status
                        ?.toLowerCase()
                        .includes("progress") ||
                      item.status
                        ?.toLowerCase()
                        .includes("generating");

                    return (
                      <div
                        key={`${item.step}-${index}`}
                        className="flex gap-2"
                      >
                        <div
                          className={`mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-600"
                              : isProcessing
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={9} />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold text-slate-700">
                            {item.label || item.step}
                          </p>

                          <p className="mt-0.5 text-[9px] leading-4 text-slate-400">
                            {item.detail || item.status}
                          </p>

                          {(item.intent ||
                            item.confidence !== null &&
                              item.confidence !== undefined) && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.intent && (
                                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-medium text-indigo-600">
                                  {item.intent}
                                </span>
                              )}

                              {item.confidence !== null &&
                                item.confidence !==
                                  undefined && (
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-500">
                                    {Math.round(
                                      item.confidence * 100,
                                    )}
                                    % confidence
                                  </span>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {latestAssistant && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600">
                    <Bot size={15} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-indigo-900">
                      Selected Agent
                    </p>

                    <p className="truncate text-[9px] text-indigo-600">
                      {latestAssistant.agentName}
                    </p>
                  </div>
                </div>

                {latestAssistant.intent && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] text-indigo-500">
                      Detected intent
                    </span>

                    <span className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-indigo-600">
                      {latestAssistant.intent}
                    </span>
                  </div>
                )}

                {latestAssistant.confidence !== null &&
                  latestAssistant.confidence !== undefined && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] text-indigo-500">
                        Decision confidence
                      </span>

                      <span className="text-[9px] font-semibold text-indigo-700">
                        {Math.round(
                          latestAssistant.confidence * 100,
                        )}
                        %
                      </span>
                    </div>
                  )}
              </div>
            )}

            <div>
              <p className="mb-3 text-xs font-semibold text-slate-700">
                Specialized Agents
              </p>

              <div className="space-y-2">
                {Object.entries(agentLabels)
                  .filter(([key]) => key !== "copilot")
                  .map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <span className="truncate text-[10px] font-medium text-slate-600">
                        {label}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {sources.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setShowSources((value) => !value)
                  }
                  className="flex w-full items-center justify-between text-xs font-semibold text-slate-700"
                >
                  <span>Retrieved Sources</span>

                  <ChevronDown
                    size={15}
                    className={
                      showSources ? "rotate-180" : ""
                    }
                  />
                </button>

                {showSources && (
                  <div className="mt-2 space-y-2">
                    {sources.map((source, index) => (
                      <div
                        key={`${source}-${index}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] leading-4 text-slate-500"
                      >
                        {source}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.some(
              (message) => message.role === "assistant",
            ) && (
              <button
                type="button"
                disabled={loading}
                onClick={regenerate}
                className="saas-button saas-button-secondary w-full justify-center"
              >
                <RefreshCw size={14} />
                Regenerate response
              </button>
            )}

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-indigo-600">
                  <Clipboard size={14} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-indigo-900">
                    Personalized AI
                  </p>

                  <p className="text-[9px] text-indigo-600">
                    Profile + memory + RAG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showMobileHistory && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close conversation history"
            onClick={() => setShowMobileHistory(false)}
            className="absolute inset-0 bg-slate-950/30"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[290px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Conversations
                </p>

                <p className="text-[10px] text-slate-400">
                  Your Copilot history
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileHistory(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={startNewConversation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white"
              >
                <Plus size={15} />
                New conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      openConversation(conversation.id)
                    }
                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <MessageSquare
                      size={13}
                      className="mt-0.5 text-slate-400"
                    />

                    <span className="text-[10px] leading-4 text-slate-600">
                      {conversation.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}





