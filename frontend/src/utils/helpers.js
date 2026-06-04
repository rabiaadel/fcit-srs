// ═══════════════════════════════════════════════════════════════════════════
// Utility helpers — shared across all pages
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unwrap API response: handles both res.data and res.data.data shapes
 * from the backend's double-wrap pattern.
 */
export const D = (r) => {
  const d = r?.data?.data ?? r?.data ?? null;
  // Handle nested paginated data: { data: [...], page: X, total: Y }
  if (d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.data)) {
    const arr = d.data;
    // Attach pagination/meta properties directly to the array
    Object.keys(d).forEach(k => {
      if (k !== 'data') arr[k] = d[k];
    });
    return arr;
  }
  return d;
};

/** Arabic level labels — REMOVED: levels are now dynamically sent from the backend via bylawService.creditsToLevel() */

/** Arabic role labels */
export const ROLE_AR = {
  admin: 'مسؤول',
  doctor: 'دكتور',
  student: 'طالب',
};

/** Role home paths */
export const ROLE_HOME = {
  admin: '/admin',
  doctor: '/doctor',
  student: '/student',
};

/** Format date to Arabic locale string */
export const formatDateAr = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG');
  } catch {
    return '—';
  }
};

/** Format datetime to Arabic locale string */
export const formatDateTimeAr = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('ar-EG');
  } catch {
    return '—';
  }
};

/** Get user initials (first character) */
export const getInitials = (user) => {
  return (user?.fullNameAr || user?.fullNameEn || 'م').charAt(0);
};

/** Normalize backend field name — handles both camelCase and snake_case */
export const nf = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
  }
  return undefined;
};

/** Get GPA color */
export const getGpaColor = (gpa) => {
  const n = Number(gpa || 0);
  if (n < 2) return 'var(--color-error)';
  if (n < 3) return 'var(--color-warning)';
  return 'var(--color-success)';
};

/** Get attendance color */
export const getAttendanceColor = (pct) => {
  const n = Number(pct || 0);
  if (n < 42) return 'var(--color-error)';
  if (n < 75) return 'var(--color-warning)';
  return 'var(--color-success)';
};

/** Extract date part from ISO string */
export const isoDate = (str) => str?.split?.('T')?.[0] || '';

/** Category colors for course categories */
export const CATEGORY_COLORS = {
  university_req: '#7c3aed',
  math_science: '#0891b2',
  basic_computing: '#16a34a',
  applied_computing: '#2563eb',
  elective: '#d97706',
  project: '#1e293b',
  training: '#059669',
  mandatory: '#16a34a',
  core_cs: '#2563eb',
  specialization: '#7c3aed',
  free_elective: '#d97706',
  supporting: '#0891b2',
};

/** Category Arabic labels */
export const CATEGORY_AR = {
  university_req: 'متطلب جامعي',
  math_science: 'رياضيات وعلوم',
  basic_computing: 'حوسبة أساسية',
  applied_computing: 'حوسبة تطبيقية',
  elective: 'اختياري',
  project: 'مشروع',
  training: 'تدريب',
  mandatory: 'إلزامي',
  core_cs: 'حوسبة أساسية',
  specialization: 'تخصص',
  free_elective: 'اختياري حر',
  supporting: 'مساندة',
};
