import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Table, Th, Td, Button, Spinner, Modal, Badge, Input, Select, SearchInput } from '../../components/ui';

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const DAY_AR = { Sun: 'الأحد', Mon: 'الإثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء', Thu: 'الخميس', Fri: 'الجمعة', Sat: 'السبت' };

export default function AdminTimetablePage() {
  const [sems, setSems] = useState([]);
  const [semId, setSemId] = useState('');
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  
  // We will manage slots as an array in the modal
  const [slots, setSlots] = useState([]);
  const [room, setRoom] = useState('');

  useEffect(() => {
    adminAPI.getSemesters()
      .then(r => {
        const d = D(r)?.semesters || D(r) || [];
        setSems(d);
        const active = d.find(s => ['active', 'registration'].includes(s.status));
        if (active) setSemId(active.id);
        else if (d.length > 0) setSemId(d[0].id);
      })
      .catch(() => toast.error('فشل تحميل الفصول الدراسية'));
  }, []);

  const loadOfferings = () => {
    if (!semId) return;
    setLoading(true);
    adminAPI.getOfferings({ semesterId: semId })
      .then(r => {
        const data = D(r) || [];
        // Deduplicate: one row per course_id — prefer offerings that already have a schedule
        const seenCourseIds = new Set();
        const withSchedule = [];
        const withoutSchedule = [];
        data.forEach(o => {
          if (o.schedule_slots && o.schedule_slots.length > 0) withSchedule.push(o);
          else withoutSchedule.push(o);
        });
        const deduped = [];
        [...withSchedule, ...withoutSchedule].forEach(o => {
          if (!seenCourseIds.has(o.course_id)) {
            seenCourseIds.add(o.course_id);
            deduped.push(o);
          }
        });
        // Sort by level then code
        deduped.sort((a, b) => (a.level || 0) - (b.level || 0) || (a.code || '').localeCompare(b.code || ''));
        setOfferings(deduped);
      })
      .catch(() => toast.error('فشل تحميل المقررات'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOfferings();
  }, [semId]);

  const openAssignModal = (offering) => {
    setEditingOffering(offering);
    setSlots(offering.schedule_slots || []);
    setRoom(offering.room || '');
    setIsModalOpen(true);
  };

  const handleAddSlot = () => {
    setSlots([...slots, { dayOfWeek: 'Sun', startTime: '08:00', endTime: '10:00', room: room, sessionType: 'lecture' }]);
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!editingOffering) return;
    
    // Map fields for backend compatibility
    const formattedSlots = slots.map(s => ({
      dayOfWeek: s.dayOfWeek || s.day,
      startTime: s.startTime || (s.start ? s.start.slice(0, 5) : '08:00'),
      endTime: s.endTime || (s.end ? s.end.slice(0, 5) : '10:00'),
      room: s.room,
      sessionType: s.sessionType || s.type
    }));

    try {
      await adminAPI.assignSchedule(editingOffering.id, { slots: formattedSlots, room });
      toast.success('تم حفظ الجدول بنجاح');
      setIsModalOpen(false);
      loadOfferings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حفظ الجدول');
    }
  };

  const filtered = offerings.filter(o => !q || (o.name_ar || o.name_en || o.code || o.doctor_name_ar || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-gray-900)' }}>إدارة الجدول الدراسي</h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '14px', marginTop: '4px' }}>قم بتعيين القاعات والمواعيد للمقررات المطروحة</p>
        </div>
        <select
          style={{ width: '250px', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}
          value={semId} onChange={e => setSemId(e.target.value)}
        >
          {sems.map(s => (
            <option key={s.id} value={s.id}>{s.label || s.semester_type}</option>
          ))}
        </select>
      </div>

      <Card>
        <SearchInput value={q} onChange={setQ} placeholder="بحث بالكود، اسم المقرر، أو اسم الدكتور…" />

        {loading ? <Spinner /> : (
          <Table>
            <thead>
              <tr>
                <Th>المقرر</Th>
                <Th>الفرقة / المستوى</Th>
                <Th>الدكتور</Th>
                <Th>المواعيد</Th>
                <Th>الإجراء</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <Td>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{o.name_ar || o.name_en}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{o.code} | {o.credits} ساعات</div>
                  </Td>
                  <Td>
                    <Badge variant="info">المستوى {o.level}</Badge>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{o.doctor_name_ar || o.doctor_name || 'غير محدد'}</div>
                  </Td>
                  <Td>
                    {o.schedule_slots && o.schedule_slots.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {o.schedule_slots.map((s, i) => (
                          <div key={i} style={{ fontSize: '12px', background: 'var(--color-gray-50)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-gray-100)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{DAY_AR[s.day]}</span>:{' '}
                            {s.start ? s.start.slice(0, 5) : ''} - {s.end ? s.end.slice(0, 5) : ''}{' '}
                            {s.room ? <span style={{ color: 'var(--color-gray-500)' }}>({s.room})</span> : ''}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-gray-400)', fontSize: '13px' }}>غير محدد</span>
                    )}
                  </Td>
                  <Td>
                    <Button size="sm" variant={o.schedule_slots?.length > 0 ? 'ghost' : 'primary'} onClick={() => openAssignModal(o)}>
                      {o.schedule_slots?.length > 0 ? 'تعديل الجدول' : 'تعيين جدول'}
                    </Button>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>لا يوجد مقررات مطروحة لهذا الفصل</Td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={`جدول ${editingOffering?.name_ar || editingOffering?.name_en || ''}`}>
        <form onSubmit={handleSaveSchedule} style={{ width: '600px', maxWidth: '100%' }}>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>القاعة الافتراضية للمقرر</label>
            <Input value={room} onChange={e => setRoom(e.target.value)} placeholder="مثال: قاعة 1, معمل أ" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700 }}>مواعيد المحاضرات / السكاشن</label>
            <Button size="sm" type="button" onClick={handleAddSlot}>+ إضافة موعد</Button>
          </div>

          {slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-gray-300)', color: 'var(--color-gray-500)', marginBottom: '20px' }}>
              لا يوجد مواعيد مضافة بعد. اضغط على "+ إضافة موعد".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {slots.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 40px', gap: '8px', background: 'var(--color-gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', alignItems: 'end' }}>
                  
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '4px', display: 'block' }}>اليوم</label>
                    <select
                      style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-sm)' }}
                      value={s.dayOfWeek || s.day} onChange={e => handleSlotChange(i, 'dayOfWeek', e.target.value)} required
                    >
                      {DAYS.map(d => <option key={d} value={d}>{DAY_AR[d]}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '4px', display: 'block' }}>من</label>
                    <input
                      type="time"
                      style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-sm)' }}
                      value={s.startTime || (s.start ? s.start.slice(0, 5) : '')} onChange={e => handleSlotChange(i, 'startTime', e.target.value)} required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '4px', display: 'block' }}>إلى</label>
                    <input
                      type="time"
                      style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-sm)' }}
                      value={s.endTime || (s.end ? s.end.slice(0, 5) : '')} onChange={e => handleSlotChange(i, 'endTime', e.target.value)} required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: '4px', display: 'block' }}>القاعة (اختياري)</label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-sm)' }}
                      value={s.room || ''} onChange={e => handleSlotChange(i, 'room', e.target.value)} placeholder="القاعة"
                    />
                  </div>

                  <button type="button" onClick={() => handleRemoveSlot(i)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '8px', fontSize: '16px' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button type="submit" variant="primary">حفظ الجدول</Button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  );
}
