import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Table, Th, Td, Badge, Spinner, Tabs, SpecBadge } from '../../components/ui';

export default function AdminReportsPage() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('distribution');

  useEffect(() => {
    adminAPI.getAcademicReport()
      .then(r => setD(D(r)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><Spinner /></AppLayout>;

  const dist = d?.gpaDistribution || d?.gpa_distribution || {};
  const bands = [
    { lb: 'ممتاز (≥ 3.5)', n: dist.excellent || 0, c: '#059669' },
    { lb: 'جيد جداً (3–3.5)', n: dist.very_good || 0, c: '#2563b8' },
    { lb: 'جيد (2.5–3)', n: dist.good || 0, c: '#7c3aed' },
    { lb: 'مقبول (2–2.5)', n: dist.satisfactory || 0, c: '#d97706' },
    { lb: 'ضعيف (< 2)', n: dist.below_average || 0, c: '#dc2626' }
  ];
  const total = bands.reduce((s, b) => s + b.n, 0);

  return (
    <AppLayout>
      <Card title="التقارير الأكاديمية">
        <Tabs
          tabs={[
            ['distribution', 'توزيع المعدلات'],
            ['top', 'أوائل الطلاب'],
            ['dismissed', 'الفصل الأكاديمي']
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'distribution' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {bands.map(b => (
                <div key={b.lb} style={{ background: b.c + '10', border: '1px solid ' + b.c + '22', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: b.c }}>{b.n}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-600)', marginTop: '4px', lineHeight: 1.3 }}>{b.lb}</div>
                  {total > 0 && <div style={{ fontSize: '11px', color: b.c, fontWeight: 700, marginTop: '4px' }}>{Math.round(b.n / total * 100)}%</div>}
                </div>
              ))}
            </div>
            
            {bands.map(b => (
              <div key={b.lb} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-600)', width: '140px', flexShrink: 0, textAlign: 'right' }}>{b.lb}</div>
                <div style={{ flex: 1, background: 'var(--color-gray-100)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: total > 0 ? (b.n / total * 100) + '%' : '0%', background: b.c, height: '100%', borderRadius: '20px' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: b.c, width: '32px', textAlign: 'left' }}>{b.n}</div>
              </div>
            ))}
          </>
        )}

        {tab === 'top' && (
          <Table>
            <thead>
              <tr>
                <Th>الطالب</Th>
                <Th>الكود</Th>
                <Th>التخصص</Th>
                <Th>المعدل</Th>
              </tr>
            </thead>
            <tbody>
              {(d?.topStudents || d?.top_students || []).map(s => (
                <tr key={s.id}>
                  <Td style={{ fontWeight: 600 }}>
                    {s.fullNameAr || s.full_name_ar || s.fullNameEn || s.full_name_en || '—'}
                  </Td>
                  <Td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{s.studentCode || s.student_code}</Td>
                  <Td><SpecBadge spec={(s.specialization || '').toUpperCase()} /></Td>
                  <Td><Badge variant="success">{Number(s.cgpa || 0).toFixed(2)}</Badge></Td>
                </tr>
              ))}
              {!(d?.topStudents || d?.top_students)?.length && (
                <tr>
                  <Td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)' }}>لا توجد بيانات</Td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        {tab === 'dismissed' && (
          <Table>
            <thead>
              <tr>
                <Th>الطالب</Th>
                <Th>الكود</Th>
                <Th>المعدل</Th>
                <Th>الإنذارات</Th>
              </tr>
            </thead>
            <tbody>
              {(d?.dismissedStudents || d?.dismissed_students || []).map(s => (
                <tr key={s.id}>
                  <Td style={{ fontWeight: 600 }}>
                    {s.fullNameAr || s.full_name_ar || s.fullNameEn || s.full_name_en || '—'}
                  </Td>
                  <Td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{s.studentCode || s.student_code}</Td>
                  <Td style={{ color: 'var(--color-error)', fontWeight: 700 }}>{Number(s.cgpa || 0).toFixed(2)}</Td>
                  <Td><Badge variant="error">{s.totalWarnings || s.total_warnings}</Badge></Td>
                </tr>
              ))}
              {!(d?.dismissedStudents || d?.dismissed_students)?.length && (
                <tr>
                  <Td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)' }}>لا توجد بيانات</Td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </AppLayout>
  );
}
