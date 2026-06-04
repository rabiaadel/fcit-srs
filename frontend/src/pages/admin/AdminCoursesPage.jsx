import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Table, Th, Td, Badge, Button, Spinner, SearchInput } from '../../components/ui';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', nameAr: '', nameEn: '', credits: 3, category: 'basic_computing', level: 1, isMandatory: true, description: '' });
  const [q, setQ] = useState('');
  const [lvl, setLvl] = useState('');

  const CATS = ['university_req', 'faculty_req', 'basic_computing', 'specialization', 'elective', 'training', 'project'];

  const load = () => {
    setLoading(true);
    adminAPI.getCourses(lvl ? { level: lvl } : {})
      .then(r => setCourses(D(r) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lvl]);

  const create = async e => {
    e.preventDefault();
    try {
      await adminAPI.createCourse(form);
      toast.success('تمت الإضافة');
      setShowAdd(false);
      setForm({ code: '', nameAr: '', nameEn: '', credits: 3, category: 'basic_computing', level: 1, isMandatory: true, description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل');
    }
  };

  const filtered = courses.filter(c => !q || (c.nameAr || c.name_ar || c.code || '').includes(q));

  return (
    <AppLayout>
      <Card
        title="إدارة المقررات"
        headerActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" onClick={() => setShowAdd(p => !p)}>
              {showAdd ? '✕ إلغاء' : '+ إضافة مقرر'}
            </Button>
            <select
              style={{ width: '120px', padding: '6px 8px', fontSize: '12px', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}
              value={lvl} onChange={e => setLvl(e.target.value)}
            >
              <option value="">كل المستويات</option>
              <option value="1">الأول</option>
              <option value="2">الثاني</option>
              <option value="3">الثالث</option>
              <option value="4">الرابع</option>
            </select>
          </div>
        }
      >
        {showAdd && (
          <form onSubmit={create} style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px' }} dir="rtl">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                ['code', 'كود المقرر'],
                ['nameAr', 'الاسم بالعربي'],
                ['nameEn', 'الاسم بالإنجليزي'],
                ['description', 'الوصف']
              ].map(([k, l]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>{l}</label>
                  <input
                    required={k !== 'description'}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                    value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>الساعات</label>
                <input
                  type="number" min={1} max={6}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none' }}
                  value={form.credits} onChange={e => setForm(p => ({ ...p, credits: +e.target.value }))}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>المستوى</label>
                <select
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', background: 'var(--color-white)' }}
                  value={form.level} onChange={e => setForm(p => ({ ...p, level: +e.target.value }))}
                >
                  <option value={1}>الأول</option>
                  <option value={2}>الثاني</option>
                  <option value={3}>الثالث</option>
                  <option value={4}>الرابع</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>الفئة</label>
                <select
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', background: 'var(--color-white)' }}
                  value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>النوع</label>
                <select
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', background: 'var(--color-white)' }}
                  value={form.isMandatory} onChange={e => setForm(p => ({ ...p, isMandatory: e.target.value === 'true' }))}
                >
                  <option value="true">إجباري</option>
                  <option value="false">اختياري</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" variant="success">إضافة المقرر</Button>
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
            </div>
          </form>
        )}

        <SearchInput value={q} onChange={setQ} placeholder="بحث بالاسم أو الكود…" />

        {loading ? <Spinner /> : (
          <div>
            {filtered.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Badge variant={c.isMandatory || c.is_mandatory ? 'error' : 'primary'} size="sm">
                    {c.isMandatory || c.is_mandatory ? 'إجباري' : 'اختياري'}
                  </Badge>
                  <Badge variant="default" size="sm">مستوى {c.level}</Badge>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-gray-800)' }}>{c.nameAr || c.name_ar}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    {c.code} | {c.credits || c.credit_hours} ساعات | {c.category}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)' }}>لا توجد مقررات</div>
            )}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
