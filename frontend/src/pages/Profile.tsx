import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Mail,
  MapPin,
  Save,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  institution: string;
  degree: string;
  specialization: string;
  graduationYear: string;
  careerGoal: string;
  targetRole: string;
  experienceLevel: string;
  skills: string[];
  interests: string[];
  bio: string;
};

const defaultProfile: ProfileData = {
  fullName: "Student",
  email: "student@example.com",
  phone: "",
  location: "",
  institution: "",
  degree: "BCA",
  specialization: "Computer Applications",
  graduationYear: "2026",
  careerGoal: "Build a strong career in technology",
  targetRole: "Software Developer",
  experienceLevel: "Fresher",
  skills: [
    "Python",
    "Java",
    "SQL",
    "HTML",
    "CSS",
    "JavaScript",
  ],
  interests: [
    "Artificial Intelligence",
    "Web Development",
    "Data Analytics",
  ],
  bio: "Aspiring technology professional focused on building practical skills, completing meaningful projects, and becoming career ready.",
};

function loadProfile(): ProfileData {
  try {
    const storedUser = localStorage.getItem("ai_nexus_user");

    if (!storedUser) {
      return defaultProfile;
    }

    const user = JSON.parse(storedUser);

    return {
      ...defaultProfile,
      fullName:
        user?.full_name ||
        user?.name ||
        user?.username ||
        defaultProfile.fullName,
      email: user?.email || defaultProfile.email,
    };
  } catch {
    return defaultProfile;
  }
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    const storedProfile = localStorage.getItem("ai_nexus_profile");

    if (!storedProfile) {
      return;
    }

    try {
      const parsed = JSON.parse(storedProfile);

      if (parsed && typeof parsed === "object") {
        setProfile((current) => ({
          ...current,
          ...parsed,
        }));
        setDraft((current) => ({
          ...current,
          ...parsed,
        }));
      }
    } catch {
      // Keep the default profile when stored profile data is invalid.
    }
  }, []);

  const initials = useMemo(() => {
    const parts = profile.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "ST";
    }

    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [profile.fullName]);

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(profile.fullName.trim()),
      Boolean(profile.email.trim()),
      Boolean(profile.institution.trim()),
      Boolean(profile.degree.trim()),
      Boolean(profile.careerGoal.trim()),
      Boolean(profile.targetRole.trim()),
      profile.skills.length >= 3,
      profile.interests.length >= 1,
      Boolean(profile.bio.trim()),
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [profile]);

  const startEditing = () => {
    setDraft(profile);
    setSaved(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setSkillInput("");
    setInterestInput("");
    setEditing(false);
  };

  const saveProfile = () => {
    setProfile(draft);
    localStorage.setItem("ai_nexus_profile", JSON.stringify(draft));

    const storedUser = localStorage.getItem("ai_nexus_user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        localStorage.setItem(
          "ai_nexus_user",
          JSON.stringify({
            ...user,
            full_name: draft.fullName,
            name: draft.fullName,
            email: draft.email,
          })
        );
      } catch {
        // Profile data remains saved independently.
      }
    }

    setSaved(true);
    setEditing(false);
  };

  const updateDraft = <K extends keyof ProfileData>(
    field: K,
    value: ProfileData[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value || draft.skills.includes(value)) {
      return;
    }

    updateDraft("skills", [...draft.skills, value]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateDraft(
      "skills",
      draft.skills.filter((item) => item !== skill)
    );
  };

  const addInterest = () => {
    const value = interestInput.trim();

    if (!value || draft.interests.includes(value)) {
      return;
    }

    updateDraft("interests", [...draft.interests, value]);
    setInterestInput("");
  };

  const removeInterest = (interest: string) => {
    updateDraft(
      "interests",
      draft.interests.filter((item) => item !== interest)
    );
  };

  const displayProfile = editing ? draft : profile;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="animate-fade-up flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <User className="h-4 w-4" />
            Student Profile
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your professional profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Keep your academic background, career goals, skills, and
            interests updated so AI COPILOT can personalize your learning
            and career recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && !editing && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </div>
          )}

          {!editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="saas-button saas-button-primary"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="saas-button saas-button-secondary"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                className="saas-button saas-button-primary"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </section>

      {/* Profile Hero */}
      <section className="saas-card ai-grid relative overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-100/70 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-200 sm:h-24 sm:w-24 sm:text-2xl">
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {displayProfile.fullName}
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Personalized
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {displayProfile.targetRole}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                {displayProfile.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {displayProfile.email}
                  </span>
                )}

                {displayProfile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {displayProfile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-xs rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Profile completion
              </span>

              <span className="text-lg font-bold text-indigo-600">
                {profileCompletion}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              A complete profile helps the AI generate more relevant
              recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        {/* Personal Information */}
        <section className="saas-card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <User className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Personal information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Basic information used to personalize your AI experience.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              value={displayProfile.fullName}
              editing={editing}
              onChange={(value) => updateDraft("fullName", value)}
            />

            <Field
              label="Email"
              value={displayProfile.email}
              editing={editing}
              onChange={(value) => updateDraft("email", value)}
              type="email"
            />

            <Field
              label="Phone"
              value={displayProfile.phone}
              editing={editing}
              onChange={(value) => updateDraft("phone", value)}
            />

            <Field
              label="Location"
              value={displayProfile.location}
              editing={editing}
              onChange={(value) => updateDraft("location", value)}
              placeholder="City, Country"
            />
          </div>
        </section>

        {/* AI Profile */}
        <section className="saas-card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                AI personalization
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Your profile powers personalized learning and career
                recommendations.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <InfoRow
              icon={<Target className="h-4 w-4" />}
              label="Career goal"
              value={displayProfile.careerGoal}
            />

            <InfoRow
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Target role"
              value={displayProfile.targetRole}
            />

            <InfoRow
              icon={<Award className="h-4 w-4" />}
              label="Experience"
              value={displayProfile.experienceLevel}
            />
          </div>
        </section>

        {/* Education */}
        <section className="saas-card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Education
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your academic background.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field
              label="Institution"
              value={displayProfile.institution}
              editing={editing}
              onChange={(value) => updateDraft("institution", value)}
              placeholder="College / University"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Degree"
                value={displayProfile.degree}
                editing={editing}
                onChange={(value) => updateDraft("degree", value)}
              />

              <Field
                label="Graduation year"
                value={displayProfile.graduationYear}
                editing={editing}
                onChange={(value) =>
                  updateDraft("graduationYear", value)
                }
              />
            </div>

            <Field
              label="Specialization"
              value={displayProfile.specialization}
              editing={editing}
              onChange={(value) =>
                updateDraft("specialization", value)
              }
            />
          </div>
        </section>

        {/* Career */}
        <section className="saas-card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <Target className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Career direction
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tell AI COPILOT where you want to go.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field
              label="Career goal"
              value={displayProfile.careerGoal}
              editing={editing}
              onChange={(value) => updateDraft("careerGoal", value)}
            />

            <Field
              label="Target role"
              value={displayProfile.targetRole}
              editing={editing}
              onChange={(value) => updateDraft("targetRole", value)}
            />

            {editing ? (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Experience level
                </label>

                <select
                  value={draft.experienceLevel}
                  onChange={(event) =>
                    updateDraft(
                      "experienceLevel",
                      event.target.value
                    )
                  }
                  className="saas-input"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            ) : (
              <InfoRow
                icon={<BriefcaseBusiness className="h-4 w-4" />}
                label="Experience level"
                value={displayProfile.experienceLevel}
              />
            )}
          </div>
        </section>
      </div>

      {/* Skills + Interests */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="saas-card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex rounded-xl bg-cyan-50 p-2.5 text-cyan-600">
                <BookOpen className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Technical skills
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Skills used by the Skill Gap and Career agents.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {displayProfile.skills.length} skills
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {displayProfile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
              >
                {skill}

                {editing && (
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {editing && (
            <div className="mt-5 flex gap-2">
              <input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill"
                className="saas-input"
              />

              <button
                type="button"
                onClick={addSkill}
                className="saas-button saas-button-secondary shrink-0"
              >
                Add
              </button>
            </div>
          )}
        </section>

        <section className="saas-card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Interests
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Topics that help AI personalize recommendations.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {displayProfile.interests.length} interests
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {displayProfile.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
              >
                {interest}

                {editing && (
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="rounded-full p-0.5 text-amber-500 hover:bg-amber-100 hover:text-amber-800"
                    aria-label={`Remove ${interest}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {editing && (
            <div className="mt-5 flex gap-2">
              <input
                value={interestInput}
                onChange={(event) =>
                  setInterestInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="Add an interest"
                className="saas-input"
              />

              <button
                type="button"
                onClick={addInterest}
                className="saas-button saas-button-secondary shrink-0"
              >
                Add
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Bio */}
      <section className="saas-card animate-fade-up p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
            <User className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Professional summary
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              A short introduction that represents your current direction.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {editing ? (
            <textarea
              value={draft.bio}
              onChange={(event) =>
                updateDraft("bio", event.target.value)
              }
              rows={5}
              maxLength={600}
              className="saas-input resize-none"
              placeholder="Write a short professional summary..."
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {displayProfile.bio || "No professional summary added yet."}
            </div>
          )}

          {editing && (
            <div className="mt-2 text-right text-xs text-slate-400">
              {draft.bio.length}/600
            </div>
          )}
        </div>
      </section>

      {/* AI Note */}
      <section className="ai-gradient saas-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Your profile powers the AI Copilot
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">
                Career Guidance, Skill Gap Analysis, Resume Assistant,
                Roadmap, Study Planner, and Next Best Action can use this
                information to create more relevant recommendations.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="status-dot status-dot-online" />
            Personalization active
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="saas-input"
        />
      ) : (
        <div className="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
          {value || (
            <span className="font-normal text-slate-400">
              Not provided
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mt-0.5 rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}
