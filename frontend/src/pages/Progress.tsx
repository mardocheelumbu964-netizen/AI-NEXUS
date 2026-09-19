import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Lightbulb,
  Loader2,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import {
  getAnalyticsOverview,
  type AnalyticsOverview,
} from "../services/analyticsApi";

const fallbackAnalytics: AnalyticsOverview = {
  study_progress: 72,
  career_readiness: 64,
  resume_readiness: 78,
  skill_progress: 68,
  projects_completed: 0,
  assessments_completed: 0,
  study_hours: 19.4,
};

const fallbackWeeklyActivity = [
  { day: "Mon", hours: 0 },
  { day: "Tue", hours: 0 },
  { day: "Wed", hours: 0 },
  { day: "Thu", hours: 0 },
  { day: "Fri", hours: 0 },
  { day: "Sat", hours: 0 },
  { day: "Sun", hours: 0 },
];

const fallbackSkills = [
  { name: "Programming", progress: 0, change: "Profile based" },
  { name: "Problem Solving", progress: 0, change: "Profile based" },
  { name: "Communication", progress: 0, change: "Profile based" },
  { name: "AI & ML", progress: 0, change: "Profile based" },
];

const achievements = [
  {
    title: "12-day learning streak",
    description: "You have maintained consistent learning activity.",
    icon: Flame,
  },
  {
    title: "Security milestone",
    description: "You completed a major security learning milestone.",
    icon: Trophy,
  },
  {
    title: "Weekly target achieved",
    description: "You reached your weekly study target.",
    icon: CheckCircle2,
  },
];

const clampPercentage = (value: number | undefined, fallback: number) => {
  const numericValue =
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

export default function Progress() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview>(
    fallbackAnalytics,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then((data) => {
        setAnalytics({
          ...fallbackAnalytics,
          ...data,
        });
      })
      .catch((error) => {
        console.error("Progress analytics error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const studyProgress = clampPercentage(
    analytics.study_progress,
    fallbackAnalytics.study_progress!,
  );

  const careerReadiness = clampPercentage(
    analytics.career_readiness,
    fallbackAnalytics.career_readiness!,
  );

  const resumeReadiness = clampPercentage(
    analytics.resume_readiness,
    fallbackAnalytics.resume_readiness!,
  );

  const skillProgress = clampPercentage(
    analytics.skill_progress,
    fallbackAnalytics.skill_progress!,
  );

  const studyHours: number =
    typeof analytics.study_hours === "number"
      ? analytics.study_hours
      : (fallbackAnalytics.study_hours ?? 0);

  const projectsCompleted =
    typeof analytics.projects_completed === "number"
      ? analytics.projects_completed
      : 0;

  const assessmentsCompleted =
    typeof analytics.assessments_completed === "number"
      ? analytics.assessments_completed
      : 0;

  const overallProgress = Math.round(
    (studyProgress + careerReadiness + resumeReadiness) / 3,
  );

  const weeklyTarget = analytics.weekly_target ?? 18;
  const weeklyHours =
    typeof analytics.weekly_hours === "number"
      ? analytics.weekly_hours
      : 0;

  const weeklyProgress =
    typeof analytics.weekly_target_progress === "number"
      ? Math.max(0, Math.min(100, Math.round(analytics.weekly_target_progress)))
      : Math.min(
          100,
          Math.round((weeklyHours / weeklyTarget) * 100),
        );

  const weeklyActivity =
    analytics.weekly_activity?.length
      ? analytics.weekly_activity
      : fallbackWeeklyActivity;

  const skills =
    analytics.skill_breakdown?.length
      ? analytics.skill_breakdown.map((skill) => ({
          name: skill.name,
          progress: skill.progress,
          change: skill.status,
        }))
      : fallbackSkills;

  const goalsCompleted = analytics.completed_tasks ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <TrendingUp size={16} />
            Learning intelligence
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Progress
          </h1>

          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Track your learning progress, skill development, career readiness,
            and activity across the AI-NEXUS platform.
          </p>
        </header>

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <Loader2 size={16} className="animate-spin" />
            Syncing your latest progress data...
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp size={20} />
              </div>
              <ArrowUpRight size={17} className="text-emerald-500" />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Overall progress
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {overallProgress}%
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Based on study, career, and resume readiness
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock3 size={20} />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Study hours
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {studyHours.toFixed(1)}h
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Current analytics total
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Flame size={20} />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Learning streak
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              12 days
            </p>
            <p className="mt-2 text-xs font-medium text-orange-600">
              Keep your learning habit consistent
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Target size={20} />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Goals completed
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {goalsCompleted}
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Estimated from current readiness
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Weekly activity</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your study activity across the week
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                {studyHours.toFixed(1)}h tracked
              </div>
            </div>

            <div className="flex h-56 items-end justify-between gap-2">
              {weeklyActivity.map((item) => {
                const height = Math.max(10, (item.hours / 5) * 100);

                return (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="text-xs font-semibold text-slate-500">
                      {item.hours}h
                    </div>

                    <div
                      className="w-full max-w-10 rounded-t-xl bg-indigo-500 transition-all hover:bg-indigo-600"
                      style={{ height: `${height}%` }}
                      title={`${item.hours} hours`}
                    />

                    <span className="text-xs font-medium text-slate-400">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Weekly target</span>
                <span className="text-slate-700">
                  {studyHours.toFixed(1)} / {weeklyTarget}h
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Brain size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Learning overview
                </h2>
                <p className="text-sm text-slate-500">
                  Current readiness signals
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">Study</span>
                  <span className="font-bold text-slate-900">
                    {studyProgress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${studyProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">Skills</span>
                  <span className="font-bold text-slate-900">
                    {skillProgress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${skillProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    Career readiness
                  </span>
                  <span className="font-bold text-slate-900">
                    {careerReadiness}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${careerReadiness}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    Resume readiness
                  </span>
                  <span className="font-bold text-slate-900">
                    {resumeReadiness}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${resumeReadiness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Zap size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Skill development
                </h2>
                <p className="text-sm text-slate-500">
                  Current skill progress indicators
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      {skill.name}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {skill.progress}%
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {skill.change}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Achievements</h2>
                <p className="text-sm text-slate-500">
                  Milestones from your learning journey
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div
                    key={achievement.title}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                      <Icon size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {achievement.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Lightbulb size={23} />
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                AI progress insight
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Your progress is being tracked across learning and career
                readiness.
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Your current study progress is {studyProgress}%, skill progress
                is {skillProgress}%, and career readiness is{" "}
                {careerReadiness}%. Use the AI Copilot and Next Best Action
                features to turn these signals into specific learning tasks.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Progress journey</h2>
              <p className="text-sm text-slate-500">
                From learning to employability readiness
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <BookOpen size={20} className="text-indigo-600" />
                <span className="text-lg font-bold text-slate-900">
                  {studyProgress}%
                </span>
              </div>
              <p className="font-bold text-slate-800">Learn</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Build strong foundations through focused study.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <Zap size={20} className="text-purple-600" />
                <span className="text-lg font-bold text-slate-900">
                  {skillProgress}%
                </span>
              </div>
              <p className="font-bold text-slate-800">Build</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Convert knowledge into practical technical skills and projects.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <Target size={20} className="text-emerald-600" />
                <span className="text-lg font-bold text-slate-900">
                  {careerReadiness}%
                </span>
              </div>
              <p className="font-bold text-slate-800">Become ready</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Improve career readiness through projects, resume, and
                interview preparation.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Projects completed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {projectsCompleted}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Assessments completed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {assessmentsCompleted}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Skill progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {skillProgress}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resume readiness</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {resumeReadiness}%
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}



