// ═══════════════════════════════════════════════════════════════════════════
// Navigation and page title constants
// ═══════════════════════════════════════════════════════════════════════════

/** Sidebar navigation items */
export const NAV_ITEMS = [
  // Admin
  { to: '/admin',              icon: 'LayoutDashboard', label: 'لوحة التحكم',       roles: ['admin'] },
  { to: '/admin/students',     icon: 'Users',           label: 'الطلاب',             roles: ['admin'] },
  { to: '/admin/courses',      icon: 'BookOpen',        label: 'المقررات',            roles: ['admin'] },
  { to: '/admin/users',        icon: 'Settings',        label: 'المستخدمون',          roles: ['admin'] },
  { to: '/admin/semesters',    icon: 'Calendar',        label: 'الفصول الدراسية',     roles: ['admin'] },
  { to: '/admin/timetable',    icon: 'Calendar',        label: 'الجدول الدراسي',      roles: ['admin'] },
  { to: '/admin/registration', icon: 'ClipboardList',   label: 'التسجيل',             roles: ['admin'] },
  { to: '/admin/curriculum',   icon: 'FolderOpen',      label: 'الخطة الدراسية',      roles: ['admin'] },
  { to: '/admin/departments',  icon: 'Building2',       label: 'الأقسام',              roles: ['admin'] },
  { to: '/admin/bylaw-config', icon: 'Scale',           label: 'إعدادات اللوائح',     roles: ['admin'] },
  { to: '/admin/reports',      icon: 'BarChart3',       label: 'التقارير',             roles: ['admin'] },
  { to: '/admin/announcements',icon: 'Megaphone',       label: 'الإعلانات',           roles: ['admin'] },
  { to: '/admin/notifications',icon: 'Bell',            label: 'الإشعارات',           roles: ['admin'] },
  // Doctor
  { to: '/doctor',             icon: 'LayoutDashboard', label: 'لوحة التحكم',         roles: ['doctor'] },
  { to: '/doctor/courses',     icon: 'BookOpen',        label: 'مقرراتي',             roles: ['doctor'] },
  { to: '/doctor/schedule',    icon: 'Calendar',        label: 'جدولي',               roles: ['doctor'] },
  { to: '/doctor/notifications',icon: 'Bell',           label: 'الإشعارات',          roles: ['doctor'] },
  { to: '/doctor/announcements',icon: 'Megaphone',      label: 'الإعلانات',          roles: ['doctor'] },
  // Student
  { to: '/student',            icon: 'LayoutDashboard', label: 'لوحة التحكم',         roles: ['student'] },
  { to: '/student/courses',    icon: 'ClipboardList',   label: 'تسجيل المقررات',      roles: ['student'] },
  { to: '/student/schedule',   icon: 'Calendar',        label: 'جدولي',               roles: ['student'] },
  { to: '/student/transcript', icon: 'FileText',        label: 'كشف الدرجات',         roles: ['student'] },
  { to: '/student/graduation', icon: 'GraduationCap',   label: 'حالة التخرج',         roles: ['student'] },
  { to: '/student/notifications',icon: 'Bell',          label: 'الإشعارات',          roles: ['student'] },
  { to: '/student/announcements',icon: 'Megaphone',     label: 'الإعلانات',          roles: ['student'] },
];

/** Page title lookup by path */
export const PAGE_TITLES = {
  '/admin':               'لوحة التحكم',
  '/admin/students':      'الطلاب',
  '/admin/courses':       'المقررات',
  '/admin/users':         'إدارة المستخدمين',
  '/admin/semesters':     'الفصول الدراسية',
  '/admin/timetable':     'الجدول الدراسي',
  '/admin/registration':  'التسجيل',
  '/admin/curriculum':    'الخطة الدراسية',
  '/admin/departments':   'الأقسام',
  '/admin/bylaw-config':  'إعدادات اللوائح',
  '/admin/reports':       'التقارير',
  '/admin/announcements': 'الإعلانات',
  '/admin/notifications': 'الإشعارات',
  '/doctor':              'لوحة التحكم',
  '/doctor/courses':      'مقرراتي',
  '/doctor/schedule':     'جدولي',
  '/doctor/notifications':'الإشعارات',
  '/doctor/announcements':'الإعلانات',
  '/student':             'لوحة التحكم',
  '/student/courses':     'تسجيل المقررات',
  '/student/schedule':    'جدولي',
  '/student/transcript':  'كشف الدرجات',
  '/student/graduation':  'حالة التخرج',
  '/student/notifications':'الإشعارات',
  '/student/announcements':'الإعلانات',
  '/change-password':     'تغيير كلمة المرور',
};

/** Notification type config */
export const NOTIF_CONFIG = {
  warning:            { icon: 'AlertTriangle', color: '#b45309', label: 'إنذار أكاديمي',  badgeClass: 'warning' },
  enrollment:         { icon: 'GraduationCap', color: '#16a34a', label: 'تسجيل',           badgeClass: 'success' },
  grade:              { icon: 'FileEdit',      color: '#2563eb', label: 'درجات',            badgeClass: 'info' },
  announcement:       { icon: 'Megaphone',     color: '#7c3aed', label: 'إعلان',            badgeClass: 'default' },
  system:             { icon: 'Bell',          color: '#64748b', label: 'نظام',             badgeClass: 'default' },
  semester_event:     { icon: 'Calendar',      color: '#0891b2', label: 'فصل دراسي',       badgeClass: 'info' },
  attendance_warning: { icon: 'AlertTriangle', color: '#d97706', label: 'تحذير حضور',      badgeClass: 'warning' },
  dismissal:          { icon: 'Ban',           color: '#dc2626', label: 'فصل',              badgeClass: 'error' },
  schedule_assigned:  { icon: 'ClipboardList', color: '#059669', label: 'جدول',             badgeClass: 'success' },
  password_reset:     { icon: 'KeyRound',      color: '#64748b', label: 'كلمة مرور',       badgeClass: 'default' },
};

/** Semester status config */
export const SEMESTER_STATUS = {
  upcoming:     { label: 'قادم',          color: '#94a3b8', badgeClass: 'default' },
  registration: { label: 'تسجيل مفتوح',  color: '#2563eb', badgeClass: 'info' },
  active:       { label: 'نشط',           color: '#16a34a', badgeClass: 'success' },
  grading:      { label: 'درجات',         color: '#d97706', badgeClass: 'warning' },
  closed:       { label: 'مغلق',          color: '#1e293b', badgeClass: 'default' },
};

/** Grade to CSS class mapping */
export const GRADE_CLASSES = {
  'A+': 'excellent',  'A': 'excellent',   'A-': 'excellent',
  'B+': 'veryGood',   'B': 'veryGood',    'B-': 'veryGood',
  'C+': 'good',       'C': 'good',        'C-': 'good',
  'D+': 'pass',       'D': 'pass',        'D-': 'pass',
  'F':  'fail',
  'W':  'withdrawn',
  'Abs': 'fail',
};

/** Semester type Arabic labels */
export const SEMESTER_TYPE_AR = {
  first: 'الترم الأول',
  second: 'الترم الثاني',
  summer: 'الترم الصيفي'
};
