import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { GradeBadge, Spinner } from '../../components/ui';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtGpa = (v) => {
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0) return null;
  return n.toFixed(2);
};

const hasValue = (v) => v !== null && v !== undefined && v !== '';

// ── Compact inline table (bypasses the generic Td/Th padding) ─────────────────
function CompactTable({ children }) {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
      direction: 'rtl',
    }}>
      {children}
    </table>
  );
}

function CTh({ children, style }) {
  return (
    <th style={{
      textAlign: 'right',
      padding: '7px 12px',
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--color-gray-400)',
      borderBottom: '1px solid var(--color-gray-200)',
      whiteSpace: 'nowrap',
      background: 'var(--color-gray-50)',
      ...style,
    }}>
      {children}
    </th>
  );
}

function CTd({ children, style }) {
  return (
    <td style={{
      textAlign: 'right',
      padding: '8px 12px',
      color: 'var(--color-gray-800)',
      borderBottom: '1px solid var(--color-gray-100)',
      verticalAlign: 'middle',
      ...style,
    }}>
      {children}
    </td>
  );
}

// ── GPA pill ──────────────────────────────────────────────────────────────────
function GpaPill({ value, label }) {
  if (!value) return null;
  const n = parseFloat(value);
  const color = n >= 3.6 ? 'var(--color-success)' : n >= 3.0 ? 'var(--color-primary)' : n >= 2.0 ? 'var(--color-warning)' : 'var(--color-error)';
  const bg    = n >= 3.6 ? 'var(--color-success-light)' : n >= 3.0 ? 'var(--color-primary-50)' : n >= 2.0 ? 'var(--color-warning-light)' : 'var(--color-error-light)';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: bg, border: `1px solid ${color}33`,
      borderRadius: 20, padding: '3px 10px',
    }}>
      <span style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>{label}:</span>
      <span style={{ fontWeight: 800, fontSize: 13, color }}>{value}</span>
    </div>
  );
}

// ── Classification normaliser ─────────────────────────────────────────────────
// Handles Arabic text (from migration 011), English text (from JS service),
// and filters out any garbled / question-mark values from old seed runs.
const CLASSIFICATION_MAP = {
  // Arabic originals (migration 011)
  'ممتاز':   'ممتاز',
  'جيد جداً':'جيد جداً',
  'جيد':     'جيد',
  'مقبول':   'مقبول',
  'راسب':    'راسب',
  // English originals (JS gpa service)
  'Excellent':    'ممتاز',
  'Very Good':    'جيد جداً',
  'Good':         'جيد',
  'Satisfactory': 'مقبول',
  'Weak':         'مقبول',
  'Poor':         'راسب',
};

