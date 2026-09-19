import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clipboard,
  Code2,
  Copy,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  Network,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  User,
  Bot,
  Zap,
} from "lucide-react";
import {
  getConversation,
  getConversations,
  sendCopilotMessage,
} from "../services/chatApi";

type ConversationItem = {
  id: number;
  title: string;
  agent_name?: string | null;
  updated_at?: string;
};

type ConversationDetailSafe = ConversationItem & {
  messages?: Array<{
    id?: number;
    role?: string;
    content?: string;
    agent_name?: string | null;
    created_at?: string;
  }>;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  sources?: string[];
  activity?: Array<{
    status: string;
    detail: string;
  }>;
};

function formatAgentName(agent?: string | null) {
  if (!agent) {
    return "AI Copilot";
  }

  return agent
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderContent(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      return (
        <h3
          key={index}
          className="mb-2 mt-5 text-sm font-bold text-slate-900 first:mt-0"
        >
          {trimmed.replace("## ", "")}
        </h3>
      );
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h4
          key={index}
          className="mb-2 mt-4 text-sm font-bold text-slate-800"
        >
          {trimmed.replace("### ", "")}
        </h4>
      );
    }

    if (trimmed.startsWith("- ")) {
      return (
        <div key={index} className="mb-1 flex gap-2 text-sm leading-6">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
          <span>{trimmed.substring(2)}</span>
        </div>
      );
    }

    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }

    return (
      <p key={index} className="mb-2 text-sm leading-6 text-slate-600">
        {line}
      </p>
    );
  });
}

const suggestions = [
  {
    title: "Explain a concept",
    text: "Explain this topic in simple terms",
    icon: BrainCircuit,
  },
  {
    title: "Build a study plan",
    text: "Create a study plan for me",
    icon: Target,
  },
  {
    title: "Find my skill gaps",
    text: "Analyze my skill gap",
    icon: Zap,
  },
  {
    title: "Prepare for interview",
    text: "Help me prepare for an interview",
    icon: MessageSquare,
  },
];

