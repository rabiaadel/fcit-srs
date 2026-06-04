import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Spinner, StatusBadge } from '../../components/ui';

export default function AdminRegistrationPage() {
  const [sems, setSems] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});

  const load = () => {
    setLoading(true);
    adminAPI.getSemesters()
      .then(r => {
        const s = D(r)?.semesters || D(r) || [];
        setSems(s);
        
        const target = sel ? s.find(x => x.id === sel.id) : (s.find(x => x.status === 'registration') || s[0] || null);
        setSel(target);
        
        if (target) {
          setForm({
            registrationStart: target.registrationStart || target.registration_start ? new Date(target.registrationStart || target.registration_start).toISOString().split('T')[0] : '',
            registrationEnd: target.registrationEnd || target.registration_end ? new Date(target.registrationEnd || target.registration_end).toISOString().split('T')[0] : '',
            addDropDeadline: target.addDropDeadline || target.add_drop_deadline ? new Date(target.addDropDeadline || target.add_drop_deadline).toISOString().split('T')[0] : '',
            withdrawalDeadline: target.withdrawalDeadline || target.withdrawal_deadline ? new Date(target.withdrawalDeadline || target.withdrawal_deadline).toISOString().split('T')[0] : '',
          });
        }
      })
      .catch(() => toast.error('فشل تحميل الفصول الدراسية'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelectChange = (e) => {
    const target = sems.find(s => String(s.id) === String(e.target.value));
    setSel(target);
    if (target) {
      setForm({
        registrationStart: target.registrationStart || target.registration_start ? new Date(target.registrationStart || target.registration_start).toISOString().split('T')[0] : '',
        registrationEnd: target.registrationEnd || target.registration_end ? new Date(target.registrationEnd || target.registration_end).toISOString().split('T')[0] : '',
        addDropDeadline: target.addDropDeadline || target.add_drop_deadline ? new Date(target.addDropDeadline || target.add_drop_deadline).toISOString().split('T')[0] : '',
        withdrawalDeadline: target.withdrawalDeadline || target.withdrawal_deadline ? new Date(target.withdrawalDeadline || target.withdrawal_deadline).toISOString().split('T')[0] : '',
      });
    }
  };

  const advanceStatus = async () => {
    if (!sel) return;
    
    let newStatus;
    let finalize = false;
    if (sel.status === 'upcoming') newStatus = 'registration';
    else if (sel.status === 'registration') newStatus = 'active';
    else if (sel.status === 'active') newStatus = 'grading';
    else if (sel.status === 'grading') finalize = true;
    else return;

    try {
      if (finalize) {
        await adminAPI.finalizeSemester(sel.id);
        toast.success('تم اعتماد النتيجة وإغلاق الفصل');
      } else {
        await adminAPI.updateSemesterStatus(sel.id, newStatus);
        toast.success('تم تحديث حالة الفصل بنجاح');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحديث الحالة');
    }
  };

  const saveDates = async () => {
    if (!sel) return;
    try {
      await adminAPI.updateSemesterDates(sel.id, form);
      toast.success('تم تحديث فترات التسجيل بنجاح');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحديث التواريخ');
    }
  };

  const getActionLabel = (status) => {
    switch(status) {
      case 'upcoming': return 'فتح التسجيل';
      case 'registration': return 'إغلاق التسجيل وبدء الدراسة';
      case 'active': return 'بدء الرصد';
      case 'grading': return 'اعتماد النتيجة';
      default: return null;
    }
  };

  const actionBtn = sel ? getActionLabel(sel.status) : null;

  return (
    <AppLayout>
      <Card title="ضبط نافذة التسجيل والأكاديمية">
        {loading ? <Spinner /> : sems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)' }}>
            لا توجد فصول دراسية، يرجى إضافة فصل دراسي جديد من صفحة الفصول الدراسية للبدء.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
                اختيار الفصل الدراسي
              </label>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--color-primary-100)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none', background: 'var(--color-white)', color: 'var(--color-primary-dark)', fontWeight: 700 }}
                value={sel?.id || ''}
                onChange={handleSelectChange}
              >
                {sems.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label || `${s.semester_type} ${s.year_label}`} {s.status === 'registration' ? '(التسجيل مفتوح حالياً)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {sel && (
              <div style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-gray-200)' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                      {sel.label || `${sel.semester_type} ${sel.year_label}`}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
                      تحكم كامل بفترات التسجيل والحالة الأكاديمية للفصل
                    </div>
                  </div>
                  <div style={{ transform: 'scale(1.1)', transformOrigin: 'left center' }}>
                    <StatusBadge status={sel.status} />
                  </div>
                </div>
                
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-gray-800)', marginBottom: '16px' }}>فترات التسجيل والحذف والإضافة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '6px' }}>بداية التسجيل</label>
                    <input type="date" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', outline: 'none', fontFamily: 'var(--font-family)' }} value={form.registrationStart} onChange={e => setForm(p => ({...p, registrationStart: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '6px' }}>نهاية التسجيل</label>
                    <input type="date" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', outline: 'none', fontFamily: 'var(--font-family)' }} value={form.registrationEnd} onChange={e => setForm(p => ({...p, registrationEnd: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '6px' }}>آخر موعد للحذف والإضافة (Add/Drop)</label>
                    <input type="date" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', outline: 'none', fontFamily: 'var(--font-family)' }} value={form.addDropDeadline} onChange={e => setForm(p => ({...p, addDropDeadline: e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '6px' }}>آخر موعد للانسحاب (Withdrawal)</label>
                    <input type="date" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', outline: 'none', fontFamily: 'var(--font-family)' }} value={form.withdrawalDeadline} onChange={e => setForm(p => ({...p, withdrawalDeadline: e.target.value}))} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button variant="primary" onClick={saveDates}>
                    حفظ التواريخ
                  </Button>
                  
                  {actionBtn && (
                    <>
                      <div style={{ height: '24px', width: '1px', background: 'var(--color-gray-300)', margin: '0 8px' }}></div>
                      <Button variant="success" onClick={advanceStatus}>
                        {actionBtn}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </AppLayout>
  );
}
