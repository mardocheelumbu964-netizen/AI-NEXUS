import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  Flag,
  Lightbulb,
  Loader2,
  Map,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { generateRoadmapGuidance } from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";

type RoadmapStage = {
  number: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  status: "completed" | "current" | "upcoming";
};

const roadmapStages: RoadmapStage[] = [
  {
    number: "01",
    title: "Build your foundation",
    description:
      "Strengthen programming, databases, Git, problem solving, and core computer science concepts.",
    duration: "4–6 weeks",
    skills: ["Programming", "SQL", "Git", "DSA"],
    status: "completed",
  },
  {
    number: "02",
    title: "Master your specialization",
    description:
      "Develop focused technical skills around your chosen career direction and technology stack.",
    duration: "6–10 weeks",
    skills: ["Python", "AI & ML", "APIs", "RAG"],
    status: "current",
  },
  {
    number: "03",
    title: "Build real-world projects",
    description:
      "Turn your knowledge into practical projects that demonstrate your ability to solve realistic problems.",
    duration: "4–8 weeks",
    skills: ["Projects", "Architecture", "Testing", "Deployment"],
    status: "upcoming",
  },
  {
    number: "04",
    title: "Become career ready",
    description:
      "Prepare your resume, portfolio, interview skills, communication, and job application strategy.",
    duration: "3–5 weeks",
    skills: ["Resume", "Interview", "Portfolio", "Communication"],
    status: "upcoming",
  },
];

const weeklyPlan = [
  {
    week: "Week 1",
    title: "Strengthen fundamentals",
    tasks: [
      "Review Python fundamentals",
      "Practice problem solving",
      "Complete SQL exercises",
    ],
  },
  {
    week: "Week 2",
    title: "Explore AI engineering",
    tasks: [
      "Study machine learning concepts",
      "Build a small AI feature",
      "Learn RAG fundamentals",
    ],
  },
  {
    week: "Week 3",
    title: "Build with APIs",
    tasks: [
      "Create an API integration",
      "Connect AI to an application",
      "Document your implementation",
    ],
  },
  {
    week: "Week 4",
    title: "Create portfolio evidence",
    tasks: [
      "Polish your project",
      "Write project documentation",
      "Prepare a portfolio entry",
    ],
  },
];

