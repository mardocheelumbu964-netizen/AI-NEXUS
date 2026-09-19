import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  GraduationCap,
  Map,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { generateNextBestAction } from "../services/chatApi";
import { getRecentActivity, type RecentActivity } from "../services/activityApi";
import { getAnalyticsOverview, getSkillIntelligence, type SkillIntelligenceResponse } from "../services/analyticsApi";
import { getStudentProfile } from "../services/profileApi";

interface NextBestAction {
  action: string;
  reason: string;
  category: string;
  priority: string;
  estimated_minutes: number;
  suggested_timeframe: string;
  expected_outcome: string;
  next_step: string;
}

const quickActions = [
  {
    title: "AI Copilot",
    description: "Ask anything about learning or career.",
    icon: MessageSquare,
    path: "/copilot",
  },
  {
    title: "Study Assistant",
    description: "Generate a personalized study plan.",
    icon: BookOpen,
    path: "/study-planner",
  },
  {
    title: "Career Guidance",
    description: "Explore roles and career directions.",
    icon: BriefcaseBusiness,
    path: "/career",
  },
  {
    title: "Resume Assistant",
    description: "Improve your resume with AI.",
    icon: FileText,
    path: "/resume",
  },
];

const fallbackActivities: RecentActivity[] = [
  {
    title: "AI Copilot ready",
    description: "Start a conversation with your AI learning and career assistant.",
    time: null,
    type: "conversation",
  },
  {
    title: "No recent activity",
    description: "Your AI activity will appear here as you use the platform.",
    time: null,
    type: "system",
  },
];

