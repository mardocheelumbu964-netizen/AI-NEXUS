import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Learning from "./pages/Learning";
import Copilot from "./pages/Copilot";
import StudyPlanner from "./pages/StudyPlanner";
import Documents from "./pages/Documents";
import Career from "./pages/Career";
import Resume from "./pages/Resume";
import Projects from "./pages/Projects";
import Assessments from "./pages/Assessments";
import Interview from "./pages/Interview";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Roadmap from "./pages/Roadmap";
import SkillGap from "./pages/SkillGap";
import AgentActivity from "./pages/AgentActivity";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/learning" element={<Learning />} />

          <Route path="/copilot" element={<Copilot />} />

          <Route
            path="/study-planner"
            element={<StudyPlanner />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          <Route
            path="/career"
            element={<Career />}
          />

          <Route
            path="/resume"
            element={<Resume />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/assessments"
            element={<Assessments />}
          />

          <Route
            path="/skills"
            element={<SkillGap />}
          />

          <Route
            path="/interview"
            element={<Interview />}
          />

          <Route
            path="/roadmap"
            element={<Roadmap />}
          />

          <Route
            path="/progress"
            element={<Progress />}
          />

          <Route
            path="/agent-activity"
            element={<AgentActivity />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;
