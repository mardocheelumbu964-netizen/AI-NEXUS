import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface TopbarProps {
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Study session coming up",
    description: "Cryptography revision starts at 09:00.",
    time: "10 min ago",
    unread: true,
  },
  {
    id: 2,
    title: "Roadmap updated",
    description: "Your AI career roadmap has a new recommendation.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Weekly goal achieved",
    description: "You completed your 18-hour weekly study target.",
    time: "Yesterday",
    unread: false,
  },
];

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/copilot": "AI Copilot",
  "/learning": "Learning",
  "/study-planner": "Study Assistant",
  "/documents": "Knowledge Base",
  "/career": "Career Guidance",
  "/resume": "Resume Assistant",
  "/projects": "Projects",
  "/roadmap": "Career Roadmap",
  "/assessments": "Skill Gap Analysis",
  "/interview": "Interview Preparation",
  "/progress": "Progress Intelligence",
  "/profile": "Profile",
  "/settings": "Settings",
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  const pageName =
    pageNames[location.pathname] ||
    (location.pathname.startsWith("/copilot")
      ? "AI Copilot"
      : "Workspace");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyboard);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  const markAllRead = () => {
    setNotifications((items) =>
      items.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_nexus_token");
    localStorage.removeItem("ai_nexus_user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-7">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        {/* Page identity */}
        <div className="hidden min-w-[170px] md:block">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <p className="text-xs font-semibold text-slate-400">
              Workspace
            </p>
          </div>

          <h1 className="mt-0.5 text-sm font-bold tracking-tight text-slate-900">
            {pageName}
          </h1>
        </div>

        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <div
            className={[
              "mx-auto flex h-10 max-w-[520px] items-center rounded-xl border bg-slate-50 transition-all duration-150",
              searchOpen
                ? "border-indigo-300 bg-white shadow-sm ring-4 ring-indigo-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-white",
            ].join(" ")}
          >
            <Search className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />

            <input
              ref={searchRef}
              type="text"
              placeholder="Search your workspace..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setSearchOpen(false), 150);
              }}
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
              aria-label="Search workspace"
            />

            <div className="mr-2 hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[9px] font-bold text-slate-400 shadow-sm sm:flex">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </div>

          {searchOpen && (
            <div className="absolute left-1/2 top-12 z-40 hidden w-full max-w-[520px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl sm:block">
              <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Quick navigation
              </div>

              {[
                ["AI Copilot", "/copilot"],
                ["Study Assistant", "/study-planner"],
                ["Career Guidance", "/career"],
                ["Resume Assistant", "/resume"],
              ].map(([label, path]) => (
                <button
                  key={path}
                  type="button"
                  onMouseDown={() => navigate(path)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>

                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* AI status */}
          <button
            type="button"
            onClick={() => navigate("/copilot")}
            className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-100/70 xl:flex"
            title="Open AI Copilot"
          >
            <span className="status-dot status-dot-pulse bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-700">
              AI Online
            </span>
          </button>

          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen((value) => !value);
                setProfileOpen(false);
              }}
              className={[
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition",
                notificationOpen
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              ].join(" ")}
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />

              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[8px] font-extrabold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[350px] max-w-[calc(100vw-20px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {unreadCount} unread updates
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-50"
                    >
                      <Check className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() =>
                        setNotifications((items) =>
                          items.map((item) =>
                            item.id === notification.id
                              ? { ...item, unread: false }
                              : item,
                          ),
                        )
                      }
                      className="flex w-full gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50"
                    >
                      <span
                        className={[
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          notification.unread
                            ? "bg-indigo-600"
                            : "bg-slate-200",
                        ].join(" ")}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                          {notification.description}
                        </p>

                        <p className="mt-1.5 text-[9px] font-semibold text-slate-400">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationOpen(false)}
                  className="w-full border-t border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                  View notification center
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:flex"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>

          {/* Divider */}
          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationOpen(false);
              }}
              className={[
                "flex items-center gap-2 rounded-xl p-1.5 transition",
                profileOpen
                  ? "bg-slate-100"
                  : "hover:bg-slate-100",
              ].join(" ")}
              aria-label="Open profile menu"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-cyan-100 text-[10px] font-extrabold text-indigo-700 ring-1 ring-indigo-100">
                LM
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="hidden text-left lg:block">
                <p className="max-w-28 truncate text-[11px] font-bold text-slate-800">
                  Student
                </p>
                <p className="text-[9px] text-slate-400">
                  Personal workspace
                </p>
              </div>

              <ChevronDown
                className={[
                  "hidden h-3.5 w-3.5 text-slate-400 transition lg:block",
                  profileOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-extrabold text-indigo-700">
                      LM
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        Student Account
                      </p>

                      <p className="truncate text-[10px] text-slate-400">
                        Personalized AI workspace
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <UserCircle className="h-4 w-4" />
                    My profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  <div className="my-1.5 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
