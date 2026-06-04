import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Spinner, GradeBadge, StatusBadge, SpecBadge } from '../../components/ui';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtGpa = (v) => {
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0) return null;
  return n.toFixed(2);
};

const hasValue = (v) => v !== null && v !== undefined && v !== '';

// Grade points for fallback GPA computation
const LETTER_TO_POINTS = {
  'A+': 4.0, 'A': 3.7, 'A-': 3.4,
  'B+': 3.2, 'B': 3.0, 'B-': 2.8,
  'C+': 2.6, 'C': 2.4, 'C-': 2.2,
  'D+': 2.0, 'D': 1.5, 'D-': 1.0,
  'F': 0.0, 'Abs': 0.0,
};

function computeSemGPA(courses) {
  let totalPoints = 0, totalCredits = 0;
  for (const c of courses) {
    const grade = c.letterGrade || c.letter_grade;
    const credits = Number(c.credits || 0);
    if (grade && LETTER_TO_POINTS[grade] !== undefined && credits > 0) {
      totalPoints += LETTER_TO_POINTS[grade] * credits;
      totalCredits += credits;
    }
  }
  if (totalCredits === 0) return null;
  return (totalPoints / totalCredits).toFixed(2);
}

// ── Compact Table (matching TranscriptPage style) ─────────────────────────────
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

