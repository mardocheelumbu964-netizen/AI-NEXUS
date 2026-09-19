import {
  Bell,
  Bot,
  ChevronRight,
  Database,
  Lock,
  Moon,
  Palette,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <SettingsIcon className="h-4 w-4" />
          Preferences
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Manage your AI Copilot preferences, notifications, privacy, and
          account settings.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Settings navigation */}
        <aside className="saas-card h-fit p-2">
          {[
            { label: "General", icon: UserRound, active: true },
            { label: "AI preferences", icon: Bot },
            { label: "Notifications", icon: Bell },
            { label: "Privacy & security", icon: Lock },
            { label: "Appearance", icon: Palette },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* Settings content */}
        <div className="space-y-6">
          <section className="saas-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  AI Copilot preferences
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Control how your AI learning and career assistant behaves.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Personalized recommendations",
                  description:
                    "Allow AI to use your learning progress when generating recommendations.",
                  enabled: true,
                },
                {
                  title: "Learning activity analysis",
                  description:
                    "Use your study activity to improve planning suggestions.",
                  enabled: true,
                },
                {
                  title: "Career recommendations",
                  description:
                    "Use your profile and skill progress for career guidance.",
                  enabled: true,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={`relative h-6 w-11 shrink-0 rounded-full ${
                      item.enabled ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        item.enabled ? "right-1" : "left-1"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="saas-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose which updates you want to receive.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Study session reminders",
                "Deadline reminders",
                "Weekly progress summary",
                "Career opportunity alerts",
              ].map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="saas-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Privacy & security
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review how your account and learning data are protected.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {[
                {
                  title: "Account security",
                  description: "Password and authentication settings",
                  icon: Lock,
                },
                {
                  title: "Learning data",
                  description: "Manage your saved learning information",
                  icon: Database,
                },
                {
                  title: "AI memory",
                  description: "Manage information used for personalization",
                  icon: Sparkles,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="saas-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Moon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Appearance
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Customize how AI Copilot looks.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Light", "System", "Dark"].map((theme) => (
                <button
                  key={theme}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    theme === "Light"
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button className="saas-button saas-button-primary">
              <Save className="h-4 w-4" />
              Save preferences
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
        <span className="status-dot bg-emerald-500" />
        Settings synchronized
      </div>
    </div>
  );
}
