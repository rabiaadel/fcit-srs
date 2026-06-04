import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Spinner, Badge } from '../../components/ui';
import { Building } from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ code: '', nameAr: '', nameEn: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.getDepartmentsFull()
      .then(r => setDepts(D(r) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ code: '', nameAr: '', nameEn: '' }); setModal({}); };
  const openEdit = d => { setForm({ code: d.code, nameAr: d.name_ar, nameEn: d.name_en }); setModal(d); };

  const save = async () => {
    if (!form.code || !form.nameAr || !form.nameEn) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setSaving(true);
    try {
      if (modal?.id) {
        await adminAPI.updateDepartment(modal.id, { nameAr: form.nameAr, nameEn: form.nameEn });
      } else {
        await adminAPI.createDepartment({ code: form.code, nameAr: form.nameAr, nameEn: form.nameEn });
      }
      toast.success('تم الحفظ بنجاح');
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل الحفظ');
    }
    setSaving(false);
  };

  return (
    <AppLayout>
      {modal !== null && (
        <div
          onClick={e => e.target === e.currentTarget && setModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', padding: '16px' }}
        >
          <div style={{ background: 'var(--surface-card)', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--color-gray-800)' }}>{modal?.id ? 'تعديل قسم' : 'إضافة قسم جديد'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--color-gray-500)' }}>✕</button>
            </div>
            {[
              { label: 'كود القسم', key: 'code', placeholder: 'CS', disabled: !!modal?.id },
              { label: 'الاسم بالعربية', key: 'nameAr', placeholder: 'علوم الحاسبات' },
              { label: 'الاسم بالإنجليزية', key: 'nameEn', placeholder: 'Computer Science' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--color-gray-800)' }}>{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  disabled={f.disabled}
                  style={{
                    width: '100%', border: '1.5px solid var(--color-gray-200)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
                    background: f.disabled ? 'var(--color-gray-50)' : 'var(--surface-card)', fontFamily: 'var(--font-family)', outline: 'none'
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <Button onClick={save} disabled={saving} variant="primary">{saving ? 'جارٍ الحفظ…' : 'حفظ'}</Button>
              <Button onClick={() => setModal(null)} variant="ghost">إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      <Card
        title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={20} /> <span>إدارة الأقسام</span></div>}
        headerActions={<Button size="sm" onClick={openAdd}>+ إضافة قسم</Button>}
      >
        {loading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {depts.map(d => (
              <div key={d.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '12px', padding: '16px', background: d.is_active ? 'var(--surface-card)' : 'var(--color-gray-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: '8px', padding: '4px 10px', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>
                    {d.code}
                  </span>
                  <Badge variant={d.is_active ? 'success' : 'error'} size="sm">{d.is_active ? 'نشط' : 'معطل'}</Badge>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-800)', marginBottom: '3px' }}>{d.name_ar}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '10px' }}>{d.name_en}</div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-gray-400)', marginBottom: '12px' }}>
                  <span>👨‍🏫 {d.doctor_count || 0} مدرس</span>
                  <span>📚 {d.course_count || 0} مقرر</span>
                </div>
                <Button variant="ghost" size="sm" style={{ width: '100%', border: '1px solid var(--color-gray-200)' }} onClick={() => openEdit(d)}>تعديل</Button>
              </div>
            ))}
            {depts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>لا توجد أقسام بعد</div>
            )}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
