import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Spinner, Input } from '../../components/ui';
import { Scale, Save, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function AdminBylawEditor() {
  const [bylaw, setBylaw] = useState(null);
  const [originalBylaw, setOriginalBylaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata');
  
  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBylawFull();
      if (res.data.success) {
        setBylaw(res.data.data);
        setOriginalBylaw(JSON.parse(JSON.stringify(res.data.data)));
      }
    } catch (e) {
      toast.error('Failed to load JSON Bylaw');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!window.confirm('Are you sure you want to save these changes? This directly modifies the academic regulations.')) return;
    setSaving(true);
    try {
      const res = await adminAPI.updateBylawFull(bylaw);
      if (res.data.success) {
        toast.success('Bylaw successfully updated and backed up.');
        setOriginalBylaw(JSON.parse(JSON.stringify(bylaw)));
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(bylaw) !== JSON.stringify(originalBylaw);

  if (loading) return <AppLayout><Spinner /></AppLayout>;
  if (!bylaw || !bylaw.metadata) {
    return (
      <AppLayout>
        <Card style={{ textAlign: 'center', padding: '40px', color: 'var(--color-error)' }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3>فشل في تحميل اللائحة الأكاديمية</h3>
          <p style={{ color: 'var(--color-gray-600)', marginTop: '8px' }}>
            The academic bylaw data could not be loaded or is corrupted. Please check the backend connection or restore a backup.
          </p>
          <Button onClick={load} style={{ marginTop: '20px' }} variant="outline">
            <RefreshCcw size={16} style={{ marginLeft: '8px' }} /> إعادة المحاولة
          </Button>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ background: 'var(--color-warning-light)', border: '1px solid var(--color-accent)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Scale size={24} color="var(--color-warning-dark)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--color-warning-dark)', marginBottom: '4px' }}>
            Academic Regulations Editor (JSON)
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-warning-dark)' }}>
            Modify the core academic bylaw safely. A backup is automatically created on every save.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={() => setBylaw(JSON.parse(JSON.stringify(originalBylaw)))}>
              <RefreshCcw size={16} style={{ marginLeft: '6px' }} /> Discard
            </Button>
          )}
          <Button variant={hasChanges ? 'primary' : 'secondary'} size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? <Spinner size="sm" /> : <Save size={16} style={{ marginLeft: '6px' }} />}
            Save Changes
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TabBtn active={activeTab === 'metadata'} onClick={() => setActiveTab('metadata')}>Metadata & General</TabBtn>
          <TabBtn active={activeTab === 'grading'} onClick={() => setActiveTab('grading')}>Grading System</TabBtn>
          <TabBtn active={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>Academic Rules</TabBtn>
          <TabBtn active={activeTab === 'curriculum'} onClick={() => setActiveTab('curriculum')}>Curriculum & Courses</TabBtn>
          <TabBtn active={activeTab === 'raw'} onClick={() => setActiveTab('raw')}>Raw JSON Editor</TabBtn>
        </div>

        <div style={{ flex: 1 }}>
          <Card>
            {activeTab === 'metadata' && (
              <div>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Metadata</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input 
                    label="Version" 
                    value={bylaw.metadata.version} 
                    onChange={e => setBylaw({...bylaw, metadata: {...bylaw.metadata, version: e.target.value}})} 
                  />
                  <Input 
                    label="Degree" 
                    value={bylaw.metadata.degree} 
                    onChange={e => setBylaw({...bylaw, metadata: {...bylaw.metadata, degree: e.target.value}})} 
                  />
                  <Input 
                    label="Total Credit Hours" 
                    type="number"
                    value={bylaw.metadata.total_credit_hours} 
                    onChange={e => setBylaw({...bylaw, metadata: {...bylaw.metadata, total_credit_hours: parseInt(e.target.value)}})} 
                  />
                  <Input 
                    label="Passing CGPA" 
                    type="number"
                    step="0.1"
                    value={bylaw.metadata.passing_cgpa} 
                    onChange={e => setBylaw({...bylaw, metadata: {...bylaw.metadata, passing_cgpa: parseFloat(e.target.value)}})} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'grading' && (
              <div>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Grading Scale</h3>
                {bylaw.grading_system.map((g, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{g.grade}</div>
                    <Input label="Min %" type="number" value={g.min_percent} onChange={e => {
                      const newG = [...bylaw.grading_system];
                      newG[idx].min_percent = parseFloat(e.target.value);
                      setBylaw({...bylaw, grading_system: newG});
                    }} />
                    <Input label="Max %" type="number" value={g.max_percent} onChange={e => {
                      const newG = [...bylaw.grading_system];
                      newG[idx].max_percent = parseFloat(e.target.value);
                      setBylaw({...bylaw, grading_system: newG});
                    }} />
                    <Input label="Points" type="number" step="0.1" value={g.points} onChange={e => {
                      const newG = [...bylaw.grading_system];
                      newG[idx].points = parseFloat(e.target.value);
                      setBylaw({...bylaw, grading_system: newG});
                    }} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rules' && (
              <div>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Registration & Warnings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input 
                    label="Warning Threshold (CGPA)" 
                    type="number" step="0.1"
                    value={bylaw.academic_status.warning_threshold} 
                    onChange={e => setBylaw({...bylaw, academic_status: {...bylaw.academic_status, warning_threshold: parseFloat(e.target.value)}})} 
                  />
                  <Input 
                    label="Max Consecutive Warnings" 
                    type="number"
                    value={bylaw.academic_status.dismissal.consecutive_warnings} 
                    onChange={e => setBylaw({...bylaw, academic_status: {...bylaw.academic_status, dismissal: {...bylaw.academic_status.dismissal, consecutive_warnings: parseInt(e.target.value)}}})} 
                  />
                  <Input 
                    label="Min Hours (Regular Semester)" 
                    type="number"
                    value={bylaw.registration_rules.regular_semester.min_hours} 
                    onChange={e => setBylaw({...bylaw, registration_rules: {...bylaw.registration_rules, regular_semester: {...bylaw.registration_rules.regular_semester, min_hours: parseInt(e.target.value)}}})} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Curriculum Editor</h3>
                <p style={{ color: 'var(--color-gray-500)', fontSize: '13px', marginBottom: '16px' }}>
                  This provides a read-only structured view of the curriculum. To modify complex prerequisite chains or add new courses, please use the <strong>Raw JSON Editor</strong> for safety.
                </p>
                
                <h4 style={{ margin: '16px 0 8px 0', color: 'var(--color-primary)' }}>Departments</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {bylaw.departments.map(d => (
                    <div key={d.code} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}>
                      <strong>{d.code}</strong> - {d.name_en} ({d.name_ar})
                    </div>
                  ))}
                </div>

                <h4 style={{ margin: '24px 0 8px 0', color: 'var(--color-primary)' }}>University Requirements (Mandatory)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {bylaw.curriculum.university_requirements.mandatory.map((c, idx) => (
                    <div key={c.code} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>{c.code}</strong></span>
                        <span style={{ color: 'var(--color-gray-500)', fontSize: '12px' }}>Prereqs: {c.prerequisites?.length > 0 ? c.prerequisites.join(', ') : 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}><Input value={c.name_en} onChange={e => {
                          const nb = {...bylaw};
                          nb.curriculum.university_requirements.mandatory[idx].name_en = e.target.value;
                          setBylaw(nb);
                        }} /></div>
                        <div style={{ flex: 1 }}><Input value={c.name_ar} onChange={e => {
                          const nb = {...bylaw};
                          nb.curriculum.university_requirements.mandatory[idx].name_ar = e.target.value;
                          setBylaw(nb);
                        }} /></div>
                        <div style={{ width: '80px' }}><Input type="number" value={c.credits} onChange={e => {
                          const nb = {...bylaw};
                          nb.curriculum.university_requirements.mandatory[idx].credits = parseInt(e.target.value);
                          setBylaw(nb);
                        }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'raw' && (
              <div>
                <div style={{ background: 'var(--color-error-light)', color: 'var(--color-error-dark)', padding: '10px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} />
                  <span><strong>Warning:</strong> Invalid JSON will crash the backend. Edit carefully!</span>
                </div>
                <textarea 
                  style={{ width: '100%', height: '500px', fontFamily: 'monospace', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', direction: 'ltr' }}
                  value={JSON.stringify(bylaw, null, 2)}
                  onChange={e => {
                    try {
                      setBylaw(JSON.parse(e.target.value));
                    } catch(err) {
                      // ignore parse errors while typing
                    }
                  }}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 16px',
        textAlign: 'right',
        background: active ? 'var(--color-primary-50)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-gray-600)',
        border: 'none',
        borderRadius: '8px',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}
