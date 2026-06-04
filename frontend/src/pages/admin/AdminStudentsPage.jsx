import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Table, Th, Td, Badge, Spinner, Button, SearchInput, Pagination, SpecBadge, StatusBadge } from '../../components/ui';

export default function AdminStudentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) {
      setQ(s);
      setPage(1);
    }
  }, [searchParams]);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getStudents({ page, limit: 15, search: q })
      .then(r => {
        const d = D(r);
        setRows(d?.students || []);
        // Calculate hasMore using total items
        const limit = d?.limit || 15;
        const total = d?.total || 0;
        const currentTotal = (d?.page || page) * limit;
        setHasMore(currentTotal < total);
        setTotalPages(Math.ceil(total / limit) || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => { load(); }, [page, q]);

  return (
    <AppLayout>
      <Card title="إدارة الطلاب">
        <SearchInput
          value={q}
          onChange={v => { setQ(v); setPage(1); }}
          placeholder="بحث بالاسم أو الكود…"
        />
        
        {loading ? <Spinner /> : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>الطالب</Th>
                  <Th>الكود</Th>
                  <Th>التخصص</Th>
                  <Th>المستوى</Th>
                  <Th>المعدل</Th>
                  <Th>الحالة</Th>
                  <Th>الإجراء</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr key={s.id}>
                    <Td style={{ fontWeight: 600 }}>{s.fullNameAr || s.full_name_ar}</Td>
                    <Td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{s.studentCode || s.student_code}</Td>
                    <Td><SpecBadge spec={(s.specialization || '').toUpperCase()} /></Td>
                    <Td>{s.currentLevel || s.current_level || '—'}</Td>
                    <Td style={{ color: Number(s.cgpa) < 2 ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 700 }}>
                      {Number(s.cgpa || 0).toFixed(2)}
                    </Td>
                    <Td>
                      <StatusBadge status={s.academicStatus || s.academic_status || 'نشط'} />
                    </Td>
                    <Td>
                      <Link to={`/admin/students/${s.id}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm">تفاصيل</Button>
                      </Link>
                    </Td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <Td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)' }}>لا توجد نتائج</Td>
                  </tr>
                )}
              </tbody>
            </Table>
            
            <Pagination
              page={page}
              totalPages={totalPages}
              hasMore={hasMore}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => p + 1)}
            />
          </>
        )}
      </Card>
    </AppLayout>
  );
}
