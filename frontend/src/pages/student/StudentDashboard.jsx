/* ═══════════════════════════════════════════════════════════════════════════
   StudentDashboard — GPA ring, credit progress bar, skeleton loaders
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef } from 'react';
import { studentAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import {
  Card, StatCard, Table, Th, Td, EmptyState,
  SkeletonCard, SkeletonTable, Skeleton,
} from '../../components/ui';
import { useBylaw } from '../../contexts/BylawContext';
import { BookOpen, Trophy, AlertTriangle, GraduationCap, Calendar } from 'lucide-react';

/* ── GPA Grade label map ─────────────────────────────────────────────────── */
function gpaLabel(gpa) {
  if (gpa >= 3.7) return 'ممتاز';
  if (gpa >= 3.0) return 'جيد جداً';
  if (gpa >= 2.0) return 'جيد';
  if (gpa >= 1.0) return 'مقبول';
  return 'راسب';
}
function gpaColor(gpa) {
  if (gpa >= 3.5) return 'var(--color-success)';
  if (gpa >= 2.0) return 'var(--color-accent)';
  return 'var(--color-error)';
}

/* ── SVG GPA Ring ────────────────────────────────────────────────────────── */
function GpaRing({ gpa, maxGpa = 4.0 }) {
  const r = 38;
  const stroke = 8;
  const cx = 54;
  const cy = 54;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, gpa / maxGpa));
  const color = gpaColor(gpa);

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const dashoffset = animated
    ? circumference * (1 - pct)
    : circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        width={cx * 2}
        height={cy * 2}
        viewBox={`0 0 ${cx * 2} ${cy * 2}`}
        aria-label={`المعدل التراكمي ${gpa.toFixed(2)} من ${maxGpa}`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth={stroke}
        />
        {/* Arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'rotate(-90deg)',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
        {/* GPA text */}
        <text
          x={cx} y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Cairo, sans-serif"
          fontWeight="800"
          fontSize="20"
          fill="var(--color-gray-800)"
        >
          {gpa.toFixed(2)}
        </text>
        {/* Label below */}
        <text
          x={cx} y={cy + 17}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Cairo, sans-serif"
          fontWeight="600"
          fontSize="9"
          fill={color}
        >
          {gpaLabel(gpa)}
        </text>
      </svg>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', fontWeight: 600 }}>
        المعدل التراكمي
      </div>
    </div>
  );
}

