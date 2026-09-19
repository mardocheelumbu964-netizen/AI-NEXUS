import { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  FileQuestion,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { sendCopilotMessage } from "../services/chatApi";

type Question = {
  question: string;
  options: string[];
  correct: number;
};

const questionBank: Record<string, Question[]> = {
  Programming: [
    {
      question: "Which data structure follows the LIFO principle?",
      options: ["Queue", "Stack", "Linked List", "Graph"],
      correct: 1,
    },
    {
      question: "Which keyword is commonly used to define a function in Python?",
      options: ["function", "func", "def", "define"],
      correct: 2,
    },
    {
      question: "What is the average time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
    },
    {
      question: "Which language is primarily used for styling web pages?",
      options: ["HTML", "Python", "CSS", "SQL"],
      correct: 2,
    },
    {
      question: "Which Git command downloads changes from a remote repository?",
      options: ["git push", "git init", "git pull", "git branch"],
      correct: 2,
    },
  ],
  "Data Structures": [
    {
      question: "Which structure uses FIFO ordering?",
      options: ["Stack", "Queue", "Tree", "Heap"],
      correct: 1,
    },
    {
      question: "Which traversal visits the left subtree, root, then right subtree?",
      options: ["Preorder", "Postorder", "Inorder", "Level order"],
      correct: 2,
    },
    {
      question: "What is the worst-case search complexity of an unsorted array?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correct: 2,
    },
    {
      question: "Which structure is commonly used to represent hierarchical data?",
      options: ["Tree", "Queue", "Stack", "Hash table"],
      correct: 0,
    },
    {
      question: "Which data structure is commonly used for BFS?",
      options: ["Stack", "Queue", "Heap", "Array only"],
      correct: 1,
    },
  ],
  SQL: [
    {
      question: "Which SQL command retrieves data from a table?",
      options: ["GET", "SELECT", "FETCHROW", "READ"],
      correct: 1,
    },
    {
      question: "Which clause filters rows?",
      options: ["WHERE", "ORDER", "GROUP", "LIMIT"],
      correct: 0,
    },
    {
      question: "Which command permanently removes a table?",
      options: ["DELETE", "REMOVE", "DROP", "CLEAR"],
      correct: 2,
    },
    {
      question: "Which keyword removes duplicate results?",
      options: ["UNIQUE", "DISTINCT", "ONLY", "FILTER"],
      correct: 1,
    },
    {
      question: "Which clause groups rows with common values?",
      options: ["GROUP BY", "ORDER BY", "WHERE", "JOIN BY"],
      correct: 0,
    },
  ],
  "Web Development": [
    {
      question: "Which language provides the structure of a web page?",
      options: ["CSS", "HTML", "SQL", "Python"],
      correct: 1,
    },
    {
      question: "Which technology is primarily used for styling web pages?",
      options: ["HTML", "CSS", "Node.js", "SQL"],
      correct: 1,
    },
    {
      question: "Which JavaScript library is commonly used to build user interfaces?",
      options: ["React", "Django", "Flask", "PostgreSQL"],
      correct: 0,
    },
    {
      question: "What does API commonly stand for?",
      options: [
        "Application Programming Interface",
        "Application Process Integration",
        "Advanced Program Internet",
        "Automated Programming Instruction",
      ],
      correct: 0,
    },
    {
      question: "Which HTTP method is commonly used to create a resource?",
      options: ["GET", "POST", "DELETE", "HEAD"],
      correct: 1,
    },
  ],
};

export default function Assessments() {
  const [topic, setTopic] = useState("Programming");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const questions = questionBank[topic] || questionBank.Programming;

  const score = useMemo(() => {
    return answers.reduce((total, answer, index) => {
      return total + (answer === questions[index]?.correct ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const percentage = Math.round((score / questions.length) * 100);

  const startAssessment = () => {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setAiFeedback("");
  };

  const submitAnswer = () => {
    if (selected === null) return;

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);

    if (current === questions.length - 1) {
      setFinished(true);
      setStarted(false);
      generateFeedback(updatedAnswers);
      return;
    }

    setCurrent((value) => value + 1);
    setSelected(null);
  };

  const generateFeedback = async (finalAnswers: number[]) => {
    setLoading(true);

    const finalScore = finalAnswers.reduce((total, answer, index) => {
      return total + (answer === questions[index]?.correct ? 1 : 0);
    }, 0);

    try {
      const response = await sendCopilotMessage(
        `Assessment Evaluation

Topic: ${topic}
Difficulty: ${difficulty}
Score: ${finalScore}/${questions.length}

Act as the Assessment Agent. Analyze this student's assessment result. Explain their likely strengths, areas needing improvement, recommended topics to revise, and a short study action plan. Keep the feedback practical and suitable for a BCA student.`
      );

      setAiFeedback(response.answer || "No AI feedback was generated.");
    } catch (error: any) {
      setAiFeedback(
        error?.response?.data?.detail ||
          error?.message ||
          "Unable to generate AI feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setStarted(false);
    setFinished(false);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setAiFeedback("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Assessment Engine
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Assessments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Test your knowledge, measure your progress, and receive
              personalized AI feedback based on your performance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Brain className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Assessment Agent
              </p>
              <p className="text-sm font-bold text-slate-900">
                Ready
              </p>
            </div>
            <span className="ml-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </section>

      {!started && !finished ? (
        <>
          {/* Configuration */}
          <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <div className="saas-card animate-fade-up stagger-1 p-6 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FileQuestion className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Configure assessment
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose what you want to practice.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Object.keys(questionBank).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTopic(item)}
                        className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                          topic === item
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
                onClick={startAssessment}
                className="saas-button saas-button-primary mt-7 w-full justify-center"
              >
                <Zap className="h-4 w-4" />
                Start assessment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Assessment information */}
            <div className="saas-card ai-gradient ai-grid animate-fade-up stagger-2 p-6 sm:p-7">
              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>

                <h2 className="text-xl font-bold text-slate-950">
                  Smart evaluation
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your Assessment Agent evaluates your answers and creates
                  actionable feedback after every assessment.
                </p>

                <div className="mt-7 space-y-4">
                  {[
                    [
                      CheckCircle2,
                      "Knowledge evaluation",
                      "Measure your understanding of key concepts.",
                    ],
                    [
                      TrendingUp,
                      "Performance insights",
                      "Identify patterns in your strengths and gaps.",
                    ],
                    [
                      Trophy,
                      "Personalized improvement",
                      "Get recommended topics for your next study session.",
                    ],
                  ].map(([Icon, title, text]) => (
                    <div
                      key={title as string}
                      className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-4"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
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

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              ["5", "Questions", FileQuestion],
              ["~5 min", "Estimated time", Clock3],
              ["AI", "Personalized feedback", Sparkles],
            ].map(([value, label, Icon]) => (
              <div
                key={label as string}
                className="saas-card animate-fade-up stagger-3 flex items-center gap-4 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {value as string}
                  </p>
                  <p className="text-xs text-slate-500">{label as string}</p>
                </div>
              </div>
            ))}
          </section>
        </>
      ) : started ? (
        /* Active assessment */
        <section className="mx-auto max-w-4xl">
          <div className="saas-card animate-scale-in overflow-hidden">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {topic}
                    </span>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                      {difficulty}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    Question {current + 1} of {questions.length}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  Active assessment
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
                  <Code2 className="h-5 w-5" />
                </div>

                <h3 className="pt-1 text-lg font-bold leading-7 text-slate-900 sm:text-xl">
                  {questions[current].question}
                </h3>
              </div>

              <div className="space-y-3">
                {questions[current].options.map((option, index) => {
                  const active = selected === index;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelected(index)}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-50"
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span
                        className={`text-sm font-medium ${
                          active ? "text-indigo-800" : "text-slate-700"
                        }`}
                      >
                        {option}
                      </span>

                      {active ? (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-indigo-600" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={selected === null}
                  className="saas-button saas-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {current === questions.length - 1
                    ? "Finish assessment"
                    : "Next question"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Results */
        <section className="space-y-5">
          <div className="ai-gradient ai-grid saas-card animate-scale-in overflow-hidden p-6 sm:p-8">
            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-indigo-100 bg-white shadow-sm">
                <div>
                  <p className="text-center text-3xl font-bold text-slate-950">
                    {percentage}%
                  </p>
                  <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Score
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <Trophy className="h-3.5 w-3.5" />
                  Assessment complete
                </div>

                <h2 className="text-2xl font-bold text-slate-950">
                  {score} of {questions.length} answers correct
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {percentage >= 80
                    ? "Strong performance. Continue building depth and consistency."
                    : percentage >= 60
                      ? "Good foundation. Focus on the areas identified by the AI feedback."
                      : "Use this result as a learning baseline and strengthen the core concepts."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="saas-card animate-fade-up p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    AI performance analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Feedback generated by the Assessment Agent.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Assessment Agent is analyzing your result...
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  {aiFeedback || "No AI feedback is available yet."}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="saas-card animate-fade-up stagger-1 p-5">
                <h3 className="font-bold text-slate-900">Result summary</h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">Topic</span>
                    <span className="text-xs font-bold text-slate-800">
                      {topic}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">Difficulty</span>
                    <span className="text-xs font-bold text-slate-800">
                      {difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">Correct</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {score}/{questions.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card animate-fade-up stagger-2 p-5">
                <h3 className="font-bold text-slate-900">Recommended</h3>

                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 rounded-xl bg-indigo-50 p-3">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span className="text-xs leading-5 text-indigo-800">
                      Review concepts where you made mistakes.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span className="text-xs leading-5 text-amber-800">
                      Retake the assessment after revision.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAssessment}
                className="saas-button saas-button-primary w-full justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                Take another assessment
              </button>
            </aside>
          </div>

          {/* Answer review */}
          <div className="saas-card animate-fade-up stagger-3 overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">Answer review</h3>
              <p className="mt-1 text-xs text-slate-500">
                Review where your answers were correct or incorrect.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {questions.map((item, index) => {
                const correct = answers[index] === item.correct;

                return (
                  <div
                    key={item.question}
                    className="flex items-start gap-4 p-5"
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        correct
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {correct ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-6 text-slate-800">
                        {index + 1}. {item.question}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Your answer:{" "}
                        <span className="font-semibold text-slate-700">
                          {item.options[answers[index]] || "Not answered"}
                        </span>
                      </p>

                      {!correct ? (
                        <p className="mt-1 text-xs text-emerald-700">
                          Correct answer:{" "}
                          <span className="font-semibold">
                            {item.options[item.correct]}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
