import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth pages
import UniSmartAuth from "./pages/auth/UniSmartAuth";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard pages
import StudentsPage from "./pages/dashboard/StudentsPage";
import CoursesPage from "./pages/dashboard/CoursesPage";
import DepartmentsPage from "./pages/dashboard/DepartmentsPage";
import SemestersPage from "./pages/dashboard/SemestersPage";
import GradesPage from "./pages/dashboard/GradesPage";
import RulesPage from "./pages/dashboard/RulesPage";
import OperationsPage from "./pages/dashboard/OperationsPage";
import AcademicStatusPage from "./pages/dashboard/AcademicStatusPage";
import CourseRegistrationPage from "./pages/dashboard/CourseRegistrationPage";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<UniSmartAuth />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="students" replace />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="semesters" element={<SemestersPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="academic-status" element={<AcademicStatusPage />} />
        <Route path="course-registration" element={<CourseRegistrationPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
