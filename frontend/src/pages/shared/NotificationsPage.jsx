/* ═══════════════════════════════════════════════════════════════════════════
   NotificationsPage — Read/unread state, relative time, mark-all-as-read
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, doctorAPI, studentAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import { NOTIF_CONFIG } from '../../utils/constants';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge, EmptyState, SkeletonTable } from '../../components/ui';
import * as Icons from 'lucide-react';

/* ── Relative time using Intl.RelativeTimeFormat ─────────────────────────── */
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const rtf  = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (secs  < 60)  return 'الآن';
  if (mins  < 60)  return rtf.format(-mins, 'minute');
  if (hours < 24)  return rtf.format(-hours, 'hour');
  return rtf.format(-days, 'day');
}

/* ── Notification Modal ──────────────────────────────────────────────────── */
export function NotificationModal({ notif, onClose, apiGet }) {
  const [detail, setDetail] = useState(notif);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notif) return;
    setLoading(true);
    apiGet(notif.id)
      .then(r => setDetail(D(r) || notif))
      .catch(() => setDetail(notif))
      .finally(() => setLoading(false));
  }, [notif?.id]);

  if (!notif) return null;

  const TYPE_ICON = {
    warning: '⚠️', enrollment: '🎓', grade: '📝', announcement: '📢',
    system: '🔔', semester_event: '📅', attendance_warning: '⚠️',
    dismissal: '🚫', schedule_assigned: '📋', password_reset: '🔑',
  };
  const TYPE_BADGE = {
    warning: '#b45309', enrollment: '#16a34a', grade: '#2563eb',
    announcement: '#7c3aed', system: '#64748b', semester_event: '#0891b2',
    attendance_warning: '#d97706', dismissal: '#dc2626', schedule_assigned: '#059669',
  };
  const TYPE_LABEL = {
    warning: 'إنذار أكاديمي', enrollment: 'تسجيل', grade: 'درجات',
    announcement: 'إعلان', system: 'نظام', semester_event: 'فصل دراسي',
    attendance_warning: 'تحذير حضور', dismissal: 'فصل', schedule_assigned: 'جدول',
  };

  const d = detail || notif;
  const typeColor = TYPE_BADGE[d.type] || '#64748b';

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={d.title}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--surface-card)', borderRadius: 16, width: '100%', maxWidth: 560,
        boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
      }}>
        <div style={{
          background: typeColor, padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>{TYPE_ICON[d.type] || '🔔'}</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{d.title}</div>
              <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>
                {TYPE_LABEL[d.type] || d.type}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-gray-500)' }}>جارٍ التحميل…</div>
          ) : (
            <>
              <div style={{
                background: 'var(--color-gray-50)', borderRadius: 12, padding: 16,
                lineHeight: 1.9, fontSize: 14, color: 'var(--color-gray-800)',
                marginBottom: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {d.message}
              </div>
              {d.link && (
                <a
                  href={d.link}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'var(--color-primary-dark)', fontSize: 13, textDecoration: 'none',
                    padding: '6px 12px', background: 'var(--color-primary-50)', borderRadius: 8,
                  }}
                >
                  🔗 عرض التفاصيل
                </a>
              )}
              <div style={{
                marginTop: 14, fontSize: 12, color: 'var(--color-gray-500)',
                borderTop: '1px solid var(--color-gray-200)', paddingTop: 10,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{(d.created_at || d.createdAt) ? new Date(d.created_at || d.createdAt).toLocaleString('ar-EG') : ''}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 20,
                  background: d.is_read || d.isRead ? 'var(--color-gray-100)' : 'var(--color-primary-50)',
                  color: d.is_read || d.isRead ? 'var(--color-gray-600)' : 'var(--color-primary-dark)',
                  fontSize: 11,
                }}>
                  {d.is_read || d.isRead ? 'مقروء' : 'غير مقروء'}
                </span>
              </div>
            </>
          )}
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-gray-100)', border: 'none', borderRadius: 8,
              padding: '8px 20px', cursor: 'pointer', fontSize: 13, color: 'var(--color-gray-600)',
              fontFamily: 'var(--font-family)',
            }}
          >إغلاق</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const apiMap = { admin: adminAPI, doctor: doctorAPI, student: studentAPI };
  const api = apiMap[user?.role] || studentAPI;

  const load = () => {
    api.getNotifications()
      .then(r => setNotifs(D(r)?.notifications || D(r) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user?.role]);

  const markRead = async id => {
    try {
      await api.markNotificationRead(id);
      setNotifs(p => p.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n));
    } catch {}
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifs(p => p.map(n => ({ ...n, isRead: true, is_read: true })));
      toast.success('تم تعليم الكل كمقروء');
    } catch {}
  };

  const openNotif = n => {
    if (!n.isRead && !n.is_read) markRead(n.id);
    setSelectedNotif(n);
  };

  const apiGetDetail = id => fetch(`/api/v1/notifications/${id}/detail`, {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
  }).then(r => r.json());

  const unreadCount = notifs.filter(n => !n.isRead && !n.is_read).length;

  return (
    <AppLayout>
      {selectedNotif && (
        <NotificationModal
          notif={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          apiGet={apiGetDetail}
        />
      )}
      <Card
        title={`الإشعارات${unreadCount > 0 ? ` (${unreadCount} غير مقروءة)` : ''}`}
        headerActions={
          unreadCount > 0
            ? <Button variant="ghost" size="sm" onClick={markAll}>تعليم الكل كمقروء</Button>
            : null
        }
      >
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : notifs.length === 0 ? (
          <EmptyState
            icon={<Icons.Bell size={28} color="var(--color-gray-400)" />}
            title="لا توجد إشعارات"
            description="ستظهر هنا إشعاراتك الجديدة"
          />
        ) : (
          <div>
            {notifs.map(n => {
              const read = n.isRead || n.is_read;
              const conf = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.system;
              const Icon = Icons[conf.icon] || Icons.Bell;

              return (
                <div
                  key={n.id}
                  onClick={() => openNotif(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && openNotif(n)}
                  aria-label={n.title}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '13px 12px',
                    borderBottom: '1px solid var(--color-gray-100)',
                    cursor: 'pointer',
                    background: read ? 'transparent' : 'var(--color-primary-50)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 2,
                    transition: 'background 0.15s',
                    /* Unread right-border indicator */
                    borderRight: read ? '3px solid transparent' : '3px solid var(--color-primary)',
                    fontWeight: read ? 400 : 600,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = read ? 'var(--color-gray-50)' : 'var(--color-primary-100)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = read ? 'transparent' : 'var(--color-primary-50)'; }}
                >
                  <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2, color: conf.color }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                        {relativeTime(n.createdAt || n.created_at)}
                      </span>
                      <Badge variant={conf.badgeClass}>{conf.label}</Badge>
                    </div>
                    <div style={{ fontWeight: read ? 500 : 700, fontSize: 14, color: 'var(--color-gray-800)', marginBottom: 3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 380 }}>
                      {n.message}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {!read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                    <Icons.ChevronLeft size={16} color="var(--color-gray-400)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
