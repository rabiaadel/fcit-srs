import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Spinner } from '../../components/ui';

export default function AdminCurriculumPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spec, setSpec] = useState('GENERAL');
  // [AUDIT-I-22 FIX] SE removed — only GENERAL, CS, IS, IT are active specializations
  const [specs, setSpecs] = useState(['GENERAL', 'CS', 'IS', 'IT']);
  const [allCourses, setAllCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courseId: '', yearOfStudy: 1, semesterInYear: 1, isMandatory: true });
  const [saving, setSaving] = useState(false);

  const CAT_COLORS = { mandatory: '#16a34a', elective: '#2563eb', training: '#d97706', project: '#7c3aed', university_req: '#0891b2' };
  const CAT_AR = { mandatory: 'إلزامي', elective: 'اختياري', training: 'تدريب', project: 'مشروع', university_req: 'متطلب جامعي' };

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getCurriculumPlan(spec)
      .then(r => {
        const d = D(r);
        if (d) {
          setPlan(d);
          if (d.specializations?.length) setSpecs(d.specializations);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [spec]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    adminAPI.getCourses()
      .then(r => setAllCourses(D(r)?.courses || D(r) || []))
      .catch(() => {});
  }, []);

  const addCourse = async () => {
    if (!form.courseId) return;
    setSaving(true);
    try {
      await adminAPI.addCourseToCurriculum({ ...form, specialization: spec });
      toast.success('تم إضافة المقرر للخطة');
      setShowAdd(false);
      setForm({ courseId: '', yearOfStudy: 1, semesterInYear: 1, isMandatory: true });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل الإضافة');
    }
    setSaving(false);
  };

  const removeCourse = async (planId, courseName) => {
    if (!window.confirm(`حذف "${courseName}" من الخطة؟`)) return;
    try {
      await adminAPI.removeCourseFromCurriculum(planId);
      toast.success('تم الحذف');
      load();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const grouped = plan?.grouped || [];

  return (
    <AppLayout>
      {showAdd && (
        <div
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', padding: '16px' }}
        >
          <div style={{ background: 'var(--surface-card)', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--color-gray-800)' }}>إضافة مقرر للخطة</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--color-gray-500)' }}>✕</button>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>المقرر</label>
              <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}>
                <option value="">اختر مقررًا</option>
                {allCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.nameAr || c.name_ar}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>السنة الدراسية</label>
                <select value={form.yearOfStudy} onChange={e => setForm(p => ({ ...p, yearOfStudy: parseInt(e.target.value) }))} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>السنة {y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>الفصل</label>
                <select value={form.semesterInYear} onChange={e => setForm(p => ({ ...p, semesterInYear: parseInt(e.target.value) }))} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}>
                  <option value={1}>الفصل الأول</option>
                  <option value={2}>الفصل الثاني</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={addCourse} disabled={!form.courseId || saving} variant="primary">
                {saving ? 'جارٍ الحفظ…' : 'إضافة'}
              </Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost">إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      <Card
        title="الخطة الدراسية"
        headerActions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={spec} onChange={e => setSpec(e.target.value)}
              style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', padding: '7px 12px', fontSize: '13px', background: 'var(--color-gray-50)' }}
            >
              {specs.map(s => <option key={s} value={s}>{s === 'GENERAL' ? 'عام (جميع التخصصات)' : s}</option>)}
            </select>
            <Button size="sm" onClick={() => setShowAdd(true)}>+ إضافة مقرر</Button>
          </div>
        }
      >
        {loading ? <Spinner /> : grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-gray-400)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
            <div style={{ fontSize: '15px' }}>لا توجد خطة دراسية لهذا التخصص</div>
            <Button style={{ marginTop: '14px' }} onClick={() => setShowAdd(true)}>ابدأ بإضافة مقررات</Button>
          </div>
        ) : (
          grouped.map(yr => (
            <div key={yr.year} style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-gray-800)', padding: '8px 0', borderBottom: '2px solid var(--color-primary)', marginBottom: '14px' }}>
                السنة الدراسية {yr.year}
              </div>
              {yr.semesters?.map(sem => (
                <div key={sem.semester} style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '8px' }}>
                    الفصل {sem.semester === 1 ? 'الأول' : 'الثاني'}
                    <span style={{ color: 'var(--color-gray-400)', marginRight: '8px', fontWeight: 400 }}>({sem.courses?.length || 0} مقرر)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {sem.courses?.map(c => (
                      <div key={c.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '10px', padding: '12px', position: 'relative', background: c.is_active ? 'var(--surface-card)' : 'var(--color-gray-50)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>{c.code}</span>
                          <button onClick={() => removeCourse(c.id, c.course_name_ar || c.name_ar)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '14px', padding: '2px' }}>🗑</button>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-gray-800)', marginBottom: '4px', lineHeight: 1.3 }}>{c.course_name_ar || c.name_ar}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginBottom: '6px' }}>{c.course_name_en || c.name_en}</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ background: (CAT_COLORS[c.category] || '#64748b') + '15', color: CAT_COLORS[c.category] || '#64748b', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: 600 }}>{CAT_AR[c.category] || c.category}</span>
                          <span style={{ background: 'var(--color-gray-100)', color: 'var(--color-gray-600)', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>{c.credits} ساعة</span>
                          {c.prereq_count > 0 && <span style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning-dark)', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>{c.prereq_count} متطلب</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </Card>
    </AppLayout>
  );
}
