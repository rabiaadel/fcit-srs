import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Table, Th, Td, Badge, Button, Spinner, SearchInput, Modal } from '../../components/ui';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullNameAr: '', fullNameEn: '', email: '', role: 'doctor', password: '' });
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  // Bulk Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importStats, setImportStats] = useState(null);

  const load = (pageNum = 1) => {
    setLoading(true);
    adminAPI.getUsers({ page: pageNum, limit: LIMIT, search: q, _t: Date.now() })
      .then(r => {
        const d = D(r);
        const userList = Array.isArray(d) ? d : (d?.users || []);
        const t  = d?.total      ?? userList.length;
        const tp = d?.totalPages ?? 1;
        setUsers(userList);
        setTotal(t);
        setTotalPages(tp);
        setPage(pageNum);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);
  
  // Refresh on search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  const closeImportModal = () => {
    setShowImportModal(false);
    // Give time for modal exit animation before clearing data
    setTimeout(() => {
      setPreviewRows([]);
      setImportStats(null);
    }, 300);
  };

  const create = async e => {
    e.preventDefault();
    try {
      await adminAPI.createUser(form);
      toast.success('تمت إضافة المستخدم');
      setShowAdd(false);
      setForm({ fullNameAr: '', fullNameEn: '', email: '', role: 'doctor', password: '' });
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في الإضافة');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    return lines.slice(1).map(line => {
      // Basic CSV splitting handling simple cases
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportLoading(true);
    setImportStats(null);
    setPreviewRows([]);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const jsonRows = parseCSV(text);
        if (jsonRows.length === 0) {
          toast.error('الملف فارغ أو غير صالح');
          setImportLoading(false);
          return;
        }
        
        // Call validation endpoint
        const res = await adminAPI.validateUsersBulk(jsonRows);
        setPreviewRows(D(res) || []);
      } catch (err) {
        toast.error('حدث خطأ أثناء معالجة الملف');
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    const validRows = previewRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('لا يوجد مستخدمين صالحين للاستيراد');
      return;
    }
    
    setImportLoading(true);
    try {
      const res = await adminAPI.bulkImportUsers({ users: previewRows });
      const data = D(res);
      setImportStats(data);
      toast.success(res.data?.message || 'تم الاستيراد');
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الاستيراد');
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFFarabic_name,english_name,email,password,role\nأحمد محمد,Ahmed,ahmed@fcit.edu,Pass123!,doctor\nسارة خالد,,sara@fcit.edu,Sara123!,student\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // filtered is handled by backend now, but we keep it just in case
  const filtered = users;

  const ROLE_BADGE = { admin: 'success', doctor: 'primary', student: 'warning' };
  const ROLE_AR = { admin: 'مدير', doctor: 'دكتور', student: 'طالب' };

  return (
    <AppLayout>
      <Card
        title="إدارة المستخدمين"
        headerActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
              📊 استيراد CSV
            </Button>
            <Button size="sm" onClick={() => setShowAdd(p => !p)}>
              {showAdd ? '✕ إلغاء' : '+ مستخدم جديد'}
            </Button>
          </div>
        }
      >
        {showAdd && (
          <form onSubmit={create} style={{ background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>الاسم بالعربي</label>
                <input required style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none' }} value={form.fullNameAr} onChange={e => setForm(p => ({ ...p, fullNameAr: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>الاسم بالإنجليزي (اختياري)</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', direction: 'ltr' }} value={form.fullNameEn} onChange={e => setForm(p => ({ ...p, fullNameEn: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>البريد</label>
                <input required type="email" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none' }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>كلمة المرور</label>
                <input required type="password" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none' }} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '6px' }}>الصلاحية</label>
                <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', outline: 'none', background: 'var(--color-white)' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="doctor">دكتور</option>
                  <option value="admin">مدير</option>
                  <option value="student">طالب</option>
                </select>
              </div>
            </div>
            {form.role === 'student' && (
              <div style={{ background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '14px', fontSize: '12px', color: '#6d28d9', fontWeight: 600 }}>
                ℹ️ الطلاب الجدد يُسجلون في البرنامج العام (عام) — يتم تحديد التخصص (CS / IT / IS) بدايةً من الفرقة الثالثة.
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" variant="success">إضافة المستخدم</Button>
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>إلغاء</Button>
            </div>
          </form>
        )}

        <SearchInput value={q} onChange={setQ} placeholder="بحث بالاسم أو البريد…" />

        {loading ? <Spinner /> : (
          <>
          <Table>
            <thead>
              <tr>
                <Th>الاسم</Th>
                <Th>البريد</Th>
                <Th>الصلاحية</Th>
                <Th>الحالة</Th>
                <Th>آخر دخول</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <Td style={{ fontWeight: 600 }}>{u.fullNameAr || u.full_name_ar || u.username}</Td>
                  <Td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{u.email}</Td>
                  <Td>
                    <Badge variant={ROLE_BADGE[u.role] || 'default'}>{ROLE_AR[u.role] || u.role}</Badge>
                  </Td>
                  <Td>
                    <Badge variant={u.isActive || u.is_active ? 'success' : 'error'}>
                      {u.isActive || u.is_active ? 'نشط' : 'موقوف'}
                    </Badge>
                  </Td>
                  <Td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    {u.lastLogin || u.last_login ? new Date(u.lastLogin || u.last_login).toLocaleDateString('ar-EG') : '—'}
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-gray-400)' }}>لا توجد نتائج</Td>
                </tr>
              )}
            </tbody>
          </Table>
          
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 0', borderTop: '1px solid var(--color-gray-200)', marginTop: '12px'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
                عرض {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} من {total} مستخدم
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="sm" variant="outline"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                >
                  → السابق
                </Button>
                <span style={{
                  padding: '6px 14px', border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-md)', fontSize: '13px',
                  background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                  fontWeight: 700
                }}>
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm" variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1)}
                >
                  ← التالي
                </Button>
              </div>
            </div>
          )}
        </>
        )}
      </Card>

      {/* Bulk Import Modal */}
      <Modal open={showImportModal} onClose={closeImportModal} title="استيراد المستخدمين">
        <div style={{ width: '800px', maxWidth: '100%' }}>
          {!importStats && previewRows.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '15px' }}>خطوة 1: تحميل النموذج</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-gray-700)' }}>يرجى تحميل نموذج CSV وتعبئته ببيانات المستخدمين (الاسم، الإيميل، كلمة المرور، الصلاحية).</p>
                </div>
                <Button onClick={downloadTemplate} variant="primary" size="sm">📥 تحميل النموذج</Button>
              </div>

              <div style={{ border: '2px dashed var(--color-gray-300)', padding: '40px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'var(--color-gray-50)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
                <h4 style={{ margin: '0 0 8px', color: 'var(--color-gray-800)' }}>خطوة 2: رفع الملف</h4>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--color-gray-500)' }}>قم برفع ملف CSV الذي تم تعبئته (تأكد من حفظ الإكسل بصيغة CSV UTF-8)</p>
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'block', margin: '0 auto' }} />
              </div>
            </div>
          )}

          {importLoading && (
            <div style={{ padding: '40px', textAlign: 'center' }}><Spinner /> <p>جاري المعالجة...</p></div>
          )}

          {!importLoading && previewRows.length > 0 && !importStats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--color-gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', display: 'flex', gap: '16px' }}>
                <div style={{ fontSize: '14px' }}><strong>إجمالي الصفوف:</strong> {previewRows.length}</div>
                <div style={{ fontSize: '14px', color: 'var(--color-success)' }}><strong>صالح:</strong> {previewRows.filter(r => r.isValid).length}</div>
                <div style={{ fontSize: '14px', color: 'var(--color-error)' }}><strong>غير صالح:</strong> {previewRows.filter(r => !r.isValid).length}</div>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                <Table>
                  <thead>
                    <tr>
                      <Th>صف</Th>
                      <Th>الاسم</Th>
                      <Th>البريد والصلاحية</Th>
                      <Th>الحالة</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((r, i) => (
                      <tr key={i} style={{ background: r.isValid ? 'transparent' : 'var(--color-error-light)' }}>
                        <Td>{r.rowNum}</Td>
                        <Td>
                          <div style={{ fontWeight: 600 }}>{r.arabic_name || '—'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{r.english_name}</div>
                        </Td>
                        <Td>
                          <div>{r.email || '—'}</div>
                          <Badge variant={ROLE_BADGE[r.role] || 'default'}>{ROLE_AR[r.role] || r.role}</Badge>
                        </Td>
                        <Td>
                          {r.isValid ? (
                            <Badge variant="success">✓ صالح</Badge>
                          ) : (
                            <div style={{ color: 'var(--color-error)', fontSize: '12px', fontWeight: 600 }}>
                              {r.errors?.join(' | ')}
                            </div>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="ghost" onClick={() => { setPreviewRows([]); }}>إلغاء</Button>
                <Button variant="primary" onClick={confirmImport} disabled={previewRows.filter(r => r.isValid).length === 0}>تأكيد الاستيراد ({previewRows.filter(r => r.isValid).length})</Button>
              </div>
            </div>
          )}

          {importStats && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', color: 'var(--color-success)', marginBottom: '16px' }}>✓</div>
              <h3 style={{ margin: '0 0 8px' }}>اكتمل الاستيراد</h3>
              <p style={{ margin: '0 0 24px', color: 'var(--color-gray-600)' }}>
                تم إضافة {importStats.imported} مستخدم بنجاح.
                {importStats.failedCount > 0 && ` فشل ${importStats.failedCount} مستخدم.`}
              </p>
              
              {importStats.failed && importStats.failed.length > 0 && (
                <div style={{ textAlign: 'right', background: 'var(--color-gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '24px', maxHeight: '150px', overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px' }}>الأخطاء:</h4>
                  {importStats.failed.map((f, i) => (
                    <div key={i} style={{ fontSize: '12px', color: 'var(--color-error)' }}>• {f.email}: {f.reason}</div>
                  ))}
                </div>
              )}

              <Button onClick={closeImportModal}>إغلاق</Button>
            </div>
          )}
        </div>
      </Modal>

    </AppLayout>
  );
}
