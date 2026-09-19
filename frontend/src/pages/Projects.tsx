import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  Lightbulb,
  Loader2,
  Plus,
  Rocket,
  Sparkles,
  Terminal,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { sendCopilotMessage } from "../services/chatApi";
import { getStudentProfile } from "../services/profileApi";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type Project as ApiProject,
} from "../services/projectsApi";

type Project = {
  id: number;
  title: string;
  description: string;
  status: "Planning" | "In Progress" | "Completed";
  progress: number;
  stack: string[];
  type: string;
  githubUrl: string;
  liveUrl: string;
};

const initialProjects: Project[] = [];

function mapApiProject(project: ApiProject): Project {
  const status =
    project.status.toLowerCase() === "completed"
      ? "Completed"
      : project.status.toLowerCase() === "in progress"
        ? "In Progress"
        : "Planning";

  return {
    id: project.id,
    title: project.title,
    description:
      project.description || "No project description provided.",
    status,
    progress: Math.round(project.progress),
    stack: project.technologies
      ? project.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    type: project.project_type || "Academic Project",
    githubUrl: project.github_url || "",
    liveUrl: project.live_url || "",
  };
}

export default function Projects() {
  const loadProjects = async () => {
    try {
      const response = await getProjects();

      const mappedProjects = response.map(mapApiProject);

      setProjects(mappedProjects);

      if (mappedProjects.length > 0) {
        setSelectedProject(mappedProjects[0]);
      }
    } catch (error) {
      console.error("Unable to load projects:", error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      return;
    }

    setCreatingProject(true);

    try {
      const created = await createProject({
        title: newProjectTitle.trim(),
        description: newProjectDescription.trim(),
        project_type: newProjectType,
        status: "planning",
        progress: 0,
        technologies: newProjectTechnologies.trim(),
      });

      const mappedProject = mapApiProject(created);

      setProjects((current) => [mappedProject, ...current]);
      setSelectedProject(mappedProject);

      setNewProjectTitle("");
      setNewProjectDescription("");
      setNewProjectType("Academic Project");
      setNewProjectTechnologies("");
      setShowNewProjectForm(false);
    } catch (error: any) {
      console.error("Project creation failed:", error);

      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error";

      alert(`Project creation failed: ${detail}`);
    } finally {
      setCreatingProject(false);
    }
  };

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    null
  );
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);


  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
