import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileText,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import { generateResumeGuidance } from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";

type ResumeResult = {
  answer: string;
  agent_key?: string;
  sources?: Array<{
    filename?: string;
    content?: string;
  }>;
};

const sampleResume = `John Doe
Computer Applications Student

Skills:
Python, JavaScript, React, SQL, Git

Education:
Bachelor of Computer Applications

Experience:
Student projects and academic work

Projects:
AI-powered student learning assistant
Web-based career guidance application`;

function extractScore(text: string): number {
  const match = text.match(/(?:score|rating)[^0-9]{0,20}([0-9]{1,3})/i);
  if (!match) return 78;
  const score = Number(match[1]);
  return Math.min(100, Math.max(0, score));
}

function ScoreRing({ score }: { score: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 120 120"
        aria-label={`Resume score ${score} out of 100`}
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-200"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="text-indigo-600 transition-all duration-1000"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs font-medium text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

export default function Resume() {
  const [resumeContent, setResumeContent] = useState("");
  const [targetRole, setTargetRole] = useState("Software Developer");
  const [skills, setSkills] = useState(
    "Python, JavaScript, React, SQL, Git"
  );
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"builder" | "analysis">(
    "builder"
  );

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

        setTargetRole((current) =>
          current.trim() && current !== "Software Developer"
            ? current
            : savedCareerGoal || current,
        );

        setSkills((current) =>
          current.trim() && current !== "Python, JavaScript, React, SQL, Git"
            ? current
            : savedSkills || current,
        );
      } catch (error) {
        console.error("Resume profile loading failed:", error);
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

  const score = useMemo(
    () => (result ? extractScore(result.answer) : 0),
    [result]
  );

  const runAnalysis = async () => {
    if (!resumeContent.trim()) {
      setResumeContent(sampleResume);
    }

    setLoading(true);
    setActiveTab("analysis");

    try {
      const response = await generateResumeGuidance(
        targetRole,
        resumeContent.trim() || sampleResume,
        skills
      );

      setResult(response as ResumeResult);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Unable to analyze the resume right now.";

      setResult({
        answer: `Resume analysis could not be completed.\n\n${message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearWorkspace = () => {
    setResumeContent("");
    setResult(null);
    setActiveTab("builder");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Resume Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Resume Assistant
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Build, analyze, and improve your resume for the role you want.
              AI Copilot identifies gaps and suggests practical improvements.
            </p>
          </div>

          <button
            type="button"
            onClick={clearWorkspace}
            className="saas-button saas-button-secondary self-start lg:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reset workspace
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="saas-card animate-fade-up stagger-1 p-1.5">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "builder"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Resume Workspace
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analysis")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "analysis"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            AI Analysis
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <>
          {/* Target role */}
          <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="saas-card animate-fade-up stagger-2 p-6">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Target position
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tell the AI what role your resume should target.
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Target role
              </label>

              <input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                className="saas-input"
                placeholder="e.g. Full Stack Developer"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Software Developer",
                  "Data Analyst",
                  "AI Engineer",
                  "Web Developer",
                ].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="saas-card animate-fade-up stagger-3 p-6">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Award className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Core skills
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add the skills you currently have.
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Your skills
              </label>

              <textarea
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                className="saas-input min-h-[105px] resize-none"
                placeholder="Python, React, SQL, Git..."
              />
            </div>
          </section>

          {/* Editor */}
          <section className="saas-card animate-fade-up stagger-4 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Resume content
                  </h2>
                  <p className="text-xs text-slate-500">
                    Paste your current resume for AI analysis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setResumeContent(sampleResume)}
                className="saas-button saas-button-secondary"
              >
                <Upload className="h-4 w-4" />
                Use sample
              </button>
            </div>

            <div className="p-5">
              <textarea
                value={resumeContent}
                onChange={(event) => setResumeContent(event.target.value)}
                className="min-h-[430px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-5 font-mono text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                placeholder={`Paste your resume here...

Example:
Name
Professional Summary
Education
Experience
Projects
Skills
Certifications`}
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={clearWorkspace}
                  className="saas-button saas-button-secondary"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={loading}
                  className="saas-button saas-button-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze with AI
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* AI capabilities */}
          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Role alignment",
                text: "Compare your resume against the target position.",
              },
              {
                icon: TrendingUp,
                title: "Impact improvement",
                text: "Turn basic descriptions into stronger achievement statements.",
              },
              {
                icon: Lightbulb,
                title: "AI recommendations",
                text: "Receive practical suggestions for skills, projects, and structure.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`saas-card animate-fade-up p-5 stagger-${index + 5}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <item.icon className="h-5 w-5" />
                </div>

                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
              </div>
            ))}
          </section>
        </>
      ) : (
        <>
          {/* Analysis header */}
          <section className="ai-gradient ai-grid animate-fade-up overflow-hidden rounded-3xl border border-indigo-100 p-6 shadow-sm sm:p-8">
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  <Bot className="h-3.5 w-3.5" />
                  Resume Agent
                </div>

                <h2 className="text-2xl font-bold text-slate-950">
                  AI Resume Review
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Targeting{" "}
                  <span className="font-semibold text-slate-900">
                    {targetRole}
                  </span>
                  . The AI is evaluating relevance, clarity, skills, projects,
                  and improvement opportunities.
                </p>
              </div>

              {result && !loading ? <ScoreRing score={score} /> : null}
            </div>
          </section>

          {loading ? (
            <section className="saas-card flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                AI is reviewing your resume
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                The Resume Agent is analyzing your content against the target
                role and generating personalized recommendations.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-indigo-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Analyzing
                <ChevronRight className="h-3.5 w-3.5" />
                Generating recommendations
              </div>
            </section>
          ) : result ? (
            <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="saas-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 p-5">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      AI recommendations
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Personalized feedback from your Resume Agent.
                    </p>
                  </div>

                  <div className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:block">
                    Analysis complete
                  </div>
                </div>

                <div className="whitespace-pre-wrap p-5 text-sm leading-7 text-slate-700">
                  {result.answer}
                </div>

                {result.sources && result.sources.length > 0 ? (
                  <div className="border-t border-slate-200 bg-slate-50 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Supporting material
                    </p>

                    <div className="space-y-2">
                      {result.sources.map((source, index) => (
                        <div
                          key={`${source.filename}-${index}`}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <p className="text-xs font-semibold text-slate-700">
                            {source.filename || `Source ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="space-y-4">
                <div className="saas-card p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Analysis status
                      </h3>
                      <p className="text-xs text-slate-500">
                        AI review completed
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target role</span>
                      <span className="max-w-[150px] text-right font-semibold text-slate-800">
                        {targetRole}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">AI agent</span>
                      <span className="font-semibold text-slate-800">
                        Resume Agent
                      </span>
                    </div>
                  </div>
                </div>

                <div className="saas-card p-5">
                  <h3 className="font-bold text-slate-900">
                    Next actions
                  </h3>

                  <div className="mt-4 space-y-2">
                    {[
                      "Improve weak bullet points",
                      "Add measurable achievements",
                      "Align skills with target role",
                    ].map((action) => (
                      <div
                        key={action}
                        className="flex items-start gap-2 rounded-xl bg-slate-50 p-3"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                        <span className="text-sm text-slate-600">
                          {action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className="saas-button saas-button-primary w-full justify-center"
                >
                  Edit resume
                  <ArrowRight className="h-4 w-4" />
                </button>
              </aside>
            </section>
          ) : (
            <section className="saas-card flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FileText className="h-7 w-7" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                No analysis yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your resume in the workspace and run the AI analysis to
                receive personalized recommendations.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className="saas-button saas-button-primary mt-6"
              >
                Open resume workspace
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          )}

          {result && !loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                AI-generated resume feedback should be reviewed and edited
                before submission.
              </span>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}


