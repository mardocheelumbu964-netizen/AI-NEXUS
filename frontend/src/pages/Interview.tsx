import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Loader2,
  MessageSquare,
  Mic,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { evaluateInterviewAnswer } from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";

type InterviewQuestion = {
  question: string;
  category: string;
  tip: string;
};

const interviewBank: Record<string, InterviewQuestion[]> = {
  "Software Developer": [
    {
      question:
        "Tell me about yourself and explain why you are interested in software development.",
      category: "Introduction",
      tip: "Keep your answer focused on education, technical skills, projects, and career direction.",
    },
    {
      question:
        "Explain the difference between a stack and a queue. Give a practical example of each.",
      category: "Technical",
      tip: "Define both concepts and connect them to real applications.",
    },
    {
      question:
        "Describe one technical project you have worked on and explain your contribution.",
      category: "Project",
      tip: "Explain the problem, your approach, technologies used, and the result.",
    },
    {
      question:
        "How would you debug an application that suddenly became very slow?",
      category: "Problem Solving",
      tip: "Explain a systematic debugging process rather than jumping to one solution.",
    },
    {
      question:
        "Where do you see yourself growing as a software developer over the next few years?",
      category: "Career",
      tip: "Connect your learning goals with the role you are targeting.",
    },
  ],
  "Data Analyst": [
    {
      question:
        "Tell me about yourself and explain why you are interested in data analytics.",
      category: "Introduction",
      tip: "Mention your education, analytical skills, tools, and relevant projects.",
    },
    {
      question:
        "What is the difference between WHERE and HAVING in SQL?",
      category: "Technical",
      tip: "Explain when each clause is applied during query processing.",
    },
    {
      question:
        "Describe a project where you used data to identify an important insight.",
      category: "Project",
      tip: "Explain the dataset, analysis process, insight, and business or academic value.",
    },
    {
      question:
        "How would you handle missing values in a dataset?",
      category: "Problem Solving",
      tip: "Discuss different approaches depending on the data and business context.",
    },
    {
      question:
        "Which data analysis skills would you like to improve next?",
      category: "Career",
      tip: "Mention a specific technical skill and explain why it matters.",
    },
  ],
  "AI Engineer": [
    {
      question:
        "Tell me about yourself and explain why you are interested in artificial intelligence.",
      category: "Introduction",
      tip: "Connect your education, AI projects, programming skills, and interests.",
    },
    {
      question:
        "What is the difference between Generative AI and traditional machine learning?",
      category: "Technical",
      tip: "Explain the difference in purpose, outputs, and common use cases.",
    },
    {
      question:
        "Explain an AI project you have built or studied.",
      category: "Project",
      tip: "Cover the architecture, model or API, data, challenges, and results.",
    },
    {
      question:
        "How would you reduce incorrect or hallucinated answers from an AI system?",
      category: "Problem Solving",
      tip: "Discuss grounding, retrieval, validation, prompting, and evaluation.",
    },
    {
      question:
        "What AI skill would you prioritize learning next?",
      category: "Career",
      tip: "Choose a specific skill and explain how it supports your career goal.",
    },
  ],
};