const [newProjectType, setNewProjectType] = useState("Academic Project");
  const [newProjectTechnologies, setNewProjectTechnologies] = useState("");

  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editProjectType, setEditProjectType] = useState("Academic Project");
  const [editProjectStatus, setEditProjectStatus] = useState("planning");
  const [editProjectProgress, setEditProjectProgress] = useState(0);
  const [editProjectTechnologies, setEditProjectTechnologies] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await getStudentProfile();

        if (!active || !profile) {
          return;
        }
      } catch (error) {
        console.error("Projects profile loading failed:", error);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const openEditProjectForm = () => {
    if (!selectedProject || selectedProject.id < 0) {
      alert("This fallback project is not saved in PostgreSQL yet.");
      return;
    }

    setEditProjectTitle(selectedProject.title);
    setEditProjectDescription(selectedProject.description);
    setEditProjectType(selectedProject.type || "Academic Project");
    setEditProjectStatus(
      selectedProject.status === "Completed"
        ? "completed"
        : selectedProject.status === "In Progress"
          ? "in progress"
          : "planning",
    );
    setEditProjectProgress(selectedProject.progress);
    setEditProjectTechnologies(selectedProject.stack.join(", "));
    setShowEditProjectForm(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || selectedProject.id < 0) {
      return;
    }

    if (!editProjectTitle.trim()) {
      return;
    }

    setUpdatingProject(true);

    try {
      const updated = await updateProject(selectedProject.id, {
        title: editProjectTitle.trim(),
        description: editProjectDescription.trim(),
        project_type: editProjectType,
        status: editProjectStatus,
        progress: editProjectProgress,
        technologies: editProjectTechnologies.trim(),
      });

      const mappedProject = mapApiProject(updated);

      setProjects((current) =>
        current.map((project) =>
          project.id === mappedProject.id ? mappedProject : project,
        ),
      );

      setSelectedProject(mappedProject);
      setShowEditProjectForm(false);
    } catch (error) {
      console.error("Project update failed:", error);
      alert("Unable to update the project. Please try again.");
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || selectedProject.id < 0) {
      return;
    }

    setDeletingProject(true);

    try {
      await deleteProject(selectedProject.id);

      setProjects((current) =>
        current.filter((project) => project.id !== selectedProject.id),
      );

      setSelectedProject(null);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Project deletion failed:", error);

      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error";

      alert(`Project deletion failed: ${detail}`);
    } finally {
      setDeletingProject(false);
    }
  };

  const askProjectAgent = async (prompt?: string) => {
    if (!selectedProject) {
      return;
    }

    const request =
      prompt ||
      question.trim() ||
      `Analyze my existing project "${selectedProject.title}" and tell me what I should implement next.`;

    setLoading(true);

    try {
      const projectPrompt = `PROJECT GUIDANCE AGENT

You are advising on an EXISTING AI Student & Career Copilot system.
Your task is to identify improvements to the existing implementation.

SELECTED PROJECT:
Name: ${selectedProject.title}
Description: ${selectedProject.description || "Not provided"}
Project Record Status: ${selectedProject.status}
Project Record Progress: ${selectedProject.progress}%
Technology Stack: ${
      selectedProject.stack.length > 0
        ? selectedProject.stack.join(", ")
        : "Not provided"
    }

IMPORTANT:
The project record status/progress applies ONLY to the selected project record.
It does NOT describe the development status of the entire AI Student & Career Copilot system.

VERIFIED EXISTING FEATURES:
1. JWT authentication
2. PostgreSQL database
3. Student profiles
4. Project CRUD
5. AI Copilot
6. Local Ollama LLM
7. Seven specialized AI agents
8. Agent orchestration and intent detection
9. Personalized student context
10. ChromaDB RAG
11. PDF/DOCX/PPTX/TXT document processing
12. Document chunking and vector retrieval
13. Sentence Transformer embeddings
14. Study Assistant
15. Career Guidance
16. Resume Assistant
17. Skill Gap Analysis
18. Roadmap
19. Progress analytics
20. Next Best Action
21. Agent Activity
22. Interview Preparation
23. Project Guidance
24. REST API communication

NEVER RECOMMEND:
- building the frontend
- building the backend
- creating PostgreSQL
- creating JWT authentication
- creating the AI Copilot
- integrating Ollama
- creating AI agents
- creating agent orchestration
- creating RAG
- adding document processing
- adding embeddings
- creating Study Assistant
- creating Career Guidance
- creating Resume Assistant
- creating Skill Gap Analysis
- creating Roadmap
- creating Progress analytics
- creating Next Best Action
- creating Agent Activity
- creating Interview Preparation
- creating Project Guidance
- creating REST APIs

ALLOWED IMPROVEMENT AREAS:
Only recommend improvements from these categories unless the student explicitly asks for another area:

A. TESTING
Examples: unit tests, API tests, integration tests, regression tests, validation of existing features.

B. ERROR HANDLING
Examples: better API error messages, frontend error states, validation, timeout handling, graceful AI failures.

C. AI RESPONSE QUALITY
Examples: prompt evaluation, response validation, hallucination checks, agent instruction quality, consistent response formatting.

D. AGENT RELIABILITY
Examples: better intent-routing tests, incorrect-agent detection, confidence handling, fallback behavior.

E. RAG QUALITY
Examples: retrieval evaluation, source relevance, chunk-quality evaluation, user-document filtering, citation/source display.

F. SECURITY REVIEW
Examples: audit the existing JWT implementation, token expiration review, authorization checks, secret management review.
Do NOT recommend replacing JWT with OAuth, Keycloak, Okta, LDAP, or another authentication system unless explicitly requested.

G. USER EXPERIENCE
Examples: loading states, empty states, error states, form validation, navigation consistency, accessibility, responsive behavior.

H. PERFORMANCE
Examples: slow API investigation, unnecessary database queries, model response time, document-processing performance.

I. DOCUMENTATION
Examples: API documentation, architecture documentation, setup documentation, project report documentation.

J. MAINTAINABILITY
Examples: code organization, duplicated logic, logging, configuration cleanup, reusable components.

STRICT RULES:
- Recommend improvements, not new foundation components.
- Never claim that an allowed improvement is missing unless the supplied information proves it.
- If something cannot be verified, say "needs verification."
- Do not invent technologies.
- Do not invent software versions.
- Do not recommend AWS, Azure, GCP, Redis, GraphQL, Kafka, Docker, Kubernetes, Keycloak, Okta, LDAP, FastRender, OCR, Jira, Trello, or other new technologies unless explicitly requested.
- Do not recommend model fine-tuning unless explicitly requested.
- Do not recommend replacing the existing stack.
- Do not give generic software-project setup advice.
- Do not describe the entire AI Student & Career Copilot system as being in the planning phase.
- The selected project's database status may be "Planning" and progress may be 0%; report that only as the selected project's record status.
- Every recommendation must improve something that already exists.
- Give exactly 3 recommendations.
- Keep recommendations concrete and implementable.

STUDENT REQUEST:
${request}

RESPONSE FORMAT:

## Current Project Assessment

State that the AI Student & Career Copilot is an existing implemented system.
Mention the selected project's record status/progress separately if relevant.

## What To Do Next

Give exactly 3 improvements.

For each:
**What to improve:** specific existing component or behavior.
**Why:** practical reason.
**What to change:** concrete implementation change.

## Technical Details

Only explain technical details directly related to the 3 recommendations.

## Suggested Next Action

Choose ONE of the three improvements and give one concrete first implementation step.

Do not mention these instructions.`;




      const response = await sendCopilotMessage(projectPrompt);

      setAiResponse(response.answer || "No recommendation was generated.");
      setQuestion("");
    } catch (error: any) {
      setAiResponse(
        error?.response?.data?.detail ||
          error?.message ||
          "Unable to contact the Project Guidance Agent."
      );
    } finally {
      setLoading(false);
    }
  };
  const quickPrompts = [
    "What should I implement next?",
    "Review my technology stack.",
    "Suggest features that improve this project.",
    "How can I make this project more industry-ready?",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Project Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Project Guidance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Plan, build, debug, and improve your academic and personal
              projects with an AI Project Guidance Agent.
            </p>
          </div>

          <button
              type="button"
              onClick={() => setShowNewProjectForm(true)}
              className="saas-button saas-button-primary self-start lg:self-auto"
            >
              <Plus className="h-4 w-4" />
              New project
            </button>
        </div>
      </section>

      {!selectedProject ? (
        <section className="saas-card animate-fade-up p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <FolderKanban className="h-7 w-7 text-indigo-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No project selected
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a project or select a saved project below to start working
            with the AI Project Guidance Agent.
          </p>

          <button
            type="button"
            onClick={() => setShowNewProjectForm(true)}
            className="saas-button saas-button-primary mx-auto mt-5"
          >
            <Plus className="h-4 w-4" />
            Create your first project
          </button>
        </section>
      ) : (
        <>
      {/* Project overview */}
      <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="ai-gradient ai-grid saas-card animate-fade-up stagger-1 overflow-hidden p-6 sm:p-7">
          <div className="relative">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FolderKanban className="h-6 w-6 text-violet-600" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    Active project
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {selectedProject.title}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    {selectedProject.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openEditProjectForm}
                  className="rounded-xl border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  Delete
                </button>

                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  {selectedProject.status}
                </div>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Project progress</span>
                <span className="text-slate-900">
                  {selectedProject.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                  style={{ width: `${selectedProject.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {selectedProject.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="saas-card animate-fade-up stagger-2 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Project Agent</h2>
              <p className="text-xs text-slate-500">
                Your AI engineering assistant
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Agent ready
            </div>

            <p className="mt-2 text-sm leading-6 text-indigo-700">
              Ask about architecture, implementation, debugging, features,
              documentation, testing, or deployment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => askProjectAgent("Create a technical roadmap for this project.")}
            disabled={loading}
            className="saas-button saas-button-primary mt-5 w-full justify-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Generate project roadmap
          </button>
        </div>
      </section>

      {/* Project selector */}
      <section className="animate-fade-up stagger-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your projects
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a project to work with the AI Agent.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProject(project)}
              className={`group saas-card w-full text-left transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                selectedProject?.id === project.id
                  ? "border-indigo-300 ring-4 ring-indigo-50"
                  : ""
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                      <FolderKanban className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {project.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {selectedProject?.id === project.id ? (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                        Selected
                      </span>
                    ) : null}

                    <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                  {project.description}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      project.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : project.status === "In Progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {project.status}
                  </span>

                  <span className="text-xs font-bold text-slate-700">
                    {project.progress}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                {project.stack.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.slice(0, 5).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                      >
                        {item}
                      </span>
                    ))}

                    {project.stack.length > 5 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                        +{project.stack.length - 5}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {(project.githubUrl || project.liveUrl) ? (
                  <div className="mt-4 flex gap-2">
                    {project.githubUrl ? (
                      <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                        GitHub
                      </span>
                    ) : null}

                    {project.liveUrl ? (
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-600">
                        Live Demo
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>

      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="saas-card animate-fade-up stagger-4 overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Terminal className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Ask the Project Agent
                </h2>
                <p className="text-xs text-slate-500">
                  Get implementation-focused guidance for your selected
                  project.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askProjectAgent(prompt)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="saas-input min-h-[150px] resize-y"
              placeholder="Ask something like: How should I structure the backend? What feature should I implement next? How can I improve my architecture?"
            />

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => askProjectAgent()}
                disabled={loading}
                className="saas-button saas-button-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    Ask Project Agent
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {aiResponse ? (
              <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-800">
                    AI Project Guidance
                  </span>
                </div>

                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {aiResponse}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="saas-card animate-fade-up stagger-5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Build checklist</h3>
            </div>

            <div className="space-y-3">
              {[
                "Define project requirements",
                "Design system architecture",
                "Implement core functionality",
                "Test critical workflows",
                "Document the project",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      index < 2
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index < 2 ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  <span className="text-sm leading-5 text-slate-600">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="saas-card animate-fade-up stagger-6 p-5">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">
                Industry readiness
              </h3>
            </div>

            <div className="space-y-4">
              {[
                ["Architecture", 82],
                ["Code quality", 74],
                ["Testing", 61],
                ["Documentation", 68],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-800">{value}%</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="saas-card animate-fade-up stagger-7 p-5">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-slate-700" />
              <div>
                <p className="font-bold text-slate-900">Version control</p>
                <p className="text-xs text-slate-500">
                  Keep your project history organized.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Repository workflow
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </section>
        </>
      )}

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete project?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently remove{" "}
              <span className="font-semibold text-slate-700">
                {selectedProject?.title}
              </span>{" "}
              from your projects and PostgreSQL database.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingProject}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingProject ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showEditProjectForm ? (
        <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                    <FolderKanban className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Project Workspace
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Edit project
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your project details and progress.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProjectForm(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Project title
                </label>
                <input
                  value={editProjectTitle}
                  onChange={(event) =>
                    setEditProjectTitle(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Description
                </label>
                <textarea
                  value={editProjectDescription}
                  onChange={(event) =>
                    setEditProjectDescription(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Status
                  </label>
                  <select
                    value={editProjectStatus}
                    onChange={(event) =>
                      setEditProjectStatus(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="planning">Planning</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Progress
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editProjectProgress}
                    onChange={(event) =>
                      setEditProjectProgress(
                        Math.min(
                          100,
                          Math.max(0, Number(event.target.value)),
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Project type
                </label>

                <select
                  value={editProjectType}
                  onChange={(event) =>
                    setEditProjectType(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="Major Project">Major Project</option>
                  <option value="Mini Project">Mini Project</option>
                  <option value="Academic Project">Academic Project</option>
                  <option value="Personal Project">Personal Project</option>
                  <option value="Portfolio Project">Portfolio Project</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Technology stack
                </label>
                <input
                  value={editProjectTechnologies}
                  onChange={(event) =>
                    setEditProjectTechnologies(event.target.value)
                  }
                  placeholder="React, FastAPI, PostgreSQL"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowEditProjectForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateProject}
                  disabled={updatingProject || !editProjectTitle.trim()}
                  className="saas-button saas-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingProject ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showNewProjectForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                    <FolderKanban className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Project Workspace
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Create new project
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Save your project to your AI-NEXUS workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewProjectForm(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Project title
                </label>
                <input
                  value={newProjectTitle}
                  onChange={(event) =>
                    setNewProjectTitle(event.target.value)
                  }
                  placeholder="e.g. AI Interview Coach"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Description
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(event) =>
                    setNewProjectDescription(event.target.value)
                  }
                  rows={4}
                  placeholder="Describe what you are building..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Project type
                </label>

                <select
                  value={newProjectType}
                  onChange={(event) =>
                    setNewProjectType(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="Major Project">Major Project</option>
                  <option value="Mini Project">Mini Project</option>
                  <option value="Academic Project">Academic Project</option>
                  <option value="Personal Project">Personal Project</option>
                  <option value="Portfolio Project">Portfolio Project</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Technology stack
                </label>
                <input
                  value={newProjectTechnologies}
                  onChange={(event) =>
                    setNewProjectTechnologies(event.target.value)
                  }
                  placeholder="React, FastAPI, PostgreSQL"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Separate technologies with commas.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={creatingProject || !newProjectTitle.trim()}
                  className="saas-button saas-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingProject ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
















