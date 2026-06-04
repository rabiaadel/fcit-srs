// =============================================================================
// Frontend API Service
// [F1-FIX]  sharedAPI.getSemesters now calls /semesters (shared route, not /admin/semesters)
// [B9-FIX]  doctorAPI uses /doctor/notifications, not /student/notifications
// [B2-FIX]  Unread count + mark-all-read endpoints added
// [B5-FIX]  adminAPI.getDepartments added for user creation form
// =============================================================================
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor: handle 401, token refresh ─────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Rate Limiting (429)
    if (error.response?.status === 429) {
      if (!originalRequest._hasRetried429) {
        originalRequest._hasRetried429 = true;
        // Don't toast repeatedly if there are multiple requests failing at once
        if (!window._isRateLimitToasting) {
          window._isRateLimitToasting = true;
          import('react-hot-toast').then(({ toast }) => {
            toast.error('تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً والمحاولة مرة أخرى.', {
              id: 'rate-limit-error',
              duration: 5000,
            });
            setTimeout(() => { window._isRateLimitToasting = false; }, 5000);
          });
        }
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token — reject queued requests, clear state, redirect
          isRefreshing = false;
          processQueue(new Error('No refresh token'), null);
          localStorage.clear();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.clear();
          // Avoid reloading the page if we are already on /login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      if (!originalRequest.url.includes('/auth/')) {
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (email, password)            => api.post('/auth/login', { email, password }),
  logout:         (refreshToken)               => api.post('/auth/logout', { refreshToken }),
  refresh:        (refreshToken)               => api.post('/auth/refresh', { refreshToken }),
  getMe:          ()                           => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ── Student API ───────────────────────────────────────────────────────────────
export const studentAPI = {
  getProfile:           ()               => api.get('/student/profile'),
  getDashboard:         ()               => api.get('/student/dashboard'),
  getTranscript:        ()               => api.get('/student/transcript'),
  getGraduationStatus:  ()               => api.get('/student/graduation-status'),
  getWarnings:          ()               => api.get('/student/warnings'),
  getSchedule:          (semesterId)     => api.get(`/student/semesters/${semesterId}/schedule`),
  getAvailableCourses:  (semesterId)     => api.get(`/student/semesters/${semesterId}/available-courses`),
  getCoursesByPlan:     (semesterId)     => api.get(`/student/semesters/${semesterId}/courses-by-plan`),
  registerCourse:       (offeringId)     => api.post('/student/register', { offeringId }),
  dropCourse:           (enrollmentId)   => api.delete(`/student/enrollments/${enrollmentId}/drop`),
  withdrawCourse:       (enrollmentId, reason) =>
    api.post(`/student/enrollments/${enrollmentId}/withdraw`, { reason }),
  // [B2-FIX] Unified notification endpoints
  getNotifications:       ()           => api.get('/notifications'),
  getUnreadCount:         ()           => api.get('/notifications/unread-count'),
  markNotificationRead:   (notifId)    => api.patch(`/notifications/${notifId}/read`),
  markAllNotificationsRead: ()         => api.patch('/notifications/read-all'),
  getNotificationDetail:  (notifId)    => api.get(`/notifications/${notifId}/detail`),
  // FR-1 to FR-5: Credit hours + eligibility + alternatives
  getCreditSummary:       (semId)      => api.get(`/student/semesters/${semId}/credit-summary`),
  checkEligibility:       (semId, oid) => api.get(`/student/semesters/${semId}/offerings/${oid}/eligibility`),
  getAlternatives:        (semId, oid) => api.get(`/student/semesters/${semId}/offerings/${oid}/alternatives`),
  validateRegistration:   (semId, d)   => api.post(`/student/semesters/${semId}/validate-registration`, d),
};

// ── Doctor API ────────────────────────────────────────────────────────────────
export const doctorAPI = {
  getDashboard:    ()              => api.get('/doctor/dashboard'),
  getMyCourses:    ()              => api.get('/doctor/courses'),
  getCourseRoster: (offeringId)   => api.get(`/doctor/offerings/${offeringId}/roster`),
  enterGrades:     (enrollmentId, grades) =>
    api.patch(`/doctor/enrollments/${enrollmentId}/grades`, grades),
  bulkEnterGrades: (offeringId, grades) =>
    api.post(`/doctor/offerings/${offeringId}/grades/bulk`, { grades }),
  recordAttendance:    (offeringId, data) =>
    api.post(`/doctor/offerings/${offeringId}/attendance`, data),
  getAttendanceReport: (offeringId) =>
    api.get(`/doctor/offerings/${offeringId}/attendance`),
  getSchedule:         (params)    => api.get('/doctor/schedule', { params }),
  // [B9-FIX] Doctor notifications via own route
  getNotifications:       ()        => api.get('/doctor/notifications'),
  markNotificationRead:   (notifId) => api.patch(`/doctor/notifications/${notifId}/read`),
  getUnreadCount:         ()        => api.get('/notifications/unread-count'),
  markAllNotificationsRead: ()      => api.patch('/notifications/read-all'),
  getNotificationDetail:  (notifId) => api.get(`/notifications/${notifId}/detail`),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:         ()                 => api.get('/admin/dashboard'),
  getUsers:             (params)           => api.get('/admin/users', { params }),
  createUser:           (data)             => api.post('/admin/users', data),
  updateUser:           (userId, data)     => api.patch(`/admin/users/${userId}`, data),
  resetPassword:        (userId, newPassword) =>
    api.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  // Bulk Import Users
  validateUsersBulk:    (rows)             => api.post('/admin/users/validate-bulk', { rows }),
  bulkImportUsers:      (data)             => api.post('/admin/users/bulk-import', data),
  getStudents:          (params)           => api.get('/admin/students', { params }),
  getStudentDetail:     (studentId)        => api.get(`/admin/students/${studentId}`),
  getSemesters:         ()                 => api.get('/admin/semesters'),
  createSemester:       (data)             => api.post('/admin/semesters', data),
  updateSemesterStatus: (semesterId, status) =>
    api.patch(`/admin/semesters/${semesterId}/status`, { status }),
  updateSemesterDates:  (semesterId, dates) => 
    api.patch(`/admin/semesters/${semesterId}/dates`, dates),
  finalizeSemester:     (semesterId)       => api.post(`/admin/semesters/${semesterId}/finalize`),
  createOffering:       (data)             => api.post('/admin/offerings', data),
  createAnnouncement:   (data)             => api.post('/admin/announcements', data),
  getAnnouncements:     ()                 => api.get('/admin/announcements'),
  deleteAnnouncement:   (id)               => api.delete(`/admin/announcements/${id}`),
  getAcademicReport:    ()                 => api.get('/admin/reports/academic'),
  getNotifications:     ()                 => api.get('/notifications'),
  markNotificationRead: (notifId)          => api.patch(`/notifications/${notifId}/read`),
  markAllNotificationsRead: ()             => api.patch('/notifications/read-all'),
  getUnreadCount:       ()                 => api.get('/notifications/unread-count'),

  // [C6-FIX] Course management
  getCourses:           (params)           => api.get('/admin/courses', { params }),
  createCourse:         (data)             => api.post('/admin/courses', data),
  updateCourse:         (courseId, data)   => api.patch(`/admin/courses/${courseId}`, data),
  deleteCourse:         (courseId)         => api.delete(`/admin/courses/${courseId}`),
  addPrerequisite:      (courseId, data)   => api.post(`/admin/courses/${courseId}/prerequisites`, data),

  // Offerings
  getOfferings:         (params)           => api.get('/admin/offerings', { params }),
  updateOffering:       (offeringId, data) => api.patch(`/admin/offerings/${offeringId}`, data),

  // [C7-FIX] Student enrollment override
  enrollStudent:        (studentId, data)  => api.post(`/admin/students/${studentId}/enroll`, data),
  forceDropStudent:     (studentId, enrollmentId, data) =>
    api.delete(`/admin/students/${studentId}/enroll/${enrollmentId}`, { data }),
  getStudentEnrollments:(studentId, params) => api.get(`/admin/students/${studentId}/enrollments`, { params }),

  // Registration control
  getRegistrationStatus:()                  => api.get('/admin/registration/status'),
  toggleRegistration:   (semesterId, action) =>
    api.post('/admin/registration/toggle', { semesterId, action }),

  // V3 Extensions
  // Curriculum plans
  getCurriculumPlan:    (spec)              => api.get('/admin/curriculum', { params: { specialization: spec } }),
  addCourseToCurriculum:(data)              => api.post('/admin/curriculum', data),
  updateCurriculumEntry:(planId, data)      => api.put(`/admin/curriculum/${planId}`, data),
  removeCourseFromCurriculum:(planId)       => api.delete(`/admin/curriculum/${planId}`),
  // Bylaw config (Database)
  getBylawConfig:       ()                  => api.get('/admin/bylaw-config'),
  updateBylawConfig:    (key, value)        => api.put(`/admin/bylaw-config/${key}`, { value }),
  resetBylawConfig:     (key)               => api.post(`/admin/bylaw-config/${key}/reset`),
  // Bylaw config (JSON Full)
  getBylawFull:         ()                  => api.get('/admin/bylaw-full'),
  updateBylawFull:      (data)              => api.post('/admin/bylaw-full', data),
  // Departments CRUD
  getDepartmentsFull:   ()                  => api.get('/admin/departments'),
  createDepartment:     (data)              => api.post('/admin/departments', data),
  updateDepartment:     (deptId, data)      => api.patch(`/admin/departments/${deptId}`, data),
  // Doctor schedule
  getDoctorSchedule:    (doctorId, params)  => api.get(`/admin/doctor-schedule/${doctorId}`, { params }),
  assignSchedule:       (offeringId, data)  => api.post(`/admin/offerings/${offeringId}/schedule`, data),
  // Prerequisites UI
  getPrerequisites:     (courseId)          => api.get(`/admin/courses/${courseId}/prerequisites`),
  removePrerequisite:   (courseId, prereqId)=> api.delete(`/admin/courses/${courseId}/prerequisites/${prereqId}`),
  // Reports
  getDetailedReports:   (params)            => api.get('/admin/reports/detailed', { params }),
  // Notification detail
  getNotificationDetail:(notifId)           => api.get(`/notifications/${notifId}/detail`),
};

// ── Shared API ────────────────────────────────────────────────────────────────
// [F1-FIX] getSemesters now calls /semesters (shared route accessible to all roles)
export const sharedAPI = {
  getCourses:        (params)  => api.get('/courses', { params }),
  getDepartments:    ()        => api.get('/departments'),           // [B5-FIX] needed for user creation
  getCurrentSemester: ()       => api.get('/semesters/current'),
  getSemesters:      ()        => api.get('/semesters'),             // [F1-FIX] shared, not /admin/semesters
  getAcademicRules:  ()        => api.get('/academic-rules'),
  getAnnouncements:  ()        => api.get('/announcements'),
};

export default api;
