/* ═══════════════════════════════════════════════════════════════════════════
   SharedAnnouncementsPage — Category badges, relative time, improved layout
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { sharedAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge, EmptyState, SkeletonTable } from '../../components/ui';
import { Megaphone, AlertTriangle } from 'lucide-react';

const ROLE_LABELS = {
  all: 'الجميع', student: 'الطلاب', doctor: 'الدكاترة', admin: 'الإداريون',
};

const ROLE_BADGE_VARIANT = {
  all: 'default', student: 'primary', doctor: 'info', admin: 'warning',
};

/* Relative time using Intl.RelativeTimeFormat */
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const rtf   = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 2)  return 'الآن';
  if (mins  < 60) return rtf.format(-mins, 'minute');
  if (hours < 24) return rtf.format(-hours, 'hour');
  return rtf.format(-days, 'day');
}

export default function SharedAnnouncementsPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    sharedAPI.getAnnouncements()
      .then(r => {
        const data = D(r);
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('فشل تحميل الإعلانات. تحقق من الاتصال بالخادم.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <Card title="الإعلانات">
        {loading ? (
          <SkeletonTable rows={4} cols={2} />
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-error)' }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={28} color="var(--color-gray-400)" />}
            title="لا توجد إعلانات حالياً"
            description="ستظهر هنا الإعلانات الموجهة إليك"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((ann, i) => (
              <div
                key={ann.id}
                style={{
                  border: ann.is_pinned
                    ? '1.5px solid var(--color-primary-200)'
                    : '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  background: ann.is_pinned ? 'var(--color-primary-50)' : 'var(--surface-card)',
                  direction: 'rtl',
                  animation: 'slideUpFade 0.3s ease both',
                  animationDelay: `${i * 0.05}s`,
                  transition: 'box-shadow var(--transition-base)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {ann.is_pinned && (
                      <Badge variant="primary" size="sm">📌 مثبت</Badge>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-gray-900)' }}>
                      {ann.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    {/* Category / role badge */}
                    {ann.target_role && (
                      <Badge variant={ROLE_BADGE_VARIANT[ann.target_role] || 'default'} size="sm">
                        {ROLE_LABELS[ann.target_role] || ann.target_role}
                      </Badge>
                    )}
                    {/* Announcement type tag */}
                    {ann.type && ann.type !== 'general' && (
                      <Badge variant="info" size="sm">{ann.type}</Badge>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--color-gray-400)', whiteSpace: 'nowrap' }}>
                      {relativeTime(ann.created_at)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <p style={{
                  fontSize: 14, color: 'var(--color-gray-700)',
                  lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap',
                }}>
                  {ann.body}
                </p>

                {/* Footer */}
                {ann.created_by_name && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-gray-400)' }}>
                    بواسطة: {ann.created_by_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Inject local keyframe for announcement animations */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AppLayout>
  );
}
