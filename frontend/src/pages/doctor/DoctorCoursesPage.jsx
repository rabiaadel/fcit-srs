import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorAPI, sharedAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Spinner } from '../../components/ui';
import { Search, Users, Calendar, BookOpen } from 'lucide-react';

const PRIMARY = '#1b4f9e';

export default function DoctorCoursesPage() {
  const [courses, setCourses]   = useState([]);
  const [sems, setSems]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchParams]          = useSearchParams();
  const [searchQ, setSearchQ]   = useState(searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQ(q);
  }, [searchParams]);

  useEffect(() => {
    // Use getMyCourses (live counts, all semesters, no deduplication)
    Promise.all([
      doctorAPI.getMyCourses().catch(() => ({})),
      sharedAPI.getSemesters().catch(() => ({})),
    ]).then(([cRes, sRes]) => {
      const raw = D(cRes) || [];
      setCourses(Array.isArray(raw) ? raw : []);
      setSems(D(sRes) || []);
    }).finally(() => setLoading(false));
  }, []);

  const ACTIVE_STATUSES = ['active', 'registration', 'grading'];

  const SEMESTER_TYPE_AR = { first: 'الترم الأول', second: 'الترم الثاني', summer: 'الترم الصيفي' };

  const filteredAndGrouped = useMemo(() => {
    const q = searchQ.toLowerCase().trim();

    // First filter by active status AND optional search query
    const filtered = courses.filter(c => {
      const semId  = c.semester_id || c.semesterId;
      const sem    = sems.find(s => s.id === semId);
      const status = c.semester_status || sem?.status || '';
      if (!ACTIVE_STATUSES.includes(status)) return false; // hide closed semesters

      if (!q) return true;
      const name = (c.course_name_ar || c.course_name_en || c.courseName || c.course_name || '').toLowerCase();
      const code = (c.course_code || c.courseCode || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });

    const groups = {};
    filtered.forEach(c => {
      const semId  = c.semester_id || c.semesterId;
      const sem    = sems.find(s => s.id === semId);
      const status = c.semester_status || sem?.status || '';

      // Use Arabic label already computed by backend (c.semester),
      // then fall back to the type map, then raw DB label.
      const type  = c.semester_type || sem?.semester_type || '';
      const year  = c.year_label    || sem?.year_label    || '';
      const semLabel = c.semester
        || (type && year ? `${SEMESTER_TYPE_AR[type] || type} ${year}` : null)
        || sem?.label
        || 'فصل دراسي غير محدد';

      if (!groups[semLabel]) groups[semLabel] = { courses: [], status };
      groups[semLabel].courses.push(c);
    });

    // Sort: registration → active → grading
    const ORDER = { registration: 0, active: 1, grading: 2 };
    return Object.entries(groups).sort(([,a], [,b]) => {
      const ai = ORDER[a.status] ?? 99;
      const bi = ORDER[b.status] ?? 99;
      return ai - bi;
    });
  }, [courses, sems, searchQ]);

  const statusBadge = (status) => {
    const map = { active: ['نشط', 'var(--color-success)', 'var(--color-success-light)'], registration: ['تسجيل', 'var(--color-primary)', 'var(--color-primary-100)'],
                  grading: ['درجات', 'var(--color-warning)', 'var(--color-warning-light)'], closed: ['مغلق', 'var(--color-gray-500)', 'var(--color-gray-100)'] };
    const [label, color, bg] = map[status] || ['—', 'var(--color-gray-400)', 'var(--color-gray-50)'];
    return (
      <span style={{ padding: '2px 10px', borderRadius: 99, background: bg, color, fontWeight: 700, fontSize: 10 }}>
        {label}
      </span>
    );
  };

  return (
    <AppLayout>
      <div style={{ direction: 'rtl' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: PRIMARY, margin: 0 }}>مقرراتي</h1>
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              placeholder="ابحث في مقرراتك..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{
                width: '100%', padding: '9px 36px 9px 14px', borderRadius: 10,
                border: '1px solid var(--color-gray-200)', fontSize: 13, outline: 'none', background: 'var(--surface-card)',
              }}
            />
            <Search size={15} color="var(--color-gray-400)" style={{ position: 'absolute', right: 12, top: 11 }} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>
        ) : filteredAndGrouped.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px', background: 'var(--surface-card)',
            borderRadius: 14, border: '1px solid var(--color-gray-200)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-500)', marginBottom: 6 }}>لا توجد مقررات</div>
            <div style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
              {searchQ ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم إسناد مقررات إليك حتى الآن'}
            </div>
          </div>
        ) : (
          filteredAndGrouped.map(([semLabel, { courses: semCourses, status }]) => (
            <div key={semLabel} style={{ marginBottom: 28 }}>
              {/* Semester heading */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                paddingBottom: 8, borderBottom: `2px solid ${PRIMARY}20`,
              }}>
                <Calendar size={17} color={PRIMARY} />
                <h2 style={{ fontSize: 15, fontWeight: 800, color: PRIMARY, margin: 0 }}>{semLabel}</h2>
                {statusBadge(status)}
                <span style={{ marginRight: 'auto', fontSize: 12, color: 'var(--color-gray-400)' }}>
                  {semCourses.length} {semCourses.length === 1 ? 'مقرر' : 'مقررات'}
                </span>
              </div>

              {/* Course cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {semCourses.map(c => {
                  const rosterId  = c.offering_id || c.offeringId || c.id;
                  const enrolled  = parseInt(c.enrolled_count || c.enrolledCount) || 0;
                  const capacity  = parseInt(c.capacity) || 0;
                  const fillPct   = capacity > 0 ? Math.min(Math.round((enrolled / capacity) * 100), 100) : 0;
                  const name      = c.course_name_ar || c.course_name_en || c.courseName || c.course_name || '—';
                  const code      = c.course_code || c.courseCode || '—';
                  const level     = c.level_label || c.level || '—';
                  return (
                    <div key={rosterId} style={{
                      background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--color-gray-200)',
                      overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                      display: 'flex', flexDirection: 'column', transition: 'box-shadow .15s',
                    }}>
                      {/* Card top stripe */}
                      <div style={{ height: 4, background: PRIMARY }} />
                      <div style={{ padding: '14px 16px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: 6, background: 'var(--color-primary-50)',
                            color: PRIMARY, fontWeight: 800, fontSize: 11,
                          }}>{code}</span>
                          <BookOpen size={15} color="var(--color-gray-400)" />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-gray-900)', marginBottom: 10, lineHeight: 1.4 }}>
                          {name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 12 }}>
                          المستوى: <strong>{level}</strong>
                        </div>

                        {/* Enrollment bar */}
                        <div style={{ marginBottom: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-gray-700)' }}>
                              <Users size={13} />
                              <span>الطلاب المسجلون</span>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 13, color: enrolled > 0 ? 'var(--color-gray-900)' : 'var(--color-gray-400)' }}>
                              {enrolled}
                              {capacity > 0 && <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>/{capacity}</span>}
                            </span>
                          </div>
                          {capacity > 0 && (
                            <div style={{ height: 5, background: 'var(--color-gray-100)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{
                                width: `${fillPct}%`, height: '100%', borderRadius: 99,
                                background: fillPct > 85 ? '#ef4444' : fillPct > 60 ? '#f97316' : PRIMARY,
                                transition: 'width .3s',
                              }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9' }}>
                        <Link to={`/doctor/courses/${rosterId}`} style={{ textDecoration: 'none', display: 'block' }}>
                          <button style={{
                            width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                            background: PRIMARY, color: '#fff', fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', transition: 'opacity .15s',
                          }}>
                            إدارة الطلاب والدرجات
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
