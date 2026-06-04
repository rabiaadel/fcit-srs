/* ═══════════════════════════════════════════════════════════════════════════
   AdminDashboard — Quick actions, StatCard trends, animated header strip,
                    skeleton loaders, EmptyState
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import {
  Card, StatCard, Table, Th, Td, Badge, Button,
  EmptyState, SkeletonCard, SkeletonTable, Skeleton,
} from '../../components/ui';
import {
  Users, UserCheck, BookOpen, AlertTriangle,
  UserPlus, ClipboardList, Megaphone, CheckCircle,
} from 'lucide-react';

/* ── Gradient header strip ───────────────────────────────────────────────── */
const STRIP_STYLE = {
  position: 'relative',
  marginBottom: 20,
};
const STRIP_BAR = {
  height: 2,
  width: '100%',
  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-spec-is), var(--color-primary))',
  backgroundSize: '300% 100%',
  animation: 'adminGradientSlide 5s linear infinite',
  borderRadius: 'var(--radius-full)',
  marginBottom: 20,
};

/* ── Quick action icon button ────────────────────────────────────────────── */
function QuickAction({ icon, label, to, color = 'var(--color-primary)', bg = 'var(--color-primary-50)' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        borderRadius: 'var(--radius-xl)',
        border: `1.5px solid ${bg}`,
        background: bg,
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        transition: 'all 0.18s',
        color,
        minWidth: 80,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      aria-label={label}
      title={label}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-lg)',
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
    </button>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function AdminSkeleton() {
  return (
    <AppLayout>
      <style>{`@keyframes adminGradientSlide { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }`}</style>
      <div style={STRIP_BAR} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-gray-200)', padding: 24 }}>
        <Skeleton width="220px" height="18px" radius="var(--radius-sm)" style={{ marginBottom: 16 }} />
        <SkeletonTable rows={5} cols={6} />
      </div>
    </AppLayout>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setD(D(r)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminSkeleton />;

  const st = d?.stats || d || {};
  const stats = [
    {
      lbl: 'إجمالي الطلاب',
      val: st?.totalStudents ?? st?.total_students ?? st?.active_students ?? '—',
      ic: <Users size={22} color="var(--color-primary)" />,
      bg: 'var(--color-primary-50)',
      trend: { value: 'طالب مسجل', direction: 'neutral' },
    },
    {
      lbl: 'الدكاترة',
      val: st?.totalDoctors ?? st?.total_doctors ?? '—',
      ic: <UserCheck size={22} color="var(--color-success)" />,
      bg: 'var(--color-success-light)',
      trend: { value: 'عضو هيئة', direction: 'neutral' },
    },
    {
      lbl: 'المقررات',
      val: st?.totalCourses ?? st?.total_courses ?? '—',
      ic: <BookOpen size={22} color="var(--color-spec-is)" />,
      bg: 'var(--color-spec-is-bg)',
      trend: { value: 'مقرر دراسي', direction: 'neutral' },
    },
    {
      lbl: 'إنذارات نشطة',
      val: st?.activeWarnings ?? st?.active_warnings ?? st?.warning_students ?? 0,
      ic: <AlertTriangle size={22} color="var(--color-warning)" />,
      bg: 'var(--color-warning-light)',
      trend: (st?.activeWarnings ?? st?.active_warnings ?? 0) > 0
        ? { value: 'تتطلب متابعة', direction: 'down' }
        : { value: 'لا إنذارات', direction: 'up' },
    },
  ];

  return (
    <AppLayout>
      <style>{`@keyframes adminGradientSlide { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }`}</style>

      {/* Animated header strip */}
      <div style={STRIP_BAR} />

      {/* Quick actions */}
      <Card title="إجراءات سريعة" style={{ '--item-index': 0 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 4 }}>
          <QuickAction
            icon={<UserPlus size={20} color="var(--color-primary)" />}
            label="إضافة مستخدم"
            to="/admin/users"
            color="var(--color-primary)"
            bg="var(--color-primary-50)"
          />
          <QuickAction
            icon={<ClipboardList size={20} color="var(--color-success)" />}
            label="فتح التسجيل"
            to="/admin/registration"
            color="var(--color-success)"
            bg="var(--color-success-light)"
          />
          <QuickAction
            icon={<Megaphone size={20} color="var(--color-spec-is)" />}
            label="إنشاء إعلان"
            to="/admin/announcements"
            color="var(--color-spec-is)"
            bg="var(--color-spec-is-bg)"
          />
          <QuickAction
            icon={<BookOpen size={20} color="var(--color-spec-se)" />}
            label="المقررات"
            to="/admin/courses"
            color="var(--color-spec-se)"
            bg="var(--color-spec-se-bg)"
          />
          <QuickAction
            icon={<Users size={20} color="var(--color-role-doctor)" />}
            label="الطلاب"
            to="/admin/students"
            color="var(--color-role-doctor)"
            bg="var(--color-role-doctor-bg)"
          />
        </div>
      </Card>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14,
        marginBottom: 20,
      }}>
        {stats.map((s, i) => (
          <StatCard
            key={s.lbl}
            label={s.lbl}
            value={s.val}
            icon={s.ic}
            iconBg={s.bg}
            trend={s.trend}
            style={{ '--item-index': i + 1 }}
          />
        ))}
      </div>

      {/* Warnings table */}
      <Card
        title="الطلاب ذوو الإنذارات الأكاديمية"
        headerActions={
          <Link to="/admin/students" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm">عرض الكل</Button>
          </Link>
        }
        style={{ '--item-index': 6 }}
      >
        {d?.recentWarnings?.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th scope="col">الطالب</Th>
                <Th scope="col">الكود</Th>
                <Th scope="col">المستوى</Th>
                <Th scope="col">المعدل</Th>
                <Th scope="col">الحالة</Th>
                <Th scope="col">إنذارات</Th>
              </tr>
            </thead>
            <tbody>
              {d.recentWarnings.map(w => (
                <tr key={w.studentId || w.student_id || w.id}>
                  <Td style={{ fontWeight: 600 }}>{w.studentName || w.student_name || w.name}</Td>
                  <Td style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{w.studentCode || w.student_code}</Td>
                  <Td>{w.currentLevel || w.current_level}</Td>
                  <Td style={{ color: 'var(--color-error)', fontWeight: 700 }}>{Number(w.cgpa || 0).toFixed(2)}</Td>
                  <Td>
                    {w.academicStatus === 'probation' || w.academic_status === 'probation'
                      ? <Badge variant="error">Probation</Badge>
                      : <Badge variant="warning">إنذار أكاديمي</Badge>
                    }
                  </Td>
                  <Td><Badge variant="error">{w.warningCount || w.warning_count || w.totalWarnings}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={<CheckCircle size={28} color="var(--color-success)" />}
            title="لا توجد إنذارات نشطة"
            description="جميع الطلاب يسيرون بشكل جيد أكاديمياً 🎉"
          />
        )}
      </Card>
    </AppLayout>
  );
}
