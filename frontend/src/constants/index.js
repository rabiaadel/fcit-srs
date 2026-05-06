// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  STUDENTS: "/students",
  COURSES: "/courses",
  DEPARTMENTS: "/departments",
  SEMESTERS: "/semesters",
  GRADES: "/grades",
  RULES: "/rules",
  OPERATIONS: "/operations",
  ACADEMIC_STATUS: "/academic-status",
  COURSE_REGISTRATION: "/course-registration",
};

// ─── THEME COLORS (matches UniSmart brand) ────────────────────────────────────
export const COLORS = {
  // Blues
  primary: "#1b4f9e",        // deep university blue
  primaryLight: "#2563b8",   // lighter blue (overlays, hover)
  primaryDark: "#1b3a6b",    // darkest blue (text, headings)
  primaryBg: "#d6e4f0",      // card / page background tint

  // Yellow / Gold accent
  accent: "#f5c518",         // yellow (hover states, highlights)
  accentText: "#1b3a6b",     // text on yellow background

  // Neutrals
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",

  // Semantic
  success: "#16a34a",
  successBg: "#dcfce7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  warning: "#d97706",
  warningBg: "#fef3c7",
};

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
export const FONTS = {
  arabic: "'Cairo', 'Noto Sans Arabic', sans-serif",
  mono: "'Fira Code', 'Courier New', monospace",
};

// ─── ROLES ────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  TEACHER: "teacher",
};

export const ROLE_LABELS = {
  admin: "مسؤول",
  student: "طالب",
  teacher: "أستاذ",
};

// ─── NAVIGATION LINKS ─────────────────────────────────────────────────────────
// Each entry: { key, label, path, icon (string name), roles }
export const NAV_LINKS = [
  // ── Admin / Staff ──
  {
    key: "students",
    label: "الطلاب",
    path: "/dashboard/students",
    icon: "Users",
    roles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  {
    key: "courses",
    label: "المقررات",
    path: "/dashboard/courses",
    icon: "BookOpen",
    roles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  {
    key: "departments",
    label: "الأقسام",
    path: "/dashboard/departments",
    icon: "Building2",
    roles: [ROLES.ADMIN],
  },
  {
    key: "semesters",
    label: "الفصول الدراسية",
    path: "/dashboard/semesters",
    icon: "CalendarDays",
    roles: [ROLES.ADMIN],
  },
  {
    key: "grades",
    label: "نظام التقديرات",
    path: "/dashboard/grades",
    icon: "Star",
    roles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  {
    key: "rules",
    label: "القواعد الأكاديمية",
    path: "/dashboard/rules",
    icon: "ScrollText",
    roles: [ROLES.ADMIN],
  },
  {
    key: "operations",
    label: "سجل العمليات",
    path: "/dashboard/operations",
    icon: "ClipboardList",
    roles: [ROLES.ADMIN],
  },

  // ── Student ──
  {
    key: "academic-status",
    label: "الحالة الأكاديمية",
    path: "/dashboard/academic-status",
    icon: "TrendingUp",
    roles: [ROLES.STUDENT],
  },
  {
    key: "course-registration",
    label: "تسجيل المقررات",
    path: "/dashboard/course-registration",
    icon: "ClipboardCheck",
    roles: [ROLES.STUDENT],
  },
];

// ─── PAGINATION ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ─── GRADE COLOR MAP ──────────────────────────────────────────────────────────
export const GRADE_COLORS = {
  "A+": "success",
  A: "success",
  "B+": "primary",
  B: "primary",
  "B-": "primary",
  C: "warning",
  D: "warning",
  F: "danger",
};
