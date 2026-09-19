import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  Lightbulb,
  Loader2,
  Map,
  MessageSquare,
  Network,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import {
  generateCareerGuidance,
} from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";

type CareerPath = {
  title: string;
  description: string;
  skills: string[];
  roles: string[];
  demand: string;
};

type SkillGroup = {
  name: string;
  skills: string[];
};

type RoadmapStep = {
  step: string;
  title: string;
  description: string;
};

const careerPaths: CareerPath[] = [
  {
    title: "AI & Machine Learning",
    description:
      "Build intelligent systems using machine learning, generative AI, data, and modern AI engineering practices.",
    skills: ["Python", "Machine Learning", "Generative AI", "LangChain", "RAG"],
    roles: ["AI Engineer", "ML Engineer", "GenAI Developer"],
    demand: "High demand",
  },
  {
    title: "Full-Stack Development",
    description:
      "Design and build complete web applications across frontend, backend, APIs, databases, and deployment.",
    skills: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL"],
    roles: ["Full-Stack Developer", "Software Engineer", "Web Developer"],
    demand: "High demand",
  },
  {
    title: "Data & Analytics",
    description:
      "Turn business and technical data into useful insights through analysis, visualization, and predictive techniques.",
    skills: ["Python", "SQL", "Statistics", "Power BI", "Data Analysis"],
    roles: ["Data Analyst", "BI Analyst", "Junior Data Scientist"],
    demand: "Growing",
  },
  {
    title: "Cybersecurity",
    description:
      "Develop practical skills for protecting applications, networks, identities, systems, and organizational data.",
    skills: ["Networking", "Linux", "Security", "Python", "Cloud Security"],
    roles: ["Security Analyst", "SOC Analyst", "Security Engineer"],
    demand: "Growing",
  },
];

const skillGroups: SkillGroup[] = [
  {
    name: "Technical foundation",
    skills: ["Programming", "Data Structures", "Databases", "Git & GitHub"],
  },
  {
    name: "AI & modern development",
    skills: ["Generative AI", "APIs", "RAG", "Agentic AI"],
  },
  {
    name: "Professional skills",
    skills: ["Communication", "Problem Solving", "Teamwork", "Presentation"],
  },
];

const roadmapSteps: RoadmapStep[] = [
  {
    step: "01",
    title: "Build the foundation",
    description:
      "Strengthen programming, databases, Git, problem solving, and core computer science concepts.",
  },
  {
    step: "02",
    title: "Choose a specialization",
    description:
      "Select a career direction and focus your learning around the skills expected for that role.",
  },
  {
    step: "03",
    title: "Build real projects",
    description:
      "Create practical projects that demonstrate your technical skills and solve realistic problems.",
  },
  {
    step: "04",
    title: "Become job ready",
    description:
      "Improve your resume, portfolio, interview performance, communication, and application strategy.",
  },
];