// ── GPA pill (matching TranscriptPage style) ──────────────────────────────────
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminStudentDetail() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStudentDetail(studentId)
      .then(r => setData(D(r)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <AppLayout><Spinner /></AppLayout>;
  if (!data) return <AppLayout><div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-error)' }}>الطالب غير موجود</div></AppLayout>;

  const st  = data.student || {};
  const ac  = data.academicInfo || {};
  const sems = data.semesters || [];
  const warnings = data.warnings || [];
  const eligibility = data.graduationEligibility || data.eligibility || {};

  const cgpaDisplay = fmtGpa(ac.cgpa ?? st.cgpa);
  const totalCredits = ac.totalCreditsPassed ?? ac.total_credits_passed ?? st.total_credits_passed ?? 0;
  const requiredCredits = ac.requiredCredits ?? 138;
  const progressPct = requiredCredits > 0 ? Math.min(100, Math.round((totalCredits / requiredCredits) * 100)) : 0;

  const reloadData = async () => {
    try {
      const r = await adminAPI.getStudentDetail(studentId);
      setData(D(r));
      toast.success('تم تحديث البيانات');
    } catch {
      toast.error('فشل تحديث البيانات');
    }
  };

  // Build GPA lookup from the gpaHistory
  const gpaLookup = {};
  (data.gpaHistory || []).forEach(g => {
    const key = g.semester_id;
    if (key) gpaLookup[key] = g;
  });

  return (
    <AppLayout>
      {/* ── Back navigation + title ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14, direction: 'rtl',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/students" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" style={{ fontSize: 12 }}>← العودة للطلاب</Button>
          </Link>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-gray-800)' }}>
              {st.full_name_ar || st.fullNameAr || 'بيانات الطالب'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span>{st.student_code || st.studentCode}</span>
              <span>•</span>
              <span>{st.email}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SpecBadge spec={(st.specialization || '').toUpperCase()} />
          <StatusBadge status={ac.academicStatus || st.academic_status || st.academicStatus || 'active'} />
          <Button variant="ghost" size="sm" onClick={reloadData} style={{ fontSize: 11 }}>🔄 تحديث</Button>
        </div>
      </div>

      {/* ── Summary cards row (3 columns like TranscriptPage) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 14,
        direction: 'rtl',
      }}>
        {/* CGPA card */}
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
                  const n = parseFloat(ac.cgpa ?? st.cgpa);
                  return n >= 3.6 ? 'ممتاز' : n >= 3.0 ? 'جيد جداً' : n >= 2.0 ? 'جيد' : 'مقبول';
                })()}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>لم يُحسب بعد</div>
          )}
        </div>

        {/* Total credits with progress bar */}
        <div style={{
          background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)',
          borderRadius: 14, padding: '18px 22px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginBottom: 6 }}>الساعات المكتملة</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--color-primary)' }}>{totalCredits}</span>
            <span style={{ fontSize: 13, color: 'var(--color-gray-400)', fontWeight: 500 }}>/ {requiredCredits}</span>
          </div>
          <div style={{ marginTop: 8, height: 6, background: 'var(--color-gray-100)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: progressPct >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
              borderRadius: 6,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-gray-400)', marginTop: 4 }}>
            {progressPct}% من المتطلبات
          </div>
        </div>

        {/* Level + status */}
        <div style={{
          background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)',
          borderRadius: 14, padding: '18px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginBottom: 6 }}>المستوى الدراسي</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)' }}>
            {st.currentLevel || st.current_level || '—'}
          </div>
          {(ac.consecutiveWarnings > 0 || ac.consecutive_warnings > 0) ? (
            <div style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 6, fontWeight: 600 }}>
              ⚠️ {ac.consecutiveWarnings || ac.consecutive_warnings} إنذار متتالي
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 6 }}>
              {st.semesters_enrolled || 0} فصول مسجلة
            </div>
          )}
        </div>
      </div>

      {/* ── Academic detail row (5 boxes) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
        marginBottom: 14,
        direction: 'rtl',
      }}>
        {[
          { label: 'الإنذارات المتتالية', value: ac.consecutiveWarnings || ac.consecutive_warnings || 0, color: (ac.consecutiveWarnings || ac.consecutive_warnings || 0) > 0 ? 'var(--color-error)' : 'var(--color-gray-700)', icon: '⚠️' },
          { label: 'إجمالي الإنذارات', value: ac.totalWarnings || ac.total_warnings || st.total_warnings || 0, color: 'var(--color-gray-700)', icon: '🔔' },
          { label: 'مجموع النقاط', value: ac.totalPoints || '0', color: 'var(--color-gray-700)', icon: '📊' },
          { label: 'الفصول المسجلة', value: st.semesters_enrolled || 0, color: 'var(--color-gray-700)', icon: '📅' },
          { label: 'سنة الالتحاق', value: st.enrollment_year || '—', color: 'var(--color-primary)', icon: '🎓' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)',
            borderRadius: 10, padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>{item.icon}</div>
            <div style={{ fontSize: 10, color: 'var(--color-gray-400)', marginBottom: 2, lineHeight: 1.2 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Graduation eligibility banner ── */}
      {eligibility && (eligibility.eligible !== undefined) && (
        <div style={{
          background: eligibility.eligible ? 'var(--color-success-light)' : 'var(--color-warning-light)',
          border: `1px solid ${eligibility.eligible ? 'var(--color-success)' : 'var(--color-warning)'}33`,
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          direction: 'rtl',
        }}>
          <span style={{ fontSize: 18 }}>{eligibility.eligible ? '🎓' : '📋'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: eligibility.eligible ? 'var(--color-success)' : 'var(--color-warning-dark)' }}>
              {eligibility.eligible ? 'مؤهل للتخرج' : 'غير مؤهل للتخرج بعد'}
            </div>
            {eligibility.reasons && eligibility.reasons.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--color-gray-600)', marginTop: 2 }}>
                {eligibility.reasons.join(' • ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Warnings section ── */}
      {warnings.length > 0 && (
        <div style={{
          background: 'var(--surface-card)', border: '1px solid var(--color-gray-200)',
          borderRadius: 14, marginBottom: 14, overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,.04)',
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--color-gray-200)',
            background: 'rgba(220,38,38,0.04)',
            display: 'flex', alignItems: 'center', gap: 8,
            direction: 'rtl',
          }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-error)' }}>
              الإنذارات الأكاديمية ({warnings.length})
            </span>
          </div>
          {warnings.map((w, i) => (
            <div key={w.id || i} style={{
              padding: '8px 16px',
              borderBottom: i < warnings.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              direction: 'rtl', fontSize: 12,
            }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--color-error)' }}>
                  إنذار {w.warning_number || i + 1}
                </span>
                <span style={{ color: 'var(--color-gray-500)', marginRight: 8 }}>
                  {w.semester_label || w.label || ''}
                </span>
              </div>
              <div style={{ color: 'var(--color-gray-400)', fontSize: 11 }}>
                المعدل: {fmtGpa(w.semester_gpa || w.gpa_at_warning) || '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Semester cards (TranscriptPage style) ── */}
      {sems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px',
          color: 'var(--color-gray-400)',
          background: 'var(--surface-card)', borderRadius: 14,
          border: '1px solid var(--color-gray-200)',
        }}>
          لا يوجد سجل أكاديمي متاح لهذا الطالب حتى الآن.
        </div>
      ) : (
        sems.map(s => {
          const semId    = s.semesterId || s.semester_id;
          const semName  = s.semesterName || s.semester_name || '';
          const cleanSemName = semName.replace(/\s*\d{4}\s*/g, '').trim();
          const yearLabel = s.yearLabel || s.year_label;
          const gpaRec   = gpaLookup[semId];
          const serverGPA = Number(s.gpa || 0);
          const computedGPA = computeSemGPA(s.courses || []);
          const semGpa   = fmtGpa(gpaRec?.semester_gpa || (serverGPA > 0 ? serverGPA : computedGPA));
          const cumGpa   = fmtGpa(gpaRec?.cumulative_gpa);
          const courses  = s.courses || [];

          // Determine grade column visibility per semester
          const hasNumeric = courses.some(c => hasValue(c.totalGrade ?? c.total_grade));
          const hasLetter  = courses.some(c => hasValue(c.letterGrade || c.letter_grade));
          const isActive   = !hasLetter; // no letter grade → still in progress

          return (
            <div
              key={semId}
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
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-gray-800)' }}>{cleanSemName}</span>
                  {yearLabel && (
                    <span style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 500 }}>
                      {cleanSemName} — العام الدراسي {yearLabel.replace('-', '/')}
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
                    </>
                  )}
                </div>
              </div>

              {/* Compact table */}
              <CompactTable>
                <thead>
                  <tr>
                    <CTh>رمز المقرر</CTh>
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
                    const gradeStr    = hasValue(rawGrade) ? String(Number(rawGrade).toFixed(1)) : null;

                    return (
                      <tr key={c.enrollmentId || c.enrollment_id || i} style={{ background: i % 2 === 0 ? 'var(--surface-card)' : 'var(--color-gray-50)' }}>
                        <CTd style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {c.courseCode || c.course_code || '—'}
                        </CTd>
                        <CTd>
                          <span style={{ color: 'var(--color-gray-600)', fontSize: 12 }}>
                            {c.courseName || c.course_name || '—'}
                          </span>
                        </CTd>
                        <CTd style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)', fontSize: 13 }}>
                          {c.credits || '—'}
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

              {/* Footer: credit summary */}
              {!isActive && (
                <div style={{
                  padding: '8px 14px',
                  borderTop: '1px solid var(--color-gray-100)',
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'flex-end',
                  direction: 'rtl',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                    المقررات: <strong style={{ color: 'var(--color-gray-600)' }}>{courses.length}</strong>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
                    إجمالي الساعات: <strong style={{ color: 'var(--color-primary)' }}>{courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)}</strong>
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
    </AppLayout>
  );
}
