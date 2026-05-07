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
          localStorage.clear();
          window.location.href = '/login';
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
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      if (!originalRequest.url.includes('/auth/')) {
        localStorage.clear();
        window.location.href = '/login';
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
  registerCourse:       (offeringId)     => api.post('/student/register', { offeringId }),
  dropCourse:           (enrollmentId)   => api.delete(`/student/enrollments/${enrollmentId}/drop`),
  withdrawCourse:       (enrollmentId, reason) =>
    api.post(`/student/enrollments/${enrollmentId}/withdraw`, { reason }),
  // [B2-FIX] Unified notification endpoints
  getNotifications:       ()           => api.get('/notifications'),
  getUnreadCount:         ()           => api.get('/notifications/unread-count'),
  markNotificationRead:   (notifId)    => api.patch(`/notifications/${notifId}/read`),
  markAllNotificationsRead: ()         => api.patch('/notifications/read-all'),
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
  // [B9-FIX] Doctor notifications via own route
  getNotifications:       ()        => api.get('/doctor/notifications'),
  markNotificationRead:   (notifId) => api.patch(`/doctor/notifications/${notifId}/read`),
  getUnreadCount:         ()        => api.get('/notifications/unread-count'),
  markAllNotificationsRead: ()      => api.patch('/notifications/read-all'),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:         ()                 => api.get('/admin/dashboard'),
  getUsers:             (params)           => api.get('/admin/users', { params }),
  createUser:           (data)             => api.post('/admin/users', data),
  updateUser:           (userId, data)     => api.patch(`/admin/users/${userId}`, data),
  resetPassword:        (userId, newPassword) =>
    api.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  getStudents:          (params)           => api.get('/admin/students', { params }),
  getStudentDetail:     (studentId)        => api.get(`/admin/students/${studentId}`),
  getSemesters:         ()                 => api.get('/admin/semesters'),
  updateSemesterStatus: (semesterId, status) =>
    api.patch(`/admin/semesters/${semesterId}/status`, { status }),
  finalizeSemester:     (semesterId)       => api.post(`/admin/semesters/${semesterId}/finalize`),
  createOffering:       (data)             => api.post('/admin/offerings', data),
  createAnnouncement:   (data)             => api.post('/admin/announcements', data),
  getAnnouncements:     ()                 => api.get('/admin/announcements'),
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
