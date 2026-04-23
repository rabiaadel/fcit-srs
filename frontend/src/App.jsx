import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { studentAPI, doctorAPI, adminAPI, sharedAPI, authAPI } from './services/api';

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
const GRADE_COLORS = { 'A+':'#0d9488','A':'#14b8a6','A-':'#2dd4bf','B+':'#3b82f6','B':'#60a5fa','B-':'#93c5fd','C+':'#f59e0b','C':'#fbbf24','C-':'#fcd34d','D+':'#f97316','D':'#fb923c','D-':'#fdba74','F':'#ef4444','W':'#6b7280','Abs':'#6b7280','P':'#10b981' };
const gradeColor = (g) => GRADE_COLORS[g] || '#6b7280';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-EG', { year:'numeric', month:'short', day:'numeric' }) : '—';

const Badge = ({ label, color = '#3b82f6' }) => (
  <span style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{label}</span>
);

const StatusBadge = ({ status }) => {
  const map = { active:'#10b981', warning:'#f59e0b', dismissed:'#ef4444', graduated:'#6366f1', on_leave:'#8b5cf6', withdrawn:'#6b7280', registration:'#3b82f6', upcoming:'#8b5cf6', closed:'#6b7280', grading:'#f59e0b' };
  return <Badge label={status?.replace('_',' ').toUpperCase()} color={map[status]||'#3b82f6'} />;
};

const Card = ({ children, title, action, className = '' }) => (
  <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px #0001', border:'1px solid #e5e7eb', overflow:'hidden' }} className={className}>
    {title && (
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#1f2937' }}>{title}</h3>
        {action}
      </div>
    )}
    <div style={{ padding: title ? 20 : 0 }}>{children}</div>
  </div>
);

