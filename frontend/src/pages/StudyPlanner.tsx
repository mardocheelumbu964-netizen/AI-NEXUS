import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

import {
  generateStudyPlan as generatePersistentStudyPlan,
  type StudyPlanDetail,
} from "../services/studyPlanApi";

function getDurationWeeks(value: string): number {
  return Number.parseInt(value, 10) || 4;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function StudyPlanner() {
  const [goal, setGoal] = useState("");
  const [subjects, setSubjects] = useState("");
  const [availableHours, setAvailableHours] = useState("2");
  const [duration, setDuration] = useState("4 weeks");
  const [learningPreference, setLearningPreference] =
    useState("Balanced");

  const [savedPlan, setSavedPlan] = useState<StudyPlanDetail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!goal.trim() || !subjects.trim()) {
      setError(
        "Please enter your learning goal and at least one subject."
      );
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(
        end.getDate() + getDurationWeeks(duration) * 7 - 1
      );

      const question = [
        `Learning goal: ${goal.trim()}`,
        `Subjects: ${subjects.trim()}`,
        `Available study time: ${availableHours} hours per day`,
        `Plan duration: ${duration}`,
        `Learning preference: ${learningPreference}`,
        "",
        "Create a practical, personalized study plan with clear daily tasks.",
        "Prioritize important topics, revision, practice, and realistic workload.",
      ].join("\n");

      const response = await generatePersistentStudyPlan(
        question,
        formatDate(start),
        formatDate(end)
      );

      setSavedPlan(response);
    } catch (requestError: any) {
      console.error("Study plan generation failed:", requestError);

      if (requestError?.response?.status === 401) {
        setError(
          "Your login session has expired. Please log out and sign in again."
        );
      } else {
        setError(
          requestError?.response?.data?.detail ||
            "Unable to generate the study plan right now. Please try again."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlan = () => {
    setSavedPlan(null);
    setError("");
  };

  const totalMinutes =
    savedPlan?.tasks.reduce(
      (total, task) => total + task.duration_minutes,
      0
    ) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-4 w-4" />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                AI learning intelligence
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Study Assistant
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Build a personalized study strategy around your goals,
              available time, subjects and preferred learning style.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-bold text-emerald-800">
                Study agent online
              </p>
              <p className="text-[10px] text-emerald-700/70">
                Ready to plan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planner */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BrainCircuit className="h-4 w-4" />
                </div>

                <h2 className="text-base font-bold text-slate-900">
                  Create your study plan
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Your plan will be generated and saved to your AI-NEXUS
                study workspace.
              </p>
            </div>

            {savedPlan && (
              <button
                type="button"
                onClick={resetPlan}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                New plan
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <Field
              label="What do you want to achieve?"
              icon={<Target className="h-4 w-4" />}
            >
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Example: Prepare for my semester exams and strengthen my cybersecurity fundamentals."
                rows={3}
                className="saas-input min-h-[90px] resize-none"
              />
            </Field>

            <Field
              label="Subjects"
              icon={<BookOpen className="h-4 w-4" />}
              hint="Separate subjects with commas"
            >
              <input
                value={subjects}
                onChange={(event) => setSubjects(event.target.value)}
                placeholder="Cryptography, Network Security, Database Management"
                className="saas-input"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Hours per day"
                icon={<Clock3 className="h-4 w-4" />}
              >
                <select
                  value={availableHours}
                  onChange={(event) =>
                    setAvailableHours(event.target.value)
                  }
                  className="saas-input"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6+ hours</option>
                </select>
              </Field>

              <Field
                label="Plan duration"
                icon={<CalendarDays className="h-4 w-4" />}
              >
                <select
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="saas-input"
                >
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="6 weeks">6 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                </select>
              </Field>
            </div>

            <Field
              label="Learning preference"
              icon={<Lightbulb className="h-4 w-4" />}
            >
              <div className="grid gap-2 sm:grid-cols-3">
                {["Balanced", "Theory First", "Practice First"].map(
                  (preference) => (
                    <button
                      key={preference}
                      type="button"
                      onClick={() => setLearningPreference(preference)}
                      className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                        learningPreference === preference
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {preference}
                    </button>
                  )
                )}
              </div>
            </Field>

            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-medium leading-5 text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  AI is building your plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate personalized plan
                </>
              )}
            </button>
          </div>
        </section>

        {/* Intelligence panel */}
        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Zap className="h-4 w-4" />
              </span>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  How the agent works
                </h3>
                <p className="text-[10px] text-slate-400">
                  Personalized planning flow
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Understand your learning goal",
                "Consider subjects and available time",
                "Structure a realistic schedule",
                "Prioritize high-value topics",
                "Save actionable study sessions",
              ].map((step, index) => (
                <div key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-xs leading-5 text-slate-600">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-5 text-white shadow-xl shadow-indigo-500/15">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <TrendingUp className="h-4 w-4" />
            </div>

            <h3 className="mt-4 text-sm font-bold">
              Build consistency, not just schedules
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/75">
              AI-NEXUS now stores your study plan and tasks so your
              learning progress can be tracked over time.
            </p>
          </section>
        </aside>
      </div>

      {/* Saved plan */}
      {savedPlan && (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200/80 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>

                  <h2 className="text-base font-bold text-slate-900">
                    Your saved AI study plan
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {savedPlan.plan.title} ·{" "}
                  {savedPlan.tasks.length} study tasks ·{" "}
                  {Math.round(totalMinutes / 60)} total hours
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                  Saved
                </span>

                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-700">
                  Personalized
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {savedPlan.tasks.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {savedPlan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                        <ListChecks className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold leading-5 text-slate-800">
                            {task.topic}
                          </p>

                          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-500">
                            {task.duration_minutes} min
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] font-semibold text-indigo-600">
                          {task.subject}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {task.scheduled_date} · {task.priority} priority
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-500">
                The AI generated a plan, but no individual tasks were
                returned.
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Play className="h-3.5 w-3.5" />
                Start studying
              </button>

              <button
                type="button"
                onClick={resetPlan}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
              >
                Create another plan
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="text-indigo-500">{icon}</span>
          {label}
        </label>

        {hint && (
          <span className="text-[10px] text-slate-400">{hint}</span>
        )}
      </div>

      {children}
    </div>
  );
}