function getNextBestActionPath(category: string): string {
  const paths: Record<string, string> = {
    learning: "/study-planner",
    career: "/career",
    skills: "/skills",
    resume: "/resume",
    interview: "/interview",
    project: "/projects",
    assessment: "/assessments",
  };

  return paths[category.toLowerCase()] || "/copilot";
}
function getStoredUserName(): string {
  try {
    const storedUser = localStorage.getItem("ai_nexus_user");

    if (!storedUser) {
      return "Student";
    }

    const user = JSON.parse(storedUser);

    return (
      user?.full_name ||
      user?.name ||
      user?.username ||
      user?.email?.split("@")[0] ||
      "Student"
    );
  } catch {
    return "Student";
  }
}
function getCurrentDateLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatActivityTime(value: string | null): string {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function getActivityIcon(type: string) {
  switch (type) {
    case "document":
      return ShieldCheck;

    case "conversation":
      return MessageSquare;

    default:
      return Activity;
  }
}
export default function Dashboard() {
  const navigate = useNavigate();

  const studentName = getStoredUserName();

  const [nextBestAction, setNextBestAction] =
    useState<NextBestAction | null>(null);

  const [nextBestActionLoading, setNextBestActionLoading] =
    useState(true);

  const [studentProfile, setStudentProfile] =
    useState<Awaited<ReturnType<typeof getStudentProfile>>>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [analytics, setAnalytics] =
    useState<Awaited<ReturnType<typeof getAnalyticsOverview>> | null>(null);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(true);

  const [skillIntelligence, setSkillIntelligence] =
    useState<SkillIntelligenceResponse | null>(null);
  const [skillIntelligenceLoading, setSkillIntelligenceLoading] =
    useState(true);
const [recentActivities, setRecentActivities] =
  useState<RecentActivity[]>([]);

const [activityLoading, setActivityLoading] =
  useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const profile = await getStudentProfile();

        if (active) {
          setStudentProfile(profile);
        }
      } catch (error) {
        console.error("Student profile loading failed:", error);
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();
return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);

        const result = await getAnalyticsOverview();

        if (active) {
          setAnalytics(result);
        }
      } catch (error) {
        console.error("Analytics loading failed:", error);
      } finally {
        if (active) {
          setAnalyticsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSkillIntelligence = async () => {
      try {
        setSkillIntelligenceLoading(true);

        const result = await getSkillIntelligence();

        if (active) {
          setSkillIntelligence(result);
        }
      } catch (error) {
        console.error("Skill Intelligence loading failed:", error);

        if (active) {
          setSkillIntelligence(null);
        }
      } finally {
        if (active) {
          setSkillIntelligenceLoading(false);
        }
      }
    };

    loadSkillIntelligence();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadNextBestAction = async () => {
      try {
        setNextBestActionLoading(true);

        const profile = await getStudentProfile();

        const result = await generateNextBestAction(
          profile?.career_goals || undefined,
          undefined,
          profile?.technical_skills || undefined,
          {
            degree: profile?.degree || null,
            university: profile?.university || null,
            academic_year: profile?.academic_year || null,
            cgpa: profile?.cgpa ?? null,
          },
          [
            "Dashboard opened",
            "Review current learning progress",
          ],
        );

        if (active) {
          setNextBestAction(result);
        }
      } catch (error) {
        console.error("Next Best Action generation failed:", error);
      } finally {
        if (active) {
          setNextBestActionLoading(false);
        }
      }
    };

    loadNextBestAction();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;

    const loadRecentActivities = async () => {
      try {
        setActivityLoading(true);

        const result = await getRecentActivity(8);

        if (active) {
          setRecentActivities(
            Array.isArray(result) && result.length > 0
              ? result
              : fallbackActivities,
          );
        }
      } catch (error) {
        console.error(
          "Recent activity loading failed:",
          error,
        );

        if (active) {
          setRecentActivities(fallbackActivities);
        }
      } finally {
        if (active) {
          setActivityLoading(false);
        }
      }
    };

    loadRecentActivities();

    return () => {
      active = false;
    };
  }, []);


  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              <Sparkles className="h-3 w-3" />
              AI student cockpit
            </span>

            <span className="text-[10px] font-medium text-slate-400">
              {getCurrentDateLabel()}
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Good morning, {studentName}
          </h1>

          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
            Your AI learning and career workspace is ready. Continue where
            you left off or let your AI Copilot decide the next step.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </button>
        </div>
      </section>

      {/* Profile + Copilot */}
      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="saas-card saas-card-hover p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <CircleUserRound className="h-6 w-6" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Student profile
                </p>

                <h2 className="mt-1 text-sm font-extrabold text-slate-900">
                  Learning profile
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-slate-400 transition hover:text-indigo-600"
              aria-label="Open profile"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Education
              </p>

              {profileLoading ? (
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
              ) : (
                <>
                  <p className="mt-1 truncate text-[11px] font-bold text-slate-700">
                    {studentProfile?.degree || "Add degree"}
                  </p>

                  <p className="mt-0.5 truncate text-[9px] text-slate-400">
                    {studentProfile?.university || "Add university"}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Academic score
              </p>

              {profileLoading ? (
                <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="mt-1 text-[11px] font-bold text-slate-700">
                  {studentProfile?.cgpa !== null &&
                  studentProfile?.cgpa !== undefined
                    ? `${studentProfile.cgpa} CGPA`
                    : "Add CGPA"}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <Clock3 className="h-4 w-4 text-violet-500" />
              <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Academic year
              </p>

              {profileLoading ? (
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="mt-1 truncate text-[11px] font-bold text-slate-700">
                  {studentProfile?.academic_year || "Add year"}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <Target className="h-4 w-4 text-amber-500" />
              <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Career goal
              </p>

              {profileLoading ? (
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="mt-1 truncate text-[11px] font-bold text-slate-700">
                  {studentProfile?.career_goals || "Add career goal"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Technical skills
                </p>

                {profileLoading ? (
                  <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">
                    {studentProfile?.technical_skills || "Add your technical skills"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition duration-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.24)] sm:p-7">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-4 w-4 text-indigo-300" />
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                    AI Copilot
                  </span>
                </div>

                <h2 className="mt-5 max-w-xl text-xl font-black tracking-tight sm:text-2xl">
                  Your intelligent partner for learning and career growth.
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300">
                  Ask questions, analyze study material, plan your learning,
                  improve your resume, prepare for interviews, or get career
                  guidance through one intelligent AI interface.
                </p>
              </div>

              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:flex">
                <Zap className="h-6 w-6 text-amber-300" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[9px] font-semibold text-slate-200">
                Personalized
              </span>

              <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[9px] font-semibold text-slate-200">
                Agentic
              </span>

              <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[9px] font-semibold text-slate-200">
                RAG enabled
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/copilot")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-extrabold text-slate-900 transition hover:bg-slate-100"
            >
              Open AI Copilot
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
      {/* Main intelligence grid */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Next Best Action */}
        <div className="saas-card saas-card-hover overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-500">
                AI recommendation
              </p>

              <h2 className="mt-1 text-base font-extrabold text-slate-950">
                Next Best Action
              </h2>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_210px]">
            <div>
              {nextBestActionLoading ? (
                <div className="animate-pulse">
                  <div className="inline-flex rounded-lg bg-slate-100 px-3 py-2">
                    <div className="h-2 w-20 rounded bg-slate-200" />
                  </div>

                  <div className="mt-5 h-5 w-3/4 rounded bg-slate-200" />

                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-3 w-5/6 rounded bg-slate-100" />
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                  </div>

                  <div className="mt-5 h-9 w-44 rounded-xl bg-slate-200" />
                </div>
              ) : nextBestAction ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                      {nextBestAction.priority} priority
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">
                    {nextBestAction.action}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {nextBestAction.reason}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                      {nextBestAction.category}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {nextBestAction.estimated_minutes} min
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {nextBestAction.suggested_timeframe}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(getNextBestActionPath(nextBestAction.category))}
                    className="saas-button saas-button-primary mt-5"
                  >
                    Start recommended action
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Recommendation unavailable
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">
                    Continue your learning journey
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    AI recommendations are temporarily unavailable. Continue
                    working on your study plan or ask AI Copilot for guidance.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/copilot")}
                    className="saas-button saas-button-primary mt-5"
                  >
                    Ask AI Copilot
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Expected impact
              </p>

              {nextBestActionLoading ? (
                <div className="mt-5 space-y-4 animate-pulse">
                  <div>
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200" />
                  </div>

                  <div>
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="mt-2 h-8 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ) : nextBestAction ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-slate-500">
                        Recommended effort
                      </span>

                      <span className="text-indigo-600">
                        {nextBestAction.estimated_minutes} min
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              20,
                              nextBestAction.estimated_minutes,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Expected outcome
                    </p>

                    <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-600">
                      {nextBestAction.expected_outcome}
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                      AI timeframe
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-slate-800">
                      {nextBestAction.suggested_timeframe}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-[11px] leading-5 text-slate-500">
                    AI impact information is temporarily unavailable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI System Status */}
        <div className="saas-card saas-card-hover p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                System status
              </p>

              <h2 className="mt-1 text-base font-extrabold text-slate-950">
                AI Copilot
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[9px] font-bold text-emerald-700">
                Online
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              ["Intent detection", "Ready"],
              ["Specialized agents", "7 active"],
              ["Knowledge retrieval", "Ready"],
              ["Local AI model", "Online"],
            ].map(([label, status]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
              >
                <span className="text-[11px] font-semibold text-slate-600">
                  {label}
                </span>

                <span className="text-[10px] font-bold text-emerald-600">
                  {status}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/copilot")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            Open AI Copilot
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* Progress and skill intelligence */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="saas-card saas-card-hover p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-500">
                Learning analytics
              </p>

              <h2 className="mt-1 text-base font-extrabold text-slate-950">
                Progress overview
              </h2>
            </div>

            <BarChart3 className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            {[
              [
                "Study progress",
                analytics?.study_progress ?? 0,
              ],
              [
                "Career readiness",
                analytics?.career_readiness ?? 0,
              ],
              [
                "Resume readiness",
                analytics?.resume_readiness ?? 0,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {label}
                  </span>

                  {analyticsLoading ? (
                    <div className="h-3 w-8 animate-pulse rounded bg-slate-200" />
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-600">
                      {Number(value)}%
                    </span>
                  )}
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  {analyticsLoading ? (
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-200" />
                  ) : (
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(value)),
                        )}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/progress")}
            className="mt-6 flex items-center gap-2 text-[10px] font-bold text-indigo-600"
          >
            View detailed progress
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="saas-card saas-card-hover p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-500">
                Skill intelligence
              </p>

              <h2 className="mt-1 text-base font-extrabold text-slate-950">
                Current skill gaps
              </h2>
            </div>

            <Target className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            {skillIntelligenceLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="h-2 w-16 rounded bg-slate-200" />
                    </div>
                    <div className="h-3 w-8 rounded bg-slate-200" />
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-200" />
                </div>
              ))
            ) : skillIntelligence?.skills?.length ? (
              <>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-violet-500">
                      Overall skill readiness
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Based on your current student profile
                    </p>
                  </div>

                  <span className="text-lg font-extrabold text-violet-600">
                    {skillIntelligence.overall_score}%
                  </span>
                </div>

                {skillIntelligence.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-700">
                          {skill.name}
                        </p>
                        <p className="mt-0.5 text-[9px] text-slate-400">
                          {skill.status}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold text-violet-600">
                        {skill.level}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>

                    <p className="mt-2 text-[9px] leading-4 text-slate-400">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-semibold text-slate-500">
                  Skill intelligence is not available yet.
                </p>
                <p className="mt-1 text-[9px] leading-4 text-slate-400">
                  Add technical skills to your profile to personalize this section.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/skills")}
            className="mt-5 flex items-center gap-2 text-[10px] font-bold text-violet-600"
          >
            Open skill gap analysis
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* Learning metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Weekly study
            </span>
            <Clock3 className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-950">
            {analyticsLoading
              ? "—"
              : `${Number(analytics?.weekly_hours ?? 0).toFixed(1)}h`}
          </p>
          <p className="mt-1 text-[9px] text-slate-400">
            {analyticsLoading
              ? "Loading activity"
              : `Target ${Number(analytics?.weekly_target ?? 18)}h`}
          </p>
        </div>

        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Learning streak
            </span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-950">
            {analyticsLoading
              ? "—"
              : `${Number(analytics?.learning_streak ?? 0)} days`}
          </p>
          <p className="mt-1 text-[9px] text-slate-400">
            Consecutive completed study days
          </p>
        </div>

        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Completed tasks
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-950">
            {analyticsLoading
              ? "—"
              : `${Number(analytics?.completed_tasks ?? 0)}`}
          </p>
          <p className="mt-1 text-[9px] text-slate-400">
            {analyticsLoading
              ? "Loading tasks"
              : `of ${Number(analytics?.total_tasks ?? 0)} study tasks`}
          </p>
        </div>

        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Projects completed
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>

          <p className="mt-3 text-xl font-extrabold text-slate-950">
            {analyticsLoading
              ? "?"
              : `${Number(analytics?.projects_completed ?? 0)}`}
          </p>

          <p className="mt-1 text-[9px] text-slate-400">
            Saved projects marked completed
          </p>
        </div>

        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Weekly target
            </span>
            <Target className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-950">
            {analyticsLoading
              ? "—"
              : `${Number(analytics?.weekly_target_progress ?? 0)}%`}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    Number(analytics?.weekly_target_progress ?? 0),
                  ),
                )}%`,
              }}
            />
          </div>
        </div>
      </section>
      {/* AI activity */}
      <section className="saas-card saas-card-hover overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-500">
              Intelligence timeline
            </p>

            <h2 className="mt-1 text-base font-extrabold text-slate-950">
              Recent AI activity
            </h2>
          </div>

          
        </div>

        <div className="divide-y divide-slate-100">
          {(activityLoading ? fallbackActivities : recentActivities).map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);

            return (
              <div
                key={`${activity.type}-${activity.title}-${index}`}
                className="flex items-center gap-4 px-5 py-4 sm:px-6"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ActivityIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-slate-700">
                    {activity.title}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {activity.description}
                  </p>
                </div>

                <span className="shrink-0 text-[9px] font-semibold text-slate-400">
                  {formatActivityTime(activity.time)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </p>

            <h2 className="mt-1 text-base font-extrabold text-slate-950">
              Quick actions
            </h2>
          </div>

          <Clock3 className="h-4 w-4 text-slate-400" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.path)}
                className="group saas-card saas-card-hover p-4 text-left transition hover:border-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
                </div>

                <h3 className="mt-4 text-xs font-extrabold text-slate-800">
                  {action.title}
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* System footer */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />

          <span className="text-[10px] font-semibold text-slate-500">
            AI Copilot systems operational
          </span>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </span>

          <span className="flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            Personalized
          </span>

          <span className="flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5" />
            Agentic
          </span>
        </div>
      </div>
    </div>
  );
}

