export default function Roadmap() {
  const [careerGoal, setCareerGoal] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Student");
  const [, setProfileLoading] = useState(true);
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const profile = await getStudentProfile();

        if (!active || !profile) {
          return;
        }

        const savedCareerGoal =
          profile.career_goals ||
          "";

        const savedSkills =
          profile.technical_skills ||
          "";

        const savedExperience =
          profile.academic_year ||
          "Student";

        setCareerGoal((current) =>
          current.trim() ? current : savedCareerGoal,
        );

        setCurrentSkills((current) =>
          current.trim() ? current : savedSkills,
        );

        setExperienceLevel((current) =>
          current !== "Student" ? current : savedExperience,
        );
      } catch (error) {
        console.error("Roadmap profile loading failed:", error);
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

  const generateAIPlan = async () => {
    setLoading(true);

    try {
      const result = await generateRoadmapGuidance(
        careerGoal,
        targetRole,
        currentSkills,
        experienceLevel
      );

      setGuidance(result.answer);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to generate your roadmap right now.";

      setGuidance(message);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    completed: {
      wrapper: "border-emerald-200 bg-emerald-50/40",
      number: "bg-emerald-500 text-white",
      badge: "bg-emerald-100 text-emerald-700",
      label: "Completed",
    },
    current: {
      wrapper: "border-indigo-200 bg-indigo-50/40 shadow-lg shadow-indigo-100/40",
      number: "bg-indigo-600 text-white",
      badge: "bg-indigo-100 text-indigo-700",
      label: "Current focus",
    },
    upcoming: {
      wrapper: "border-slate-200 bg-white",
      number: "bg-slate-100 text-slate-500",
      badge: "bg-slate-100 text-slate-500",
      label: "Upcoming",
    },
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] border border-cyan-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />

        <div className="relative px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                <Map className="h-3.5 w-3.5" />
                AI Career Roadmap
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Turn your ambition into a{" "}
                <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                  clear path.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Follow a structured progression from fundamentals to real-world
                projects and career readiness, with AI helping you decide what
                to focus on next.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    document
                      .getElementById("ai-roadmap")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="saas-button saas-button-primary inline-flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Personalize roadmap
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("roadmap-stages")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="saas-button saas-button-secondary inline-flex items-center gap-2"
                >
                  <Map className="h-4 w-4" />
                  View roadmap
                </button>
              </div>
            </div>

            <div className="w-full max-w-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                    <Rocket className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Roadmap progress
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-950">
                      25%
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">1 of 4 stages</span>
                  <span className="font-bold text-cyan-600">
                    In progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Personalization */}
      <section id="ai-roadmap" className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="saas-card overflow-hidden">
          <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50/80 to-violet-50/60 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm ring-1 ring-cyan-100">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Personalize with AI
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Give the Roadmap Agent your current position and destination.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Career goal
                </span>
                <input
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. Build a career in AI"
                  className="saas-input w-full"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Target role
                </span>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. AI Engineer"
                  className="saas-input w-full"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_220px]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Current skills
                </span>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  rows={4}
                  placeholder="Python, React, SQL, machine learning..."
                  className="saas-input w-full resize-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Experience level
                </span>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="saas-input w-full"
                >
                  <option>Student</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>

                <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                    AI context
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The agent uses these details to tailor your roadmap.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap className="h-4 w-4 text-cyan-500" />
                Roadmap Agent ready
              </div>

              <button
                onClick={generateAIPlan}
                disabled={loading}
                className="saas-button saas-button-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI roadmap
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {guidance && (
              <div className="animate-fade-up overflow-hidden rounded-2xl border border-cyan-200 bg-cyan-50/50">
                <div className="flex items-center gap-2 border-b border-cyan-100 px-4 py-3 sm:px-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-cyan-600 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    AI-generated roadmap
                  </span>
                </div>

                <div className="whitespace-pre-wrap px-4 py-5 text-sm leading-7 text-slate-700 sm:px-5">
                  {guidance}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent process */}
        <div className="saas-card h-fit overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  AI roadmap process
                </h3>
                <p className="text-xs text-slate-500">
                  From your goal to an action plan
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            {[
              {
                number: "01",
                title: "Understand",
                description: "Analyze your destination",
              },
              {
                number: "02",
                title: "Assess",
                description: "Review your current skills",
              },
              {
                number: "03",
                title: "Plan",
                description: "Sequence the required skills",
              },
              {
                number: "04",
                title: "Guide",
                description: "Recommend your next actions",
              },
            ].map((item, index) => (
              <div key={item.number} className="relative flex gap-3">
                {index < 3 && (
                  <div className="absolute left-5 top-10 h-7 border-l border-dashed border-slate-200" />
                )}

                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 shadow-sm">
                  {item.number}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
              <CheckCircle2 className="h-4 w-4" />
              Personalized planning
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap stages */}
      <section id="roadmap-stages" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
            Your journey
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Career roadmap
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A structured progression from fundamentals to employability.
          </p>
        </div>

        <div className="relative">
          <div className="absolute bottom-10 left-5 top-10 hidden w-px bg-slate-200 md:block" />

          <div className="space-y-4">
            {roadmapStages.map((stage) => {
              const style = statusStyles[stage.status];

              return (
                <div
                  key={stage.number}
                  className={`relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${style.wrapper}`}
                >
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${style.number}`}
                      >
                        {stage.status === "completed" ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          stage.number
                        )}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {stage.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}
                            >
                              {style.label}
                            </span>
                          </div>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {stage.description}
                          </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {stage.duration}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {stage.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hidden items-center md:flex">
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current focus */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="saas-card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Current focus
                </p>
                <h2 className="mt-1 font-bold text-slate-950">
                  Master your specialization
                </h2>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-600">
                    Stage progress
                  </p>
                  <p className="mt-1 text-2xl font-bold text-indigo-950">
                    46%
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-indigo-100">
                <div className="h-full w-[46%] rounded-full bg-indigo-600" />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Keep building practical AI and software engineering skills
                before moving to the project stage.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <Code2 className="h-4 w-4 text-indigo-600" />
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Skills
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  4 active
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <Clock3 className="h-4 w-4 text-indigo-600" />
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Estimated
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  6–10 weeks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly plan */}
        <div className="saas-card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Flag className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Action plan
                </p>
                <h2 className="mt-1 font-bold text-slate-950">
                  Next 4 weeks
                </h2>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {weeklyPlan.map((item, index) => (
              <div key={item.week} className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          {item.week}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-slate-900">
                          {item.title}
                        </h3>
                      </div>

                      <Circle className="h-4 w-4 text-slate-300" />
                    </div>

                    <div className="mt-3 space-y-2">
                      {item.tasks.map((task) => (
                        <div
                          key={task}
                          className="flex items-center gap-2 text-xs text-slate-500"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career destination */}
      <section className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950">
        <div className="relative px-5 py-7 sm:px-7 lg:px-8">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                <Award className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Destination
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Become job ready with evidence, not just knowledge.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Complete the roadmap by turning your learning into projects,
                  measurable skills, a strong portfolio, and confident
                  interviews.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("ai-roadmap")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Update roadmap
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="status-dot bg-emerald-500" />
          Roadmap system ready
        </div>

        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-cyan-500" />
          AI recommendations available
        </div>
      </div>
    </div>
  );
}



