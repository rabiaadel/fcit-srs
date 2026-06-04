import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Table, Th, Td, Button, Spinner, StatusBadge, Modal, EmptyState, Input, Select } from '../../components/ui';

export default function AdminSemestersPage() {
  const [sems, setSems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Form states
  const defaultAddForm = { academicYear: '2024-2025', semesterType: 'first', startDate: '', endDate: '' };
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [editForm, setEditForm] = useState({ startDate: '', endDate: '' });

  const load = () => {
    setLoading(true);
    adminAPI.getSemesters()
      .then(r => setSems(D(r)?.semesters || D(r) || []))
      .catch(() => toast.error('فشل تحميل الفصول الدراسية'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await adminAPI.createSemester(addForm);
      toast.success('تم إنشاء الفصل الدراسي بنجاح');
      setIsAddOpen(false);
      setAddForm(defaultAddForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء الفصل الدراسي');
    }
  };

  const handleSaveDates = async e => {
    e.preventDefault();
    if (!editData) return;
    try {
      await adminAPI.updateSemesterDates(editData.id, editForm);
      toast.success('تم تحديث التواريخ بنجاح');
      setEditData(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحديث التواريخ');
    }
  };

  const advanceStatus = async (s) => {
    let newStatus;
    let finalize = false;
    if (s.status === 'upcoming') newStatus = 'registration';
    else if (s.status === 'registration') newStatus = 'active';
    else if (s.status === 'active') newStatus = 'grading';
    else if (s.status === 'grading') finalize = true;
    else return;

    const confirmMsg = finalize 
      ? 'هل أنت متأكد من اعتماد النتيجة؟ لا يمكن التراجع عن هذه الخطوة.' 
      : 'هل أنت متأكد من تغيير حالة الفصل؟';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      if (finalize) {
        await adminAPI.finalizeSemester(s.id);
        toast.success('تم اعتماد النتيجة وإغلاق الفصل');
      } else {
        await adminAPI.updateSemesterStatus(s.id, newStatus);
        toast.success('تم تحديث حالة الفصل بنجاح');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحديث الحالة');
    }
  };

  const getActionLabel = (status) => {
    switch(status) {
      case 'upcoming': return 'فتح التسجيل';
      case 'registration': return 'إغلاق التسجيل وبدء الدراسة';
      case 'active': return 'بدء الرصد';
      case 'grading': return 'اعتماد النتيجة';
      default: return null;
    }
  };

  const openEditModal = (s) => {
    setEditData(s);
    setEditForm({
      startDate: s.startDate || s.start_date ? new Date(s.startDate || s.start_date).toISOString().split('T')[0] : '',
      endDate: s.endDate || s.end_date ? new Date(s.endDate || s.end_date).toISOString().split('T')[0] : ''
    });
  };

  // Derived state for highlights
  const activeSemester = sems.find(s => ['active', 'grading'].includes(s.status));
  const registrationSemester = sems.find(s => s.status === 'registration');

  return (
    <AppLayout>
      {/* ─────────────────────────────────────────────────────────
          QUICK STATS HERO SECTION 
      ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'white', padding: '24px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>الفصل الدراسي النشط حالياً</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            {activeSemester ? (activeSemester.label || `${activeSemester.semester_type} ${activeSemester.year_label}`) : 'لا يوجد فصل نشط'}
          </div>
        </div>

        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-gray-500)', marginBottom: '8px', fontWeight: 600 }}>حالة التسجيل الأكاديمي</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {registrationSemester ? (
              <>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 4px var(--color-success-100)' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-900)' }}>مفتوح ({registrationSemester.label})</span>
              </>
            ) : (
              <>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-gray-400)', boxShadow: '0 0 0 4px var(--color-gray-100)' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-600)' }}>مغلق حالياً</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MAIN TABLE SECTION 
      ────────────────────────────────────────────────────────── */}
      <Card
        title="سجل الفصول الدراسية"
        className="shadow-sm"
        headerActions={
          <Button size="md" onClick={() => setIsAddOpen(true)} style={{ fontWeight: 700 }}>
            + إضافة فصل دراسي
          </Button>
        }
      >
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}><Spinner size={40} /></div>
        ) : sems.length === 0 ? (
          <EmptyState 
            icon="📅" 
            title="لا توجد فصول دراسية" 
            description="قم بإضافة الفصل الدراسي الأول لتتمكن من إدارته وبدء التسجيل." 
            action={<Button onClick={() => setIsAddOpen(true)}>إضافة فصل دراسي</Button>}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>الفصل الدراسي</Th>
                <Th>تاريخ البداية</Th>
                <Th>تاريخ النهاية</Th>
                <Th>الحالة</Th>
                <Th style={{ textAlign: 'left' }}>الإجراءات</Th>
              </tr>
            </thead>
            <tbody>
              {sems.map(s => {
                const actionBtn = getActionLabel(s.status);
                const isHighlight = s.status === 'active' || s.status === 'registration';
                
                return (
                  <tr key={s.id} style={{ background: isHighlight ? 'var(--color-primary-50)' : 'transparent', transition: 'background 0.2s' }}>
                    <Td style={{ fontWeight: 700, color: isHighlight ? 'var(--color-primary-dark)' : 'var(--color-gray-900)' }}>
                      {s.label || `${s.semester_type} ${s.year_label}`}
                    </Td>
                    <Td style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>
                      {s.startDate || s.start_date ? new Date(s.startDate || s.start_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </Td>
                    <Td style={{ fontSize: '13px', color: 'var(--color-gray-600)' }}>
                      {s.endDate || s.end_date ? new Date(s.endDate || s.end_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </Td>
                    <Td>
                      <StatusBadge status={s.status} />
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {['upcoming', 'registration', 'active'].includes(s.status) && (
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(s)}>
                            تعديل التواريخ
                          </Button>
                        )}
                        {actionBtn && (
                          <Button 
                            size="sm" 
                            variant={s.status === 'upcoming' ? 'success' : s.status === 'grading' ? 'primary' : 'outline'} 
                            onClick={() => advanceStatus(s)}
                          >
                            {actionBtn}
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {/* ─────────────────────────────────────────────────────────
          MODALS
      ────────────────────────────────────────────────────────── */}
      
      {/* Create Semester Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة فصل دراسي جديد">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <Input 
              label="العام الأكاديمي (مثال: 2024-2025)" 
              required 
              value={addForm.academicYear} 
              onChange={e => setAddForm(p => ({...p, academicYear: e.target.value}))} 
              placeholder="2024-2025"
            />
            
            <Select 
              label="نوع الفصل" 
              value={addForm.semesterType} 
              onChange={e => setAddForm(p => ({...p, semesterType: e.target.value}))}
            >
              <option value="fall">الترم الأول</option>
              <option value="spring">الترم الثاني</option>
              <option value="summer">الترم الصيفي</option>
            </Select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input 
                type="date" 
                label="تاريخ البداية" 
                required 
                value={addForm.startDate} 
                onChange={e => setAddForm(p => ({...p, startDate: e.target.value}))} 
              />
              <Input 
                type="date" 
                label="تاريخ النهاية" 
                required 
                value={addForm.endDate} 
                onChange={e => setAddForm(p => ({...p, endDate: e.target.value}))} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
            <Button type="submit" variant="primary">حفظ الفصل</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Dates Modal */}
      <Modal open={!!editData} onClose={() => setEditData(null)} title={`تعديل تواريخ: ${editData?.label || ''}`}>
        <form onSubmit={handleSaveDates}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <Input 
              type="date" 
              label="تاريخ البداية" 
              required 
              value={editForm.startDate} 
              onChange={e => setEditForm(p => ({...p, startDate: e.target.value}))} 
            />
            <Input 
              type="date" 
              label="تاريخ النهاية" 
              required 
              value={editForm.endDate} 
              onChange={e => setEditForm(p => ({...p, endDate: e.target.value}))} 
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setEditData(null)}>إلغاء</Button>
            <Button type="submit" variant="success">حفظ التعديلات</Button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  );
}
