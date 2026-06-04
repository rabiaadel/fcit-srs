import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge, Button, Spinner } from '../../components/ui';

export default function AnnouncementsPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', targetRole: 'all', isPinned: false });

  const load = () => {
    setLoading(true);
    setError(null);
    adminAPI.getAnnouncements()
      .then(r => {
        const data = D(r);
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to load announcements', err);
        setError('فشل تحميل الإعلانات. تحقق من الاتصال بالخادم.');
        toast.error('فشل تحميل الإعلانات');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('العنوان والمحتوى مطلوبان');
      return;
    }
    setSubmitting(true);
    try {
      await adminAPI.createAnnouncement(form);
      toast.success('تم نشر الإعلان بنجاح');
      setShowAdd(false);
      setForm({ title: '', body: '', targetRole: 'all', isPinned: false });
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || 'فشل نشر الإعلان';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteAnnouncement(id);
      toast.success('تم حذف الإعلان');
      setItems(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast.error('فشل حذف الإعلان');
    } finally {
      setDeletingId(null);
    }
  };

  const ROLE_AR = { all: 'الجميع', student: 'الطلاب', doctor: 'الدكاترة', admin: 'الإداريون' };

  return (
    <AppLayout>
      <Card
        title="الإعلانات"
        headerActions={
          <Button size="sm" onClick={() => setShowAdd(p => !p)}>
            {showAdd ? '✕ إلغاء' : '+ إضافة إعلان'}
          </Button>
        }
      >
        {showAdd && (
          <form onSubmit={create} style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>العنوان *</label>
              <input
                required
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', boxSizing: 'border-box' }}
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="عنوان الإعلان..."
              />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>المحتوى *</label>
              <textarea
                required
                rows={4}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                placeholder="محتوى الإعلان..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>الجهة المستهدفة</label>
                <select
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', background: 'var(--color-white)' }}
                  value={form.targetRole}
                  onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}
                >
                  <option value="all">الجميع</option>
                  <option value="student">الطلاب فقط</option>
                  <option value="doctor">الدكاترة فقط</option>
                  <option value="admin">الإداريون فقط</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                <input
                  type="checkbox"
                  id="pin"
                  checked={form.isPinned}
                  onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="pin" style={{ fontSize: '13px', color: 'var(--color-gray-800)', cursor: 'pointer', userSelect: 'none' }}>📌 تثبيت الإعلان</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? '...جارٍ النشر' : 'نشر الإعلان'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowAdd(false); setForm({ title: '', body: '', targetRole: 'all', isPinned: false }); }}>
                إلغاء
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <Spinner />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-error)', border: '1px dashed var(--color-error)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>{error}</div>
            <Button size="sm" variant="ghost" onClick={load}>إعادة المحاولة</Button>
          </div>
        ) : (
          <div>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--color-gray-400)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📢</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>لا توجد إعلانات</div>
                <div style={{ fontSize: '13px' }}>اضغط على "إضافة إعلان" لإنشاء أول إعلان</div>
              </div>
            ) : (
              items.map(a => (
                <div key={a.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-gray-100)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(a.isPinned || a.is_pinned) && <Badge variant="warning">📌 مثبت</Badge>}
                      <Badge variant="primary">{ROLE_AR[a.target_role || a.targetRole || 'all'] || 'الجميع'}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-gray-800)' }}>{a.title}</span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        style={{ background: 'none', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', padding: '3px 8px', fontSize: '12px', cursor: 'pointer', opacity: deletingId === a.id ? 0.5 : 1 }}
                      >
                        {deletingId === a.id ? '...' : 'حذف'}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{a.body}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
                    {a.created_by_name ? `بواسطة: ${a.created_by_name} · ` : ''}
                    {a.created_at || a.createdAt ? new Date(a.created_at || a.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