/* ── Credit Hours Progress ───────────────────────────────────────────────── */
function CreditProgress({ passed, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((passed / total) * 100)) : 0;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', minWidth: 160 }}>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: 2 }}>
        الساعات المعتمدة
      </div>
      {/* Segmented bar */}
      <div
        style={{
          height: 22,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-gray-100)',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="progressbar"
        aria-valuenow={passed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${passed} ساعة من أصل ${total}`}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            right: 0,
            width: animated ? `${pct}%` : '0%',
            background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingInlineEnd: 8,
          }}
        >
          {pct > 18 && (
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.92)',
              fontFamily: 'Cairo, sans-serif',
            }}>
              {pct}%
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', fontWeight: 500 }}>
        {passed} ساعة مكتملة من أصل {total} ساعة
      </div>
    </div>
  );
}

/* ── Skeleton layout ─────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <AppLayout>
      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[0,1,2,3].map(i => <SkeletonCard key={i} style={{ '--item-index': i }} />)}
      </div>
      {/* Table card */}
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-gray-200)', padding: 24 }}>
        <Skeleton width="180px" height="18px" radius="var(--radius-sm)" style={{ marginBottom: 16 }} />
        <SkeletonTable rows={4} cols={3} />
      </div>
    </AppLayout>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { bylaw } = useBylaw();

  useEffect(() => {
    studentAPI.getDashboard()
      .then(r => setD(D(r)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !d) {
    return (
      <AppLayout>
        <EmptyState
          icon={<AlertTriangle size={32} color="var(--color-warning)" />}
          title="تعذر تحميل لوحة التحكم"
          description="يرجى المحاولة مرة أخرى لاحقاً"
        />
      </AppLayout>
    );
  }

  const st = d?.student || d || {};
  const scheduleData = d?.schedule || d?.currentSchedule || { enrollments: [] };
  const scheduleList = Array.isArray(scheduleData) ? scheduleData : (scheduleData.enrollments || []);
  const warnings = d?.warnings || [];

  const totalCredits = bylaw?.metadata?.total_credit_hours || 138;
  const creditsPassed = Number(st.totalCreditsPassed ?? st.total_credits_passed ?? 0);
  const cgpa = Number(st.cgpa || 0);
  const warningCount = Number(st.consecutiveWarnings ?? st.consecutive_warnings ?? st.totalWarnings ?? st.total_warnings ?? 0);
  const program = st.program || st.specialization || 'عام';

  const sideStats = [
    {
      lbl: 'المستوى الحالي',
      val: st.currentLevel || st.current_level || '—',
      ic: <Trophy size={22} color="var(--color-spec-is)" />,
      bg: 'var(--color-spec-is-bg)',
      trend: null,
    },
    {
      lbl: 'البرنامج',
      val: program,
      ic: <GraduationCap size={22} color="var(--color-spec-is)" />,
      bg: 'rgba(124, 58, 237, 0.08)',
      trend: null,
    },
    {
      lbl: 'الإنذارات',
      val: warningCount,
      ic: <AlertTriangle size={22} color="var(--color-warning)" />,
      bg: 'var(--color-warning-light)',
      trend: warningCount > 0
        ? { value: 'يُرجى الانتباه', direction: 'down' }
        : { value: 'لا إنذارات', direction: 'up' },
    },
  ];

  return (
    <AppLayout>
      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr 1fr 1fr',
        gap: 14,
        marginBottom: 20,
        alignItems: 'stretch',
      }}>
        {/* GPA Ring card */}
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-gray-200)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-xs)',
            transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
            animation: 'slideUpFade 0.35s ease both',
            '--item-index': 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'none'; }}
        >
          <GpaRing gpa={cgpa} />
        </div>

        {/* Credit Progress card */}
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-gray-200)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-xs)',
            minWidth: 220,
            transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
            animation: 'slideUpFade 0.35s ease both',
            '--item-index': 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'none'; }}
        >
          <CreditProgress passed={creditsPassed} total={totalCredits} />
        </div>

        {/* Side StatCards */}
        {sideStats.map((s, i) => (
          <StatCard
            key={s.lbl}
            label={s.lbl}
            value={s.val}
            icon={s.ic}
            iconBg={s.bg}
            trend={s.trend}
            style={{ '--item-index': i + 2, animationFillMode: 'both' }}
          />
        ))}
      </div>

      {/* ── Responsive fallback for small screens ──────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .student-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .student-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Schedule card ─────────────────────────────────────────────────── */}
      <Card title="الجدول الدراسي الحالي" style={{ '--item-index': 5 }}>
        {scheduleList.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th scope="col">المقرر</Th>
                <Th scope="col">الدكتور</Th>
                <Th scope="col">الموعد</Th>
              </tr>
            </thead>
            <tbody>
              {scheduleList.map((c, i) => (
                <tr key={i}>
                  <Td style={{ fontWeight: 600 }}>{c.name_ar || c.courseName || c.course_name || '—'}</Td>
                  <Td>{c.doctor_name_ar || c.doctorName || c.doctor_name || '—'}</Td>
                  <Td>
                    {c.schedule_slots && c.schedule_slots.length > 0
                      ? c.schedule_slots.map(s => {
                          const dayAr = { Sat: 'السبت', Sun: 'الأحد', Mon: 'الاثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء', Thu: 'الخميس' }[s.day] || s.day;
                          const fmt = t => (t || '').replace(/^(\d{2}:\d{2}):\d{2}$/, '$1');
                          const start = fmt(s.start);
                          const end   = fmt(s.end);
                          const [from, to] = start > end ? [end, start] : [start, end];
                          return `${dayAr} ${from} - ${to}`;
                        }).join('، ')
                      : (c.schedule || c.time || '—')}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={<Calendar size={28} color="var(--color-gray-400)" />}
            title="لا توجد مقررات مسجلة"
            description="لم يتم تسجيل أي مقررات في الفصل الدراسي الحالي"
          />
        )}
      </Card>

      {/* ── Academic warnings ─────────────────────────────────────────────── */}
      {warnings.length > 0 && (
        <div style={{
          background: 'var(--color-warning-light)',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          marginTop: 4,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-warning-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} />
            تحذيرات أكاديمية
          </div>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--color-warning-dark)', lineHeight: 1.6 }}>
              {w.description || w.message || w.semester_label || '—'}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