export default function Interview() {
  const [role, setRole] = useState("Software Developer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [, setProfileLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

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

        const matchedRole = Object.keys(interviewBank).find(
          (item) =>
            item.toLowerCase() === savedCareerGoal.trim().toLowerCase(),
        );

        if (matchedRole) {
          setRole((current) =>
            current === "Software Developer" ? matchedRole : current,
          );
        }
      } catch (error) {
        console.error("Interview profile loading failed:", error);
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

  const questions = interviewBank[role] || interviewBank["Software Developer"];

  const averageScore = useMemo(() => {
    if (!scores.length) return 0;
    return Math.round(
      scores.reduce((total, value) => total + value, 0) / scores.length
    );
  }, [scores]);

  const startInterview = () => {
    setStarted(true);
    setCompleted(false);
    setCurrent(0);
    setAnswer("");
    setFeedback("");
    setScores([]);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      const response = await evaluateInterviewAnswer(
        questions[current].question,
        answer,
        role
      );

      const responseText = response.answer || "No feedback was generated.";
      setFeedback(responseText);

      const match = responseText.match(
        /(?:score|rating)[^0-9]{0,20}([0-9]{1,3})/i
      );

      const generatedScore = match
        ? Math.min(100, Math.max(0, Number(match[1])))
        : 80;

      setScores((previous) => [...previous, generatedScore]);
    } catch (error: any) {
      setFeedback(
        error?.response?.data?.detail ||
          error?.message ||
          "Unable to generate interview feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (current === questions.length - 1) {
      setCompleted(true);
      setStarted(false);
      return;
    }

    setCurrent((value) => value + 1);
    setAnswer("");
    setFeedback("");
  };

  const resetInterview = () => {
    setStarted(false);
    setCompleted(false);
    setCurrent(0);
    setAnswer("");
    setFeedback("");
    setScores([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Interview Coach
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Interview Preparation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Practice realistic interview questions and receive AI-powered
              feedback on your answers.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">
                Interview Agent
              </p>
              <p className="text-sm font-bold text-slate-900">Ready</p>
            </div>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </section>

      {!started && !completed ? (
        <>
          {/* Setup */}
          <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <div className="saas-card animate-fade-up stagger-1 p-6 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Target className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Interview setup
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Configure a practice session for your target role.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Target role
                  </label>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {Object.keys(interviewBank).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRole(item)}
                        className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                          role === item
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Difficulty
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDifficulty(item)}
                        className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                          difficulty === item
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={startInterview}
                className="saas-button saas-button-primary mt-7 w-full justify-center"
              >
                <Play className="h-4 w-4" />
                Start mock interview
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Coach overview */}
            <div className="ai-gradient ai-grid saas-card animate-fade-up stagger-2 overflow-hidden p-6 sm:p-7">
              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>

                <h2 className="text-xl font-bold text-slate-950">
                  Practice with an AI interviewer
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Simulate a structured interview and receive feedback after
                  each answer.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    [Mic, "Realistic questions", "Role-specific interview prompts."],
                    [TrendingUp, "Answer analysis", "Feedback on clarity and technical depth."],
                    [Trophy, "Progress tracking", "Monitor your interview performance."],
                  ].map(([Icon, title, text]) => (
                    <div
                      key={title as string}
                      className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {title as string}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {text as string}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Preparation tips */}
          <section className="grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Think before answering",
                "Take a moment to structure your response before speaking.",
              ],
              [
                "02",
                "Use examples",
                "Support technical and behavioral answers with concrete examples.",
              ],
              [
                "03",
                "Stay concise",
                "Give a clear answer without losing the important details.",
              ],
            ].map(([number, title, text], index) => (
              <div
                key={number}
                className={`saas-card animate-fade-up p-5 stagger-${index + 3}`}
              >
                <span className="text-xs font-bold text-indigo-600">
                  {number}
                </span>
                <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </section>
        </>
      ) : started ? (
        /* Interview session */
        <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="saas-card animate-scale-in overflow-hidden">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {role}
                    </span>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                      {difficulty}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {questions[current].category}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    Question {current + 1} of {questions.length}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  Mock interview
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${((current + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Interviewer
                  </p>

                  <h3 className="mt-2 text-lg font-bold leading-7 text-slate-900 sm:text-xl">
                    {questions[current].question}
                  </h3>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-800">
                  Interview tip
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  {questions[current].tip}
                </p>
              </div>

              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={loading}
                className="saas-input min-h-[220px] resize-y"
                placeholder="Type your interview answer here..."
              />

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={loading || !answer.trim()}
                  className="saas-button saas-button-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit answer
                    </>
                  )}
                </button>
              </div>

              {feedback ? (
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-800">
                      AI interviewer feedback
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {feedback}
                  </div>

                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="saas-button saas-button-primary mt-5"
                  >
                    {current === questions.length - 1
                      ? "Finish interview"
                      : "Next question"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="saas-card animate-fade-up p-5">
              <div className="mb-4 flex items-center gap-3">
                <Bot className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">
                  Interview Agent
                </h3>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </div>
                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Your answer will be evaluated for clarity, relevance,
                  structure, and technical quality.
                </p>
              </div>
            </div>

            <div className="saas-card animate-fade-up stagger-1 p-5">
              <h3 className="font-bold text-slate-900">Session progress</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Questions</span>
                  <span className="text-xs font-bold text-slate-800">
                    {current + 1}/{questions.length}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${((current + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Answers evaluated
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {scores.length}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetInterview}
              className="saas-button saas-button-secondary w-full justify-center"
            >
              <RotateCcw className="h-4 w-4" />
              End session
            </button>
          </aside>
        </section>
      ) : (
        /* Results */
        <section className="space-y-5">
          <div className="ai-gradient ai-grid saas-card animate-scale-in overflow-hidden p-6 sm:p-8">
            <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-[10px] border-indigo-100 bg-white shadow-sm">
                <span className="text-3xl font-bold text-slate-950">
                  {averageScore}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Average
                </span>
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <Trophy className="h-3.5 w-3.5" />
                  Interview complete
                </div>

                <h2 className="text-2xl font-bold text-slate-950">
                  Your practice session is complete
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You completed {scores.length} evaluated answer
                  {scores.length === 1 ? "" : "s"}. Review the feedback and
                  continue practicing to improve consistency.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="saas-card animate-fade-up p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Performance overview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scores recorded during this session.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {scores.map((value, index) => (
                  <div
                    key={`${index}-${value}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Question {index + 1}
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {value}/100
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="saas-card animate-fade-up stagger-1 p-5">
                <h3 className="font-bold text-slate-900">Session summary</h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">Role</span>
                    <span className="text-xs font-bold text-slate-800">
                      {role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">Difficulty</span>
                    <span className="text-xs font-bold text-slate-800">
                      {difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">Evaluated</span>
                    <span className="text-xs font-bold text-slate-800">
                      {scores.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card animate-fade-up stagger-2 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Keep practicing
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Repeat the session and compare your scores as your
                      answers improve.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetInterview}
                className="saas-button saas-button-primary w-full justify-center"
              >
                <RotateCcw className="h-4 w-4" />
                Start another interview
              </button>
            </aside>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            <Code2 className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>
              Use the AI feedback to refine your technical explanations,
              project stories, and problem-solving approach.
            </span>
          </div>
        </section>
      )}
    </div>
  );
}