export default function Career() {
  const [careerGoal, setCareerGoal] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [, setProfileLoading] = useState(true);
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePath, setActivePath] = useState(0);

  const selectedPath = careerPaths[activePath];

  const completion = useMemo(() => {
    let completed = 0;
    if (careerGoal.trim()) completed += 1;
    if (currentSkills.trim()) completed += 1;
    if (preferredRole.trim()) completed += 1;
    return Math.round((completed / 3) * 100);
  }, [careerGoal, currentSkills, preferredRole]);

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
        console.error("Career profile loading failed:", error);
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

  const handleGenerateGuidance = async () => {
    if (!careerGoal.trim() && !preferredRole.trim() && !currentSkills.trim()) {
      setGuidance(
        "Add your career goal, current skills, or preferred role so the Career Agent can create personalized guidance."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await generateCareerGuidance(
        careerGoal,
        currentSkills,
        preferredRole
      );

      setGuidance(result.answer);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to generate career guidance right now.";

      setGuidance(message);
    } finally {
      setLoading(false);
    }
  };

  const applyPath = (path: CareerPath) => {
    setCareerGoal(path.title);
    setPreferredRole(path.roles[0]);
    setCurrentSkills(path.skills.join(", "));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

        <div className="relative overflow-hidden px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI Career Intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Build a career path that fits{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  your goals.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Tell the Career Agent where you are today and where you want
                to go. AI will turn your profile, skills, and target role into
                practical career guidance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    document
                      .getElementById("career-planner")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="saas-button saas-button-primary inline-flex items-center gap-2"
                >
                  <Compass className="h-4 w-4" />
                  Plan my career
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("career-paths")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="saas-button saas-button-secondary inline-flex items-center gap-2"
                >
                  Explore paths
                </button>
              </div>
            </div>

            <div className="w-full max-w-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Career profile
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {completion}% ready
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Target className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Complete your career goal, skills, and preferred role for
                  more personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career planner */}
      <section id="career-planner" className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="saas-card overflow-hidden">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-blue-50/60 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  AI Career Guidance
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Give the Career Agent enough context to make the guidance
                  useful and actionable.
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
                  placeholder="e.g. Become an AI Engineer"
                  className="saas-input w-full"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred role
                </span>
                <input
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Generative AI Developer"
                  className="saas-input w-full"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Current skills
              </span>
              <textarea
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                rows={5}
                placeholder="List your current technical and professional skills..."
                className="saas-input w-full resize-none"
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap className="h-4 w-4 text-emerald-500" />
                Powered by the AI Career Agent
              </div>

              <button
                onClick={handleGenerateGuidance}
                disabled={loading}
                className="saas-button saas-button-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating guidance...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate guidance
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {guidance && (
              <div className="animate-fade-up overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      Career Agent response
                    </span>
                  </div>

                  <button
                    onClick={handleGenerateGuidance}
                    disabled={loading}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-emerald-600"
                    title="Regenerate"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="whitespace-pre-wrap px-4 py-5 text-sm leading-7 text-slate-700 sm:px-5">
                  {guidance}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI decision panel */}
        <div className="saas-card h-fit overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI decision flow</h3>
                <p className="text-xs text-slate-500">
                  How your request is processed
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {[
              ["01", "Understand your goal", "Intent detected"],
              ["02", "Analyze your skills", "Profile context"],
              ["03", "Career Agent", "Specialized reasoning"],
              ["04", "Generate guidance", "Actionable result"],
            ].map(([number, title, description], index) => (
              <div key={number} className="relative">
                {index < 3 && (
                  <div className="absolute left-5 top-10 h-6 border-l border-dashed border-slate-200" />
                )}

                <div className="flex gap-3">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 shadow-sm">
                    {number}
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-slate-800">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
              Career Agent ready
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your request is processed through the personalized AI workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Career paths */}
      <section id="career-paths" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              Explore directions
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Career paths
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore possible technology career directions and use one as a
              starting point.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {careerPaths.map((path, index) => {
            const active = activePath === index;

            return (
              <button
                key={path.title}
                onClick={() => setActivePath(index)}
                className={`group text-left transition-all duration-300 ${
                  active
                    ? "rounded-2xl ring-2 ring-emerald-500/30"
                    : ""
                }`}
              >
                <div
                  className={`saas-card h-full p-5 transition duration-300 ${
                    active
                      ? "border-emerald-200 bg-emerald-50/30 shadow-lg"
                      : "hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-blue-50 text-emerald-600">
                      {index === 0 ? (
                        <Sparkles className="h-5 w-5" />
                      ) : index === 1 ? (
                        <BriefcaseBusiness className="h-5 w-5" />
                      ) : index === 2 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                    </div>

                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-100">
                      {path.demand}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-900">
                    {path.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {path.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {path.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-emerald-600">
                      {path.roles[0]}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="saas-card overflow-hidden border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/70">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Selected path
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedPath.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  {selectedPath.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => applyPath(selectedPath)}
              className="saas-button saas-button-secondary inline-flex shrink-0 items-center justify-center gap-2"
            >
              Use this path
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="saas-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Skills to develop</h2>
              <p className="text-xs text-slate-500">
                Build a balanced career skill portfolio
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {skillGroups.map((group) => (
              <div key={group.name}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="saas-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Career insight</h2>
              <p className="text-xs text-slate-500">
                Turn learning into employability
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <p className="text-sm font-semibold leading-6 text-slate-800">
              Skills become more valuable when you can demonstrate them through
              projects, measurable outcomes, and clear communication.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Learn", "Skills"],
                ["Build", "Projects"],
                ["Show", "Evidence"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-blue-100"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-bold text-blue-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="saas-card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Career roadmap</h2>
              <p className="text-xs text-slate-500">
                A practical progression from foundation to job readiness
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-4">
          {roadmapSteps.map((item, index) => (
            <div
              key={item.step}
              className="relative border-b border-slate-100 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-cyan-600">
                  {item.step}
                </span>

                {index < roadmapSteps.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 text-slate-300 md:block" />
                )}
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950">
        <div className="relative px-5 py-7 sm:px-7">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <User className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Your career path can evolve with you.
                </p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
                  Keep updating your goals and skills as you learn. The AI
                  Career Agent can use the latest context to guide your next
                  step.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("career-planner")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Continue planning
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