const Stat = ({ label, value, color = '#3b82f6', icon }) => (
  <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px #0001', border:`1px solid ${color}33`, display:'flex', gap:16, alignItems:'center' }}>
    {icon && <span style={{ fontSize:28, background:color+'22', width:52, height:52, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10 }}>{icon}</span>}
    <div>
      <div style={{ fontSize:28, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>{label}</div>
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:40 }}>
    <div style={{ width:32, height:32, border:'3px solid #e5e7eb', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Table = ({ columns, data, emptyMsg = 'No data available' }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
      <thead>
        <tr style={{ background:'#f9fafb', borderBottom:'2px solid #e5e7eb' }}>
          {columns.map(c => <th key={c.key} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#374151', whiteSpace:'nowrap' }}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr><td colSpan={columns.length} style={{ textAlign:'center', padding:32, color:'#9ca3af' }}>{emptyMsg}</td></tr>
        )}
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom:'1px solid #f3f4f6', background: i%2===0 ? '#fff' : '#fafafa' }}>
            {columns.map(c => (
              <td key={c.key} style={{ padding:'10px 14px', color:'#374151' }}>
                {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ═══════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = {
    student: [
      { to: '/student', label: '📊 Dashboard' },
      { to: '/student/courses', label: '📚 Register Courses' },
      { to: '/student/schedule', label: '🗓 My Schedule' },
      { to: '/student/transcript', label: '📜 Transcript' },
      { to: '/student/graduation', label: '🎓 Graduation' },
      { to: '/student/notifications', label: '🔔 Notifications' },
    ],
    doctor: [
      { to: '/doctor', label: '📊 Dashboard' },
      { to: '/doctor/courses', label: '📖 My Courses' },
    ],
    admin: [
      { to: '/admin', label: '📊 Dashboard' },
      { to: '/admin/students', label: '👨‍🎓 Students' },
      { to: '/admin/users', label: '👥 Users' },
      { to: '/admin/semesters', label: '📅 Semesters' },
      { to: '/admin/reports', label: '📈 Reports' },
      { to: '/admin/announcements', label: '📢 Announcements' },
    ],
  };

  const links = navLinks[user?.role] || [];
  const roleColor = { admin:'#6366f1', doctor:'#0891b2', student:'#0d9488' }[user?.role] || '#374151';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width:240, background:'#1e293b', color:'#fff', flexShrink:0, display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, overflowY:'auto', zIndex:100 }}>
        {/* Logo */}
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #334155' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:28 }}>🎓</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14, letterSpacing:0.5 }}>FCIT Tanta</div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>Student Reg. System</div>
            </div>
          </div>
        </div>
        {/* User Info */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #334155' }}>
          <div style={{ background:roleColor+'33', border:`1px solid ${roleColor}55`, borderRadius:8, padding:12 }}>
            <div style={{ fontSize:12, color:'#94a3b8', marginBottom:4 }}>{user?.role?.toUpperCase()}</div>
            <div style={{ fontWeight:600, fontSize:14, lineHeight:1.4 }}>{user?.fullNameEn}</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{user?.email}</div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 0' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={{ display:'block', padding:'10px 20px', color: location.pathname === l.to ? '#fff' : '#94a3b8', background: location.pathname === l.to ? '#334155' : 'transparent', textDecoration:'none', fontSize:14, borderLeft: location.pathname === l.to ? `3px solid ${roleColor}` : '3px solid transparent', transition:'all 0.15s' }}
            >{l.label}</Link>
          ))}
        </nav>
        {/* Bottom */}
        <div style={{ padding:16, borderTop:'1px solid #334155' }}>
          <Link to="/change-password" style={{ display:'block', padding:'8px 12px', color:'#94a3b8', textDecoration:'none', fontSize:13, marginBottom:4 }}>🔒 Change Password</Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width:'100%', padding:'9px 12px', background:'#ef444422', color:'#fca5a5', border:'1px solid #ef444444', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:240, flex:1, padding:24, minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// AUTH PAGES
// ═══════════════════════════════════════════════════════════
const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (user) navigate(`/${user.role}`, { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: u } = await login(email, password);
      toast.success(`Welcome back, ${u.fullNameEn}!`);
      navigate(`/${u.role}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label:'Admin', email:'admin@fci.tanta.edu.eg', pw:'Admin@2026!', color:'#6366f1', icon:'🛡️' },
    { label:'Doctor', email:'dr.ahmed@fci.tanta.edu.eg', pw:'Doctor@2026!', color:'#0891b2', icon:'👨‍🏫' },
    { label:'Student', email:'s.2024cs001@fci.tanta.edu.eg', pw:'Student@2026!', color:'#0d9488', icon:'👨‍🎓' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🎓</div>
          <h1 style={{ color:'#fff', fontSize:24, fontWeight:800, margin:'0 0 6px' }}>Faculty of Computers & Informatics</h1>
          <p style={{ color:'#94a3b8', margin:0, fontSize:14 }}>Tanta University — Student Registration System</p>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:16, padding:32, boxShadow:'0 20px 60px #0005' }}>
          <h2 style={{ textAlign:'center', margin:'0 0 24px', fontSize:20, fontWeight:700, color:'#1e293b' }}>Sign In</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' }}>University Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="user@fci.tanta.edu.eg"
                style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #d1d5db', borderRadius:9, fontSize:14, boxSizing:'border-box', outline:'none', transition:'border 0.2s' }}
                onFocus={e => e.target.style.borderColor='#3b82f6'}
                onBlur={e => e.target.style.borderColor='#d1d5db'}
              />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ width:'100%', padding:'11px 42px 11px 14px', border:'1.5px solid #d1d5db', borderRadius:9, fontSize:14, boxSizing:'border-box', outline:'none' }}
                  onFocus={e => e.target.style.borderColor='#3b82f6'}
                  onBlur={e => e.target.style.borderColor='#d1d5db'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', background: loading ? '#93c5fd' : '#3b82f6', color:'#fff', border:'none', borderRadius:9, fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.2s' }}>
              {loading ? '⏳ Signing In...' : '→ Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:28, borderTop:'1px solid #f3f4f6', paddingTop:20 }}>
            <p style={{ textAlign:'center', fontSize:12, color:'#9ca3af', marginBottom:12 }}>Demo Accounts</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {demoAccounts.map(acc => (
                <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword(acc.pw); }}
                  style={{ padding:'8px 6px', background:acc.color+'11', border:`1px solid ${acc.color}33`, borderRadius:8, cursor:'pointer', fontSize:11, fontWeight:600, color:acc.color }}>
                  <div style={{ fontSize:18, marginBottom:2 }}>{acc.icon}</div>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign:'center', color:'#475569', fontSize:12, marginTop:20 }}>
          © 2024 Faculty of Computers & Informatics, Tanta University
        </p>
      </div>
    </div>
  );
};

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword(form.currentPassword, form.newPassword);
      toast.success('Password changed successfully!');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:400, margin:'40px auto' }}>
      <Card title="🔒 Change Password">
        <form onSubmit={handleSubmit}>
          {['currentPassword','newPassword','confirmPassword'].map(field => (
            <div key={field} style={{ marginBottom:16 }}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' }}>
                {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input type="password" value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} required
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14, boxSizing:'border-box' }}
              />
            </div>
          ))}
          <p style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>Min 8 chars, must include uppercase, lowercase, number and special char (@$!%*?&#)</p>
          <button type="submit" disabled={loading} style={{ width:'100%', padding:11, background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            {loading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// STUDENT PAGES
// ═══════════════════════════════════════════════════════════
const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div>Failed to load</div>;

  const { student, currentSemester, schedule, recentGPA, warnings } = data;

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:4 }}>📊 Dashboard</h1>
      <p style={{ color:'#64748b', marginBottom:24 }}>Welcome back, {student?.student_code}</p>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
        <Stat label="Cumulative GPA" value={parseFloat(student?.cgpa||0).toFixed(3)} color="#3b82f6" icon="📊" />
        <Stat label="Credits Passed" value={`${student?.total_credits_passed||0}/132`} color="#10b981" icon="✅" />
        <Stat label="Academic Level" value={student?.current_level?.toUpperCase()} color="#8b5cf6" icon="📈" />
        <Stat label="Status" value={<StatusBadge status={student?.academic_status} />} color="#f59e0b" icon="🎯" />
      </div>

      {/* Warnings banner */}
      {warnings?.length > 0 && (
        <div style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:10, padding:16, marginBottom:20, display:'flex', gap:12, alignItems:'flex-start' }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <strong style={{ color:'#92400e' }}>Academic Warning</strong>
            <p style={{ color:'#78350f', margin:'4px 0 0', fontSize:13 }}>You have {warnings.length} academic warning(s). Maintain CGPA ≥ 2.0 to avoid dismissal.</p>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        {/* Current courses */}
        <Card title={`📚 Current Semester${currentSemester ? ` — ${currentSemester.label}` : ''}`}>
          {schedule?.length === 0 ? (
            <div style={{ textAlign:'center', padding:24, color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
              No courses registered this semester.
              {currentSemester?.status === 'registration' && <Link to="/student/courses" style={{ display:'block', marginTop:8, color:'#3b82f6' }}>Register for courses →</Link>}
            </div>
          ) : (
            <Table
              columns={[
                { key:'code', label:'Code' },
                { key:'name_en', label:'Course', render: (v, r) => <div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'#6b7280'}}>{r.credits} credits</div></div> },
                { key:'doctor_name', label:'Instructor' },
                { key:'attendance_pct', label:'Attendance', render: v => <span style={{ color: v < 42 ? '#ef4444' : v < 60 ? '#f59e0b' : '#10b981', fontWeight:700 }}>{v ? `${v}%` : '—'}</span> },
                { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
              ]}
              data={schedule || []}
            />
          )}
        </Card>

        {/* GPA History */}
        <Card title="📈 GPA History">
          {recentGPA?.length === 0 ? (
            <p style={{ color:'#9ca3af', textAlign:'center', padding:16 }}>No GPA history yet</p>
          ) : (
            recentGPA.map((g, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < recentGPA.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{g.label}</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>{g.classification}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:700, color:'#3b82f6' }}>{parseFloat(g.semester_gpa).toFixed(3)}</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>CGPA: {parseFloat(g.cumulative_gpa).toFixed(3)}</div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

const CourseRegistrationPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    sharedAPI.getSemesters().then(r => {
      const open = r.data.data.filter(s => ['registration','active'].includes(s.status));
      setSemesters(open);
      if (open.length > 0) setSelectedSem(open[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedSem) return;
    setLoading(true);
    studentAPI.getAvailableCourses(selectedSem.id)
      .then(r => setCourses(r.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, [selectedSem]);

  const handleRegister = async (offeringId, code) => {
    setRegistering(offeringId);
    try {
      await studentAPI.registerCourse(offeringId);
      toast.success(`Registered for ${code} successfully!`);
      // Reload
      const r = await studentAPI.getAvailableCourses(selectedSem.id);
      setCourses(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setRegistering(null); }
  };

  const handleDrop = async (enrollmentId, code) => {
    if (!window.confirm(`Drop ${code}?`)) return;
    try {
      await studentAPI.dropCourse(enrollmentId);
      toast.success(`${code} dropped`);
      const r = await studentAPI.getAvailableCourses(selectedSem.id);
      setCourses(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Drop failed');
    }
  };

  const catColors = { university_req:'#6366f1', math_science:'#f59e0b', basic_computing:'#3b82f6', applied_computing:'#10b981', elective:'#8b5cf6', project:'#ef4444', training:'#ec4899' };
  const grouped = courses.reduce((acc, c) => { const g = c.category || 'other'; acc[g] = acc[g] || []; acc[g].push(c); return acc; }, {});

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>📚 Course Registration</h1>

      {semesters.length === 0 ? (
        <Card><div style={{ textAlign:'center', padding:32, color:'#9ca3af' }}>⚠️ Registration is not currently open</div></Card>
      ) : (
        <>
          <div style={{ marginBottom:20 }}>
            <select value={selectedSem?.id || ''} onChange={e => setSelectedSem(semesters.find(s => s.id == e.target.value))}
              style={{ padding:'9px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14, background:'#fff' }}>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {loading ? <Spinner /> : Object.entries(grouped).map(([cat, items]) => (
            <Card key={cat} title={<span style={{ color: catColors[cat] || '#374151' }}>● {cat.replace(/_/g,' ').toUpperCase()} <span style={{ fontSize:12, fontWeight:400, color:'#6b7280' }}>({items.length} courses)</span></span>} className="" style={{ marginBottom:16 }}>
              <div style={{ marginBottom:16 }}>
              <Table
                columns={[
                  { key:'code', label:'Code', render: v => <strong style={{ fontFamily:'monospace', color:'#1e293b' }}>{v}</strong> },
                  { key:'name_en', label:'Course Name', render: (v, r) => <div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'#6b7280'}}>{r.name_ar}</div></div> },
                  { key:'credits', label:'Credits', render: v => <Badge label={`${v} cr`} color="#3b82f6" /> },
                  { key:'doctor_name', label:'Instructor' },
                  { key:'enrolled_count', label:'Seats', render: (v, r) => <span style={{ color: v >= r.capacity ? '#ef4444' : '#10b981' }}>{v}/{r.capacity}</span> },
                  { key:'already_registered', label:'Action', render: (v, r) => {
                    if (v) return (
                      <div style={{ display:'flex', gap:6 }}>
                        <span style={{ color:'#10b981', fontWeight:700, fontSize:13 }}>✅ Registered</span>
                        <button onClick={() => handleDrop(r.enrollment_id, r.code)} style={{ padding:'4px 8px', background:'#fef2f2', color:'#ef4444', border:'1px solid #fca5a5', borderRadius:6, fontSize:12, cursor:'pointer' }}>Drop</button>
                      </div>
                    );
                    if (!r.can_register) return <span style={{ color:'#9ca3af', fontSize:12 }} title={r.register_block_reason}>🔒 {r.register_block_reason?.substring(0,40)}{r.register_block_reason?.length > 40 ? '…' : ''}</span>;
                    return (
                      <button onClick={() => handleRegister(r.offering_id, r.code)} disabled={registering === r.offering_id}
                        style={{ padding:'6px 14px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        {registering === r.offering_id ? '...' : '+ Register'}
                      </button>
                    );
                  }},
                ]}
                data={items}
              />
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

const TranscriptPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getTranscript().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { student, courses, gpaHistory } = data;

  // Group by semester
  const bySemester = courses.reduce((acc, c) => {
    const key = c.semester_label;
    acc[key] = acc[key] || [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:4 }}>📜 Official Transcript</h1>
          <p style={{ color:'#64748b' }}>Faculty of Computers & Informatics, Tanta University</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:24 }}>
        <Stat label="Cumulative GPA" value={parseFloat(student?.cgpa||0).toFixed(3)} color="#3b82f6" icon="📊" />
        <Stat label="Credits Passed" value={student?.totalCreditsPassed} color="#10b981" icon="✅" />
        <Stat label="Classification" value={student?.gpaClassification} color="#8b5cf6" icon="🏆" />
        <Stat label="Level" value={student?.currentLevel?.toUpperCase()} color="#f59e0b" icon="📚" />
      </div>

      {Object.entries(bySemester).map(([sem, items]) => {
        const semGPA = gpaHistory.find(g => g.label === sem);
        return (
          <Card key={sem} title={<div style={{ display:'flex', gap:16, alignItems:'center' }}><span>{sem}</span>{semGPA && <span style={{ fontSize:12, color:'#6b7280' }}>GPA: <strong>{parseFloat(semGPA.semester_gpa).toFixed(3)}</strong> | CGPA: <strong>{parseFloat(semGPA.cumulative_gpa).toFixed(3)}</strong></span>}</div>}>
            <Table
              columns={[
                { key:'course_code', label:'Code' },
                { key:'course_name_en', label:'Course' },
                { key:'credits', label:'Credits' },
                { key:'total_grade', label:'Score', render: v => v ? `${v}%` : '—' },
                { key:'letter_grade', label:'Grade', render: v => v ? <span style={{ fontWeight:700, color: gradeColor(v) }}>{v}</span> : '—' },
                { key:'grade_points', label:'Points' },
                { key:'enrollment_status', label:'Status', render: (v, r) => <span style={{ fontSize:12, color: r.is_counted_in_gpa ? '#374151' : '#9ca3af' }}>{v}{r.attempt_number > 1 ? ` (Attempt ${r.attempt_number})` : ''}</span> },
              ]}
              data={items}
            />
          </Card>
        );
      })}
    </div>
  );
};

const GraduationStatusPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getGraduationStatus().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { eligibility: e, honors: h } = data;

  const checks = [
    { label: `Credit Hours (${e.credits_passed}/132)`, met: e.credits_met, detail: e.credits_passed >= 132 ? 'All 132 credits passed ✓' : `Need ${132 - (e.credits_passed||0)} more credits` },
    { label: 'Minimum CGPA ≥ 2.0', met: e.cgpa_met, detail: `Current CGPA: ${parseFloat(e.cgpa||0).toFixed(3)}` },
    { label: 'Summer Training (1)', met: e.training1_done },
    { label: 'Summer Training (2)', met: e.training2_done },
    { label: 'Graduation Project (1)', met: e.project1_done },
    { label: 'Graduation Project (2)', met: e.project2_done },
    { label: 'No Pending Failed Courses', met: e.no_pending_f_grades },
    { label: 'Academic Standing', met: e.status_ok },
    { label: 'Remedial Math (if required)', met: e.remedial_math_ok },
  ];

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>🎓 Graduation Status</h1>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <Card title="📋 Graduation Requirements Checklist">
          {checks.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < checks.length-1 ? '1px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize:18 }}>{c.met ? '✅' : '❌'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color: c.met ? '#1e293b' : '#6b7280' }}>{c.label}</div>
                {c.detail && <div style={{ fontSize:12, color:'#9ca3af' }}>{c.detail}</div>}
              </div>
            </div>
          ))}

          <div style={{ marginTop:20, padding:16, background: e.is_eligible ? '#dcfce7' : '#fef2f2', borderRadius:10, border:`1px solid ${e.is_eligible ? '#86efac' : '#fca5a5'}` }}>
            <div style={{ fontSize:18, fontWeight:800, color: e.is_eligible ? '#15803d' : '#dc2626' }}>
              {e.is_eligible ? '🎉 Eligible for Graduation!' : '⏳ Not Yet Eligible'}
            </div>
          </div>
        </Card>

        <Card title="🏅 Honors Degree">
          <p style={{ fontSize:13, color:'#6b7280', marginTop:0 }}>Requires CGPA ≥ 3.0, all grades ≥ Very Good, completed within 8 semesters, no warnings or failed courses.</p>
          {h.eligible ? (
            <div style={{ padding:16, background:'#fef9c3', borderRadius:10, border:'1px solid #fde047', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🥇</div>
              <div style={{ fontWeight:700, color:'#713f12' }}>Eligible for Honors Degree!</div>
            </div>
          ) : (
            <div>
              <div style={{ padding:12, background:'#f9fafb', borderRadius:8, marginBottom:8, color:'#6b7280', fontSize:13 }}>Not currently eligible:</div>
              {h.reasons?.map((r, i) => <div key={i} style={{ fontSize:13, color:'#6b7280', padding:'4px 0', paddingLeft:8, borderLeft:'3px solid #e5e7eb' }}>• {r}</div>)}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// DOCTOR PAGES
// ═══════════════════════════════════════════════════════════
const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI.getDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:4 }}>📊 Doctor Dashboard</h1>
      <p style={{ color:'#64748b', marginBottom:24 }}>{data.doctor?.academic_title} — {data.doctor?.department_name}</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <Stat label="Total Courses" value={data.courses?.length || 0} color="#3b82f6" icon="📖" />
        <Stat label="Pending Grades" value={data.pendingGradeCount || 0} color="#f59e0b" icon="⏳" />
        <Stat label="Active This Semester" value={data.courses?.filter(c => c.semester_status === 'active').length || 0} color="#10b981" icon="✅" />
      </div>

      <Card title="📖 My Courses">
        <Table
          columns={[
            { key:'course_code', label:'Code' },
            { key:'course_name', label:'Course' },
            { key:'semester', label:'Semester' },
            { key:'semester_status', label:'Sem. Status', render: v => <StatusBadge status={v} /> },
            { key:'enrolled_count', label:'Enrolled', render: (v, r) => `${v}/${r.capacity}` },
            { key:'offering_id', label:'Action', render: (v) => <Link to={`/doctor/courses/${v}`} style={{ padding:'5px 12px', background:'#3b82f6', color:'#fff', borderRadius:6, textDecoration:'none', fontSize:13, fontWeight:600 }}>View Roster</Link> },
          ]}
          data={data.courses || []}
        />
      </Card>
    </div>
  );
};

const CourseRosterPage = () => {
  const { pathname } = useLocation();
  const offeringId = pathname.split('/').pop();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(null);
  const [activeTab, setActiveTab] = useState('grades');

  useEffect(() => {
    doctorAPI.getCourseRoster(offeringId).then(r => {
      setData(r.data.data);
      // Init grades state
      const g = {};
      r.data.data.roster.forEach(s => {
        g[s.enrollment_id] = { midterm_grade: s.midterm_grade||'', coursework_grade: s.coursework_grade||'', practical_grade: s.practical_grade||'', final_exam_grade: s.final_exam_grade||'' };
      });
      setGrades(g);
    }).finally(() => setLoading(false));
  }, [offeringId]);

  const saveGrade = async (enrollmentId) => {
    setSaving(enrollmentId);
    try {
      const g = grades[enrollmentId];
      await doctorAPI.enterGrades(enrollmentId, { midterm_grade: parseFloat(g.midterm_grade)||0, coursework_grade: parseFloat(g.coursework_grade)||0, practical_grade: parseFloat(g.practical_grade)||0, final_exam_grade: parseFloat(g.final_exam_grade)||0 });
      toast.success('Grades saved!');
      const r = await doctorAPI.getCourseRoster(offeringId);
      setData(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grades');
    } finally { setSaving(null); }
  };

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <Link to="/doctor/courses" style={{ color:'#3b82f6', textDecoration:'none', fontSize:13 }}>← Back to Courses</Link>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#1e293b', margin:'8px 0 2px' }}>{data.offering?.code} — {data.offering?.name_en}</h1>
        <p style={{ color:'#64748b' }}>Section {data.offering?.section} • {data.offering?.semester_label} • {data.totalStudents} students</p>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:20 }}>
        {['grades','attendance'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'8px 18px', background: activeTab===tab ? '#3b82f6' : '#f1f5f9', color: activeTab===tab ? '#fff' : '#374151', border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, fontSize:14 }}>
            {tab === 'grades' ? '📝 Grades' : '📋 Attendance'}
          </button>
        ))}
      </div>

      {activeTab === 'grades' && (
        <Card title="Grade Entry">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f9fafb', borderBottom:'2px solid #e5e7eb' }}>
                  {['Student Code','Name','Midterm (20%)','Coursework (10%)','Practical (10%)','Final (60%)','Total','Grade','Action'].map(h => (
                    <th key={h} style={{ padding:'9px 10px', textAlign:'left', fontWeight:600, color:'#374151', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.roster.map((s, i) => {
                  const g = grades[s.enrollment_id] || {};
                  const editable = !s.grade_locked;
                  return (
                    <tr key={s.enrollment_id} style={{ borderBottom:'1px solid #f3f4f6', background: i%2===0?'#fff':'#fafafa' }}>
                      <td style={{ padding:'8px 10px', fontFamily:'monospace', fontWeight:600 }}>{s.student_code}</td>
                      <td style={{ padding:'8px 10px' }}>{s.full_name_en}</td>
                      {['midterm_grade','coursework_grade','practical_grade','final_exam_grade'].map(field => (
                        <td key={field} style={{ padding:'4px 8px' }}>
                          <input type="number" min={0} max={100} step={0.5} value={g[field]??''} onChange={e => setGrades(prev => ({...prev, [s.enrollment_id]: {...prev[s.enrollment_id], [field]: e.target.value}}))}
                            disabled={!editable}
                            style={{ width:70, padding:'5px 8px', border:'1px solid #d1d5db', borderRadius:5, fontSize:13, background: editable ? '#fff' : '#f9fafb' }}
                          />
                        </td>
                      ))}
                      <td style={{ padding:'8px 10px', fontWeight:700 }}>{s.total_grade ? `${s.total_grade}%` : '—'}</td>
                      <td style={{ padding:'8px 10px' }}>{s.letter_grade ? <span style={{ fontWeight:700, color:gradeColor(s.letter_grade) }}>{s.letter_grade}</span> : '—'}</td>
                      <td style={{ padding:'4px 8px' }}>
                        {editable ? (
                          <button onClick={() => saveGrade(s.enrollment_id)} disabled={saving===s.enrollment_id}
                            style={{ padding:'5px 12px', background:'#10b981', color:'#fff', border:'none', borderRadius:6, fontSize:12, cursor:'pointer', fontWeight:600 }}>
                            {saving===s.enrollment_id ? '…' : '💾 Save'}
                          </button>
                        ) : <span style={{ color:'#9ca3af', fontSize:12 }}>🔒 Locked</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card title="Attendance Summary">
          <Table
            columns={[
              { key:'student_code', label:'Code' },
              { key:'full_name_en', label:'Name' },
              { key:'total_sessions', label:'Sessions' },
              { key:'attended_sessions', label:'Attended' },
              { key:'attendance_pct', label:'Attendance %', render: v => <span style={{ fontWeight:700, color: v < 42 ? '#ef4444' : v < 60 ? '#f59e0b' : '#10b981' }}>{v ? `${v}%` : '—'}</span> },
              { key:'below_minimum', label:'Below Min (42%)', render: v => v ? <span style={{ color:'#ef4444', fontWeight:700 }}>⚠️ Yes</span> : <span style={{ color:'#10b981' }}>✓</span> },
            ]}
            data={data.roster}
          />
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ADMIN PAGES
// ═══════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const s = data.stats;

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:24 }}>🛡️ Admin Dashboard</h1>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <Stat label="Active Students" value={s?.active_students||0} color="#10b981" icon="👨‍🎓" />
        <Stat label="Warning Students" value={s?.warning_students||0} color="#f59e0b" icon="⚠️" />
        <Stat label="Total Doctors" value={s?.total_doctors||0} color="#3b82f6" icon="👨‍🏫" />
        <Stat label="Active Courses" value={s?.active_courses||0} color="#8b5cf6" icon="📚" />
        <Stat label="Current Enrollments" value={s?.current_enrollments||0} color="#06b6d4" icon="📋" />
        <Stat label="Average CGPA" value={parseFloat(s?.avg_cgpa||0).toFixed(2)} color="#6366f1" icon="📊" />
        <Stat label="Dismissed Students" value={s?.dismissed_students||0} color="#ef4444" icon="🚫" />
        <Stat label="Graduated" value={s?.graduated_students||0} color="#0d9488" icon="🎓" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card title="📊 Students by Specialization">
          <Table
            columns={[
              { key:'specialization', label:'Specialization' },
              { key:'total', label:'Total' },
              { key:'active', label:'Active' },
              { key:'avg_cgpa', label:'Avg. CGPA', render: v => parseFloat(v||0).toFixed(3) },
            ]}
            data={data.specializationStats || []}
          />
        </Card>

        <Card title="⚠️ Recent Academic Warnings">
          <Table
            columns={[
              { key:'student_code', label:'Code' },
              { key:'full_name_en', label:'Name' },
              { key:'cgpa_at_warning', label:'CGPA', render: v => <span style={{ color:'#ef4444', fontWeight:700 }}>{parseFloat(v||0).toFixed(3)}</span> },
              { key:'semester_label', label:'Semester' },
            ]}
            data={data.recentWarnings || []}
          />
        </Card>
      </div>
    </div>
  );
};

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status:'', specialization:'', level:'' });

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getStudents({ search, ...filter }).then(r => setStudents(r.data.data)).finally(() => setLoading(false));
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>👨‍🎓 Students</h1>

      <Card>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name, code, national ID..."
            style={{ flex:1, minWidth:200, padding:'9px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14 }} />
          {[{label:'Status', key:'status', opts:['','active','warning','dismissed','graduated','on_leave']},{label:'Spec.', key:'specialization', opts:['','CS','IS','IT','SE']},{label:'Level', key:'level', opts:['','freshman','sophomore','junior','senior']}].map(f => (
            <select key={f.key} value={filter[f.key]} onChange={e => setFilter(prev => ({...prev, [f.key]: e.target.value}))}
              style={{ padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14 }}>
              {f.opts.map(o => <option key={o} value={o}>{o || `All ${f.label}`}</option>)}
            </select>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key:'student_code', label:'Code', render: v => <span style={{ fontFamily:'monospace', fontWeight:600 }}>{v}</span> },
              { key:'full_name_en', label:'Name' },
              { key:'specialization', label:'Spec.' },
              { key:'current_level', label:'Level' },
              { key:'cgpa', label:'CGPA', render: v => <span style={{ fontWeight:700, color: v < 2 ? '#ef4444' : v >= 3 ? '#10b981' : '#374151' }}>{parseFloat(v||0).toFixed(3)}</span> },
              { key:'total_credits_passed', label:'Credits' },
              { key:'semesters_enrolled', label:'Semesters' },
              { key:'academic_status', label:'Status', render: v => <StatusBadge status={v} /> },
              { key:'id', label:'Action', render: v => <Link to={`/admin/students/${v}`} style={{ color:'#3b82f6', textDecoration:'none', fontSize:13, fontWeight:600 }}>View →</Link> },
            ]}
            data={students}
          />
        )}
      </Card>
    </div>
  );
};

const AdminStudentDetailPage = () => {
  const { pathname } = useLocation();
  const studentId = pathname.split('/').pop();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    adminAPI.getStudentDetail(studentId).then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner />;
  if (!data) return <div>Not found</div>;

  const { student, transcript, gpaHistory, warnings, eligibility: e } = data;

  return (
    <div>
      <Link to="/admin/students" style={{ color:'#3b82f6', textDecoration:'none', fontSize:13 }}>← Back to Students</Link>
      <div style={{ display:'flex', gap:20, alignItems:'flex-start', margin:'16px 0 24px' }}>
        <div style={{ width:64, height:64, background:'#dbeafe', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>👨‍🎓</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>{student.full_name_en}</h1>
          <div style={{ color:'#6b7280', fontSize:14 }}>{student.full_name_ar} • {student.student_code} • {student.email}</div>
          <div style={{ marginTop:8, display:'flex', gap:8 }}>
            <StatusBadge status={student.academic_status} />
            <Badge label={student.specialization} color="#3b82f6" />
            <Badge label={student.current_level} color="#8b5cf6" />
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:32, fontWeight:900, color: student.cgpa < 2 ? '#ef4444' : student.cgpa >= 3 ? '#10b981' : '#3b82f6' }}>{parseFloat(student.cgpa||0).toFixed(3)}</div>
          <div style={{ fontSize:12, color:'#6b7280' }}>Cumulative GPA</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:20, flexWrap:'wrap' }}>
        {['overview','transcript','warnings','graduation'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'8px 18px', background: activeTab===tab ? '#3b82f6' : '#f1f5f9', color: activeTab===tab ? '#fff' : '#374151', border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, fontSize:13 }}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <Card title="📊 Academic Stats">
            {[['Student Code', student.student_code],['Enrollment Year', student.enrollment_year],['Specialization', student.specialization],['Current Level', student.current_level],['Credits Passed', `${student.total_credits_passed}/132`],['Semesters', student.semesters_enrolled],['Total Warnings', student.total_warnings],['Consecutive Warnings', student.consecutive_warnings]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f3f4f6', fontSize:14 }}>
                <span style={{ color:'#6b7280' }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card title="📈 GPA History">
            {gpaHistory.map((g, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f3f4f6', fontSize:13 }}>
                <span>{g.label}</span>
                <span><strong>{parseFloat(g.semester_gpa).toFixed(3)}</strong> <span style={{ color:'#9ca3af' }}>/ {parseFloat(g.cumulative_gpa).toFixed(3)} CGPA</span></span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === 'transcript' && (
        <Card title="📜 Transcript">
          <Table
            columns={[
              { key:'semester_label', label:'Semester' },
              { key:'course_code', label:'Code' },
              { key:'course_name_en', label:'Course' },
              { key:'credits', label:'Cr.' },
              { key:'total_grade', label:'Score', render: v => v ? `${v}%` : '—' },
              { key:'letter_grade', label:'Grade', render: v => v ? <span style={{ fontWeight:700, color:gradeColor(v) }}>{v}</span> : '—' },
              { key:'grade_points', label:'GPA Pts' },
            ]}
            data={transcript}
          />
        </Card>
      )}

      {activeTab === 'warnings' && (
        <Card title="⚠️ Academic Warnings">
          {warnings.length === 0 ? <p style={{ color:'#9ca3af', textAlign:'center', padding:16 }}>No warnings on record</p> : (
            <Table
              columns={[
                { key:'semester_label', label:'Semester' },
                { key:'warning_type', label:'Type' },
                { key:'cgpa_at_warning', label:'CGPA at Warning', render: v => <span style={{ color:'#ef4444', fontWeight:700 }}>{parseFloat(v||0).toFixed(3)}</span> },
                { key:'issued_at', label:'Date', render: v => formatDate(v) },
              ]}
              data={warnings}
            />
          )}
        </Card>
      )}

      {activeTab === 'graduation' && (
        <Card title="🎓 Graduation Eligibility">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              ['Credits (132)', e.credits_met, `${e.credits_passed}/132`],
              ['CGPA ≥ 2.0', e.cgpa_met, `CGPA: ${parseFloat(e.cgpa||0).toFixed(3)}`],
              ['Training 1', e.training1_done],
              ['Training 2', e.training2_done],
              ['Project 1', e.project1_done],
              ['Project 2', e.project2_done],
              ['No Failed Courses', e.no_pending_f_grades],
              ['Good Standing', e.status_ok],
            ].map(([label, met, detail]) => (
              <div key={label} style={{ display:'flex', gap:12, alignItems:'center', padding:12, background: met ? '#f0fdf4' : '#fef2f2', borderRadius:8 }}>
                <span style={{ fontSize:20 }}>{met ? '✅' : '❌'}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{label}</div>
                  {detail && <div style={{ fontSize:12, color:'#6b7280' }}>{detail}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, padding:16, background: e.is_eligible ? '#dcfce7' : '#fef2f2', borderRadius:10, border:`1px solid ${e.is_eligible ? '#86efac' : '#fca5a5'}` }}>
            <strong style={{ color: e.is_eligible ? '#15803d' : '#dc2626', fontSize:15 }}>
              {e.is_eligible ? '🎉 Eligible for Graduation' : '⏳ Not Yet Eligible for Graduation'}
            </strong>
          </div>
        </Card>
      )}
    </div>
  );
};

const AdminSemestersPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => adminAPI.getSemesters().then(r => setSemesters(r.data.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try {
      await adminAPI.updateSemesterStatus(id, status);
      toast.success(`Semester status updated to ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>📅 Semester Management</h1>
      <Card>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key:'label', label:'Semester' },
              { key:'year_label', label:'Academic Year' },
              { key:'semester_type', label:'Type', render: v => <Badge label={v} color={{ fall:'#3b82f6', spring:'#10b981', summer:'#f59e0b' }[v] || '#6b7280'} /> },
              { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
              { key:'start_date', label:'Start', render: v => formatDate(v) },
              { key:'end_date', label:'End', render: v => formatDate(v) },
              { key:'registration_end', label:'Reg. Deadline', render: v => formatDate(v) },
              { key:'id', label:'Actions', render: (id, row) => (
                <select defaultValue={row.status} onChange={e => changeStatus(id, e.target.value)}
                  style={{ padding:'5px 8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:12 }}>
                  {['upcoming','registration','active','grading','closed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )},
            ]}
            data={semesters}
          />
        )}
      </Card>
    </div>
  );
};

const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAcademicReport().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const dist = data.gpaDistribution;

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:24 }}>📈 Academic Reports</h1>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:24 }}>
        {[['Excellent (≥3.5)', dist?.excellent, '#10b981'],['Very Good (3-3.5)', dist?.very_good, '#3b82f6'],['Good (2.5-3)', dist?.good, '#8b5cf6'],['Satisfactory (2-2.5)', dist?.satisfactory, '#f59e0b'],['Below Average (<2)', dist?.below_average, '#ef4444']].map(([l,v,c]) => (
          <Stat key={l} label={l} value={v||0} color={c} />
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card title="🏆 Top Students (by CGPA)">
          <Table
            columns={[
              { key:'student_code', label:'Code' },
              { key:'full_name_en', label:'Name' },
              { key:'specialization', label:'Spec.' },
              { key:'cgpa', label:'CGPA', render: v => <span style={{ fontWeight:800, color:'#10b981' }}>{parseFloat(v||0).toFixed(3)}</span> },
            ]}
            data={data.topStudents || []}
          />
        </Card>
        <Card title="🚫 Dismissed Students">
          <Table
            columns={[
              { key:'student_code', label:'Code' },
              { key:'full_name_en', label:'Name' },
              { key:'cgpa', label:'CGPA', render: v => <span style={{ fontWeight:700, color:'#ef4444' }}>{parseFloat(v||0).toFixed(3)}</span> },
              { key:'total_warnings', label:'Warnings' },
            ]}
            data={data.dismissedStudents || []}
          />
        </Card>
      </div>
    </div>
  );
};

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', body:'', targetRole:'', isPinned: false });
  const [creating, setCreating] = useState(false);

  const load = () => adminAPI.getAnnouncements().then(r => setAnns(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminAPI.createAnnouncement({ ...form, isPinned: form.isPinned });
      toast.success('Announcement created!');
      setForm({ title:'', body:'', targetRole:'', isPinned: false });
      load();
    } catch (err) {
      toast.error('Failed to create');
    } finally { setCreating(false); }
  };

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>📢 Announcements</h1>
      <div style={{ display:'grid', gridTemplateColumns: user?.role === 'admin' ? '1fr 1fr' : '1fr', gap:20 }}>
        {user?.role === 'admin' && (
          <Card title="New Announcement">
            <form onSubmit={create}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', marginBottom:5, fontSize:13, fontWeight:600 }}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14, boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', marginBottom:5, fontSize:13, fontWeight:600 }}>Message</label>
                <textarea value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} required rows={4}
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14, boxSizing:'border-box', resize:'vertical' }} />
              </div>
              <div style={{ display:'flex', gap:12, marginBottom:14 }}>
                <select value={form.targetRole} onChange={e => setForm(f => ({...f, targetRole: e.target.value}))}
                  style={{ flex:1, padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14 }}>
                  <option value="">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="doctor">Doctors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer' }}>
                  <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({...f, isPinned: e.target.checked}))} />
                  📌 Pin
                </label>
              </div>
              <button type="submit" disabled={creating} style={{ width:'100%', padding:10, background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                {creating ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </Card>
        )}
        <Card title="All Announcements">
          {loading ? <Spinner /> : anns.length === 0 ? <p style={{ color:'#9ca3af', textAlign:'center', padding:16 }}>No announcements</p> : anns.map(a => (
            <div key={a.id} style={{ padding:'14px 0', borderBottom:'1px solid #f3f4f6' }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                {a.is_pinned && <span style={{ fontSize:14 }}>📌</span>}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{a.title}</div>
                  <p style={{ margin:0, fontSize:13, color:'#374151', lineHeight:1.5 }}>{a.body}</p>
                  <div style={{ marginTop:6, fontSize:11, color:'#9ca3af' }}>
                    By {a.created_by_name} • {formatDate(a.created_at)}
                    {a.target_role && <Badge label={`For ${a.target_role}s`} color="#8b5cf6" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PROTECTED ROUTE & APP ROUTER
// ═══════════════════════════════════════════════════════════
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontSize:14, color:'#6b7280' }}>Loading FCIT SRS…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <Layout>{children}</Layout>;
};

const NotificationsPage = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getNotifications().then(r => setNotifs(r.data.data)).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await studentAPI.markNotificationRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
  };

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>🔔 Notifications</h1>
      <Card>
        {loading ? <Spinner /> : notifs.length === 0 ? <p style={{ color:'#9ca3af', textAlign:'center', padding:24 }}>No notifications</p> : (
          notifs.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} style={{ padding:'14px 16px', borderBottom:'1px solid #f3f4f6', background: n.is_read ? '#fff' : '#eff6ff', cursor: n.is_read ? 'default' : 'pointer', display:'flex', gap:12 }}>
              <span style={{ fontSize:20 }}>{n.is_read ? '📭' : '📬'}</span>
              <div>
                <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize:14 }}>{n.title}</div>
                <div style={{ fontSize:13, color:'#4b5563', marginTop:2 }}>{n.message}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>{formatDate(n.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><CourseRegistrationPage /></ProtectedRoute>} />
          <Route path="/student/schedule" element={<ProtectedRoute allowedRoles={['student']}><StudentSchedulePage /></ProtectedRoute>} />
          <Route path="/student/transcript" element={<ProtectedRoute allowedRoles={['student']}><TranscriptPage /></ProtectedRoute>} />
          <Route path="/student/graduation" element={<ProtectedRoute allowedRoles={['student']}><GraduationStatusPage /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student','doctor','admin']}><NotificationsPage /></ProtectedRoute>} />

          {/* Doctor routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/courses" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/courses/:offeringId" element={<ProtectedRoute allowedRoles={['doctor','admin']}><CourseRosterPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentsPage /></ProtectedRoute>} />
          <Route path="/admin/students/:studentId" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentDetailPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/semesters" element={<ProtectedRoute allowedRoles={['admin']}><AdminSemestersPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AnnouncementsPage /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Minimal stub pages referenced in routes
const StudentSchedulePage = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sharedAPI.getSemesters().then(r => {
      const open = r.data.data.filter(s => ['registration','active','closed'].includes(s.status));
      setSemesters(open);
      if (open.length > 0) setSelectedSem(open[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedSem) return;
    setLoading(true);
    studentAPI.getSchedule(selectedSem.id).then(r => setSchedule(r.data.data)).finally(() => setLoading(false));
  }, [selectedSem]);

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20 }}>🗓 My Schedule</h1>
      <div style={{ marginBottom:16 }}>
        <select value={selectedSem?.id||''} onChange={e => setSelectedSem(semesters.find(s => s.id==e.target.value))}
          style={{ padding:'9px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14 }}>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <Card title={selectedSem?.label || 'Schedule'}>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key:'code', label:'Code' },
              { key:'name_en', label:'Course', render: (v,r) => <div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'#6b7280'}}>{r.name_ar}</div></div> },
              { key:'credits', label:'Credits' },
              { key:'section', label:'Section' },
              { key:'doctor_name', label:'Instructor' },
              { key:'room', label:'Room' },
              { key:'status', label:'Status', render: v => <StatusBadge status={v} /> },
              { key:'letter_grade', label:'Grade', render: v => v ? <span style={{ fontWeight:700, color:gradeColor(v) }}>{v}</span> : '—' },
              { key:'attendance_pct', label:'Attendance', render: v => <span style={{ color: v < 42 ? '#ef4444' : '#10b981', fontWeight:600 }}>{v ? `${v}%` : '—'}</span> },
            ]}
            data={schedule}
          />
        )}
      </Card>
    </div>
  );
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email:'', password:'', role:'student', fullNameAr:'', fullNameEn:'', nationalId:'', phone:'', specialization:'CS', enrollmentYear: new Date().getFullYear(), academicTitle:'Dr.' });

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getUsers({ search, role: roleFilter }).then(r => setUsers(r.data.data.users || [])).finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(form);
      toast.success('User created!');
      setShowCreate(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', margin:0 }}>👥 User Management</h1>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding:'9px 18px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer' }}>
          + Create User
        </button>
      </div>

      {showCreate && (
        <Card title="Create New User">
          <form onSubmit={create}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              {[['email','Email','email'],['password','Password','password'],['fullNameAr','Full Name (Arabic)','text'],['fullNameEn','Full Name (English)','text'],['nationalId','National ID','text'],['phone','Phone','text']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ display:'block', marginBottom:5, fontSize:13, fontWeight:600 }}>{l}</label>
                  <input type={t} value={form[k]||''} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} required={['email','password','fullNameAr','fullNameEn'].includes(k)}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14, boxSizing:'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:16 }}>
              <div>
                <label style={{ display:'block', marginBottom:5, fontSize:13, fontWeight:600 }}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14 }}>
                  <option value="student">Student</option><option value="doctor">Doctor</option><option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'student' && <div>
                <label style={{ display:'block', marginBottom:5, fontSize:13, fontWeight:600 }}>Specialization</label>
                <select value={form.specialization} onChange={e => setForm(f => ({...f, specialization: e.target.value}))} style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14 }}>
                  {['CS','IS','IT','SE'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>}
              {form.role === 'doctor' && <div>
                <label style={{ display:'block', marginBottom:5, fontSize:13, fontWeight:600 }}>Academic Title</label>
                <select value={form.academicTitle} onChange={e => setForm(f => ({...f, academicTitle: e.target.value}))} style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:14 }}>
                  {['Dr.','Prof.','Assoc. Prof.','Lect.'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" style={{ padding:'9px 20px', background:'#10b981', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer' }}>Create</button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding:'9px 20px', background:'#f1f5f9', border:'none', borderRadius:8, fontSize:14, cursor:'pointer' }}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search..."
            style={{ flex:1, padding:'9px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14 }} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14 }}>
            <option value="">All Roles</option><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="student">Student</option>
          </select>
        </div>
        {loading ? <Spinner /> : (
          <Table
            columns={[
              { key:'email', label:'Email' },
              { key:'full_name_en', label:'Name' },
              { key:'role', label:'Role', render: v => <Badge label={v} color={{ admin:'#6366f1', doctor:'#0891b2', student:'#0d9488' }[v]} /> },
              { key:'is_active', label:'Active', render: v => v ? <span style={{ color:'#10b981' }}>✅</span> : <span style={{ color:'#ef4444' }}>❌</span> },
              { key:'last_login', label:'Last Login', render: v => v ? formatDate(v) : 'Never' },
              { key:'created_at', label:'Created', render: v => formatDate(v) },
            ]}
            data={users}
          />
        )}
      </Card>
    </div>
  );
};