function normalizeClassification(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  // Reject values that consist mostly of question marks or non-Arabic/Latin chars
  if (/^[?؟\s]+$/.test(trimmed)) return null;
  if (trimmed.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '').length < 2) return null;
  return CLASSIFICATION_MAP[trimmed] || null;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TranscriptPage() {
  const [d, setD]       = useState(null);
  const [loading, setL] = useState(true);

  useEffect(() => {
    studentAPI.getTranscript()
      .then(r => setD(D(r)))
      .catch(() => {})
      .finally(() => setL(false));
  }, []);

  if (loading) return <AppLayout><Spinner /></AppLayout>;

  const st = d?.student || d || {};

  // Build GPA lookup keyed by semester label
  const gpaLookup = {};
  (d?.gpaHistory || []).forEach(g => {
    const key = g.label || g.semester_name;
    if (key) gpaLookup[key] = g;
  });

  const cgpaDisplay = fmtGpa(st.cgpa);
  const semesters   = d?.semesters || d?.transcript || [];

  return (
    <AppLayout>

      {/* ── Summary cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 16,
        direction: 'rtl',
      }}>
        {/* CGPA */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4f9e 0%, #2563eb 100%)',
          borderRadius: 14,
          padding: '18px 22px',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(27,79,158,.3)',
        }}>
          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 6 }}>المعدل التراكمي</div>
          {cgpaDisplay ? (
            <>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{cgpaDisplay}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6 }}>
                {(() => {
                  const n = parseFloat(st.cgpa);
                  return n >= 3.6 ? 'ممتاز' : n >= 3.0 ? 'جيد جداً' : n >= 2.0 ? 'جيد' : 'مقبول';
                })()}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>لم يُحسب بعد</div>
          )}
        </div>

        {/* Total credits */}
        <div style={{
          background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)',
          borderRadius: 14, padding: '18px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginBottom: 6 }}>إجمالي الساعات المكتملة</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--color-primary)' }}>
            {st.totalCreditsPassed ?? st.totalCredits ?? st.total_credits_passed ?? st.total_credits ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 4 }}>ساعة معتمدة</div>
        </div>

        {/* Level */}
        <div style={{
          background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)',
          borderRadius: 14, padding: '18px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginBottom: 6 }}>المستوى الدراسي</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)' }}>
            {st.currentLevel || st.current_level || '—'}
          </div>
          {st.academicStatus === 'warning'
            ? <div style={{ fontSize: 11, color: 'var(--color-warning)', marginTop: 4 }}>⚠️ إنذار أكاديمي</div>
            : <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 4 }}>
                {st.gpaClassification || ''}
              </div>
          }
        </div>
      </div>

      {/* ── Semester cards ── */}
      {semesters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)', background: 'var(--surface-card)', borderRadius: 14, border: '1px solid var(--color-gray-200)' }}>
          لا توجد سجلات درجات
        </div>
      ) : (
        semesters.map(s => {
          const semKey   = s.semester_name || s.name || s.academicYear || '';
          const cleanSemKey = semKey.replace(/\s*\d{4}\s*/g, '').trim();
          const yearLabel = s.year_label || s.yearLabel;
          
          const gpaRec   = gpaLookup[semKey];
          const semGpa   = fmtGpa(gpaRec?.semester_gpa);
          const cumGpa   = fmtGpa(gpaRec?.cumulative_gpa);
          const courses  = s.courses || s.enrollments || [];

          // Determine grade column visibility per semester
          const hasNumeric = courses.some(c => hasValue(c.totalGrade ?? c.total_grade));
          const hasLetter  = courses.some(c => hasValue(c.letterGrade || c.letter_grade));
          const isActive   = !hasLetter; // no letter grade → still in progress

          return (
            <div
              key={s.id || s.semester_id || semKey}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 14,
                marginBottom: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,.04)',
              }}
            >
              {/* Semester header */}
              <div style={{
                padding: '11px 16px',
                borderBottom: '1px solid var(--color-gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-gray-50)',
                direction: 'rtl',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-gray-800)' }}>{cleanSemKey}</span>
                  {yearLabel && (
                    <span style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 500 }}>
                      {cleanSemKey} — العام الدراسي {yearLabel.replace('-', '/')}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {isActive ? (
                    <span style={{
                      fontSize: 11, background: 'var(--color-warning-light)', color: 'var(--color-warning-dark)',
                      padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                    }}>
                      الترم الحالي
                    </span>
                  ) : (
                    <>
                      {semGpa  && <GpaPill value={semGpa}  label="معدل الترم" />}
                      {cumGpa  && <GpaPill value={cumGpa}  label="تراكمي"    />}
                      {normalizeClassification(gpaRec?.classification) && (
                        <span style={{
                          fontSize: 11, color: 'var(--color-gray-500)',
                          background: 'var(--color-gray-100)', borderRadius: 20,
                          padding: '3px 10px',
                        }}>
                          {normalizeClassification(gpaRec.classification)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Compact table */}
              <CompactTable>
                <thead>
                  <tr>
                    <CTh>المقرر</CTh>
                    <CTh style={{ textAlign: 'center', width: 60 }}>الساعات</CTh>
                    {hasNumeric && <CTh style={{ textAlign: 'center', width: 72 }}>الدرجة</CTh>}
                    {hasLetter  && <CTh style={{ textAlign: 'center', width: 80 }}>التقدير</CTh>}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, i) => {
                    const rawGrade    = c.totalGrade ?? c.total_grade;
                    const letterGrade = c.letterGrade || c.letter_grade;
                    const gradeStr    = hasValue(rawGrade) ? String(rawGrade) : null;

                    return (
                      <tr key={c.id || i} style={{ background: i % 2 === 0 ? 'var(--surface-card)' : 'var(--color-gray-50)' }}>
                        <CTd>
                          <span style={{ color: 'var(--color-gray-600)', fontSize: 12 }}>
                            {c.course_name_ar || c.nameAr || c.name_ar || c.courseName || c.course_name || '—'}
                          </span>
                        </CTd>
                        <CTd style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)', fontSize: 13 }}>
                          {c.credits || c.credit_hours || '—'}
                        </CTd>
                        {hasNumeric && (
                          <CTd style={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                            {gradeStr ?? (
                              <span style={{ fontSize: 11, color: 'var(--color-gray-300)', fontWeight: 400 }}>—</span>
                            )}
                          </CTd>
                        )}
                        {hasLetter && (
                          <CTd style={{ textAlign: 'center' }}>
                            {hasValue(letterGrade) ? (
                              <GradeBadge grade={letterGrade} />
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--color-gray-300)' }}>—</span>
                            )}
                          </CTd>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </CompactTable>

              {/* Footer: credit summary when grades exist */}
              {!isActive && (
                <div style={{
                  padding: '8px 14px',
                  borderTop: '1px solid var(--color-gray-100)',
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'flex-end',
                  direction: 'rtl',
                }}>
                  {gpaRec?.credits_attempted && (
                    <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                      الساعات المقررة: <strong style={{ color: 'var(--color-gray-600)' }}>{gpaRec.credits_attempted}</strong>
                    </span>
                  )}
                  {gpaRec?.credits_passed && (
                    <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                      الساعات الناجح بها: <strong style={{ color: 'var(--color-success)' }}>{gpaRec.credits_passed}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </AppLayout>
  );
}
