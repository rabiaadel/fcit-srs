import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BylawProvider } from './contexts/BylawContext';
import { ROLE_HOME } from './utils/helpers';
import { Spinner } from './components/ui';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/* Restore saved theme before first paint — prevents flash */
function ThemeBootstrap() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unismart-theme');
      if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    } catch { /* ignore */ }
  }, []);
  return null;
}

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

const PageFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-page)' }}>
    <Spinner />
  </div>
);

function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });
}

const LoginPage               = lazyWithRetry(() => import('./pages/auth/LoginPage'));
const ForgotPage              = lazyWithRetry(() => import('./pages/auth/ForgotPage'));
const ChangePwPage            = lazyWithRetry(() => import('./pages/auth/ChangePwPage'));
const NotificationsPage       = lazyWithRetry(() => import('./pages/shared/NotificationsPage'));
const StudentDashboard        = lazyWithRetry(() => import('./pages/student/StudentDashboard'));
const CourseRegPage           = lazyWithRetry(() => import('./pages/student/CourseRegPage'));
const SchedulePage            = lazyWithRetry(() => import('./pages/student/SchedulePage'));
const TranscriptPage          = lazyWithRetry(() => import('./pages/student/TranscriptPage'));
const GraduationPage          = lazyWithRetry(() => import('./pages/student/GraduationPage'));
const DoctorDashboard         = lazyWithRetry(() => import('./pages/doctor/DoctorDashboard'));
const DoctorCoursesPage       = lazyWithRetry(() => import('./pages/doctor/DoctorCoursesPage'));
const CourseRosterPage        = lazyWithRetry(() => import('./pages/doctor/CourseRosterPage'));
const DoctorSchedulePage      = lazyWithRetry(() => import('./pages/doctor/DoctorSchedulePage'));
const AdminDashboard          = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const AdminStudentsPage       = lazyWithRetry(() => import('./pages/admin/AdminStudentsPage'));
const AdminStudentDetail      = lazyWithRetry(() => import('./pages/admin/AdminStudentDetail'));
const AdminUsersPage          = lazyWithRetry(() => import('./pages/admin/AdminUsersPage'));
const AdminSemestersPage      = lazyWithRetry(() => import('./pages/admin/AdminSemestersPage'));
const AdminCoursesPage        = lazyWithRetry(() => import('./pages/admin/AdminCoursesPage'));
const AdminTimetablePage      = lazyWithRetry(() => import('./pages/admin/AdminTimetablePage'));
const AdminRegistrationPage   = lazyWithRetry(() => import('./pages/admin/AdminRegistrationPage'));
const AdminReportsPage        = lazyWithRetry(() => import('./pages/admin/AdminReportsPage'));
const AnnouncementsPage       = lazyWithRetry(() => import('./pages/admin/AnnouncementsPage'));
const SharedAnnouncementsPage = lazyWithRetry(() => import('./pages/shared/SharedAnnouncementsPage'));
const AdminCurriculumPage     = lazyWithRetry(() => import('./pages/admin/AdminCurriculumPage'));
const AdminBylawEditor        = lazyWithRetry(() => import('./pages/admin/AdminBylawEditor'));
const AdminDepartmentsPage    = lazyWithRetry(() => import('./pages/admin/AdminDepartmentsPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeBootstrap />
        <AuthProvider>
          <BylawProvider>
            <Toaster
              position="bottom-left"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: 'var(--font-family)',
                  direction: 'rtl',
                  textAlign: 'right',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-gray-200)',
                  background: 'var(--surface-card)',
                  color: 'var(--color-gray-800)',
                  boxShadow: 'var(--shadow-lg)',
                },
                success: {
                  duration: 3500,
                  iconTheme: { primary: 'var(--color-success)', secondary: '#fff' },
                },
                error: {
                  duration: 5000,
                  iconTheme: { primary: 'var(--color-error)', secondary: '#fff' },
                },
              }}
            />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot" element={<ForgotPage />} />
                <Route path="/change-password" element={<Guard><ChangePwPage /></Guard>} />

                <Route path="/student" element={<Guard roles={['student']}><StudentDashboard /></Guard>} />
                <Route path="/student/courses" element={<Guard roles={['student']}><CourseRegPage /></Guard>} />
                <Route path="/student/schedule" element={<Guard roles={['student']}><SchedulePage /></Guard>} />
                <Route path="/student/transcript" element={<Guard roles={['student']}><TranscriptPage /></Guard>} />
                <Route path="/student/graduation" element={<Guard roles={['student']}><GraduationPage /></Guard>} />
                <Route path="/student/notifications" element={<Guard roles={['student']}><NotificationsPage /></Guard>} />
                <Route path="/student/announcements" element={<Guard roles={['student']}><SharedAnnouncementsPage /></Guard>} />

                <Route path="/doctor" element={<Guard roles={['doctor']}><DoctorDashboard /></Guard>} />
                <Route path="/doctor/courses" element={<Guard roles={['doctor']}><DoctorCoursesPage /></Guard>} />
                <Route path="/doctor/courses/:offeringId" element={<Guard roles={['doctor', 'admin']}><CourseRosterPage /></Guard>} />
                <Route path="/doctor/schedule" element={<Guard roles={['doctor']}><DoctorSchedulePage /></Guard>} />
                <Route path="/doctor/notifications" element={<Guard roles={['doctor']}><NotificationsPage /></Guard>} />
                <Route path="/doctor/announcements" element={<Guard roles={['doctor']}><SharedAnnouncementsPage /></Guard>} />

                <Route path="/admin" element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
                <Route path="/admin/students" element={<Guard roles={['admin']}><AdminStudentsPage /></Guard>} />
                <Route path="/admin/students/:studentId" element={<Guard roles={['admin']}><AdminStudentDetail /></Guard>} />
                <Route path="/admin/users" element={<Guard roles={['admin']}><AdminUsersPage /></Guard>} />
                <Route path="/admin/semesters" element={<Guard roles={['admin']}><AdminSemestersPage /></Guard>} />
                <Route path="/admin/timetable" element={<Guard roles={['admin']}><AdminTimetablePage /></Guard>} />
                <Route path="/admin/courses" element={<Guard roles={['admin']}><AdminCoursesPage /></Guard>} />
                <Route path="/admin/registration" element={<Guard roles={['admin']}><AdminRegistrationPage /></Guard>} />
                <Route path="/admin/reports" element={<Guard roles={['admin']}><AdminReportsPage /></Guard>} />
                <Route path="/admin/announcements" element={<Guard roles={['admin']}><AnnouncementsPage /></Guard>} />
                <Route path="/admin/notifications" element={<Guard roles={['admin']}><NotificationsPage /></Guard>} />
                <Route path="/admin/curriculum" element={<Guard roles={['admin']}><AdminCurriculumPage /></Guard>} />
                <Route path="/admin/bylaw-config" element={<Guard roles={['admin']}><AdminBylawEditor /></Guard>} />
                <Route path="/admin/departments" element={<Guard roles={['admin']}><AdminDepartmentsPage /></Guard>} />

                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </BylawProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
