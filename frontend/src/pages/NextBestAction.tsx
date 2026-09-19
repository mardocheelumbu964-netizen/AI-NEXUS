import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  Map,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";

import { generateNextBestAction } from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";
import { getAnalyticsOverview } from "../services/analyticsApi";
import { getRecentActivity, type RecentActivity } from "../services/activityApi";

interface NextBestActionResult {
  action: string;
  reason: string;
  category: string;
  priority: string;
  estimated_minutes: number;
  suggested_timeframe: string;
  expected_outcome: string;
  next_step: string;
}

const categoryConfig: Record<
  string,
  {
    label: string;
    icon: typeof GraduationCap;
    path: string;
  }
> = {
  learning: {
    label: "Learning",
    icon: GraduationCap,
    path: "/study-planner",
  },
  career: {
    label: "Career",
    icon: Briefcase,
    path: "/career",
  },
  skills: {
    label: "Skills",
    icon: Code2,
    path: "/skills",
  },
  resume: {
    label: "Resume",
    icon: FileText,
    path: "/resume",
  },
  interview: {
    label: "Interview",
    icon: MessageSquare,
    path: "/copilot",
  },
  project: {
    label: "Project",
    icon: Code2,
    path: "/copilot",
  },
  assessment: {
    label: "Assessment",
    icon: Target,
    path: "/assessments",
  },
};

const fallbackAction: NextBestActionResult = {
  action: "Start a focused learning session on one skill related to your target role.",
  reason:
    "A focused session creates measurable progress and gives the AI more information about your current learning state.",
  category: "learning",
  priority: "medium",
  estimated_minutes: 30,
  suggested_timeframe: "Today",
  expected_outcome: "Complete one focused learning task and record the result.",
  next_step: "Open Study Assistant and create a focused session.",
};

const getCategory = (category: string) =>
  categoryConfig[category?.toLowerCase()] || categoryConfig.learning;

const getStoredUserName = () => {
  try {
    const raw = localStorage.getItem("ai_nexus_user");

    if (!raw) {
      return "Student";
    }

    const user = JSON.parse(raw);

    return (
      user.full_name ||
      user.name ||
      user.username ||
      user.email?.split("@")[0] ||
      "Student"
    );
  } catch {
    return "Student";
  }
};

const formatTime = (time: string | null) => {
  if (!time) {
    return "Recent";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function NextBestAction() {
  const [result, setResult] = useState<NextBestActionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] =
    useState<Awaited<ReturnType<typeof getStudentProfile>>>(null);
  const [analytics, setAnalytics] =
    useState<Awaited<ReturnType<typeof getAnalyticsOverview>> | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [error, setError] = useState("");

  const studentName = getStoredUserName();

  const loadRecommendation = async () => {
    setLoading(true);
    setError("");

    try {
      const studentProfile = await getStudentProfile();

      setProfile(studentProfile);

      const generated = await generateNextBestAction(
        JSON.stringify(studentProfile || {})
      );

      setResult(generated || fallbackAction);
    } catch (err) {
      console.error("Next Best Action error:", err);
      setResult(fallbackAction);
      setError(
        "AI recommendation could not be refreshed right now. Showing a useful default action.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendation();

    getAnalyticsOverview()
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null));

    getRecentActivity(6)
      .then((data) => setActivities(data))
      .catch(() => setActivities([]));
  }, []);

  const category = getCategory(result?.category || "learning");
  const CategoryIcon = category.icon;

  const handleOpenAction = () => {
    window.location.href = category.path;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Sparkles size={16} />
              Agentic Decision Engine
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Next Best Action
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {studentName}, your AI Copilot analyzes your profile, progress,
              skills, and recent activity to identify the next action that can
              move you forward.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRecommendation}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh recommendation
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <Bot size={27} />
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      AI Recommendation
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                      {result?.category || "learning"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        result?.priority === "high"
                          ? "bg-rose-100 text-rose-700"
                          : result?.priority === "low"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {result?.priority || "medium"} priority
                    </span>
                  </div>

                  <h2 className="max-w-3xl text-xl font-bold leading-8 text-slate-900 sm:text-2xl">
                    {loading
                      ? "Analyzing your current student journey..."
                      : result?.action || fallbackAction.action}
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {result?.reason || fallbackAction.reason}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
                <Zap size={16} className="text-indigo-600" />
                Agent decision
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Clock3 size={15} />
                Estimated time
              </div>
              <p className="text-lg font-bold text-slate-900">
                {result?.estimated_minutes || 30} min
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Map size={15} />
                Timeframe
              </div>
              <p className="text-lg font-bold text-slate-900">
                {result?.suggested_timeframe || "Today"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Target size={15} />
                Category
              </div>
              <p className="text-lg font-bold capitalize text-slate-900">
                {result?.category || "Learning"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <TrendingUp size={15} />
                Expected result
              </div>
              <p className="text-sm font-semibold leading-5 text-slate-800">
                {result?.expected_outcome ||
                  fallbackAction.expected_outcome}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 p-6 sm:p-8">
            <button
              type="button"
              onClick={handleOpenAction}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with this action
              <ArrowRight size={17} />
            </button>

            <p className="mt-3 text-xs text-slate-500">
              The recommendation is personalized from the student information
              currently available to AI-NEXUS.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Lightbulb size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Why this action?
                </h3>
                <p className="text-sm text-slate-500">
                  AI reasoning context
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">
                {result?.reason || fallbackAction.reason}
              </p>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Immediate next step
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm font-semibold leading-6 text-slate-800">
                    {result?.next_step || fallbackAction.next_step}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <CategoryIcon size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Recommended area
                </h3>
                <p className="text-sm text-slate-500">
                  Where AI wants you to focus
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <p className="text-lg font-bold capitalize text-indigo-900">
                {category.label}
              </p>

              <p className="mt-2 text-sm leading-6 text-indigo-800">
                Your current recommendation is focused on this part of your
                learning and career journey.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <UserRound size={19} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Student context
                </h3>
                <p className="text-sm text-slate-500">
                  Information used for personalization
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Degree</span>
                <span className="text-right text-sm font-semibold text-slate-800">
                  {profile?.degree || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">University</span>
                <span className="text-right text-sm font-semibold text-slate-800">
                  {profile?.university || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Academic year</span>
                <span className="text-right text-sm font-semibold text-slate-800">
                  {profile?.academic_year || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">CGPA</span>
                <span className="text-right text-sm font-semibold text-slate-800">
                  {profile?.cgpa ?? "Not provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={19} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Current progress signals
                </h3>
                <p className="text-sm text-slate-500">
                  Available platform analytics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {analytics?.study_progress ?? 0}%
                </p>
                <p className="mt-1 text-xs text-slate-500">Study</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {analytics?.career_readiness ?? 0}%
                </p>
                <p className="mt-1 text-xs text-slate-500">Career</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {analytics?.resume_readiness ?? 0}%
                </p>
                <p className="mt-1 text-xs text-slate-500">Resume</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock3 size={19} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Recent AI activity
              </h3>
              <p className="text-sm text-slate-500">
                Recent signals that can influence future recommendations
              </p>
            </div>
          </div>

          {activities.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.title}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600">
                      <Sparkles size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {activity.title}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {activity.description}
                      </p>

                      <p className="mt-2 text-[11px] font-medium text-slate-400">
                        {formatTime(activity.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              No recent AI activity is available yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}



