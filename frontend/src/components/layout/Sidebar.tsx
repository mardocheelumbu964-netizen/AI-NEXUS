import {
  Activity,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Map,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Target,
  UserCircle,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Zephyr AI",
    path: "/copilot",
    icon: Bot,
    ai: true,
  },
  {
    label: "Study Assistant",
    path: "/study-planner",
    icon: GraduationCap,
  },
  {
    label: "Career Guidance",
    path: "/career",
    icon: BriefcaseBusiness,
  },
  {
    label: "Skill Gap Analysis",
    path: "/skills",
    icon: Target,
  },
  {
    label: "Resume Assistant",
    path: "/resume",
    icon: FileText,
  },
  {
    label: "Interview Preparation",
    path: "/interview",
    icon: MessageSquare,
  },
  {
    label: "Roadmap",
    path: "/roadmap",
    icon: Map,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Progress",
    path: "/progress",
    icon: BarChart3,
  },
  {
    label: "Agent Activity",
    path: "/agent-activity",
    icon: Activity,
  },
];

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [studentOpen, setStudentOpen] = useState(true);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[274px] flex-col",
          "border-r border-slate-200/80 bg-white",
          "shadow-[4px_0_24px_rgba(15,23,42,0.025)]",
          "transition-all duration-300 ease-out",
          collapsed ? "lg:w-[82px]" : "",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center border-b border-slate-100 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white shadow-lg shadow-indigo-200">
              <Sparkles className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold tracking-[0.08em] text-slate-950">
                  Zephyr AI
                </p>
                <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Student Intelligence
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
            title="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <div className="mb-3 flex items-center justify-between px-3">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Workspace
              </p>

              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-600">
                Live
              </span>
            </div>
          )}

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center rounded-xl text-[13px] font-semibold transition-all duration-150",
                      collapsed
                        ? "justify-center px-2 py-3"
                        : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    ].join(" ")
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-indigo-600" />
                      )}

                      <div
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                          isActive
                            ? item.ai
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-white text-indigo-600 shadow-sm"
                            : item.ai
                              ? "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100"
                              : "text-slate-400 group-hover:bg-white group-hover:text-slate-600",
                        ].join(" ")}
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </div>

                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>

                          {item.ai && (
                            <span
                              className={[
                                "rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                                isActive
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-slate-100 text-slate-400",
                              ].join(" ")}
                            >
                              AI
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="my-5 border-t border-slate-100" />

          {!collapsed && (
            <p className="mb-3 px-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Account
            </p>
          )}

          <nav className="space-y-1">
            <NavLink
              to="/profile"
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  "group flex items-center rounded-xl text-[13px] font-semibold transition",
                  collapsed
                    ? "justify-center px-2 py-3"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                ].join(" ")
              }
              title={collapsed ? "Profile" : undefined}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <UserCircle className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600" />
              </div>

              {!collapsed && <span>Profile</span>}
            </NavLink>

            <NavLink
              to="/settings"
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  "group flex items-center rounded-xl text-[13px] font-semibold transition",
                  collapsed
                    ? "justify-center px-2 py-3"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                ].join(" ")
              }
              title={collapsed ? "Settings" : undefined}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Settings className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600" />
              </div>

              {!collapsed && <span>Settings</span>}
            </NavLink>
          </nav>
        </div>

        {/* Bottom status */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          {!collapsed ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-pulse bg-emerald-500" />

                  <span className="text-[11px] font-bold text-slate-700">
                    AI system online
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">
                    Local AI agents
                  </span>

                  <span className="text-[9px] font-semibold text-emerald-600">
                    Operational
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStudentOpen((value) => !value)}
                className="mt-2.5 flex w-full items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-[10px] font-extrabold text-indigo-700 ring-1 ring-indigo-100">
                  LM
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[11px] font-bold text-slate-800">
                    Student Account
                  </p>

                  <p className="truncate text-[9px] text-slate-400">
                    Personal workspace
                  </p>
                </div>

                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 text-slate-400 transition",
                    studentOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>
            </>
          ) : (
            <div className="flex justify-center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-extrabold text-indigo-700"
                title="Student Account"
              >
                LM
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


