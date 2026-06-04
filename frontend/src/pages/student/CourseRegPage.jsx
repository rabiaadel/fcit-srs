import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { studentAPI, sharedAPI } from '../../services/api';
import { D, CATEGORY_COLORS, CATEGORY_AR } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge, Button, Spinner } from '../../components/ui';
import { useBylaw } from '../../contexts/BylawContext';

export function CreditHoursMeter({ current, max, remaining }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  const color = pct >= 100 ? 'var(--color-error)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)';
  return (
    <div style={{ background: 'var(--surface-card)', borderRadius: 14, padding: 16,
      border: `2px solid ${color}20` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-gray-800)' }}>الساعات المعتمدة</span>
        <span style={{ fontWeight: 800, fontSize: 18, color }}>
          {current} / {max}
        </span>
      </div>
      <div style={{ background: 'var(--color-gray-100)', borderRadius: 20, height: 10, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color,
          borderRadius: 20, transition: 'width .4s ease' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: 'var(--color-gray-500)' }}>{pct}% مستخدم</span>
        <span style={{ color: remaining > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
          {remaining > 0 ? `متبقٍ ${remaining} ساعة` : '⛔ وصلت للحد الأقصى'}
        </span>
      </div>
      {pct > 100 && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-error-light)',
          borderRadius: 8, color: 'var(--color-error)', fontSize: 12, fontWeight: 600 }}>
          ⛔ لقد تجاوزت الحد المسموح به ({max} ساعة)
        </div>
      )}
      {pct === 100 && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-success-light)',
          borderRadius: 8, color: 'var(--color-success-dark)', fontSize: 12, fontWeight: 600, border: '1px solid var(--color-success-light)' }}>
          ✅ وصلت للحد الأقصى المسموح للتسجيل ({max} ساعة)
        </div>
      )}
      {pct >= 80 && pct < 100 && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-warning-light)',
          borderRadius: 8, color: 'var(--color-warning-dark)', fontSize: 12 }}>
          ⚠️ تنبيه: متبقٍ {remaining} ساعة فقط من حدك المسموح به
        </div>
      )}
    </div>
  );
}

