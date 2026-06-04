import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Input, Button } from '../../components/ui';

export default function ChangePwPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ c: '', n: '', cf: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (f.n !== f.cf) { toast.error('كلمتا المرور غير متطابقتين'); return; }
    setBusy(true);
    try {
      await authAPI.changePassword(f.c, f.n);
      toast.success('تم تغيير كلمة المرور');
      logout(true);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل التغيير');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <Card title="تغيير كلمة المرور">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              type="password"
              label="كلمة المرور الحالية"
              value={f.c}
              onChange={e => set('c', e.target.value)}
              required
            />
            <Input
              type="password"
              label="كلمة المرور الجديدة"
              value={f.n}
              onChange={e => set('n', e.target.value)}
              required
            />
            <Input
              type="password"
              label="تأكيد كلمة المرور"
              value={f.cf}
              onChange={e => set('cf', e.target.value)}
              required
            />
            <Button type="submit" loading={busy} fullWidth style={{ marginTop: '8px' }}>
              {busy ? 'جاري الحفظ…' : 'حفظ التغييرات'}
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
