import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Clock3,
  Cpu,
  FileSearch,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { getRecentActivity } from "../services/activityApi";

interface RecentActivity {
  title: string;
  description: string;
  time: string | null;
  type: string;
  agent_key?: string | null;
  intent?: string | null;
  confidence?: number | null;
}

const AGENTS = [
  {
    key: "academic_learning",
    name: "Academic Learning Agent",
    description: "Explains concepts and answers academic questions.",
    icon: BrainCircuit,
  },
  {
    key: "study_planner",
    name: "Study Planning Agent",
    description: "Creates personalized study plans and schedules.",
    icon: Clock3,
  },
  {
    key: "career_guidance",
    name: "Career Guidance Agent",
    description: "Provides career paths and skill recommendations.",
    icon: Route,
  },
  {
    key: "resume_enhancement",
    name: "Resume Enhancement Agent",
    description: "Improves resumes and professional profiles.",
    icon: Sparkles,
  },
  {
    key: "project_guidance",
    name: "Project Guidance Agent",
    description: "Supports academic and technical project development.",
    icon: Cpu,
  },
  {
    key: "assessment",
    name: "Assessment Agent",
    description: "Generates assessments and evaluates learning.",
    icon: Target,
  },
  {
    key: "interview_preparation",
    name: "Interview Preparation Agent",
    description: "Helps students prepare for interviews.",
    icon: Zap,
  },
];

const formatTime = (value: string | null) => {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStageIcon = (type: string, title: string) => {
  const value = `${type} ${title}`.toLowerCase();

  if (
    value.includes("generated") ||
    value.includes("completed") ||
    value.includes("executed")
  ) {
    return CheckCircle2;
  }

  if (
    value.includes("knowledge") ||
    value.includes("material") ||
    value.includes("search")
  ) {
    return FileSearch;
  }

  if (
    value.includes("decision") ||
    value.includes("understanding") ||
    value.includes("intent")
  ) {
    return BrainCircuit;
  }

  if (
    value.includes("agent") ||
    value.includes("selected") ||
    value.includes("instruction")
  ) {
    return Route;
  }

  return CircleDot;
};

const getStageStyle = (type: string, title: string) => {
  const value = `${type} ${title}`.toLowerCase();

  if (
    value.includes("generated") ||
    value.includes("completed") ||
    value.includes("executed")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    value.includes("knowledge") ||
    value.includes("material") ||
    value.includes("search")
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value.includes("decision") || value.includes("understanding")) {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
};

export default function AgentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadActivity = useCallback(async () => {
    try {
      setError("");

      if (activities.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getRecentActivity(20);
      setActivities(data);
    } catch {
      setError("Unable to load agent activity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activities.length]);

  useEffect(() => {
    loadActivity();
  }, []);

  const agentExecution = useMemo(
    () =>
      activities.find(
        (item) =>
          item.type === "agent" ||
          item.title.toLowerCase().includes("executed"),
      ),
    [activities],
  );

  const currentAgent = useMemo(() => {
    if (!agentExecution?.agent_key) return null;

    return AGENTS.find(
      (agent) => agent.key === agentExecution.agent_key,
    );
  }, [agentExecution]);

  const stageActivities = useMemo(
    () =>
      activities.filter(
        (item) =>
          item.type === "agent_stage" ||
          item.type === "agent",
      ),
    [activities],
  );

  const confidence = agentExecution?.confidence
    ? Math.round(agentExecution.confidence * 100)
    : null;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
              <Sparkles className="h-4 w-4" />
              Agentic AI Monitoring
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Agent Activity
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              Monitor how AI-NEXUS understands requests, selects agents,
              retrieves knowledge, and generates personalized responses.
            </p>
          </div>

          <button
            type="button"
            onClick={loadActivity}
            disabled={loading || refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh activity
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  AI Decision Pipeline
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Real execution stages recorded by the AI orchestration layer.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System online
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : stageActivities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <BrainCircuit className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">
                No agent activity yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Use AI Copilot to create your first agentic execution.
              </p>
            </div>
          ) : (
            <div className="relative space-y-3">
              <div className="absolute bottom-5 left-5 top-5 hidden w-px bg-slate-200 sm:block" />

              {stageActivities.map((item, index) => {
                const Icon = getStageIcon(item.type, item.title);

                return (
                  <div
                    key={`${item.time}-${item.title}-${index}`}
                    className="relative flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-violet-100 hover:bg-violet-50/30"
                  >
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getStageStyle(
                        item.type,
                        item.title,
                      )}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-slate-900">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatTime(item.time)}
                        </div>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>

                      {item.intent && (
                        <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                          Intent: {item.intent}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Current AI Decision
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                The latest specialized agent selected by the orchestrator.
              </p>
            </div>

            {currentAgent ? (
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-violet-100">
                    <currentAgent.icon className="h-6 w-6 text-violet-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                      Specialized agent selected
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {currentAgent.name}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {currentAgent.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white bg-white/80 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Detected intent
                    </p>
                    <p className="mt-1 font-semibold capitalize text-slate-800">
                      {agentExecution?.intent || "General request"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white bg-white/80 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Decision confidence
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {confidence !== null ? `${confidence}%` : "Available"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                The next AI execution will appear here.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Specialized Agents
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Available AI capabilities.
              </p>
            </div>

            <div className="space-y-2">
              {AGENTS.map((agent) => {
                const Icon = agent.icon;
                const active = agent.key === agentExecution?.agent_key;

                return (
                  <div
                    key={agent.key}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                      active
                        ? "border-violet-200 bg-violet-50"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-white" : "bg-white"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          active
                            ? "text-violet-600"
                            : "text-slate-500"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {agent.name}
                      </p>

                      {active && (
                        <p className="mt-0.5 text-xs font-medium text-violet-600">
                          Active in latest decision
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Agentic Feedback Loop
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              How AI-NEXUS converts a student request into personalized action.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {[
              ["01", "Student request", "Question or goal enters AI Copilot."],
              ["02", "Intent detection", "The orchestrator understands the request."],
              ["03", "Agent selection", "A specialized AI agent is selected."],
              ["04", "Task execution", "Knowledge and AI reasoning are applied."],
              ["05", "Personalized result", "The response feeds progress and next actions."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <span className="text-xs font-bold text-violet-600">
                  {number}
                </span>
                <h3 className="mt-2 text-sm font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