export function EligibilityModal({ semId, offeringId, courseName, onClose, onConfirm }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [altLoading, setAltLoading] = useState(false);
  const [alternatives, setAlternatives] = useState(null);

  useEffect(() => {
    if (!semId || !offeringId) return;
    setLoading(true);
    studentAPI.checkEligibility(semId, offeringId)
      .then(r => setData(r?.data?.data || r?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [semId, offeringId]);

  const loadAlternatives = () => {
    setAltLoading(true);
    studentAPI.getAlternatives(semId, offeringId)
      .then(r => setAlternatives(r?.data?.data || r?.data))
      .catch(() => {})
      .finally(() => setAltLoading(false));
  };

  const CHECK_ICONS = { window: '🗓', status: '🎓', enrolled: '📋',
    capacity: '👥', credits: '💳', prereqs: '📚', schedule: '⏰' };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16 }}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 16, width: '100%', maxWidth: 580,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-gray-200)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-gray-800)' }}>
            فحص صلاحية التسجيل — {courseName}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-500)' }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-gray-400)' }}>جارٍ الفحص…</div>
          ) : data ? (
            <>
              {/* Summary banner */}
              <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                background: data.canRegister ? 'var(--color-success-light)' : 'var(--color-error-light)',
                border: `1px solid ${data.canRegister ? 'var(--color-success)' : 'var(--color-error)'}` }}>
                <div style={{ fontWeight: 700, fontSize: 14,
                  color: data.canRegister ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {data.summary}
                </div>
              </div>

              {/* Check list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data.checks || []).map(check => (
                  <div key={check.id} style={{ display: 'flex', alignItems: 'flex-start',
                    gap: 10, padding: '10px 12px', borderRadius: 10,
                    background: check.ok ? 'var(--color-success-light)' : 'var(--color-error-light)',
                    border: `1px solid ${check.ok ? 'var(--color-success)' : 'var(--color-error)'}` }}>
                    <span style={{ fontSize: 18 }}>{CHECK_ICONS[check.id] || '•'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-gray-800)' }}>
                          {check.label}
                        </span>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20,
                          background: check.ok ? 'var(--color-success-light)' : 'var(--color-error-light)',
                          color: check.ok ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                          {check.ok ? '✓ مستوفى' : '✗ غير مستوفى'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alternatives section */}
              {!data.canRegister && (
                <div style={{ marginTop: 16 }}>
                  {!alternatives ? (
                    <button onClick={loadAlternatives} disabled={altLoading}
                      style={{ width: '100%', background: 'var(--color-primary-50)', color: 'var(--color-primary-dark)',
                        border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px',
                        fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      {altLoading ? 'جارٍ البحث عن بدائل…' : '🔍 اقتراح مواد بديلة'}
                    </button>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-gray-800)',
                        marginBottom: 10 }}>
                        📚 مواد بديلة ({alternatives.count})
                      </div>
                      {alternatives.suggestions?.length === 0 ? (
                        <div style={{ color: 'var(--color-gray-400)', fontSize: 13, textAlign: 'center',
                          padding: 12 }}>لا توجد مواد بديلة متاحة حاليًا</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {alternatives.suggestions?.map((alt, i) => (
                            <div key={i} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 10,
                              padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-gray-800)' }}>
                                  {alt.code} — {alt.name_ar}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-gray-500)', marginTop: 2 }}>
                                  {alt.credits} ساعات ·
                                  {alt.spots_left || alt.spotsLeft} مكان متاح ·
                                  {alt.scheduleDisplay}
                                </div>
                              </div>
                              <button onClick={() => { onConfirm(alt.offering_id); onClose(); }}
                                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none',
                                  borderRadius: 8, padding: '6px 14px', fontSize: 12,
                                  cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                                تسجيل
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Register button */}
              {data.canRegister && (
                <button onClick={() => { onConfirm(offeringId); onClose(); }}
                  style={{ width: '100%', marginTop: 16, background: 'var(--color-success)', color: '#fff',
                    border: 'none', borderRadius: 10, padding: '12px', fontSize: 14,
                    cursor: 'pointer', fontWeight: 700 }}>
                  ✅ تسجيل في {courseName}
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: 24 }}>
              تعذّر تحميل بيانات الفحص
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ c, canReg, atLimit, regOpen, enrolling, registering, enroll, openEligCheck }) {
  const reason = c.register_block_reason || c.blockReason || '';
  return (
    <div style={{
      border: `1px solid ${canReg ? 'var(--color-gray-200)' : 'var(--color-error)'}`, 
      borderRadius: 'var(--radius-md)', 
      padding: '12px', 
      marginBottom: '10px',
      opacity: (!regOpen || (atLimit && !canReg)) ? 0.7 : 1,
      background: canReg ? 'var(--surface-card)' : 'var(--color-error-light)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: canReg ? 'var(--color-primary-dark)' : 'var(--color-error-dark)' }}>{c.code}</span>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
              background: (CATEGORY_COLORS[c.category] || '#64748b') + '20',
              color: CATEGORY_COLORS[c.category] || '#64748b', fontWeight: 600
            }}>
              {CATEGORY_AR[c.category] || c.category}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', background: 'var(--color-gray-100)', padding: '2px 6px', borderRadius: '4px' }}>
              {c.credits} ساعات
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-800)', marginBottom: '4px' }}>{c.name_ar}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
            {c.doctor_name_ar || c.doctor_name || '—'} · متاح {c.capacity - (c.enrolled_count || 0)} مقعد
          </div>
          {!canReg && reason && (
            <div style={{ 
              fontSize: '12px', color: 'var(--color-error)', marginTop: '8px', fontWeight: 600, 
              background: 'var(--color-error-light)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block'
            }}>
              🚫 سبب المنع: {reason}
            </div>
          )}
          {atLimit && canReg && (
            <div style={{ fontSize: '12px', color: 'var(--color-warning-dark)', marginTop: '8px', fontWeight: 600 }}>
              ⚠️ تسجيل هذا المقرر سيجعلك تصل أو تتجاوز الحد الأقصى
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, minWidth: '90px' }}>
          {canReg && regOpen && !atLimit ? (
            <Button size="sm" onClick={() => enroll(c.offering_id || c.id)} disabled={enrolling === (c.offering_id || c.id) || registering} style={{ background: 'var(--color-success)', color: '#fff', border: 'none' }}>
              {enrolling === (c.offering_id || c.id) ? 'جارِ...' : '+ إضافة'}
            </Button>
          ) : !canReg ? (
            <Badge variant="error" size="sm" style={{ padding: '6px', textAlign: 'center' }}>مغلق</Badge>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => openEligCheck(c)} style={{ fontSize: '11px' }}>التفاصيل</Button>
          {!canReg && <Button size="sm" variant="secondary" onClick={() => openEligCheck(c)} style={{ fontSize: '11px' }}>مواد بديلة</Button>}
        </div>
      </div>
    </div>
  );
}

export default function CourseRegPage() {
  const [avail, setAvail] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [sems, setSems] = useState([]);
  const [semId, setSemId] = useState('');
  const [meta, setMeta] = useState({});
  const [creditSummary, setCreditSummary] = useState(null);
  const [eligModal, setEligModal] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [noRegistration, setNoRegistration] = useState(false);
  
  const [searchParams] = useSearchParams();
  const [searchQ, setSearchQ] = useState(searchParams.get('search') || '');
  const [filterCat, setFilterCat] = useState('ALL');

  const { bylaw } = useBylaw();
  const totalCredits = bylaw?.metadata?.total_credit_hours || 138;

  // Read search param from URL when it changes (from TopBar quick search)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchQ(q);
  }, [searchParams]);

  useEffect(() => {
    sharedAPI.getSemesters().then(r => {
      const s = D(r) || [];
      setSems(s);
      // Only auto-select a semester that is in registration, active (add/drop), or grading
      const regSem = s.find(x => x.status === 'registration');
      const activeSem = s.find(x => x.status === 'active');
      const gradingSem = s.find(x => x.status === 'grading');
      
      const targetSem = regSem || activeSem || gradingSem || s[0];
      
      if (targetSem) {
        setSemId(targetSem.id);
        setNoRegistration(false);
      } else {
        setNoRegistration(true);
        setLoading(false);
      }
    }).catch(() => { setNoRegistration(true); setLoading(false); });
  }, []);

  const loadCourses = () => {
    if (!semId) return;
    setLoading(true);
    studentAPI.getAvailableCourses(semId).then(r => {
      const all = D(r) || [];
      setEnrolled(all.filter(c => c.already_registered || c.already_registered === true || c.enrollment_status === 'registered'));
      setAvail(all.filter(c => !c.already_registered && c.enrollment_status !== 'registered'));
      setMeta(r?.data?.meta || {});
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const loadCreditSummary = () => {
    if (!semId) return;
    studentAPI.getCreditSummary(semId).then(r => setCreditSummary(D(r))).catch(() => {});
  };

  useEffect(() => {
    loadCourses();
    loadCreditSummary();
  }, [semId]);

  const enroll = async (oid) => {
    if (registering) return;
    setRegistering(true);
    setEnrolling(oid);
    try {
      await studentAPI.registerCourse(oid);
      toast.success('تم التسجيل بنجاح');
      loadCourses();
      loadCreditSummary();
      setEligModal(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل التسجيل');
    } finally {
      setEnrolling(null);
      setRegistering(false);
    }
  };

  const drop = async (eid) => {
    if (!window.confirm('حذف هذا المقرر من جدولك؟')) return;
    try {
      await studentAPI.dropCourse(eid);
      toast.success('تم حذف المقرر');
      loadCourses();
      loadCreditSummary();
    } catch (e) {
      toast.error(e.response?.data?.message || 'فشل الحذف');
    }
  };

  const openEligCheck = (c) => {
    setEligModal({ offeringId: c.offering_id || c.offeringId, courseName: c.name_ar || c.nameAr || c.code });
  };

  const regCred = creditSummary?.registeredCredits || meta?.registeredCredits || 0;
  const maxCred = creditSummary?.maxCredits || meta?.maxCredits || 20;
  const remCred = creditSummary?.remainingCredits || (maxCred - regCred);
  const regOpen = meta.registration_open || sems.find(s => s.id == semId)?.status === 'registration';
  const dropOpen = meta.add_drop_open || regOpen;

  const filteredAvail = avail.filter(c => {
    if (filterCat !== 'ALL' && c.category !== filterCat) return false;
    if (searchQ && !(c.code.toLowerCase().includes(searchQ.toLowerCase()) || c.name_ar.includes(searchQ))) return false;
    return true;
  });

  const allowedCourses = filteredAvail.filter(c => c.can_register);
  const blockedCourses = filteredAvail.filter(c => !c.can_register);

  // If no registration semester is open, show a clear message
  if (noRegistration && !semId) {
    return (
      <AppLayout>
        <div style={{
          background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '48px 24px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '20px', color: 'var(--color-gray-800)', fontWeight: 800, marginBottom: '12px' }}>
            لا يوجد تسجيل مفتوح حالياً
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', maxWidth: '400px', margin: '0 auto' }}>
            لم يتم فتح فترة تسجيل لأي فصل دراسي حالياً. يرجى مراجعة الإعلانات أو التواصل مع شؤون الطلاب.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {eligModal && (
        <EligibilityModal
          semId={semId}
          offeringId={eligModal.offeringId}
          courseName={eligModal.courseName}
          onClose={() => setEligModal(null)}
          onConfirm={enroll}
        />
      )}

      <div style={{
        background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', fontWeight: 600 }}
            value={semId}
            onChange={e => setSemId(e.target.value)}
          >
            {sems.map(s => <option key={s.id} value={s.id}>{s.label || s.year_label}</option>)}
          </select>
          <Badge variant={regOpen ? 'success' : 'error'} style={{ padding: '6px 12px', fontSize: '13px' }}>
            {regOpen ? 'التسجيل مفتوح' : 'التسجيل مغلق'}
          </Badge>
        </div>
        <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--color-primary-dark)', fontWeight: 800 }}>تسجيل المقررات</h2>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <CreditHoursMeter current={regCred} max={maxCred} remaining={remCred} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: regOpen ? '1.4fr 0.8fr' : '1fr', gap: '16px', alignItems: 'start' }}>
          
          {regOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card noPadding style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '14px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                <input 
                  type="text" 
                  placeholder="ابحث برمز أو اسم المقرر..." 
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-300)', fontSize: '13px', outline: 'none' }}
                />
                <select 
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-300)', fontSize: '13px', outline: 'none', background: 'var(--surface-card)' }}
                >
                  <option value="ALL">الكل (الفئات)</option>
                  {Object.keys(CATEGORY_AR).map(k => <option key={k} value={k}>{CATEGORY_AR[k]}</option>)}
                </select>
              </div>

              <div style={{ padding: '16px' }}>
                {filteredAvail.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)', fontSize: '14px' }}>
                    لا توجد مقررات مطابقة للبحث أو الفلتر
                  </div>
                ) : (
                  <>
                    {allowedCourses.length > 0 && (
                      <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '15px', color: 'var(--color-success)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                          مقررات متاحة للتسجيل ({allowedCourses.length})
                        </h3>
                        {Object.entries(
                          allowedCourses.reduce((acc, c) => {
                            const cat = CATEGORY_AR[c.category] || c.category || 'أخرى';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(c);
                            return acc;
                          }, {})
                        ).map(([cat, courses]) => (
                          <div key={cat} style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '8px', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '4px', fontWeight: 700 }}>{cat}</h4>
                            {courses.map(c => (
                              <CourseCard 
                                key={c.offering_id || c.id} c={c} canReg={true} atLimit={regCred + c.credits > maxCred} regOpen={regOpen}
                                enrolling={enrolling} registering={registering} enroll={enroll} openEligCheck={openEligCheck}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {blockedCourses.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '15px', color: 'var(--color-error-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-error)' }}></span>
                          مقررات غير متاحة ({blockedCourses.length})
                        </h3>
                        {Object.entries(
                          blockedCourses.reduce((acc, c) => {
                            const cat = CATEGORY_AR[c.category] || c.category || 'أخرى';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(c);
                            return acc;
                          }, {})
                        ).map(([cat, courses]) => (
                          <div key={cat} style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '8px', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '4px', fontWeight: 700 }}>{cat}</h4>
                            {courses.map(c => (
                              <CourseCard 
                                key={c.offering_id || c.id} c={c} canReg={false} atLimit={regCred + c.credits > maxCred} regOpen={regOpen}
                                enrolling={enrolling} registering={registering} enroll={enroll} openEligCheck={openEligCheck}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card title="مقرراتي المختارة" style={{ position: 'sticky', top: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} headerActions={<Badge variant="primary">{enrolled.length} مقرر</Badge>}>
              {enrolled.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)', fontSize: '13px' }}>لم تقم بتسجيل أي مقررات حتى الآن</div>
              ) : (
                enrolled.map(c => (
                  <div key={c.offering_id || c.id} style={{
                    border: '1px solid var(--color-success-light)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '10px',
                    background: 'var(--color-success-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-success-dark)' }}>{c.code}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-success)', background: 'var(--color-success-light)', padding: '2px 6px', borderRadius: '4px' }}>{c.credits} ساعات</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-gray-800)', marginBottom: '4px' }}>{c.name_ar}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-600)' }}>
                          {c.doctor_name_ar || c.doctor_name || '—'}
                        </div>
                      </div>
                      {dropOpen && (
                        <Button size="sm" variant="danger" onClick={() => drop(c.enrollment_id || c.id)} style={{ padding: '6px 10px', fontSize: '11px' }}>حذف</Button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {enrolled.length > 0 && (
                <div style={{ borderTop: '2px dashed var(--color-gray-200)', paddingTop: '12px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-gray-700)', marginBottom: '6px' }}>
                    <span>إجمالي الساعات المسجلة</span>
                    <strong style={{ color: 'var(--color-gray-900)' }}>{regCred} ساعة</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-gray-700)' }}>
                    <span>الساعات المتبقية للإضافة</span>
                    <strong style={{ color: remCred > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{remCred} ساعة</strong>
                  </div>
                </div>
              )}
            </Card>

            {creditSummary && (
              <Card noPadding style={{ padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>تم اجتياز {creditSummary.registeredCredits || 0} من أصل {totalCredits} ساعة</span>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-primary-dark)' }}>نسبة التخرج</span>
                </div>
                <div style={{ background: 'var(--color-gray-100)', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.round(((creditSummary.registeredCredits || 0) / totalCredits) * 100))}%`,
                    height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))', borderRadius: '20px', transition: 'width 0.5s ease-in-out'
                  }} />
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
