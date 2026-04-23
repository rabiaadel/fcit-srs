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

      // Non-expired 401 (e.g., deactivated account)
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
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ── Student API ───────────────────────────────────────────────────────────────
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  getDashboard: () => api.get('/student/dashboard'),
  getTranscript: () => api.get('/student/transcript'),
  getGraduationStatus: () => api.get('/student/graduation-status'),
  getWarnings: () => api.get('/student/warnings'),
  getSchedule: (semesterId) => api.get(`/student/semesters/${semesterId}/schedule`),
  getAvailableCourses: (semesterId) => api.get(`/student/semesters/${semesterId}/available-courses`),
  registerCourse: (offeringId) => api.post('/student/register', { offeringId }),
  dropCourse: (enrollmentId) => api.delete(`/student/enrollments/${enrollmentId}/drop`),
  withdrawCourse: (enrollmentId, reason) =>
    api.post(`/student/enrollments/${enrollmentId}/withdraw`, { reason }),
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (notifId) => api.patch(`/student/notifications/${notifId}/read`),
};

// ── Doctor API ────────────────────────────────────────────────────────────────
export const doctorAPI = {
  getDashboard: () => api.get('/doctor/dashboard'),
  getMyCourses: () => api.get('/doctor/courses'),
  getCourseRoster: (offeringId) => api.get(`/doctor/offerings/${offeringId}/roster`),
  enterGrades: (enrollmentId, grades) =>
    api.patch(`/doctor/enrollments/${enrollmentId}/grades`, grades),
  bulkEnterGrades: (offeringId, grades) =>
    api.post(`/doctor/offerings/${offeringId}/grades/bulk`, { grades }),
  recordAttendance: (offeringId, data) =>
    api.post(`/doctor/offerings/${offeringId}/attendance`, data),
  getAttendanceReport: (offeringId) =>
    api.get(`/doctor/offerings/${offeringId}/attendance`),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (userId, data) => api.patch(`/admin/users/${userId}`, data),
  resetPassword: (userId, newPassword) =>
    api.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudentDetail: (studentId) => api.get(`/admin/students/${studentId}`),
  getSemesters: () => api.get('/admin/semesters'),
  updateSemesterStatus: (semesterId, status) =>
    api.patch(`/admin/semesters/${semesterId}/status`, { status }),
  finalizeSemester: (semesterId) =>
    api.post(`/admin/semesters/${semesterId}/finalize`),
  createOffering: (data) => api.post('/admin/offerings', data),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getAnnouncements: () => api.get('/announcements'),
  getAcademicReport: () => api.get('/admin/reports/academic'),
};

// ── Shared API ────────────────────────────────────────────────────────────────
export const sharedAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getDepartments: () => api.get('/departments'),
  getCurrentSemester: () => api.get('/semesters/current'),
  getSemesters: () => api.get('/admin/semesters'),
  getAcademicRules: () => api.get('/academic-rules'),
};

export default api;
