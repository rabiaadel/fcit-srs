import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Spinner } from '../../components/ui';
import { Settings, Scale } from 'lucide-react';

export default function AdminBylawConfigPage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [editVals, setEditVals] = useState({});
  const [saving, setSaving] = useState({});
  const [changed, setChanged] = useState({});

  const CAT_LABELS = {
    graduation: '🎓 التخرج', attendance: '📋 الحضور', grading: '📝 الدرجات',
    warnings: '⚠️ الإنذارات', registration: '📅 التسجيل', retakes: '🔄 الإعادة',
    calendar: '📆 التقويم', general: '⚙️ عام',
  };

  const load = () => {
    setLoading(true);
    adminAPI.getBylawConfig()
      .then(r => setConfig(D(r)?.byCategory || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const startEdit = (key, currentVal) => {
    setEditVals(p => ({ ...p, [key]: currentVal }));
    setChanged(p => ({ ...p, [key]: false }));
  };
  
  const cancelEdit = key => {
    setEditVals(p => { const n = { ...p }; delete n[key]; return n; });
    setChanged(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const saveParam = async (key, val) => {
    setSaving(p => ({ ...p, [key]: true }));
    try {
      await adminAPI.updateBylawConfig(key, val);
      toast.success(`تم تحديث ${key} إلى ${val}`);
      cancelEdit(key);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل الحفظ');
    }
    setSaving(p => ({ ...p, [key]: false }));
  };

  const resetParam = async key => {
    if (!window.confirm('إعادة تعيين إلى قيمة اللائحة الافتراضية؟')) return;
    try {
      await adminAPI.resetBylawConfig(key);
      toast.success('تمت إعادة التعيين');
      load();
    } catch {
      toast.error('فشلت إعادة التعيين');
    }
  };

  if (loading) return <AppLayout><Spinner /></AppLayout>;

  return (
    <AppLayout>
      <div style={{ background: 'var(--color-warning-light)', border: '1px solid var(--color-accent)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Scale size={24} color="var(--color-warning-dark)" />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-warning-dark)', marginBottom: '4px' }}>
            إعدادات اللوائح الأكاديمية — صلاحيات المدير العليا (Superadmin)
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-warning-dark)' }}>
            يمكنك تعديل أي معامل من معاملات نظام اللوائح. كل تغيير يُسجَّل في سجل المراجعة ويؤثر فورًا على حسابات النظام.
          </div>
        </div>
      </div>

      {Object.entries(config).map(([cat, params]) => (
        <Card key={cat} title={CAT_LABELS[cat] || cat} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {params.map(p => {
              const isEditing = editVals[p.key] !== undefined;
              const editVal = editVals[p.key] ?? p.value;
              const isModified = p.value !== p.default_value;

              return (
                <div key={p.key} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', padding: '12px 10px', borderBottom: '1px solid var(--color-gray-100)', alignItems: 'center', background: isModified ? 'var(--color-warning-light)' : 'transparent', borderRadius: '8px', marginBottom: '2px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-gray-800)', marginBottom: '2px' }}>
                      {p.label_ar}
                      {isModified && <span style={{ marginRight: '8px', fontSize: '10px', color: 'var(--color-warning)', background: 'var(--color-warning-light)', padding: '1px 6px', borderRadius: '10px' }}>معدّل</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginBottom: '4px' }}>{p.description}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-spec-is)', background: 'var(--color-spec-is-bg)', padding: '1px 7px', borderRadius: '10px' }}>{p.article_ref || '—'}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-gray-400)', fontFamily: 'monospace' }}>{p.key}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '90px' }}>
                    {isEditing ? (
                      <input
                        type="number" value={editVal} min={p.min_value} max={p.max_value} step="0.1"
                        onChange={e => {
                          setEditVals(pr => ({ ...pr, [p.key]: e.target.value }));
                          setChanged(pr => ({ ...pr, [p.key]: e.target.value !== p.value }));
                        }}
                        style={{ border: '2px solid var(--color-primary)', borderRadius: '8px', padding: '6px 10px', fontSize: '15px', textAlign: 'center', width: '90px', fontWeight: 700, fontFamily: 'var(--font-family)', outline: 'none' }}
                      />
                    ) : (
                      <div>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: isModified ? 'var(--color-warning)' : 'var(--color-gray-800)' }}>{p.value}</span>
                        <div style={{ fontSize: '10px', color: 'var(--color-gray-400)' }}>افتراضي: {p.default_value}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: '120px' }}>
                    {!isEditing ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => startEdit(p.key, p.value)}>تعديل</Button>
                        {isModified && <Button variant="danger" size="sm" onClick={() => resetParam(p.key)}>إعادة</Button>}
                      </>
                    ) : (
                      <>
                        <Button variant="primary" size="sm" onClick={() => saveParam(p.key, editVal)} disabled={saving[p.key]}>
                          {saving[p.key] ? '…' : 'حفظ'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => cancelEdit(p.key)}>إلغاء</Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </AppLayout>
  );
}