export default function Learning() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileConversations, setMobileConversations] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function loadConversations() {
    try {
      const data = await getConversations();
      setConversations(data);

      if (data.length > 0 && activeConversationId === null) {
        await openConversation(data[0].id);
      }
    } catch (requestError: any) {
      console.error("Failed to load conversations:", requestError);

      if (requestError?.response?.status === 401) {
        setError(
          "Your login session has expired. Please log out and sign in again."
        );
      } else {
        setError("Unable to load your conversations.");
      }
    }
  }

  async function openConversation(id: number) {
    setLoadingConversation(true);
    setError("");
    setMobileConversations(false);

    try {
      const rawConversation = await getConversation(id);

      const conversation =
        rawConversation as unknown as ConversationDetailSafe;

      setActiveConversationId(id);

      const convertedMessages: Message[] = (conversation.messages ?? []).map(
        (message, index) => ({
          id: String(message.id ?? `${id}-${index}`),
          role: message.role === "user" ? "user" : "assistant",
          content: message.content ?? "",
          agent: message.agent_name
            ? formatAgentName(message.agent_name)
            : "AI Copilot",
        })
      );

      setMessages(convertedMessages);
    } catch (requestError: any) {
      console.error("Failed to open conversation:", requestError);

      if (requestError?.response?.status === 401) {
        setError(
          "Your login session has expired. Please log out and sign in again."
        );
      } else {
        setError("Unable to open this conversation.");
      }
    } finally {
      setLoadingConversation(false);
    }
  }

  async function handleSend(customQuestion?: string) {
    const text = (customQuestion ?? question).trim();

    if (!text || loading) {
      return;
    }

    setQuestion("");
    setError("");

    const temporaryUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, temporaryUserMessage]);
    setLoading(true);

    try {
      const response = await sendCopilotMessage(
        text,
        activeConversationId
      );

      if (response.conversation_id) {
        setActiveConversationId(response.conversation_id);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        agent: response.agent || "AI Copilot",
        sources: response.sources ?? [],
        activity: response.activity?.map((item: any) => ({
          status: item.status ?? "Completed",
          detail: item.detail ?? "",
        })),
      };

      setMessages((current) => [...current, assistantMessage]);

      const updatedConversations = await getConversations();
      setConversations(updatedConversations);
    } catch (requestError: any) {
      console.error("Copilot request failed:", requestError);

      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            requestError?.response?.status === 401
              ? "Your login session has expired or is not being sent correctly. Please log out and sign in again."
              : "I couldn't complete that request. Please try again.",
          agent: "AI Copilot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setMobileConversations(false);
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 1600);
    } catch {
      setError("Unable to copy the response.");
    }
  }

  const currentAgent = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");

    return lastAssistant?.agent || "AI Copilot";
  }, [messages]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );

  return (
    <div className="page-enter h-[calc(100vh-8rem)] min-h-[620px] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">

      <div className="relative grid h-full xl:grid-cols-[260px_minmax(0,1fr)_290px]">

        {/* =====================================================
            MOBILE CONVERSATION DRAWER
        ===================================================== */}

        {mobileConversations && (
          <div className="absolute inset-0 z-50 flex xl:hidden">

            <button
              type="button"
              aria-label="Close conversations"
              onClick={() => setMobileConversations(false)}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            />

            <aside className="relative z-10 flex h-full w-[285px] flex-col border-r border-slate-200 bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 p-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                    Conversations
                  </p>
                  <h2 className="mt-1 text-sm font-bold text-slate-900">
                    Your AI workspace
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileConversations(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                >
                  ×
                </button>

              </div>

              <div className="p-4">

                <button
                  type="button"
                  onClick={startNewConversation}
                  className="saas-button saas-button-primary w-full justify-center"
                >
                  <Plus size={15} />
                  New conversation
                </button>

              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-2">

                {conversations.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    No conversations yet.
                  </div>
                ) : (
                  <div className="space-y-1">

                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => void openConversation(conversation.id)}
                        className={`w-full rounded-xl p-3 text-left transition ${
                          activeConversationId === conversation.id
                            ? "bg-violet-50 ring-1 ring-violet-100"
                            : "hover:bg-slate-50"
                        }`}
                      >

                        <div className="flex gap-2.5">

                          <MessageSquare
                            size={14}
                            className="mt-0.5 shrink-0 text-violet-500"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-700">
                              {conversation.title || "New Conversation"}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {formatAgentName(conversation.agent_name)}
                            </p>
                          </div>

                        </div>

                      </button>
                    ))}

                  </div>
                )}

              </div>

            </aside>
          </div>
        )}

        {/* =====================================================
            LEFT SIDEBAR
        ===================================================== */}

        <aside className="hidden border-r border-slate-200 bg-slate-50/70 xl:flex xl:flex-col">

          <div className="border-b border-slate-200 bg-white/70 p-4">

            <button
              type="button"
              onClick={startNewConversation}
              className="saas-button saas-button-primary w-full justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <Plus size={15} />
              New conversation
            </button>

          </div>

          <div className="border-b border-slate-200 px-4 py-3">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <MessageSquare size={12} />
                Recent
              </div>

              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-bold text-violet-600">
                {conversations.length}
              </span>

            </div>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">

            {conversations.length === 0 ? (
              <div className="p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                  <MessageSquare size={17} />
                </div>

                <p className="mt-3 text-[11px] font-semibold text-slate-500">
                  No conversations
                </p>
              </div>
            ) : (
              <div className="space-y-1">

                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void openConversation(conversation.id)}
                    className={`group w-full rounded-xl p-3 text-left transition ${
                      activeConversationId === conversation.id
                        ? "bg-white shadow-sm ring-1 ring-violet-100"
                        : "hover:bg-white"
                    }`}
                  >

                    <div className="flex items-start gap-2.5">

                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          activeConversationId === conversation.id
                            ? "bg-violet-100 text-violet-600"
                            : "bg-white text-slate-400 group-hover:text-violet-500"
                        }`}
                      >
                        <MessageSquare size={13} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[11px] font-bold text-slate-700">
                          {conversation.title || "New Conversation"}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-slate-400">
                          {formatAgentName(conversation.agent_name)}
                        </p>

                      </div>

                    </div>

                  </button>
                ))}

              </div>
            )}

          </div>

          <div className="border-t border-slate-200 bg-white p-4">

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">

              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700">
                <span className="status-dot status-dot-success" />
                AI system online
              </div>

              <p className="mt-1.5 text-[9px] leading-4 text-emerald-700/70">
                Local AI and orchestration services are available.
              </p>

            </div>

          </div>

        </aside>

        {/* =====================================================
            MAIN CHAT
        ===================================================== */}

        <section className="flex min-w-0 flex-col bg-white">

          {/* HEADER */}

          <header className="relative border-b border-slate-200 bg-white">

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

            <div className="flex items-center justify-between px-4 py-4 sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <button
                  type="button"
                  onClick={() => setMobileConversations(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 xl:hidden"
                  title="Conversations"
                >
                  <MessageSquare size={16} />
                </button>

                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm">

                  <Sparkles size={19} />

                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />

                </div>

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                      AI Copilot
                    </h1>

                    <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black tracking-widest text-emerald-700 sm:inline-flex">
                      ONLINE
                    </span>

                  </div>

                  <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
                    {activeConversation?.title ||
                      `Powered by ${currentAgent}`}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <div className="hidden items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50/70 px-3 py-1.5 text-[9px] font-bold text-violet-600 sm:flex">
                  <Bot size={12} />
                  {currentAgent}
                </div>

                <button
                  type="button"
                  onClick={startNewConversation}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                  title="New conversation"
                >
                  <RefreshCw size={15} />
                </button>

              </div>

            </div>

          </header>

          {/* ERROR */}

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* CHAT AREA */}

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.045),transparent_35%)] px-4 py-6 sm:px-6">

            {loadingConversation ? (

              <div className="flex h-full items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Loader2 size={21} className="animate-spin" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    Loading conversation...
                  </p>

                </div>

              </div>

            ) : messages.length === 0 ? (

              <div className="flex h-full items-center justify-center">

                <div className="w-full max-w-2xl">

                  <div className="mx-auto max-w-xl text-center">

                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">

                      <div className="absolute inset-0 rounded-[28px] bg-violet-100/70 blur-md" />

                      <div className="relative flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 animate-float">
                        <Sparkles size={28} />
                      </div>

                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-violet-600">
                      <Zap size={11} />
                      Intelligent student copilot
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      What can I help you accomplish?
                    </h2>

                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                      Ask about studying, career planning, skills, resumes,
                      projects, interviews, or your learning roadmap.
                    </p>

                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">

                    {suggestions.map((suggestion, index) => {

                      const Icon = suggestion.icon;

                      return (
                        <button
                          key={suggestion.text}
                          type="button"
                          onClick={() => void handleSend(suggestion.text)}
                          className={`saas-card animate-fade-up stagger-${index + 1} group flex items-center gap-3 p-4 text-left`}
                        >

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100 group-hover:scale-105">
                            <Icon size={17} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-xs font-bold text-slate-800">
                              {suggestion.title}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {suggestion.text}
                            </p>

                          </div>

                          <ArrowRight
                            size={15}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500"
                          />

                        </button>
                      );
                    })}

                  </div>

                </div>

              </div>

            ) : (

              <div className="mx-auto max-w-3xl space-y-6">

                {messages.map((message, index) => (

                  <div
                    key={message.id}
                    className={`animate-fade-up flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    style={{
                      animationDelay: `${Math.min(index * 35, 250)}ms`,
                    }}
                  >

                    {message.role === "assistant" && (

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 shadow-sm">
                        <Bot size={16} />
                      </div>

                    )}

                    <div
                      className={`max-w-[88%] ${
                        message.role === "user"
                          ? "sm:max-w-[75%]"
                          : "sm:max-w-[85%]"
                      }`}
                    >

                      <div
                        className={`rounded-[22px] px-4 py-4 ${
                          message.role === "user"
                            ? "rounded-tr-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-100"
                            : "rounded-tl-md border border-slate-200 bg-white shadow-sm"
                        }`}
                      >

                        {message.role === "assistant" && message.agent && (

                          <div className="mb-3 flex items-center gap-2">

                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                              <Sparkles size={11} />
                            </div>

                            <span className="text-[9px] font-black uppercase tracking-widest text-violet-600">
                              {message.agent}
                            </span>

                          </div>

                        )}

                        <div
                          className={
                            message.role === "user"
                              ? "text-sm leading-6 text-white"
                              : ""
                          }
                        >
                          {message.role === "assistant"
                            ? renderContent(message.content)
                            : message.content}
                        </div>

                      </div>

                      {message.role === "assistant" && (

                        <div className="mt-2">

                          {message.sources &&
                            message.sources.length > 0 && (

                              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-3">

                                <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-cyan-700">
                                  <FileText size={11} />
                                  Knowledge sources
                                </div>

                                <div className="space-y-1.5">

                                  {message.sources.map((source, sourceIndex) => (

                                    <div
                                      key={`${source}-${sourceIndex}`}
                                      className="rounded-xl border border-white bg-white/80 px-3 py-2 text-[10px] leading-4 text-slate-500"
                                    >
                                      {source}
                                    </div>

                                  ))}

                                </div>

                              </div>

                            )}

                          <div className="mt-2 flex items-center gap-1">

                            <button
                              type="button"
                              onClick={() => void copyMessage(message)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check size={11} />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  Copy
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleSend(
                                  `Improve and expand this response:\n\n${message.content}`
                                )
                              }
                              disabled={loading}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                            >
                              <Lightbulb size={11} />
                              Improve
                            </button>

                          </div>

                        </div>

                      )}

                    </div>

                    {message.role === "user" && (

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <User size={16} />
                      </div>

                    )}

                  </div>

                ))}

                {loading && (

                  <div className="flex gap-3 animate-fade-up">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600">
                      <Bot size={16} />
                    </div>

                    <div className="rounded-[22px] rounded-tl-md border border-slate-200 bg-white px-5 py-4 shadow-sm">

                      <div className="flex items-center gap-3">

                        <div className="flex gap-1">

                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse [animation-delay:300ms]" />

                        </div>

                        <span className="text-[10px] font-bold text-slate-400">
                          AI is thinking...
                        </span>

                      </div>

                    </div>

                  </div>

                )}

                <div ref={bottomRef} />

              </div>

            )}

          </div>

          {/* ===================================================
              COMPOSER
          =================================================== */}

          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">

            <div className="mx-auto max-w-3xl">

              <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-2 shadow-sm transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50">

                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Ask AI Copilot anything..."
                  rows={2}
                  className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                />

                <div className="flex items-center justify-between gap-3 px-2 pb-1">

                  <div className="flex items-center gap-2 text-[9px] text-slate-400">

                    <Code2 size={12} />

                    <span className="hidden sm:inline">
                      Enter to send • Shift + Enter for new line
                    </span>

                    <span className="sm:hidden">
                      Shift + Enter for new line
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!question.trim() || loading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-100 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Send"
                  >
                    {loading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                  </button>

                </div>

              </div>

              <p className="mt-2 text-center text-[9px] text-slate-400">
                AI responses can contain mistakes. Verify important academic
                information with your study material.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            RIGHT AGENT ACTIVITY
        ===================================================== */}

        <aside className="hidden border-l border-slate-200 bg-slate-50/60 xl:flex xl:flex-col">

          <div className="border-b border-slate-200 bg-white p-5">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-violet-600">
                  <Network size={12} />
                  Agent intelligence
                </div>

                <h2 className="mt-1 text-sm font-bold text-slate-900">
                  AI decision flow
                </h2>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BrainCircuit size={16} />
              </div>

            </div>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">

            <div className="space-y-1">

              {[
                {
                  title: "Understanding request",
                  detail: "Detecting intent and context",
                  icon: BrainCircuit,
                },
                {
                  title: "Selecting agent",
                  detail: currentAgent,
                  icon: Bot,
                },
                {
                  title: "Retrieving knowledge",
                  detail: "Checking relevant study context",
                  icon: FileText,
                },
                {
                  title: "Generating response",
                  detail: "Local AI model execution",
                  icon: Sparkles,
                },
                {
                  title: "Updating memory",
                  detail: "Saving conversation context",
                  icon: Clipboard,
                },
              ].map((item, index) => {

                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="relative flex gap-3 rounded-xl p-2 transition hover:bg-white"
                  >

                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-white text-violet-500 shadow-sm">
                      <Icon size={13} />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">

                      <div className="flex items-center gap-2">

                        <p className="text-[10px] font-bold text-slate-700">
                          {item.title}
                        </p>

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      </div>

                      <p className="mt-1 text-[9px] leading-4 text-slate-400">
                        {item.detail}
                      </p>

                    </div>

                    {index < 4 && (
                      <div className="absolute left-[18px] top-10 h-6 border-l border-dashed border-violet-200" />
                    )}

                  </div>
                );
              })}

            </div>

            <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-700">
                <Target size={12} />
                Current context
              </div>

              <p className="mt-2 text-[10px] leading-5 text-violet-700/70">
                Copilot can combine your conversation history, student
                profile, and indexed study material before generating a
                response.
              </p>

            </div>

            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-700">
                <Sparkles size={12} />
                Knowledge layer
              </div>

              <p className="mt-2 text-[10px] leading-5 text-cyan-700/70">
                Uploaded documents can be retrieved through the RAG knowledge
                base when relevant.
              </p>

            </div>

          </div>

          <div className="border-t border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Model
              </span>

              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-bold text-violet-600">
                Llama 3.2
              </span>

            </div>

            <div className="mt-3 flex items-center justify-between">

              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Runtime
              </span>

              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600">
                <span className="status-dot status-dot-success" />
                Local Ollama
              </span>

            </div>

          </div>

        </aside>

      </div>
    </div>
  );
}
