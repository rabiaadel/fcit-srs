import React, { useState, useEffect } from 'react';
import { sharedAPI, doctorAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Spinner, Badge } from '../../components/ui';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const DAY_AR = { Sat: 'السبت', Sun: 'الأحد', Mon: 'الاثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء', Thu: 'الخميس' };

// Day-based colors — matching student schedule style
const DAY_COLORS = {
  Sat: { bg: 'var(--color-primary-50)', border: '#3b82f6', text: 'var(--color-primary)', light: 'var(--color-primary-100)' },
  Sun: { bg: 'var(--color-success-light)', border: '#22c55e', text: 'var(--color-success)', light: 'var(--color-success-light)' },
  Mon: { bg: 'rgba(168, 85, 247, 0.12)', border: '#a855f7', text: '#a855f7', light: 'rgba(168, 85, 247, 0.08)' },
  Tue: { bg: 'var(--color-warning-light)', border: '#f97316', text: 'var(--color-warning)', light: 'var(--color-warning-light)' },
  Wed: { bg: 'var(--color-error-light)', border: '#ef4444', text: 'var(--color-error)', light: 'var(--color-error-light)' },
  Thu: { bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', text: '#06b6d4', light: 'rgba(6, 182, 212, 0.08)' },
};

// Keep course palette only for the course listing cards
const COURSE_PALETTE = [
  { bg: 'var(--color-primary-50)', border: '#3b82f6', text: 'var(--color-primary)' },
  { bg: 'var(--color-success-light)', border: '#22c55e', text: 'var(--color-success)' },
  { bg: 'rgba(168, 85, 247, 0.12)', border: '#a855f7', text: '#a855f7' },
  { bg: 'var(--color-warning-light)', border: '#f97316', text: 'var(--color-warning)' },
  { bg: 'var(--color-error-light)', border: '#ef4444', text: 'var(--color-error)' },
  { bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', text: '#06b6d4' },
];

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

// Fixed window: 7:00 – 15:00
const PX_PER_MIN = 0.75;

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

const topPx    = (t, startMin) => (timeToMinutes(t) - startMin) * PX_PER_MIN;
const heightPx = (s, e) => (timeToMinutes(e) - timeToMinutes(s)) * PX_PER_MIN;

// ── Overlap layout helpers ────────────────────────────────────────────────────

function assignColumns(slots) {
  if (!slots.length) return [];

  const sorted = [...slots].map((s, origIdx) => ({ ...s, origIdx }))
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  const columns = [];

  sorted.forEach(slot => {
    const startMin = timeToMinutes(slot.start);
    let placed = false;

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const lastEnd = Math.max(...col.map(x => x.endMin));
      if (startMin >= lastEnd) {
        col.push({ slot, endMin: timeToMinutes(slot.end) });
        slot._col = c;
        placed = true;
        break;
      }
    }

    if (!placed) {
      slot._col = columns.length;
      columns.push([{ slot, endMin: timeToMinutes(slot.end) }]);
    }
  });

  return sorted.map(slot => {
    const startMin = timeToMinutes(slot.start);
    const endMin   = timeToMinutes(slot.end);
    const activeCols = columns.filter(col =>
      col.some(({ slot: s, endMin: e }) =>
        timeToMinutes(s.start) < endMin && e > startMin
      )
    ).length;
    return { ...slot, col: slot._col, totalCols: activeCols };
  });
}

// ── Slot card (matches student schedule style with day-based colors) ──────────
function SlotCard({ slot, day, startMin, col = 0, totalCols = 1 }) {
  const colDef    = DAY_COLORS[day] || DAY_COLORS['Sat'];
  const h         = heightPx(slot.start, slot.end);
  const top       = topPx(slot.start, startMin);
  const isTiny    = h < 36;
  const isSmall   = h < 58;
  const isConflict = !!slot.hasConflict;

  const pct   = 100 / totalCols;
  const left  = `calc(${col * pct}% + 3px)`;
  const width = `calc(${pct}% - 6px)`;

  return (
    <div
      title={`${slot.courseCode} — ${slot.courseNameAr || slot.courseName}\n${slot.start?.slice(0,5)} – ${slot.end?.slice(0,5)}\n${slot.room || ''}${isConflict ? '\n⚠ تعارض في الجدول!' : ''}`}
      style={{
        position: 'absolute',
        top: top + 1,
        left,
        width,
        height: Math.max(h - 2, 22),
        background: isConflict ? 'rgba(220,38,38,0.08)' : colDef.bg,
        border: `1.5px solid ${isConflict ? '#f87171' : colDef.border}`,
        borderLeft: `4px solid ${isConflict ? '#ef4444' : colDef.border}`,
        borderRadius: 7,
        padding: isTiny ? '2px 6px' : '4px 7px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: isConflict
          ? '0 0 0 1px #fca5a5, 0 2px 6px rgba(239,68,68,.18)'
          : '0 1px 3px rgba(0,0,0,.07)',
        cursor: 'default',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {isConflict && !isTiny && (
        <div style={{ fontSize: 8, fontWeight: 800, color: 'var(--color-error)', letterSpacing: 0.2 }}>⚠ تعارض</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 800, fontSize: isTiny ? 9 : 11, color: isConflict ? 'var(--color-error)' : colDef.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
          {slot.courseCode}
        </span>
        {!isTiny && (
          <span style={{ fontSize: 9, color: isConflict ? 'var(--color-error)' : colDef.text, opacity: 0.7, whiteSpace: 'nowrap', lineHeight: 1.3, flexShrink: 0 }}>
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

// ── Weekly grid (matches student schedule style) ──────────────────────────────
function WeeklyGrid({ grid }) {
  const { startMin, endMin } = computeTimeRange(grid);
  const hourLabels = buildHourLabels(startMin, endMin);
  const totalH     = (endMin - startMin) * PX_PER_MIN;

  return (
    <div style={{ overflowX: 'auto', direction: 'ltr' }}>
      <div style={{ display: 'flex', minWidth: 820 }}>

        {/* Time column */}
        <div style={{ width: 50, flexShrink: 0, position: 'relative', height: totalH + 32 }}>
          <div style={{ height: 32 }} />
          <div style={{ position: 'relative', height: totalH }}>
            {hourLabels.map(label => (
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

        {/* Day columns */}
        {[...DAYS].reverse().map(day => {
          const hasSlots = (grid[day] || []).length > 0;
          const layoutSlots = assignColumns(grid[day] || []);
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
                {hourLabels.map(label => (
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
                {hourLabels.map(label => {
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
                {layoutSlots.map((slot, i) => (
                  <SlotCard
                    key={`${slot.courseCode}-${i}`}
                    slot={slot}
                    day={day}
                    startMin={startMin}
                    col={slot.col}
                    totalCols={slot.totalCols}
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
export default function DoctorSchedulePage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [sems, setSems]       = useState([]);
  const [selSem, setSelSem]   = useState('');

  useEffect(() => {
    sharedAPI.getSemesters()
      .then(r => {
        const s = D(r) || [];
        // Only show active/registration/grading semesters in the schedule
        const activeSems = s.filter(x => ['registration', 'active', 'grading'].includes(x.status));
        setSems(activeSems);
        const cur = activeSems.find(x => ['registration', 'active', 'grading'].includes(x.status));
        if (cur) setSelSem(cur.id);
        else if (activeSems.length > 0) setSelSem(activeSems[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selSem) { setLoading(false); return; }
    setLoading(true);
    doctorAPI.getSchedule({ semesterId: selSem })
      .then(r => setData(D(r)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selSem]);

  const grid        = data?.weeklyGrid || {};
  // Ensure all days are present (backend may omit Sat)
  DAYS.forEach(d => { if (!grid[d]) grid[d] = []; });
  const offerings        = data?.offerings || [];
  const hasSchedule      = offerings.length > 0;
  const currentSem       = sems.find(s => s.id == selSem);
  const totalStudents    = data?.totalStudents ?? offerings.reduce((s, o) => s + (parseInt(o.enrolled_count) || 0), 0);
  const scheduleConflicts = data?.scheduleConflicts || [];

  const offeringsByLevel = offerings.reduce((acc, off) => {
    const level = off.level_name || 'الفرقة الأولى';
    if (!acc[level]) acc[level] = [];
    acc[level].push(off);
    return acc;
  }, {});

  const activeDays = DAYS.filter(d => (grid[d] || []).length > 0);

  const printSchedule = () => {
    const semLabel = currentSem?.label || '';
    const doc = `<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>جدول عضو هيئة التدريس</title>
<style>*{box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;margin:0;padding:20px;color:#1e293b}
h1{text-align:center;color:#1b4f9e;font-size:20px;margin-bottom:4px}.sub{text-align:center;color:#64748b;font-size:13px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}th{background:#1b4f9e;color:white;padding:10px;font-size:13px}
td{border:1px solid #e2e8f0;padding:8px;vertical-align:top;min-width:90px}
h2{font-size:15px;border-bottom:2px solid #1b4f9e;padding-bottom:4px}
.row{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
.code{font-weight:700;color:#1d4ed8;font-size:12px}.time{font-size:11px;color:#64748b}
@media print{body{padding:10px}}</style></head><body>
<h1>الجدول الدراسي لعضو هيئة التدريس</h1>
<div class="sub">${semLabel} — مطبوع ${new Date().toLocaleDateString('ar-EG')}</div>
<table><thead><tr><th>الوقت</th>${DAYS.map(d=>`<th>${DAY_AR[d]}</th>`).join('')}</tr></thead>
<tbody>
${Array.from({length:14},(_,i)=>{
  const h=`${String(8+i).padStart(2,'0')}:00`;
  return `<tr><td style="background:#f8fafc;font-weight:700;text-align:center;font-size:12px">${h}</td>
    ${DAYS.map(d=>{const slots=(grid[d]||[]).filter(s=>s.start&&s.start.startsWith(String(8+i).padStart(2,'0')));return `<td>${slots.map(s=>`<div class="code">${s.courseCode}</div><div class="time">${s.start?.slice(0,5)}–${s.end?.slice(0,5)}</div><div class="time">${s.room||''}</div>`).join('')}</td>`;}).join('')}</tr>`;
}).join('')}
</tbody></table>
<h2>المقررات والمهام التدريسية</h2>
${Object.entries(offeringsByLevel).map(([level,courses])=>`
<div style="margin-bottom:12px"><div style="font-weight:700;font-size:13px;background:#f1f5f9;padding:4px 8px;border-radius:4px;margin-bottom:6px">${level}</div>
${courses.map(o=>`<div class="row"><strong style="min-width:70px;color:#1d4ed8">${o.code}</strong><span style="flex:1">${o.name_ar||o.name_en}</span><span style="color:#64748b;font-size:12px">${o.enrolled_count||0}/${o.capacity||0} طالب</span></div>`).join('')}
</div>`).join('')}
<script>window.onload=()=>window.print();</script>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(doc);
    w.document.close();
  };

  return (
    <AppLayout>
      {/* ── Header ──────────────────────────────────────────────── */}
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
          <span style={{ fontSize: 22 }}>🏛️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-primary)' }}>جدول عضو هيئة التدريس</div>
            {currentSem && (() => {
            const typeAr = { first: 'الترم الأول', second: 'الترم الثاني', summer: 'الترم الصيفي' };
            const arLabel = (currentSem.semester_type && currentSem.year_label)
              ? `${typeAr[currentSem.semester_type] || currentSem.semester_type} ${currentSem.year_label}`
              : currentSem.label;
            return <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 1 }}>{arLabel}</div>;
          })()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {currentSem && (() => {
            const badgeMap = {
              active:       { label: 'نشط',    variant: 'success' },
              registration: { label: 'تسجيل',  variant: 'info' },
              grading:      { label: 'درجات',  variant: 'warning' },
            };
            const b = badgeMap[currentSem.status] || { label: currentSem.status, variant: 'default' };
            return (
              <Badge variant={b.variant} style={{ fontSize: 11 }}>{b.label}</Badge>
            );
          })()}
          <select
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--color-gray-200)', fontSize: 12, background: 'var(--color-gray-50)', cursor: 'pointer' }}
            value={selSem}
            onChange={e => setSelSem(e.target.value)}
          >
            {sems.map(s => {
              const typeAr = { first: 'الترم الأول', second: 'الترم الثاني', summer: 'الترم الصيفي' };
              const arLabel = (s.semester_type && s.year_label)
                ? `${typeAr[s.semester_type] || s.semester_type} ${s.year_label}`
                : s.label || `${s.semester_type||''} ${s.year_label||''}`;
              return <option key={s.id} value={s.id}>{arLabel}</option>;
            })}
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

          {/* ── Schedule conflict warning banner ─────────────── */}
          {scheduleConflicts.length > 0 && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.08)', border: '1.5px solid var(--color-error)', borderRadius: 12,
              padding: '12px 16px', direction: 'rtl',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-error)' }}>
                  تعارض في الجدول الدراسي ({scheduleConflicts.length} {scheduleConflicts.length === 1 ? 'تعارض' : 'تعارضات'})
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-error-dark)', marginBottom: 8 }}>
                يوجد تداخل في مواعيد المقررات التالية. يُرجى مراجعة الإدارة لإعادة ترتيب الجداول.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {scheduleConflicts.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--surface-card)', borderRadius: 8, padding: '6px 12px',
                    border: '1px solid #fecaca',
                  }}>
                    <span style={{ fontSize: 13 }}>🔴</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-error)', fontSize: 12 }}>
                      {c.courses.join(' ، ')}
                    </span>
                    <span style={{ color: 'var(--color-gray-500)', fontSize: 11 }}>—</span>
                    <span style={{ color: 'var(--color-gray-700)', fontSize: 11 }}>{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Stats row ────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: '📚', label: 'عدد المقررات', value: offerings.length },
              { icon: '👥', label: 'إجمالي الطلاب', value: `${totalStudents} طالب` },
              { icon: '📆', label: 'أيام التدريس', value: activeDays.map(d => DAY_AR[d]).join(' · ') || '—' },
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

          {/* ── Weekly grid ──────────────────────────────────── */}
          <div style={{ background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', direction: 'rtl' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-gray-200)', fontWeight: 700, fontSize: 14, color: 'var(--color-gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🗓️</span> الجدول الأسبوعي
            </div>
            <div style={{ padding: 10 }}>
              <WeeklyGrid grid={grid} />
            </div>
          </div>

          {/* ── Courses by level ─────────────────────────────── */}
          <div style={{ background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', direction: 'rtl' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-gray-200)', fontWeight: 700, fontSize: 14, color: 'var(--color-gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎓</span> المقررات والمهام التدريسية
            </div>
            {Object.entries(offeringsByLevel).map(([level, courses]) => (
              <div key={level} style={{ marginBottom: 0 }}>
                <div style={{ padding: '8px 16px', background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)', fontWeight: 700, fontSize: 13, color: 'var(--color-gray-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎓</span> {level}
                </div>
                {courses.map((o, i) => {
                  const col = COURSE_PALETTE[i % COURSE_PALETTE.length];
                  return (
                    <div key={o.offering_id || i} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '11px 16px',
                      borderBottom: i < courses.length - 1 ? '1px solid #f1f5f9' : '1px solid #e2e8f0',
                    }}>
                      <div style={{ width: 4, height: 38, borderRadius: 4, background: col.border, flexShrink: 0 }} />
                      <div style={{ fontWeight: 800, color: col.text, width: 72, fontSize: 13 }}>{o.code}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-gray-800)', fontSize: 13 }}>{o.name_ar || o.name_en}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 1 }}>
                          {o.schedule_slots && o.schedule_slots.length > 0
                            ? (o.room || 'القاعة غير محددة')
                            : <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>⚠ لم يتم تحديد وقت المحاضرة</span>
                          }
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 70 }}>
                        <div style={{ fontSize: 10, color: 'var(--color-gray-400)', marginBottom: 2 }}>الطلاب</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-gray-800)', fontSize: 13 }}>
                          {o.enrolled_count || 0}
                          <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>/{o.capacity || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)', gap: 12 }}>
          <div style={{ fontSize: 56, opacity: 0.15 }}>📅</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-gray-500)' }}>لا يوجد جدول دراسي</div>
          <div style={{ fontSize: 13, color: 'var(--color-gray-400)', textAlign: 'center', maxWidth: 360 }}>
            لم يتم إسناد مقررات لك في هذا الفصل، أو لم يتم رفع الجداول بعد لـ {currentSem?.label || 'هذا الفصل'}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
