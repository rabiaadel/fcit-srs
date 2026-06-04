import React, { useState, useEffect } from 'react';
import { studentAPI, sharedAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Spinner, Badge } from '../../components/ui';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS     = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const DAY_AR   = { Sat: 'السبت', Sun: 'الأحد', Mon: 'الاثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء', Thu: 'الخميس' };

const DAY_COLORS = {
  Sat: { bg: 'var(--color-primary-50)', border: '#3b82f6', text: 'var(--color-primary)', light: 'var(--color-primary-100)' },
  Sun: { bg: 'var(--color-success-light)', border: '#22c55e', text: 'var(--color-success)', light: 'var(--color-success-light)' },
  Mon: { bg: 'rgba(168, 85, 247, 0.12)', border: '#a855f7', text: '#a855f7', light: 'rgba(168, 85, 247, 0.08)' },
  Tue: { bg: 'var(--color-warning-light)', border: '#f97316', text: 'var(--color-warning)', light: 'var(--color-warning-light)' },
  Wed: { bg: 'var(--color-error-light)', border: '#ef4444', text: 'var(--color-error)', light: 'var(--color-error-light)' },
  Thu: { bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', text: '#06b6d4', light: 'rgba(6, 182, 212, 0.08)' },
};

const COURSE_COLORS = ['#3b82f6','#22c55e','#a855f7','#f97316','#ef4444','#06b6d4','#ec4899','#84cc16','#f59e0b','#14b8a6'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

const PX_PER_MIN = 0.75; // px per minute → 45px per hour (compact)

const topPx    = (t, startMin) => (timeToMinutes(t) - startMin) * PX_PER_MIN;
const heightPx = (s, e) => (timeToMinutes(e) - timeToMinutes(s)) * PX_PER_MIN;

// Fixed time range: 7:00 to 15:00
function computeTimeRange(_grid) {
  return { startMin: 7 * 60, endMin: 15 * 60 };
}

function buildHourLabels(startMin, endMin) {
  const labels = [];
  for (let m = startMin; m <= endMin; m += 60) {
    const h = Math.floor(m / 60);
    labels.push(`${String(h).padStart(2, '0')}:00`);
  }
  return labels;
}

// ── Course slot card ──────────────────────────────────────────────────────────
function SlotCard({ slot, startMin }) {
  const col = DAY_COLORS[slot.day] || DAY_COLORS['Sat'];
  const h   = heightPx(slot.start, slot.end);
  const top = topPx(slot.start, startMin);
  const isTiny  = h < 36;
  const isSmall = h < 58;

  return (
    <div
      title={`${slot.courseCode} — ${slot.courseNameAr || slot.courseName}\n${slot.start?.slice(0,5)} – ${slot.end?.slice(0,5)}\n${slot.room || ''}`}
      style={{
        position: 'absolute',
        top: top + 1,
        left: 3,
        right: 3,
        height: Math.max(h - 2, 22),
        background: col.bg,
        border: `1.5px solid ${col.border}`,
        borderLeft: `4px solid ${col.border}`,
        borderRadius: 7,
        padding: isTiny ? '2px 6px' : '4px 7px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0,0,0,.07)',
        cursor: 'default',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 800, fontSize: isTiny ? 9 : 11, color: col.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
          {slot.courseCode}
        </span>
        {!isTiny && (
          <span style={{ fontSize: 9, color: col.text, opacity: 0.7, whiteSpace: 'nowrap', lineHeight: 1.3, flexShrink: 0 }}>
            {slot.start?.slice(0,5)}–{slot.end?.slice(0,5)}
          </span>
        )}
      </div>
      {!isTiny && (
        <div style={{ fontSize: 10, color: 'var(--color-gray-700)', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {slot.courseNameAr || slot.courseName}
        </div>
      )}
      {!isSmall && slot.room && (
        <div style={{ fontSize: 9, color: 'var(--color-gray-400)', lineHeight: 1.2 }}>{slot.room}</div>
      )}
    </div>
  );
}

// ── Weekly grid ───────────────────────────────────────────────────────────────
function WeeklyGrid({ grid }) {
  const { startMin, endMin } = computeTimeRange(grid);
  const hourLabels = buildHourLabels(startMin, endMin);
  const totalH     = (endMin - startMin) * PX_PER_MIN;
  const activeDays = DAYS.filter(d => (grid[d] || []).length > 0);

  return (
    <div style={{ overflowX: 'auto', direction: 'ltr' }}>
      <div style={{ display: 'flex', minWidth: Math.max(600, activeDays.length * 130 + 60) }}>

        {/* Time column */}
        <div style={{ width: 50, flexShrink: 0, position: 'relative', height: totalH + 32 }}>
          <div style={{ height: 32 }} />
          <div style={{ position: 'relative', height: totalH }}>
            {hourLabels.map((label) => (
              <div
                key={label}
                style={{
                  position: 'absolute',
                  top: topPx(label, startMin) - 8,
                  right: 0,
                  width: '100%',
                  textAlign: 'right',
                  fontSize: 10,
                  color: 'var(--color-gray-400)',
                  paddingRight: 6,
                  lineHeight: 1,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Day columns – show only days that have courses (RTL reversed) */}
        {[...DAYS].reverse().map((day) => {
          const hasSlots = (grid[day] || []).length > 0;
          return (
            <div key={day} style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column' }}>
              {/* Day header */}
              <div style={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hasSlots ? 'var(--color-primary)' : 'var(--color-gray-200)',
                color: hasSlots ? '#fff' : '#94a3b8',
                fontSize: 12,
                fontWeight: 700,
                borderRight: '1px solid rgba(255,255,255,.15)',
              }}>
                {DAY_AR[day]}
              </div>

              {/* Day body */}
              <div style={{
                position: 'relative',
                height: totalH,
                borderRight: '1px solid var(--color-gray-200)',
                background: hasSlots ? 'var(--surface-card)' : 'var(--color-gray-50)',
              }}>
                {/* Hour grid lines */}
                {hourLabels.map((label) => (
                  <div
                    key={label}
                    style={{
                      position: 'absolute',
                      top: topPx(label, startMin),
                      left: 0, right: 0,
                      borderTop: '1px solid var(--color-gray-100)',
                    }}
                  />
                ))}
                {/* Half-hour lines */}
                {hourLabels.map((label) => {
                  const [h] = label.split(':').map(Number);
                  const halfHour = `${String(h).padStart(2,'0')}:30`;
                  const halfMin  = timeToMinutes(halfHour);
                  if (halfMin <= startMin || halfMin >= endMin) return null;
                  return (
                    <div
                      key={halfHour}
                      style={{
                        position: 'absolute',
                        top: topPx(halfHour, startMin),
                        left: 0, right: 0,
                        borderTop: '1px dashed var(--color-gray-100)',
                      }}
                    />
                  );
                })}

                {/* Course slots */}
                {(grid[day] || []).map((slot, i) => (
                  <SlotCard
                    key={`${slot.courseCode}-${i}`}
                    slot={{ ...slot, day }}
                    startMin={startMin}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [sems, setSems]       = useState([]);
  const [semId, setSemId]     = useState('');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sharedAPI.getSemesters().then(r => {
      const all = D(r) || [];
      setSems(all);
      const cur = all.find(x => x.status === 'active')
        || all.find(x => x.status === 'registration')
        || all.find(x => x.status === 'grading')
        || all[0];
      if (cur) setSemId(cur.id);
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!semId) { setLoading(false); return; }
    setLoading(true);
    studentAPI.getSchedule(semId)
      .then(r => setData(D(r)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [semId]);

  const currentSem  = sems.find(s => s.id == semId);
  const grid        = data?.weeklyGrid || {};
  const enrollments = data?.enrollments || [];
  const hasSchedule = enrollments.length > 0;

  const totalCredits = enrollments
    .filter(e => e.status === 'registered' || e.status === 'completed')
    .reduce((s, e) => s + (e.credits || 0), 0);

  const activeDays = DAYS.filter(d => (grid[d] || []).length > 0);

  const printSchedule = () => {
    const semLabel = currentSem?.label || '';
    const { startMin, endMin } = computeTimeRange(grid);
    const hours = [];
    for (let m = startMin; m < endMin; m += 60) {
      const h = Math.floor(m / 60);
      hours.push(`${String(h).padStart(2,'0')}:00`);
    }
    const doc = `<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>الجدول الدراسي</title>
<style>
  *{box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;margin:0;padding:20px;color:#1e293b}
  h1{text-align:center;color:#1b4f9e;font-size:20px;margin-bottom:4px}.sub{text-align:center;color:#64748b;font-size:13px;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{background:#1b4f9e;color:white;padding:10px;font-size:13px}td{border:1px solid #e2e8f0;padding:8px;vertical-align:top;min-width:90px}
  .code{font-weight:700;color:#1d4ed8;font-size:12px}.time{font-size:11px;color:#64748b}
  h2{font-size:15px;border-bottom:2px solid #1b4f9e;padding-bottom:4px}
  .row{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  @media print{body{padding:10px}}
</style></head><body>
  <h1>الجدول الدراسي الأسبوعي للطالب</h1>
  <div class="sub">${semLabel} — مطبوع ${new Date().toLocaleDateString('ar-EG')}</div>
  <table>
    <thead><tr><th>الوقت</th>${DAYS.map(d => `<th>${DAY_AR[d]}</th>`).join('')}</tr></thead>
    <tbody>
      ${hours.map(h => {
        return `<tr><td style="background:#f8fafc;font-weight:700;text-align:center;font-size:12px">${h}</td>
          ${DAYS.map(d => {
            const slots = (grid[d] || []).filter(s => s.start && s.start.startsWith(h.slice(0,2)));
            return `<td>${slots.map(s => `<div class="code">${s.courseCode}</div><div class="time">${s.start?.slice(0,5)}–${s.end?.slice(0,5)}</div><div class="time">${s.room||''}</div>`).join('')}</td>`;
          }).join('')}</tr>`;
      }).join('')}
    </tbody>
  </table>
  <h2>المقررات المسجلة</h2>
  ${enrollments.map(o => `<div class="row"><strong style="min-width:70px;color:#1d4ed8">${o.code}</strong><span style="flex:1">${o.name_ar||o.name_en||''}</span><span style="color:#64748b">${o.doctor_name_ar||o.doctor_name||'—'}</span></div>`).join('')}
  <script>window.onload=()=>window.print();</script>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(doc);
    w.document.close();
  };

  return (
    <AppLayout>
      {/* ── Header bar ── */}
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 14,
        padding: '14px 20px',
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        border: '1px solid var(--color-gray-200)',
        direction: 'rtl',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>📅</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-primary)' }}>جدولي الدراسي</div>
            {currentSem && (
              <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 1 }}>{currentSem.label}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {currentSem && (
            <Badge
              variant={currentSem.status === 'active' ? 'success' : currentSem.status === 'registration' ? 'info' : 'default'}
              style={{ fontSize: 11 }}
            >
              {currentSem.status === 'active' ? 'نشط' : currentSem.status === 'registration' ? 'تسجيل' : currentSem.status === 'grading' ? 'رصد درجات' : 'مغلق'}
            </Badge>
          )}
          <select
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--color-gray-200)', fontSize: 12, background: 'var(--color-gray-50)', cursor: 'pointer' }}
            value={semId || ''}
            onChange={e => { setSemId(e.target.value); setData(null); }}
          >
            {sems.map(s => (
              <option key={s.id} value={s.id}>{s.label || `${s.semester_type||''} ${s.year_label||''}`}</option>
            ))}
          </select>
          <Button size="sm" onClick={printSchedule} disabled={!hasSchedule} style={{ fontSize: 12 }}>
            🖨️ طباعة
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : hasSchedule ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Stats row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '📚', label: 'عدد المقررات', value: enrollments.length },
              { icon: '⏱️', label: 'إجمالي الساعات', value: `${totalCredits} ساعة` },
              { icon: '📆', label: 'أيام الدراسة', value: activeDays.map(d => DAY_AR[d]).join(' · ') || '—' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl' }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>{s.label}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-gray-800)' }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Weekly grid ── */}
          <div style={{ background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', direction: 'rtl' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-gray-200)', fontWeight: 700, fontSize: 14, color: 'var(--color-gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🗓️</span> الجدول الأسبوعي
            </div>
            <div style={{ padding: 10 }}>
              <WeeklyGrid grid={grid} />
            </div>
          </div>

          {/* ── Course cards grid ── */}
          <div style={{ background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', direction: 'rtl' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-gray-200)', fontWeight: 700, fontSize: 14, color: 'var(--color-gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📋</span> المقررات المسجلة
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, padding: 12 }}>
              {enrollments.map((c, i) => {
                const col = DAY_COLORS[DAYS[i % DAYS.length]];
                const att = Number(c.attendance_pct || 0);
                const attColor = att < 42 ? 'var(--color-error)' : att < 75 ? 'var(--color-warning)' : 'var(--color-success)';
                return (
                  <div
                    key={c.enrollment_id || i}
                    style={{
                      borderRadius: 10,
                      border: `1px solid ${col.border}22`,
                      background: col.bg,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {/* Code + credits row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: col.text, fontSize: 13 }}>{c.code || '—'}</span>
                      <span style={{ fontSize: 11, background: 'var(--surface-card)', color: col.text, border: `1px solid ${col.border}55`, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                        {c.credits} ساعات
                      </span>
                    </div>
                    {/* Course name */}
                    <div style={{ fontWeight: 700, color: 'var(--color-gray-800)', fontSize: 12, lineHeight: 1.4 }}>
                      {c.name_ar || c.name_en || '—'}
                    </div>
                    {/* Doctor */}
                    <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>
                      {c.doctor_name_ar || c.doctor_name || '—'}
                    </div>
                    {/* Attendance */}
                    {att > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--color-gray-200)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(att, 100)}%`, height: '100%', background: attColor, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: attColor }}>{att.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)', gap: 12 }}>
          <div style={{ fontSize: 56, opacity: 0.15 }}>📅</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-gray-500)' }}>لا يوجد جدول دراسي</div>
          <div style={{ fontSize: 13, color: 'var(--color-gray-400)', textAlign: 'center', maxWidth: 360 }}>
            لا توجد مقررات مسجلة لهذا الفصل، أو لم يتم رفع الجداول بعد لـ {currentSem?.label || 'هذا الفصل'}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
