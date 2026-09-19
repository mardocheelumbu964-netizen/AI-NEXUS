import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { generateSkillGapAnalysis } from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";

export default function SkillGap() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [, setProfileLoading] = useState(true);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const profile = await getStudentProfile();

        if (!active || !profile) {
          return;
        }

        const savedCareerGoal = profile.career_goals || "";
        const savedSkills = profile.technical_skills || "";

        setCareerGoal((current) =>
          current.trim() ? current : savedCareerGoal,
        );

        setCurrentSkills((current) =>
          current.trim() ? current : savedSkills,
        );
      } catch (error) {
        console.error("Skill Gap profile loading failed:", error);
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

  const analyzeSkillGap = async () => {
    if (!targetRole.trim()) {
      setError("Please enter your target role.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await generateSkillGapAnalysis(
        targetRole,
        currentSkills,
        careerGoal,
        experienceLevel
      );

      setResult(response.answer || "No skill gap analysis was generated.");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to generate skill gap analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Skill Analysis
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Skill Gap Analysis
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Identify the skills you need to develop for your target career
              and receive a personalized AI learning direction.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Brain className="h-5 w-5 text-indigo-600" />

            <div>
              <p className="text-xs font-semibold text-slate-500">
                Skill Gap Agent
              </p>
              <p className="text-sm font-bold text-slate-900">
                Ready
              </p>
            </div>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </section>

      {/* Input + Information */}
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="saas-card animate-fade-up stagger-1 p-6 sm:p-7">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Target className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Analyze your skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide your current career information.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Target Role
              </label>

              <input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Example: AI Engineer"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Current Skills
              </label>

              <textarea
                value={currentSkills}
                onChange={(event) => setCurrentSkills(event.target.value)}
                placeholder="Example: Python, SQL, basic machine learning"
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Career Goal
              </label>

              <input
                value={careerGoal}
                onChange={(event) => setCareerGoal(event.target.value)}
                placeholder="Example: Become an AI Engineer"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Experience Level
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperienceLevel(level)}
                    className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                      experienceLevel === level
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={analyzeSkillGap}
              disabled={loading}
              className="saas-button saas-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing skills...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Skill Gap
                </>
              )}
            </button>
          </div>
        </div>

        <div className="saas-card ai-gradient ai-grid animate-fade-up stagger-2 p-6 sm:p-7">
          <div className="relative">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-950">
              Personalized skill intelligence
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              The AI analyzes your current skills against your target role and
              identifies practical areas for improvement.
            </p>

            <div className="mt-7 space-y-4">
              {[
                [
                  "Current strengths",
                  "Understand the skills you already have.",
                ],
                [
                  "Skill gaps",
                  "Identify important areas that need development.",
                ],
                [
                  "Learning direction",
                  "Turn identified gaps into practical learning actions.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-4"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Result */}
      {result ? (
        <section className="saas-card animate-fade-up p-6 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                AI Skill Gap Assessment
              </h2>

              <p className="text-xs text-slate-500">
                Personalized analysis generated by the AI Assessment Agent.
              </p>
            </div>
          </div>

          <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            {result}
          </div>
        </section>
      ) : null}
    </div>
  );
}

