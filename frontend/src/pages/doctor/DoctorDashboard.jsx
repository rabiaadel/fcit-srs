/* ═══════════════════════════════════════════════════════════════════════════
   DoctorDashboard — StatCard upgrades, skeleton loaders, EmptyState
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI, sharedAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import {
  StatCard, EmptyState, SkeletonCard, Skeleton,
} from '../../components/ui';
import { BookOpen, Users, Edit3, Calendar, ChevronLeft } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';
const SUCCESS = 'var(--color-success)';
const WARN    = 'var(--color-warning)';

const SEMESTER_TYPE_AR = { first: 'الترم الأول', second: 'الترم الثاني', summer: 'الترم الصيفي' };

function DoctorSkeleton() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          {[0,1,2].map(i => <SkeletonCard key={i} />)}
        </div>
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-gray-200)', padding: 24 }}>
          <Skeleton width="200px" height="18px" radius="var(--radius-sm)" style={{ marginBottom: 16 }} />
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
              <Skeleton width="35%" height="13px" radius="var(--radius-sm)" />
              <Skeleton width="15%" height="13px" radius="var(--radius-sm)" />
              <Skeleton width="10%" height="13px" radius="var(--radius-sm)" />
              <Skeleton width="20%" height="13px" radius="var(--radius-sm)" />
              <Skeleton width="15%" height="13px" radius="var(--radius-sm)" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default function DoctorDashboard() {
  const [courses, setCourses] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [sems,    setSems]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      doctorAPI.getDashboard().catch(() => ({})),
      doctorAPI.getMyCourses().catch(() => ({})),
      sharedAPI.getSemesters().catch(() => ({})),
    ]).then(([dashRes, coursesRes, semsRes]) => {
      const d = D(dashRes) || {};
      setStats({
        totalCourses:  d.totalCourses  || 0,
        totalStudents: d.totalStudents || 0,
        pendingGrades: d.pendingGrades || d.pendingGradeCount || 0,
      });
      const raw = D(coursesRes) || [];
      setCourses(Array.isArray(raw) ? raw : []);
      setSems(D(semsRes) || []);
    }).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const ACTIVE_STATUSES = ['active', 'registration', 'grading'];
    const groups = {};
    courses.forEach(c => {
      const semId  = c.semester_id || c.semesterId;
      const sem    = sems.find(s => s.id === semId);
      const status = c.semester_status || sem?.status || '';
      if (!ACTIVE_STATUSES.includes(status)) return;
      const type  = c.semester_type || sem?.semester_type || '';
      const year  = c.year_label    || sem?.year_label    || '';
      const label = c.semester
        || (type && year ? `${SEMESTER_TYPE_AR[type] || type} ${year}` : null)
        || sem?.label
        || 'فصل غير محدد';
      const startDate = sem?.start_date || '';
      if (!groups[label]) groups[label] = { courses: [], status, startDate, year };
      groups[label].courses.push(c);
    });
    const ORDER = { registration: 0, active: 1, grading: 2 };
    return Object.entries(groups).sort(([,a], [,b]) => {
      const ao = ORDER[a.status] ?? 99;
      const bo = ORDER[b.status] ?? 99;
      if (ao !== bo) return ao - bo;
      return b.startDate.localeCompare(a.startDate);
    });
  }, [courses, sems]);

  const semesterBadge = (status) => {
    const map = {
      active:       { label: 'نشط',   bg: 'var(--color-success-light)', color: 'var(--color-success)' },
      registration: { label: 'تسجيل', bg: 'var(--color-primary-100)',   color: 'var(--color-primary)' },
      grading:      { label: 'درجات', bg: 'var(--color-warning-light)',  color: 'var(--color-warning)' },
      closed:       { label: 'مغلق',  bg: 'var(--color-gray-100)',       color: 'var(--color-gray-500)' },
    };
    const s = map[status] || { label: '—', bg: 'var(--color-gray-100)', color: 'var(--color-gray-400)' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 99, background: s.bg,
        color: s.color, fontWeight: 700, fontSize: 11,
      }}>{s.label}</span>
    );
  };

  if (loading) return <DoctorSkeleton />;

  const statCards = [
    {
      label: 'مقرراتي',
      value: stats?.totalCourses ?? '—',
      icon: <BookOpen size={22} color="var(--color-primary)" />,
      bg: 'var(--color-primary-50)',
      trend: { value: 'مقرر دراسي', direction: 'neutral' },
    },
    {
      label: 'إجمالي الطلاب',
      value: stats?.totalStudents ?? '—',
      icon: <Users size={22} color="var(--color-success)" />,
      bg: 'var(--color-success-light)',
      trend: { value: 'طالب مسجل', direction: 'neutral' },
    },
    {
      label: 'درجات منتظرة',
      value: stats?.pendingGrades ?? '—',
      icon: <Edit3 size={22} color="var(--color-warning)" />,
      bg: 'var(--color-warning-light)',
      trend: stats?.pendingGrades > 0
        ? { value: 'تحتاج إدخال', direction: 'down' }
        : { value: 'مكتملة', direction: 'up' },
    },
  ];

  return (
    <AppLayout>
      <div style={{ direction: 'rtl', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          {statCards.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              iconBg={s.bg}
              trend={s.trend}
              style={{ '--item-index': i }}
            />
          ))}
        </div>

        {/* ── Courses grouped by semester ─────────────────────────────────── */}
        {grouped.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} color="var(--color-gray-400)" />}
            title="لا توجد مقررات نشطة"
            description="لا توجد مقررات مسندة إليك في الفصل الدراسي الحالي"
          />
        ) : (
          grouped.map(([semLabel, { courses: semCourses, status, year }]) => {
            const cleanSemLabel = semLabel.replace(/\s*\d{4}\s*/g, '').replace(/\s*-\s*\d{4}\s*/g, '').trim();
            return (
            <div
              key={semLabel}
              style={{
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-gray-200)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {/* Semester header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px', borderBottom: '1px solid var(--color-gray-200)',
                background: 'var(--color-gray-50)',
              }}>
                <Calendar size={16} color="var(--color-primary)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)' }}>{cleanSemLabel}</span>
                  {year && (
                    <span style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 500 }}>
                      {cleanSemLabel} — العام الدراسي {year.replace('-', '/')}
                    </span>
                  )}
                </div>
                {semesterBadge(status)}
                <span style={{ marginRight: 'auto', fontSize: 12, color: 'var(--color-gray-400)' }}>
                  {semCourses.length} مقررات ·{' '}
                  {semCourses.reduce((s, c) => s + (parseInt(c.enrolled_count || c.enrolledCount) || 0), 0)} طالب
                </span>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--color-gray-50)' }}>
                    {['المقرر', 'الكود', 'المستوى', 'الطلاب', 'الإجراء'].map(h => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'right',
                        fontWeight: 700, fontSize: 11, color: 'var(--color-gray-500)',
                        borderBottom: '1px solid var(--color-gray-200)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {semCourses.map((c, idx) => {
                    const rid      = c.offering_id || c.offeringId || c.id;
                    const enrolled = parseInt(c.enrolled_count || c.enrolledCount) || 0;
                    const capacity = parseInt(c.capacity) || 0;
                    const name     = c.course_name_ar || c.course_name_en || c.courseName || c.course_name || '—';
                    const code     = c.course_code || c.courseCode || '—';
                    const level    = c.level_label || c.level || '—';
                    const fillPct  = capacity > 0 ? Math.min(Math.round(enrolled / capacity * 100), 100) : 0;
                    return (
                      <tr
                        key={rid}
                        style={{
                          background: idx % 2 === 0 ? 'var(--surface-card)' : 'var(--color-gray-50)',
                          borderBottom: '1px solid var(--color-gray-100)',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-50)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'var(--surface-card)' : 'var(--color-gray-50)'; }}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-gray-800)' }}>{name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '2px 9px', borderRadius: 6,
                            background: 'var(--color-primary-50)', color: 'var(--color-primary)', fontWeight: 700, fontSize: 11,
                          }}>{code}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--color-gray-500)' }}>{level}</td>
                        <td style={{ padding: '12px 16px', minWidth: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--color-gray-200)', borderRadius: 99, overflow: 'hidden', maxWidth: 80 }}>
                              <div style={{
                                width: `${fillPct}%`, height: '100%', borderRadius: 99,
                                background: fillPct > 85 ? 'var(--color-error)' : fillPct > 60 ? 'var(--color-warning)' : 'var(--color-primary)',
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-gray-700)' }}>
                              {enrolled}{capacity > 0 && <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>/{capacity}</span>}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Link to={`/doctor/courses/${rid}`} style={{ textDecoration: 'none' }}>
                            <button style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 14px', borderRadius: 8, border: 'none',
                              background: 'var(--color-primary)', color: '#fff',
                              fontWeight: 700, fontSize: 12, cursor: 'pointer',
                              fontFamily: 'var(--font-family)',
                              transition: 'all var(--transition-base)',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-dark)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; }}
                            >
                              عرض الطلاب <ChevronLeft size={13} />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )})
        )}
      </div>
    </AppLayout>
  );
}
