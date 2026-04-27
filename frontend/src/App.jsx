import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, Link,
  useNavigate, useLocation, useParams
} from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { studentAPI, doctorAPI, adminAPI, sharedAPI, authAPI } from './services/api';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --font:'DM Sans',-apple-system,sans-serif;
      --mono:'DM Mono','Fira Code',monospace;
      --n0:#ffffff;--n50:#f8f9fb;--n100:#f1f3f7;--n200:#e4e8f0;
      --n300:#c8cfdc;--n400:#9aa3b5;--n500:#6b7589;--n600:#4a5368;
      --n700:#313a4f;--n800:#1e2535;--n900:#0f1623;
      --brand-50:#eef5ff;--brand-100:#d8e9ff;--brand-200:#b2d2ff;
      --brand-400:#4d94ff;--brand-500:#1a6dff;--brand-600:#0052e0;
      --brand-700:#003db3;
      --success-bg:#edfbf3;--success-bd:#86efac;--success-text:#166534;--success-bold:#15803d;
      --warn-bg:#fffbeb;--warn-bd:#fcd34d;--warn-text:#92400e;--warn-bold:#b45309;
      --danger-bg:#fff1f2;--danger-bd:#fda4af;--danger-text:#9f1239;--danger-bold:#be123c;
      --info-bg:#eff6ff;--info-bd:#93c5fd;--info-text:#1d4ed8;
      --admin-color:#7c3aed;--admin-bg:#f5f3ff;--admin-bd:#c4b5fd;
      --doctor-color:#0891b2;--doctor-bg:#ecfeff;--doctor-bd:#a5f3fc;
      --student-color:#059669;--student-bg:#ecfdf5;--student-bd:#a7f3d0;
      --sidebar-w:248px;
      --radius-sm:6px;--radius-md:9px;--radius-lg:13px;--radius-xl:18px;
      --shadow-xs:0 1px 2px rgba(15,22,35,0.06);
      --shadow-sm:0 1px 4px rgba(15,22,35,0.08),0 0 0 1px rgba(15,22,35,0.04);
    }
    html,body{height:100%}
    body{font-family:var(--font);background:var(--n50);color:var(--n800);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
    .sidebar{position:fixed;top:0;left:0;bottom:0;width:var(--sidebar-w);background:var(--n800);display:flex;flex-direction:column;z-index:200;border-right:1px solid rgba(255,255,255,0.06)}
    .sidebar-logo{padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px}
    .sidebar-logo-mark{width:36px;height:36px;border-radius:var(--radius-md);background:var(--brand-500);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .sidebar-logo-title{font-size:13px;font-weight:700;color:#fff;letter-spacing:0.2px;line-height:1.3}
    .sidebar-logo-sub{font-size:11px;color:rgba(255,255,255,0.4)}
    .sidebar-user{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08)}
    .sidebar-user-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:10px 12px;display:flex;align-items:center;gap:10px}
    .sidebar-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;letter-spacing:0.5px}
    .sidebar-user-name{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sidebar-user-role{font-size:10px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;margin-top:1px}
    .sidebar-nav{flex:1;padding:10px;overflow-y:auto}
    .sidebar-nav-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.28);padding:6px 8px 4px}
    .sidebar-link{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:var(--radius-sm);text-decoration:none;font-size:13.5px;font-weight:500;color:rgba(255,255,255,0.55);transition:all 0.13s;margin-bottom:2px;border-left:2px solid transparent}
    .sidebar-link:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.9)}
    .sidebar-link.active{background:rgba(255,255,255,0.1);color:#fff;border-left-color:var(--brand-400)}
    .sidebar-bottom{padding:12px 10px;border-top:1px solid rgba(255,255,255,0.08)}
    .sidebar-bottom-link{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:var(--radius-sm);text-decoration:none;font-size:13px;color:rgba(255,255,255,0.45);transition:all 0.13s;margin-bottom:2px}
    .sidebar-bottom-link:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8)}
    .sidebar-logout{width:100%;display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:var(--radius-sm);border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:500;font-family:var(--font);color:rgba(252,165,165,0.7);transition:all 0.13s;margin-top:2px}
    .sidebar-logout:hover{background:rgba(239,68,68,0.12);color:#fca5a5}
    .main-layout{margin-left:var(--sidebar-w);min-height:100vh}
    .page-content{padding:28px 32px;max-width:1280px}
    .card{background:var(--n0);border:1px solid var(--n200);border-radius:var(--radius-lg);box-shadow:var(--shadow-xs);overflow:hidden}
    .card-header{padding:16px 20px;border-bottom:1px solid var(--n100);display:flex;align-items:center;justify-content:space-between}
    .card-title{font-size:14px;font-weight:700;color:var(--n800)}
    .card-subtitle{font-size:12px;color:var(--n400);margin-top:1px}
    .card-body{padding:20px}
    .card-body-flush{padding:0}
    .stat-grid{display:grid;gap:14px}
    .stat-tile{background:var(--n0);border:1px solid var(--n200);border-radius:var(--radius-lg);padding:18px 20px;display:flex;align-items:flex-start;gap:14px;box-shadow:var(--shadow-xs);transition:box-shadow 0.15s}
    .stat-tile:hover{box-shadow:var(--shadow-sm)}
    .stat-icon{width:44px;height:44px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .stat-value{font-size:26px;font-weight:700;line-height:1;color:var(--n800);font-variant-numeric:tabular-nums}
    .stat-label{font-size:12px;color:var(--n400);margin-top:4px;font-weight:500}
    .data-table{width:100%;border-collapse:collapse;font-size:13.5px}
    .data-table thead tr{border-bottom:1.5px solid var(--n200)}
    .data-table th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:var(--n400);white-space:nowrap}
    .data-table td{padding:11px 14px;color:var(--n700);border-bottom:1px solid var(--n100)}
    .data-table tbody tr:last-child td{border-bottom:none}
    .data-table tbody tr:hover td{background:var(--n50)}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.3px;white-space:nowrap}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-md);font-size:13.5px;font-weight:600;font-family:var(--font);cursor:pointer;border:none;transition:all 0.13s;text-decoration:none;white-space:nowrap}
    .btn-primary{background:var(--brand-500);color:#fff}
    .btn-primary:hover{background:var(--brand-600)}
    .btn-primary:disabled{background:var(--n300);cursor:not-allowed}
    .btn-secondary{background:var(--n0);color:var(--n700);border:1px solid var(--n200);box-shadow:var(--shadow-xs)}
    .btn-secondary:hover{background:var(--n50);border-color:var(--n300)}
    .btn-danger{background:var(--danger-bg);color:var(--danger-bold);border:1px solid var(--danger-bd)}
    .btn-danger:hover{background:#ffe4e6}
    .btn-sm{padding:5px 11px;font-size:12.5px}
    .btn-xs{padding:3px 9px;font-size:12px;border-radius:var(--radius-sm)}
    .form-group{margin-bottom:18px}
    .form-label{display:block;font-size:12.5px;font-weight:700;color:var(--n600);margin-bottom:5px;letter-spacing:0.2px}
    .form-input,.form-select,.form-textarea{width:100%;padding:9px 13px;border:1.5px solid var(--n200);border-radius:var(--radius-md);font-size:14px;font-family:var(--font);color:var(--n800);background:var(--n0);outline:none;transition:border-color 0.15s,box-shadow 0.15s}
    .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--brand-400);box-shadow:0 0 0 3px var(--brand-50)}
    .form-input::placeholder{color:var(--n400)}
    .form-textarea{resize:vertical;min-height:90px}
    .tabs{display:flex;gap:2px;background:var(--n100);padding:3px;border-radius:var(--radius-md);width:fit-content}
    .tab-btn{padding:7px 16px;border-radius:var(--radius-sm);border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:600;font-family:var(--font);color:var(--n500);transition:all 0.13s}
    .tab-btn.active{background:var(--n0);color:var(--n800);box-shadow:var(--shadow-xs)}
    .tab-btn:hover:not(.active){color:var(--n700)}
    .status-active{background:var(--success-bg);color:var(--success-bold);border:1px solid var(--success-bd)}
    .status-warning{background:var(--warn-bg);color:var(--warn-bold);border:1px solid var(--warn-bd)}
    .status-dismissed{background:var(--danger-bg);color:var(--danger-bold);border:1px solid var(--danger-bd)}
    .status-graduated{background:#f5f3ff;color:#6d28d9;border:1px solid #c4b5fd}
    .status-on_leave{background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff}
    .status-probation{background:#fff7ed;color:#c2410c;border:1px solid #fdba74}
    .status-withdrawn{background:var(--n100);color:var(--n500);border:1px solid var(--n300)}
    .status-registration{background:var(--info-bg);color:var(--info-text);border:1px solid var(--info-bd)}
    .status-upcoming{background:#f5f3ff;color:#7c3aed;border:1px solid #c4b5fd}
    .status-closed{background:var(--n100);color:var(--n500);border:1px solid var(--n300)}
    .status-grading{background:var(--warn-bg);color:var(--warn-bold);border:1px solid var(--warn-bd)}
    .status-completed{background:var(--success-bg);color:var(--success-bold);border:1px solid var(--success-bd)}
    .status-registered{background:var(--info-bg);color:var(--info-text);border:1px solid var(--info-bd)}
    .grade-A{color:#065f46;font-weight:700}
    .grade-B{color:#1d4ed8;font-weight:700}
    .grade-C{color:#92400e;font-weight:700}
    .grade-D{color:#c2410c;font-weight:700}
    .grade-F{color:#be123c;font-weight:700}
    .grade-W{color:var(--n400);font-weight:600}
    .alert{padding:14px 18px;border-radius:var(--radius-md);border:1px solid;display:flex;align-items:flex-start;gap:12px;margin-bottom:20px}
    .alert-warn{background:var(--warn-bg);border-color:var(--warn-bd);color:var(--warn-text)}
    .alert-danger{background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-text)}
    .alert-success{background:var(--success-bg);border-color:var(--success-bd);color:var(--success-text)}
    .alert-info{background:var(--info-bg);border-color:var(--info-bd);color:var(--info-text)}
    .alert-icon{font-size:16px;margin-top:1px;flex-shrink:0}
    .alert-title{font-weight:700;font-size:13.5px;margin-bottom:2px}
    .alert-body{font-size:13px;line-height:1.5;opacity:.85}
    .page-header{margin-bottom:24px}
    .page-title{font-size:22px;font-weight:700;color:var(--n900);line-height:1.2}
    .page-subtitle{font-size:13.5px;color:var(--n400);margin-top:4px}
    .page-header-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
    .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--n400);margin-bottom:16px}
    .breadcrumb a{color:var(--brand-500);text-decoration:none;font-weight:500}
    .breadcrumb a:hover{text-decoration:underline}
    .breadcrumb-sep{color:var(--n300)}
    .spinner-wrap{display:flex;justify-content:center;align-items:center;padding:60px 20px}
    .spinner{width:28px;height:28px;border:2.5px solid var(--n200);border-top-color:var(--brand-500);border-radius:50%;animation:spin 0.75s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .empty-state{text-align:center;padding:48px 24px;color:var(--n400)}
    .empty-state-icon{font-size:32px;margin-bottom:12px;opacity:.4}
    .empty-state-text{font-size:14px}
    .gpa-bar-wrap{background:var(--n100);border-radius:4px;height:6px;overflow:hidden}
    .gpa-bar-fill{height:100%;border-radius:4px;transition:width 0.4s ease}
    .check-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--n100)}
    .check-item:last-child{border-bottom:none}
    .check-dot{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px}
    .check-dot-yes{background:var(--success-bg);color:var(--success-bold);border:1px solid var(--success-bd)}
    .check-dot-no{background:var(--danger-bg);color:var(--danger-bold);border:1px solid var(--danger-bd)}
    .ann-card{padding:14px 0;border-bottom:1px solid var(--n100)}
    .ann-card:last-child{border-bottom:none}
    .ann-pin{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--brand-600);margin-bottom:6px}
    .att-pct{font-size:13px;font-weight:700}
    .att-good{color:var(--success-bold)}
    .att-warn{color:var(--warn-bold)}
    .att-danger{color:var(--danger-bold)}
    .grade-input{width:64px;padding:5px 8px;border:1.5px solid var(--n200);border-radius:var(--radius-sm);font-size:13px;font-family:var(--mono);text-align:center;background:var(--n0);color:var(--n800);outline:none;transition:border-color 0.13s}
    .grade-input:focus{border-color:var(--brand-400);background:var(--brand-50)}
    .grade-input:disabled{background:var(--n100);color:var(--n400);cursor:not-allowed}
    .search-wrap{position:relative;flex:1;min-width:200px}
    .search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;color:var(--n400)}
    .search-input{padding-left:34px !important}
    .code-mono{font-family:var(--mono);font-size:13px;font-weight:500;color:var(--n700);letter-spacing:0.3px}
    .gpa-number{font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}
    .gpa-excellent{color:#065f46}.gpa-verygood{color:#1d4ed8}.gpa-good{color:#1e40af}.gpa-satisfactory{color:#92400e}.gpa-low{color:#be123c}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--n300);border-radius:4px}
    ::-webkit-scrollbar-thumb:hover{background:var(--n400)}
    a{color:var(--brand-500);text-decoration:none}
    a:hover{text-decoration:underline}
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES & PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-EG',{year:'numeric',month:'short',day:'numeric'}) : '—';
const fmtGPA  = (v) => (v!==undefined && v!==null) ? parseFloat(v).toFixed(3) : '—';
const gpaClass = (v) => { const n=parseFloat(v); if(n>=3.5)return'gpa-excellent'; if(n>=3.0)return'gpa-verygood'; if(n>=2.5)return'gpa-good'; if(n>=2.0)return'gpa-satisfactory'; return'gpa-low'; };
const gradeClass = (g) => { if(!g)return''; if(g.startsWith('A'))return'grade-A'; if(g.startsWith('B'))return'grade-B'; if(g.startsWith('C'))return'grade-C'; if(g.startsWith('D'))return'grade-D'; if(g==='F'||g==='Abs')return'grade-F'; return'grade-W'; };

const Spinner = () => <div className="spinner-wrap"><div className="spinner"/></div>;

const Badge = ({label,className='',style={}}) => <span className={`badge ${className}`} style={style}>{label}</span>;

const StatusBadge = ({status}) => {
  const labels={active:'Active',warning:'Warning',probation:'Probation',dismissed:'Dismissed',graduated:'Graduated',on_leave:'On Leave',withdrawn:'Withdrawn',registration:'Registration',upcoming:'Upcoming',closed:'Closed',grading:'Grading',completed:'Completed',registered:'Registered'};
  return <Badge className={`status-${status}`} label={labels[status]||status?.replace(/_/g,' ')} />;
};

const Card = ({children,title,subtitle,action,noPad=false,style={}}) => (
  <div className="card" style={style}>
    {(title||action) && (
      <div className="card-header">
        <div>{title&&<div className="card-title">{title}</div>}{subtitle&&<div className="card-subtitle">{subtitle}</div>}</div>
        {action&&<div>{action}</div>}
      </div>
    )}
    <div className={noPad?'card-body-flush':'card-body'}>{children}</div>
  </div>
);

const StatTile = ({label,value,icon,color='var(--brand-500)'}) => (
  <div className="stat-tile">
    <div className="stat-icon" style={{background:`${color}18`}}><span style={{fontSize:18}}>{icon}</span></div>
    <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
  </div>
);

const DataTable = ({columns,data,emptyMsg='No records found'}) => (
  <div style={{overflowX:'auto'}}>
    <table className="data-table">
      <thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead>
      <tbody>
        {data.length===0&&<tr><td colSpan={columns.length}><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">{emptyMsg}</div></div></td></tr>}
        {data.map((row,i)=>(
          <tr key={i}>{columns.map(c=><td key={c.key}>{c.render?c.render(row[c.key],row):(row[c.key]??'—')}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PageHeader = ({title,subtitle,action,breadcrumbs}) => (
  <div className="page-header">
    {breadcrumbs&&<div className="breadcrumb">{breadcrumbs.map((b,i)=><React.Fragment key={i}>{i>0&&<span className="breadcrumb-sep">/</span>}{b.to?<Link to={b.to}>{b.label}</Link>:<span>{b.label}</span>}</React.Fragment>)}</div>}
    <div className="page-header-row">
      <div><h1 className="page-title">{title}</h1>{subtitle&&<p className="page-subtitle">{subtitle}</p>}</div>
      {action&&<div>{action}</div>}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const {user,logout} = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const roleConfig = {
    admin:{color:'var(--admin-color)',roleLabel:'Administrator',nav:[
      {section:'Overview',links:[{to:'/admin',icon:'▦',label:'Dashboard'}]},
      {section:'Academic',links:[{to:'/admin/students',icon:'⊞',label:'Students'},{to:'/admin/semesters',icon:'⊟',label:'Semesters'},{to:'/admin/reports',icon:'▨',label:'Academic Reports'}]},
      {section:'System',links:[{to:'/admin/users',icon:'⊕',label:'User Management'},{to:'/admin/announcements',icon:'◈',label:'Announcements'}]},
    ]},
    doctor:{color:'var(--doctor-color)',roleLabel:'Faculty Member',nav:[
      {section:'Teaching',links:[{to:'/doctor',icon:'▦',label:'Dashboard'},{to:'/doctor/courses',icon:'⊞',label:'My Courses'}]},
      {section:'Communication',links:[{to:'/doctor/notifications',icon:'◉',label:'Notifications'}]},
    ]},
    student:{color:'var(--student-color)',roleLabel:'Student',nav:[
      {section:'Academics',links:[{to:'/student',icon:'▦',label:'Dashboard'},{to:'/student/courses',icon:'⊞',label:'Course Registration'},{to:'/student/schedule',icon:'⊟',label:'My Schedule'},{to:'/student/transcript',icon:'☰',label:'Transcript'},{to:'/student/graduation',icon:'◎',label:'Graduation Status'}]},
      {section:'Communication',links:[{to:'/student/notifications',icon:'◉',label:'Notifications'}]},
    ]},
  };

  const cfg = roleConfig[user?.role]||{nav:[],color:'var(--brand-500)',roleLabel:user?.role};
  const initials = (user?.fullNameEn||'').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)||'??';

  const isActive = (to) => {
    if(['/admin','/doctor','/student'].includes(to)) return loc.pathname===to;
    return loc.pathname.startsWith(to);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 6V10C3 14 6.5 17.7 10 18C13.5 17.7 17 14 17 10V6L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.2)"/>
            <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div><div className="sidebar-logo-title">FCIT Tanta</div><div className="sidebar-logo-sub">Registration System</div></div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar" style={{background:cfg.color+'33',color:cfg.color,border:`1px solid ${cfg.color}44`}}>{initials}</div>
          <div style={{minWidth:0}}>
            <div className="sidebar-user-name">{user?.fullNameEn}</div>
            <div className="sidebar-user-role" style={{color:cfg.color}}>{cfg.roleLabel}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {cfg.nav.map(section=>(
          <div key={section.section} style={{marginBottom:4}}>
            <div className="sidebar-nav-label">{section.section}</div>
            {section.links.map(link=>(
              <Link key={link.to} to={link.to} className={`sidebar-link ${isActive(link.to)?'active':''}`}>
                <span style={{fontSize:14,fontFamily:'monospace',width:18,textAlign:'center',flexShrink:0,opacity:0.8}}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Link to="/change-password" className="sidebar-bottom-link">
          <span style={{fontSize:14}}>🔒</span> Change Password
        </Link>
        <button className="sidebar-logout" onClick={()=>{logout();navigate('/login');}}>
          <span style={{fontSize:14}}>→</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

const Layout = ({children}) => (
  <div style={{display:'flex'}}>
    <Sidebar/>
    <main className="main-layout"><div className="page-content">{children}</div></main>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const {login,user} = useAuth();
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);
  const [showPw,setShowPw] = useState(false);

  useEffect(()=>{ if(user) navigate(`/${user.role}`,{replace:true}); },[user,navigate]);

  const handleLogin = async(e) => {
    e.preventDefault(); setLoading(true);
    try {
      const {user:u} = await login(email,password);
      toast.success(`Welcome back, ${u.fullNameEn}!`);
      navigate(u.mustChangePw?'/change-password':`/${u.role}`,{replace:true});
    } catch(err) { toast.error(err.response?.data?.message||'Invalid credentials'); }
    finally { setLoading(false); }
  };

  const demos=[
    {role:'Admin',email:'admin@fci.tanta.edu.eg',pw:'Admin@2026!',color:'#7c3aed',badge:'ADM'},
    {role:'Doctor',email:'dr.ahmed@fci.tanta.edu.eg',pw:'Doctor@2026!',color:'#0891b2',badge:'DR'},
    {role:'Student',email:'s.2024cs001@fci.tanta.edu.eg',pw:'Student@2026!',color:'#059669',badge:'STD'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'var(--n900)',display:'flex'}}>
      <GlobalStyles/>
      {/* Left panel */}
      <div style={{width:'42%',minHeight:'100vh',flexShrink:0,background:'linear-gradient(160deg,#0f1623 0%,#1e2535 50%,#12223d 100%)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'48px 52px',borderRight:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{width:52,height:52,background:'var(--brand-500)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32}}>
          <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 6V10C3 14 6.5 17.7 10 18C13.5 17.7 17 14 17 10V6L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.2)"/>
            <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'var(--brand-400)',marginBottom:12}}>Faculty of Computers & Informatics</div>
        <h1 style={{fontSize:30,fontWeight:700,color:'#fff',lineHeight:1.25,marginBottom:16}}>Student Registration<br/>System</h1>
        <p style={{color:'rgba(255,255,255,0.42)',fontSize:14.5,lineHeight:1.7,maxWidth:340}}>Tanta University's academic management platform — covering course registration, grade entry, bylaw enforcement, and graduation clearance.</p>
        <div style={{marginTop:44,display:'flex',flexDirection:'column',gap:14}}>
          {[['Academic Bylaws','Automated enforcement of 2024 faculty regulations'],['Role-Based Access','Separate portals for students, faculty & admin'],['Real-Time Status','Live GPA, attendance, and graduation tracking']].map(([t,d])=>(
            <div key={t} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--brand-400)',marginTop:7,flexShrink:0}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.78)'}}>{t}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.32)'}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'48px 52px',background:'#f8f9fb'}}>
        <div style={{width:'100%',maxWidth:400}}>
          <h2 style={{fontSize:24,fontWeight:700,color:'var(--n900)',marginBottom:6}}>Sign in</h2>
          <p style={{fontSize:14,color:'var(--n400)',marginBottom:32}}>Enter your university credentials to continue</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">University Email</label>
              <input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus placeholder="user@fci.tanta.edu.eg"/>
            </div>
            <div className="form-group" style={{marginBottom:28}}>
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} className="form-input" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={{paddingRight:40}}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--n400)',fontSize:16}}>
                  {showPw?'🙈':'👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',padding:'11px 0',fontSize:15,justifyContent:'center'}}>
              {loading?'Signing in…':'Sign In →'}
            </button>
          </form>
          <div style={{marginTop:36}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase',color:'var(--n400)',marginBottom:12,textAlign:'center'}}>Demo Access</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {demos.map(d=>(
                <button key={d.role} onClick={()=>{setEmail(d.email);setPassword(d.pw);}}
                  style={{padding:'10px 8px',background:'var(--n0)',border:`1px solid ${d.color}33`,borderRadius:10,cursor:'pointer',textAlign:'center',transition:'all 0.13s',fontFamily:'var(--font)'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=d.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=d.color+'33'}>
                  <div style={{width:28,height:28,borderRadius:8,background:d.color+'18',color:d.color,fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 6px',letterSpacing:.5}}>{d.badge}</div>
                  <div style={{fontSize:12,fontWeight:700,color:d.color}}>{d.role}</div>
                </button>
              ))}
            </div>
          </div>
          <p style={{textAlign:'center',fontSize:12,color:'var(--n300)',marginTop:36}}>© {new Date().getFullYear()} Faculty of Computers &amp; Informatics, Tanta University</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [form,setForm] = useState({currentPassword:'',newPassword:'',confirmPassword:''});
  const [loading,setLoading] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(form.newPassword!==form.confirmPassword){toast.error('Passwords do not match');return;}
    setLoading(true);
    try {
      await authAPI.changePassword(form.currentPassword,form.newPassword);
      toast.success('Password changed successfully!');
      navigate(-1);
    } catch(err){toast.error(err.response?.data?.message||'Failed to change password');}
    finally{setLoading(false);}
  };

  return (
    <div style={{maxWidth:440}}>
      <PageHeader title="Change Password" subtitle="Update your account credentials"/>
      <Card>
        <form onSubmit={handleSubmit}>
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([k,l])=>(
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input type="password" className="form-input" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} required/>
            </div>
          ))}
          <p style={{fontSize:12,color:'var(--n400)',marginBottom:20,lineHeight:1.6}}>Minimum 8 characters — must include uppercase, lowercase, a number, and a special character (@$!%*?&#).</p>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
            {loading?'Saving…':'Update Password'}
          </button>
        </form>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT PAGES
// ─────────────────────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ studentAPI.getDashboard().then(r=>setData(r.data.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false)); },[]);
  if(loading)return<Spinner/>;
  if(!data)return null;
  const {student,currentSemester,schedule,recentGPA,warnings} = data;
  const cgpa = parseFloat(student?.cgpa||0);
  return (
    <div>
      <PageHeader title={`Welcome back, ${student?.student_code||'—'}`} subtitle={`${student?.specialization||'—'} · ${student?.current_level||'—'} Level`}/>
      {warnings?.length>0&&(
        <div className="alert alert-warn">
          <span className="alert-icon">⚠</span>
          <div><div className="alert-title">Academic Warning Active</div>
          <div className="alert-body">You have {warnings.length} academic warning(s). Maintain CGPA ≥ 2.0 to avoid dismissal. <Link to="/student/transcript">View transcript →</Link></div></div>
        </div>
      )}
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:24}}>
        <StatTile label="Cumulative GPA" value={<span className={`gpa-number ${gpaClass(cgpa)}`}>{fmtGPA(cgpa)}</span>} icon="📊" color="var(--brand-500)"/>
        <StatTile label="Credits Passed" value={`${student?.total_credits_passed||0} / 132`} icon="✅" color="#059669"/>
        <StatTile label="Academic Level" value={<span style={{fontSize:18,textTransform:'capitalize'}}>{student?.current_level||'—'}</span>} icon="📈" color="#7c3aed"/>
        <StatTile label="Standing" value={<StatusBadge status={student?.academic_status}/>} icon="🎯" color="#f59e0b"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        <Card title={`Current Semester${currentSemester?` — ${currentSemester.label}`:''}`} subtitle={currentSemester?<StatusBadge status={currentSemester.status}/>:'No active semester'} action={currentSemester?.status==='registration'&&<Link className="btn btn-primary btn-sm" to="/student/courses">+ Register</Link>} noPad>
          {!schedule?.length?(
            <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No courses registered this semester</div></div>
          ):(
            <DataTable columns={[
              {key:'code',label:'Code',render:v=><span className="code-mono">{v}</span>},
              {key:'name_en',label:'Course',render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'var(--n400)'}}>{r.credits} cr</div></div>},
              {key:'doctor_name',label:'Instructor'},
              {key:'attendance_pct',label:'Attendance',render:v=><span className={`att-pct ${!v?'':v<42?'att-danger':v<60?'att-warn':'att-good'}`}>{v?`${v}%`:'—'}</span>},
              {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
            ]} data={schedule||[]}/>
          )}
        </Card>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card title="GPA History">
            {!recentGPA?.length?<div style={{color:'var(--n400)',fontSize:13,textAlign:'center',padding:16}}>No GPA history yet</div>:
              recentGPA.map((g,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<recentGPA.length-1?'1px solid var(--n100)':'none'}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:'var(--n700)'}}>{g.label}</div><div style={{fontSize:11,color:'var(--n400)'}}>{g.classification}</div></div>
                  <div style={{textAlign:'right'}}><div className={`gpa-number ${gpaClass(g.semester_gpa)}`} style={{fontWeight:700}}>{fmtGPA(g.semester_gpa)}</div><div style={{fontSize:11,color:'var(--n400)'}}>CGPA {fmtGPA(g.cumulative_gpa)}</div></div>
                </div>
              ))
            }
          </Card>
          <Card title="Quick Access">
            {[{to:'/student/courses',label:'Course Registration',icon:'📚'},{to:'/student/transcript',label:'View Transcript',icon:'📜'},{to:'/student/graduation',label:'Graduation Status',icon:'🎓'}].map(l=>(
              <Link key={l.to} to={l.to} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--n100)',color:'var(--n700)',textDecoration:'none',fontSize:13,fontWeight:500}}>
                <span style={{fontSize:16}}>{l.icon}</span>{l.label}<span style={{marginLeft:'auto',color:'var(--n300)'}}>→</span>
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

const CourseRegistrationPage = () => {
  const [semesters,setSemesters] = useState([]);
  const [selectedSem,setSelectedSem] = useState(null);
  const [courses,setCourses] = useState([]);
  const [loading,setLoading] = useState(false);
  const [registering,setRegistering] = useState(null);
  const [dropping,setDropping] = useState(null);
  const [search,setSearch] = useState('');

  useEffect(()=>{ sharedAPI.getSemesters().then(r=>{const open=r.data.data.filter(s=>['registration','active'].includes(s.status));setSemesters(open);if(open.length)setSelectedSem(open[0]);}); },[]);
  useEffect(()=>{ if(!selectedSem)return; setLoading(true); studentAPI.getAvailableCourses(selectedSem.id).then(r=>setCourses(r.data.data)).catch(()=>toast.error('Failed to load courses')).finally(()=>setLoading(false)); },[selectedSem]);

  const reload = async()=>{ if(!selectedSem)return; const r=await studentAPI.getAvailableCourses(selectedSem.id); setCourses(r.data.data); };

  const handleRegister = async(offeringId,code)=>{ setRegistering(offeringId); try{ await studentAPI.registerCourse(offeringId); toast.success(`Registered for ${code}`); await reload(); }catch(err){toast.error(err.response?.data?.message||'Registration failed');}finally{setRegistering(null);} };
  const handleDrop = async(enrollmentId,code)=>{ if(!window.confirm(`Drop ${code}?`))return; setDropping(enrollmentId); try{ await studentAPI.dropCourse(enrollmentId); toast.success(`${code} dropped`); await reload(); }catch(err){toast.error(err.response?.data?.message||'Drop failed');}finally{setDropping(null);} };

  const catLabels={university_req:'University Requirements',math_science:'Math & Science',basic_computing:'Basic Computing',applied_computing:'Applied Computing',elective:'Elective Courses',project:'Graduation Project',training:'Field Training'};
  const catColors={university_req:'#7c3aed',math_science:'#d97706',basic_computing:'var(--brand-500)',applied_computing:'#059669',elective:'#0891b2',project:'#dc2626',training:'#db2777'};

  const filtered = courses.filter(c=>!search||c.name_en?.toLowerCase().includes(search.toLowerCase())||c.code?.toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc,c)=>{const g=c.category||'other';acc[g]=acc[g]||[];acc[g].push(c);return acc;},{});

  return (
    <div>
      <PageHeader title="Course Registration" subtitle={selectedSem?`${selectedSem.label} — Registration window`:'Select an open semester'}/>
      {semesters.length===0?(
        <Card><div className="alert alert-info" style={{margin:0}}><span className="alert-icon">ℹ</span><div><div className="alert-title">Registration Closed</div><div className="alert-body">Course registration is not currently open.</div></div></div></Card>
      ):(
        <>
          <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
            <select className="form-select" style={{width:'auto'}} value={selectedSem?.id||''} onChange={e=>setSelectedSem(semesters.find(s=>s.id===e.target.value))}>
              {semesters.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div className="search-wrap"><span className="search-icon">🔍</span><input className="form-input search-input" placeholder="Search courses…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          </div>
          {loading?<Spinner/>:Object.entries(grouped).map(([cat,items])=>{
            const registered=items.filter(c=>c.already_registered).length;
            return (
              <div key={cat} style={{marginBottom:20}}>
                <Card title={<div style={{display:'flex',alignItems:'center',gap:10}}><span style={{width:10,height:10,borderRadius:'50%',background:catColors[cat]||'var(--n400)',display:'inline-block'}}/>{catLabels[cat]||cat}</div>} subtitle={`${items.length} courses · ${registered} registered`} noPad>
                  <DataTable columns={[
                    {key:'code',label:'Code',render:v=><span className="code-mono">{v}</span>},
                    {key:'name_en',label:'Course',render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'var(--n400)'}}>{r.doctor_name||'—'}</div></div>},
                    {key:'credits',label:'Cr.',render:v=><Badge label={`${v} cr`} style={{background:'var(--n100)',color:'var(--n600)'}}/>},
                    {key:'enrolled_count',label:'Seats',render:(v,r)=><span style={{color:v>=r.capacity?'var(--danger-bold)':'var(--success-bold)',fontWeight:600,fontSize:12}}>{v}/{r.capacity}</span>},
                    {key:'already_registered',label:'Status / Action',render:(v,r)=>{
                      if(v)return<div style={{display:'flex',alignItems:'center',gap:8}}><span style={{color:'var(--success-bold)',fontWeight:700,fontSize:12.5}}>✓ Enrolled</span><button className="btn btn-danger btn-xs" disabled={dropping===r.enrollment_id} onClick={()=>handleDrop(r.enrollment_id,r.code)}>{dropping===r.enrollment_id?'…':'Drop'}</button></div>;
                      if(!r.can_register)return<span style={{fontSize:12,color:'var(--n400)'}} title={r.register_block_reason}>🔒 {(r.register_block_reason||'').slice(0,36)}{(r.register_block_reason||'').length>36?'…':''}</span>;
                      return<button className="btn btn-primary btn-sm" disabled={registering===r.offering_id} onClick={()=>handleRegister(r.offering_id,r.code)}>{registering===r.offering_id?'…':'+ Register'}</button>;
                    }},
                  ]} data={items}/>
                </Card>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

const StudentSchedulePage = () => {
  const [semesters,setSemesters] = useState([]);
  const [selectedSem,setSelectedSem] = useState(null);
  const [schedule,setSchedule] = useState([]);
  const [loading,setLoading] = useState(false);
  useEffect(()=>{ sharedAPI.getSemesters().then(r=>{const open=r.data.data.filter(s=>['registration','active','closed','grading'].includes(s.status));setSemesters(open);if(open.length)setSelectedSem(open[0]);}); },[]);
  useEffect(()=>{ if(!selectedSem)return; setLoading(true); studentAPI.getSchedule(selectedSem.id).then(r=>setSchedule(r.data.data)).finally(()=>setLoading(false)); },[selectedSem]);
  return (
    <div>
      <PageHeader title="My Schedule" subtitle="Current semester course schedule and attendance"/>
      <div style={{marginBottom:20}}><select className="form-select" style={{width:'auto'}} value={selectedSem?.id||''} onChange={e=>setSelectedSem(semesters.find(s=>s.id===e.target.value))}>{semesters.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      <Card title={selectedSem?.label||'Schedule'} noPad>
        {loading?<Spinner/>:(
          <DataTable columns={[
            {key:'code',label:'Code',render:v=><span className="code-mono">{v}</span>},
            {key:'name_en',label:'Course',render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'var(--n400)'}}>{r.name_ar}</div></div>},
            {key:'credits',label:'Cr.'},{key:'section',label:'Sec.'},{key:'doctor_name',label:'Instructor'},{key:'room',label:'Room'},
            {key:'attendance_pct',label:'Attendance',render:v=><span className={`att-pct ${!v?'':v<42?'att-danger':v<60?'att-warn':'att-good'}`}>{v?`${v}%`:'—'}</span>},
            {key:'letter_grade',label:'Grade',render:v=>v?<span className={gradeClass(v)}>{v}</span>:'—'},
          ]} data={schedule}/>
        )}
      </Card>
    </div>
  );
};

const TranscriptPage = () => {
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ studentAPI.getTranscript().then(r=>setData(r.data.data)).finally(()=>setLoading(false)); },[]);
  if(loading)return<Spinner/>;
  if(!data)return null;
  const {student,courses,gpaHistory} = data;
  const bySemester = courses.reduce((acc,c)=>{const k=c.semester_label;acc[k]=acc[k]||[];acc[k].push(c);return acc;},{});
  return (
    <div>
      <PageHeader title="Official Transcript" subtitle="Faculty of Computers & Informatics, Tanta University" action={<button className="btn btn-secondary" onClick={()=>window.print()}>🖨 Print</button>}/>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:24}}>
        <StatTile label="Cumulative GPA" value={<span className={`gpa-number ${gpaClass(student?.cgpa)}`}>{fmtGPA(student?.cgpa)}</span>} icon="📊"/>
        <StatTile label="Credits Passed" value={student?.totalCreditsPassed} icon="✅" color="#059669"/>
        <StatTile label="Classification" value={<span style={{fontSize:15}}>{student?.gpaClassification||'—'}</span>} icon="🏆" color="#7c3aed"/>
        <StatTile label="Level" value={<span style={{textTransform:'capitalize',fontSize:18}}>{student?.currentLevel||'—'}</span>} icon="📚" color="#d97706"/>
      </div>
      {student?.cgpa&&(
        <Card title="Academic Standing" style={{marginBottom:20}}>
          <div style={{marginBottom:8,display:'flex',justifyContent:'space-between',fontSize:13}}>
            <span style={{color:'var(--n500)'}}>CGPA Progress</span>
            <span className={`gpa-number ${gpaClass(student.cgpa)}`} style={{fontWeight:700}}>{fmtGPA(student.cgpa)} / 4.000</span>
          </div>
          <div className="gpa-bar-wrap"><div className="gpa-bar-fill" style={{width:`${Math.min(100,(parseFloat(student.cgpa)/4)*100)}%`,background:parseFloat(student.cgpa)>=3.0?'#22c55e':parseFloat(student.cgpa)>=2.0?'#f59e0b':'#ef4444'}}/></div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--n400)',marginTop:6}}><span>0.0 — Dismissal threshold (2.0)</span><span>Excellent (3.5+)</span></div>
        </Card>
      )}
      {Object.entries(bySemester).map(([sem,items])=>{
        const semGPA=gpaHistory.find(g=>g.label===sem);
        return (
          <div key={sem} style={{marginBottom:16}}>
            <Card title={sem} subtitle={semGPA?`Semester GPA: ${fmtGPA(semGPA.semester_gpa)} · Cumulative: ${fmtGPA(semGPA.cumulative_gpa)}`:''} noPad>
              <DataTable columns={[
                {key:'course_code',label:'Code',render:v=><span className="code-mono">{v}</span>},
                {key:'course_name_en',label:'Course'},{key:'credits',label:'Cr.'},
                {key:'total_grade',label:'Score',render:v=>v?`${v}%`:'—'},
                {key:'letter_grade',label:'Grade',render:v=>v?<span className={gradeClass(v)}>{v}</span>:'—'},
                {key:'grade_points',label:'GPA Pts'},
                {key:'enrollment_status',label:'Status',render:(v,r)=><span style={{fontSize:12,color:r.is_counted_in_gpa?'var(--n600)':'var(--n400)'}}>{v}{r.attempt_number>1?` (Attempt ${r.attempt_number})`:''}</span>},
              ]} data={items}/>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

const GraduationStatusPage = () => {
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ studentAPI.getGraduationStatus().then(r=>setData(r.data.data)).finally(()=>setLoading(false)); },[]);
  if(loading)return<Spinner/>;
  if(!data)return null;
  const {eligibility:e,honors:h} = data;
  const checks=[
    {label:`Credit Hours (${e.credits_passed||0}/132)`,met:e.credits_met,detail:e.credits_passed>=132?'All 132 required credits passed':`${132-(e.credits_passed||0)} credits remaining`},
    {label:'Minimum CGPA ≥ 2.0',met:e.cgpa_met,detail:`Current CGPA: ${fmtGPA(e.cgpa)}`},
    {label:'Summer Training (1)',met:e.training1_done,detail:'Required after 66 credits'},
    {label:'Summer Training (2)',met:e.training2_done,detail:'Required after 102 credits'},
    {label:'Graduation Project (Phase 1)',met:e.project1_done},{label:'Graduation Project (Phase 2)',met:e.project2_done},
    {label:'No Outstanding Failed Courses',met:e.no_pending_f_grades},{label:'Academic Standing',met:e.status_ok},
    {label:'Remedial Requirements (if applicable)',met:e.remedial_math_ok},
  ];
  return (
    <div>
      <PageHeader title="Graduation Status" subtitle="Track your progress toward degree completion"/>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        <Card title="Degree Requirements Checklist">
          {checks.map((c,i)=>(
            <div key={i} className="check-item">
              <div className={`check-dot ${c.met?'check-dot-yes':'check-dot-no'}`}>{c.met?'✓':'✕'}</div>
              <div><div style={{fontWeight:600,fontSize:13.5,color:c.met?'var(--n700)':'var(--n500)'}}>{c.label}</div>{c.detail&&<div style={{fontSize:12,color:'var(--n400)'}}>{c.detail}</div>}</div>
            </div>
          ))}
          <div style={{marginTop:20,padding:'14px 18px',background:e.is_eligible?'var(--success-bg)':'var(--danger-bg)',border:`1px solid ${e.is_eligible?'var(--success-bd)':'var(--danger-bd)'}`,borderRadius:'var(--radius-md)'}}>
            <div style={{fontSize:15,fontWeight:800,color:e.is_eligible?'var(--success-bold)':'var(--danger-bold)'}}>{e.is_eligible?'🎉 Eligible for Graduation':'⏳ Requirements Not Yet Met'}</div>
          </div>
        </Card>
        <Card title="Honors Degree Eligibility">
          <p style={{fontSize:13,color:'var(--n400)',marginBottom:16,lineHeight:1.6}}>Requires CGPA ≥ 3.0, all grades ≥ Very Good, completion within 8 semesters, and no warnings.</p>
          {h.eligible?(
            <div style={{padding:20,background:'#fefce8',border:'1px solid #fde047',borderRadius:'var(--radius-md)',textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:8}}>🥇</div><div style={{fontWeight:800,color:'#854d0e',fontSize:15}}>Honors Degree Eligible!</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:12,color:'var(--n400)',marginBottom:8}}>Outstanding requirements:</div>
              {h.reasons?.map((r,i)=><div key={i} style={{padding:'6px 0',borderBottom:'1px solid var(--n100)',fontSize:13,color:'var(--n600)',display:'flex',alignItems:'center',gap:8}}><span style={{color:'var(--danger-bold)'}}>✕</span>{r}</div>)}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const [notifs,setNotifs] = useState([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ studentAPI.getNotifications().then(r=>setNotifs(r.data.data)).finally(()=>setLoading(false)); },[]);
  const markRead = async(id)=>{ await studentAPI.markNotificationRead(id); setNotifs(prev=>prev.map(n=>n.id===id?{...n,is_read:true}:n)); };
  const unread = notifs.filter(n=>!n.is_read).length;
  return (
    <div>
      <PageHeader title="Notifications" subtitle={unread>0?`${unread} unread`:'All caught up'}/>
      <Card noPad>
        {loading?<Spinner/>:notifs.length===0?(
          <div className="empty-state"><div className="empty-state-icon">🔔</div><div className="empty-state-text">No notifications</div></div>
        ):notifs.map(n=>(
          <div key={n.id} onClick={()=>!n.is_read&&markRead(n.id)} style={{padding:'14px 20px',borderBottom:'1px solid var(--n100)',background:n.is_read?'transparent':'var(--brand-50)',cursor:n.is_read?'default':'pointer',display:'flex',gap:14,alignItems:'flex-start'}}>
            <div style={{width:8,height:8,borderRadius:'50%',marginTop:6,background:n.is_read?'var(--n200)':'var(--brand-500)',flexShrink:0}}/>
            <div>
              <div style={{fontWeight:n.is_read?500:700,fontSize:14,color:'var(--n800)'}}>{n.title}</div>
              <div style={{fontSize:13,color:'var(--n500)',marginTop:2}}>{n.message}</div>
              <div style={{fontSize:11,color:'var(--n300)',marginTop:4}}>{fmtDate(n.created_at)}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR PAGES
// ─────────────────────────────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ doctorAPI.getDashboard().then(r=>setData(r.data.data)).finally(()=>setLoading(false)); },[]);
  if(loading)return<Spinner/>;
  if(!data)return null;
  return (
    <div>
      <PageHeader title={`${data.doctor?.academic_title||''} Dashboard`} subtitle={data.doctor?.department_name||'—'}/>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:24}}>
        <StatTile label="Total Courses" value={data.courses?.length||0} icon="📖" color="var(--brand-500)"/>
        <StatTile label="Pending Grade Entry" value={data.pendingGradeCount||0} icon="⏳" color="#d97706"/>
        <StatTile label="Active This Semester" value={data.courses?.filter(c=>c.semester_status==='active').length||0} icon="✅" color="#059669"/>
      </div>
      {data.pendingGradeCount>0&&(
        <div className="alert alert-warn"><span className="alert-icon">⚠</span>
          <div><div className="alert-title">Grades Pending</div><div className="alert-body">{data.pendingGradeCount} students are awaiting grade entry across your current courses.</div></div>
        </div>
      )}
      <Card title="My Courses" noPad>
        <DataTable columns={[
          {key:'course_code',label:'Code',render:v=><span className="code-mono">{v}</span>},
          {key:'course_name',label:'Course',render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'var(--n400)'}}>Section {r.section}</div></div>},
          {key:'semester',label:'Semester'},{key:'semester_status',label:'Status',render:v=><StatusBadge status={v}/>},
          {key:'enrolled_count',label:'Students',render:(v,r)=>`${v} / ${r.capacity}`},
          {key:'offering_id',label:'Action',render:v=><Link className="btn btn-primary btn-sm" to={`/doctor/courses/${v}`}>Open Roster</Link>},
        ]} data={data.courses||[]} emptyMsg="No courses assigned"/>
      </Card>
    </div>
  );
};

const CourseRosterPage = () => {
  const {offeringId} = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [grades,setGrades] = useState({});
  const [saving,setSaving] = useState(null);
  const [tab,setTab] = useState('grades');

  useEffect(()=>{
    doctorAPI.getCourseRoster(offeringId).then(r=>{
      setData(r.data.data);
      const g={};
      r.data.data.roster.forEach(s=>{g[s.enrollment_id]={midterm_grade:s.midterm_grade??'',coursework_grade:s.coursework_grade??'',practical_grade:s.practical_grade??'',final_exam_grade:s.final_exam_grade??''};});
      setGrades(g);
    }).finally(()=>setLoading(false));
  },[offeringId]);

  const saveGrade = async(enrollmentId)=>{
    setSaving(enrollmentId);
    try{
      const g=grades[enrollmentId];
      await doctorAPI.enterGrades(enrollmentId,{midterm_grade:parseFloat(g.midterm_grade)||0,coursework_grade:parseFloat(g.coursework_grade)||0,practical_grade:parseFloat(g.practical_grade)||0,final_exam_grade:parseFloat(g.final_exam_grade)||0});
      toast.success('Grades saved');
      const r=await doctorAPI.getCourseRoster(offeringId); setData(r.data.data);
    }catch(err){toast.error(err.response?.data?.message||'Failed to save');}
    finally{setSaving(null);}
  };

  if(loading)return<Spinner/>;
  if(!data)return null;
  return (
    <div>
      <div className="breadcrumb"><Link to="/doctor">Dashboard</Link><span className="breadcrumb-sep">/</span><span>Course Roster</span></div>
      <PageHeader title={`${data.offering?.code} — ${data.offering?.name_en}`} subtitle={`Section ${data.offering?.section} · ${data.offering?.semester_label} · ${data.totalStudents} students`}/>
      <div style={{marginBottom:20}}><div className="tabs">{[['grades','📝 Grade Entry'],['attendance','📋 Attendance']].map(([k,l])=><button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div></div>

      {tab==='grades'&&(
        <Card title="Grade Entry" subtitle="Enter component grades. System calculates totals and letter grades automatically.">
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr>{['Student Code','Name','Midterm (20%)','Coursework (10%)','Practical (10%)','Final (60%)','Total','Grade','Action'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {data.roster.map((s)=>{
                  const g=grades[s.enrollment_id]||{};
                  const editable=!s.grade_locked;
                  return (
                    <tr key={s.enrollment_id}>
                      <td><span className="code-mono">{s.student_code}</span></td>
                      <td style={{fontWeight:500}}>{s.full_name_en}</td>
                      {['midterm_grade','coursework_grade','practical_grade','final_exam_grade'].map(field=>(
                        <td key={field}><input type="number" min={0} max={100} step={0.5} value={g[field]??''} onChange={e=>setGrades(prev=>({...prev,[s.enrollment_id]:{...prev[s.enrollment_id],[field]:e.target.value}}))} disabled={!editable} className="grade-input"/></td>
                      ))}
                      <td style={{fontWeight:700}}>{s.total_grade?`${s.total_grade}%`:'—'}</td>
                      <td>{s.letter_grade?<span className={gradeClass(s.letter_grade)}>{s.letter_grade}</span>:'—'}</td>
                      <td>{editable?<button className="btn btn-primary btn-xs" disabled={saving===s.enrollment_id} onClick={()=>saveGrade(s.enrollment_id)}>{saving===s.enrollment_id?'…':'Save'}</button>:<Badge label="Locked" style={{background:'var(--n100)',color:'var(--n400)',border:'1px solid var(--n200)'}}/>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab==='attendance'&&(
        <Card title="Attendance Summary" subtitle="Students below 42% attendance are flagged per bylaw">
          <DataTable columns={[
            {key:'student_code',label:'Code',render:v=><span className="code-mono">{v}</span>},
            {key:'full_name_en',label:'Name'},{key:'total_sessions',label:'Sessions'},{key:'attended_sessions',label:'Attended'},
            {key:'attendance_pct',label:'Attendance %',render:v=><span className={`att-pct ${!v?'':v<42?'att-danger':v<60?'att-warn':'att-good'}`}>{v?`${v}%`:'—'}</span>},
            {key:'below_minimum',label:'Status',render:v=>v?<Badge label="⚠ Flagged" style={{background:'var(--danger-bg)',color:'var(--danger-bold)',border:'1px solid var(--danger-bd)'}}/>:<Badge label="✓ OK" style={{background:'var(--success-bg)',color:'var(--success-bold)',border:'1px solid var(--success-bd)'}}/>},
          ]} data={data.roster}/>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PAGES
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ adminAPI.getDashboard().then(r=>setData(r.data.data)).finally(()=>setLoading(false)); },[]);
  if(loading)return<Spinner/>;
  if(!data)return null;
  const s=data.stats;
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle={data.currentSemester?`Current: ${data.currentSemester.label} · ${data.currentSemester.status}`:'No active semester'}/>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:14}}>
        <StatTile label="Active Students" value={s?.active_students||0} icon="🎓" color="#059669"/>
        <StatTile label="On Warning" value={s?.warning_students||0} icon="⚠" color="#d97706"/>
        <StatTile label="Faculty Members" value={s?.total_doctors||0} icon="👨‍🏫" color="var(--doctor-color)"/>
        <StatTile label="Active Courses" value={s?.active_courses||0} icon="📚" color="var(--brand-500)"/>
      </div>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:24}}>
        <StatTile label="Current Enrollments" value={s?.current_enrollments||0} icon="📋" color="#0891b2"/>
        <StatTile label="Average CGPA" value={parseFloat(s?.avg_cgpa||0).toFixed(2)} icon="📊" color="#7c3aed"/>
        <StatTile label="Dismissed" value={s?.dismissed_students||0} icon="🚫" color="#dc2626"/>
        <StatTile label="Graduated" value={s?.graduated_students||0} icon="🏅" color="#059669"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card title="Students by Specialization" noPad>
          <DataTable columns={[
            {key:'specialization',label:'Specialization',render:v=><Badge label={v} style={{background:'var(--brand-50)',color:'var(--brand-600)',border:'1px solid var(--brand-100)'}}/>},
            {key:'total',label:'Total'},{key:'active',label:'Active'},
            {key:'avg_cgpa',label:'Avg CGPA',render:v=><span className={`gpa-number ${gpaClass(v)}`}>{parseFloat(v||0).toFixed(3)}</span>},
          ]} data={data.specializationStats||[]}/>
        </Card>
        <Card title="Recent Academic Warnings" noPad>
          <DataTable columns={[
            {key:'student_code',label:'Code',render:v=><span className="code-mono">{v}</span>},
            {key:'full_name_en',label:'Name'},
            {key:'cgpa_at_warning',label:'CGPA',render:v=><span style={{color:'var(--danger-bold)',fontWeight:700}} className="gpa-number">{parseFloat(v||0).toFixed(3)}</span>},
            {key:'semester_label',label:'Semester'},
          ]} data={data.recentWarnings||[]} emptyMsg="No recent warnings"/>
        </Card>
      </div>
    </div>
  );
};

const AdminStudentsPage = () => {
  const [students,setStudents] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState({status:'',specialization:'',level:''});
  const load = useCallback(()=>{ setLoading(true); adminAPI.getStudents({search,...filter}).then(r=>setStudents(r.data.data)).finally(()=>setLoading(false)); },[search,filter]);
  useEffect(()=>{load();},[load]);
  return (
    <div>
      <PageHeader title="Students" subtitle="Search, filter, and manage all enrolled students"/>
      <Card>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
          <div className="search-wrap" style={{flex:2}}><span className="search-icon">🔍</span><input className="form-input search-input" placeholder="Search by name, student code, or national ID…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          {[{key:'status',opts:['','active','warning','probation','dismissed','graduated','on_leave'],label:'Status'},{key:'specialization',opts:['','CS','IS','IT','SE'],label:'Specialization'},{key:'level',opts:['','freshman','sophomore','junior','senior'],label:'Level'}].map(f=>(
            <select key={f.key} className="form-select" style={{width:'auto'}} value={filter[f.key]} onChange={e=>setFilter(prev=>({...prev,[f.key]:e.target.value}))}>
              <option value="">{f.label}: All</option>{f.opts.filter(Boolean).map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
        {loading?<Spinner/>:(
          <DataTable columns={[
            {key:'student_code',label:'Code',render:v=><span className="code-mono">{v}</span>},
            {key:'full_name_en',label:'Full Name',render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'var(--n400)'}}>{r.email}</div></div>},
            {key:'specialization',label:'Spec.'},{key:'current_level',label:'Level',render:v=><span style={{textTransform:'capitalize',fontSize:12}}>{v}</span>},
            {key:'cgpa',label:'CGPA',render:v=><span className={`gpa-number ${gpaClass(v)}`} style={{fontWeight:700}}>{parseFloat(v||0).toFixed(3)}</span>},
            {key:'total_credits_passed',label:'Credits'},{key:'semesters_enrolled',label:'Sems'},
            {key:'academic_status',label:'Status',render:v=><StatusBadge status={v}/>},
            {key:'id',label:'',render:v=><Link className="btn btn-secondary btn-xs" to={`/admin/students/${v}`}>View →</Link>},
          ]} data={students}/>
        )}
      </Card>
    </div>
  );
};

const AdminStudentDetailPage = () => {
  const {studentId} = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState('overview');
  useEffect(()=>{ adminAPI.getStudentDetail(studentId).then(r=>setData(r.data.data)).finally(()=>setLoading(false)); },[studentId]);
  if(loading)return<Spinner/>;
  if(!data)return<div>Student not found</div>;
  const {student,transcript,gpaHistory,warnings,eligibility:e} = data;
  const initials=(student.full_name_en||'').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);
  return (
    <div>
      <div className="breadcrumb"><Link to="/admin">Dashboard</Link><span className="breadcrumb-sep">/</span><Link to="/admin/students">Students</Link><span className="breadcrumb-sep">/</span><span>{student.student_code}</span></div>
      <div style={{background:'var(--n0)',border:'1px solid var(--n200)',borderRadius:'var(--radius-lg)',padding:'24px 28px',marginBottom:24,display:'flex',alignItems:'center',gap:20,boxShadow:'var(--shadow-xs)'}}>
        <div style={{width:60,height:60,borderRadius:'50%',background:'var(--student-bg)',color:'var(--student-color)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,border:'2px solid var(--student-bd)',flexShrink:0}}>{initials}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:800,color:'var(--n900)'}}>{student.full_name_en}</div>
          <div style={{fontSize:13,color:'var(--n400)',marginTop:2}}>{student.full_name_ar} · {student.student_code} · {student.email}</div>
          <div style={{marginTop:8,display:'flex',gap:6,flexWrap:'wrap'}}><StatusBadge status={student.academic_status}/><Badge label={student.specialization} style={{background:'var(--brand-50)',color:'var(--brand-600)',border:'1px solid var(--brand-100)'}}/><Badge label={student.current_level} style={{background:'var(--n100)',color:'var(--n600)',border:'1px solid var(--n200)'}}/></div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}><div className={`gpa-number ${gpaClass(student.cgpa)}`} style={{fontSize:36,fontWeight:900}}>{fmtGPA(student.cgpa)}</div><div style={{fontSize:12,color:'var(--n400)'}}>Cumulative GPA</div></div>
      </div>
      <div style={{marginBottom:20}}><div className="tabs">{[['overview','📊 Overview'],['transcript','📜 Transcript'],['warnings','⚠ Warnings'],['graduation','🎓 Graduation']].map(([k,l])=><button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div></div>

      {tab==='overview'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <Card title="Academic Details">
            {[['Student Code',student.student_code],['Enrollment Year',student.enrollment_year],['Specialization',student.specialization],['Level',student.current_level],['Credits Passed',`${student.total_credits_passed} / 132`],['Semesters',student.semesters_enrolled],['Total Warnings',student.total_warnings],['Consecutive Warnings',student.consecutive_warnings]].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--n100)',fontSize:13.5}}><span style={{color:'var(--n400)'}}>{k}</span><span style={{fontWeight:600,color:'var(--n700)'}}>{v}</span></div>
            ))}
          </Card>
          <Card title="GPA History">
            {gpaHistory.length===0?<div className="empty-state" style={{padding:24}}>No GPA history</div>:gpaHistory.map((g,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--n100)',fontSize:13}}>
                <span style={{color:'var(--n600)'}}>{g.label}</span>
                <div><span className={`gpa-number ${gpaClass(g.semester_gpa)}`} style={{fontWeight:700}}>{fmtGPA(g.semester_gpa)}</span><span style={{fontSize:11,color:'var(--n400)',marginLeft:6}}>/ {fmtGPA(g.cumulative_gpa)}</span></div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==='transcript'&&(
        <Card title="Full Transcript" noPad>
          <DataTable columns={[
            {key:'semester_label',label:'Semester'},{key:'course_code',label:'Code',render:v=><span className="code-mono">{v}</span>},
            {key:'course_name_en',label:'Course'},{key:'credits',label:'Cr.'},
            {key:'total_grade',label:'Score',render:v=>v?`${v}%`:'—'},
            {key:'letter_grade',label:'Grade',render:v=>v?<span className={gradeClass(v)}>{v}</span>:'—'},
            {key:'grade_points',label:'GPA Pts'},
          ]} data={transcript}/>
        </Card>
      )}

      {tab==='warnings'&&(
        <Card title="Academic Warnings" noPad>
          {warnings.length===0?(
            <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-text">No warnings on record</div></div>
          ):(
            <DataTable columns={[
              {key:'semester_label',label:'Semester'},{key:'warning_type',label:'Type',render:v=><StatusBadge status={v}/>},
              {key:'cgpa_at_warning',label:'CGPA at Warning',render:v=><span style={{color:'var(--danger-bold)',fontWeight:700}} className="gpa-number">{parseFloat(v||0).toFixed(3)}</span>},
              {key:'issued_at',label:'Date',render:v=>fmtDate(v)},
            ]} data={warnings}/>
          )}
        </Card>
      )}

      {tab==='graduation'&&(
        <Card title="Graduation Eligibility">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            {[['Credits (132)',e.credits_met,`${e.credits_passed}/132`],['CGPA ≥ 2.0',e.cgpa_met,`CGPA: ${fmtGPA(e.cgpa)}`],['Training 1',e.training1_done],['Training 2',e.training2_done],['Project 1',e.project1_done],['Project 2',e.project2_done],['No Failed Courses',e.no_pending_f_grades],['Academic Standing',e.status_ok]].map(([label,met,detail])=>(
              <div key={label} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 14px',background:met?'var(--success-bg)':'var(--danger-bg)',borderRadius:'var(--radius-md)',border:`1px solid ${met?'var(--success-bd)':'var(--danger-bd)'}`}}>
                <span style={{fontSize:16}}>{met?'✓':'✕'}</span>
                <div><div style={{fontWeight:600,fontSize:13,color:met?'var(--success-bold)':'var(--danger-bold)'}}>{label}</div>{detail&&<div style={{fontSize:11,color:'var(--n400)'}}>{detail}</div>}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'14px 18px',background:e.is_eligible?'var(--success-bg)':'var(--danger-bg)',border:`1px solid ${e.is_eligible?'var(--success-bd)':'var(--danger-bd)'}`,borderRadius:'var(--radius-md)'}}>
            <strong style={{color:e.is_eligible?'var(--success-bold)':'var(--danger-bold)',fontSize:14}}>{e.is_eligible?'🎉 Eligible for Graduation Clearance':'⏳ Requirements Not Yet Met'}</strong>
          </div>
        </Card>
      )}
    </div>
  );
};

const AdminUsersPage = () => {
  const [users,setUsers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [roleFilter,setRoleFilter] = useState('');
  const [showCreate,setShowCreate] = useState(false);
  const [form,setForm] = useState({email:'',password:'',role:'student',fullNameAr:'',fullNameEn:'',nationalId:'',phone:'',specialization:'CS',enrollmentYear:new Date().getFullYear(),academicTitle:'Dr.'});
  const load = useCallback(()=>{ setLoading(true); adminAPI.getUsers({search,role:roleFilter}).then(r=>setUsers(r.data.data.users||[])).finally(()=>setLoading(false)); },[search,roleFilter]);
  useEffect(()=>{load();},[load]);
  const create = async(e)=>{ e.preventDefault(); try{ await adminAPI.createUser(form); toast.success('User created'); setShowCreate(false); setForm(f=>({...f,email:'',password:'',fullNameAr:'',fullNameEn:'',nationalId:'',phone:''})); load(); }catch(err){toast.error(err.response?.data?.message||'Failed to create');} };
  const roleColors={admin:'var(--admin-color)',doctor:'var(--doctor-color)',student:'var(--student-color)'};
  return (
    <div>
      <PageHeader title="User Management" subtitle="Create and manage system accounts" action={<button className="btn btn-primary" onClick={()=>setShowCreate(v=>!v)}>{showCreate?'✕ Cancel':'+ New User'}</button>}/>
      {showCreate&&(
        <Card title="Create New Account" style={{marginBottom:20}}>
          <form onSubmit={create}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              {[['email','Email Address','email'],['password','Password','password'],['fullNameAr','Full Name (Arabic)','text'],['fullNameEn','Full Name (English)','text'],['nationalId','National ID','text'],['phone','Phone','text']].map(([k,l,t])=>(
                <div key={k} className="form-group" style={{marginBottom:0}}><label className="form-label">{l}</label><input type={t} className="form-input" value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} required={['email','password','fullNameAr','fullNameEn'].includes(k)}/></div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
              <div className="form-group" style={{marginBottom:0}}><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}><option value="student">Student</option><option value="doctor">Doctor</option><option value="admin">Admin</option></select></div>
              {form.role==='student'&&<div className="form-group" style={{marginBottom:0}}><label className="form-label">Specialization</label><select className="form-select" value={form.specialization} onChange={e=>setForm(f=>({...f,specialization:e.target.value}))}>{['CS','IS','IT','SE'].map(s=><option key={s}>{s}</option>)}</select></div>}
              {form.role==='doctor'&&<div className="form-group" style={{marginBottom:0}}><label className="form-label">Academic Title</label><select className="form-select" value={form.academicTitle} onChange={e=>setForm(f=>({...f,academicTitle:e.target.value}))}>{['Dr.','Prof.','Assoc. Prof.','Lect.'].map(t=><option key={t}>{t}</option>)}</select></div>}
            </div>
            <div style={{display:'flex',gap:10}}><button type="submit" className="btn btn-primary">Create Account</button><button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button></div>
          </form>
        </Card>
      )}
      <Card>
        <div style={{display:'flex',gap:12,marginBottom:20}}>
          <div className="search-wrap" style={{flex:1}}><span className="search-icon">🔍</span><input className="form-input search-input" placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className="form-select" style={{width:'auto'}} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="student">Student</option></select>
        </div>
        {loading?<Spinner/>:(
          <DataTable columns={[
            {key:'email',label:'Email'},{key:'full_name_en',label:'Name'},
            {key:'role',label:'Role',render:v=><Badge label={v} style={{background:roleColors[v]+'15',color:roleColors[v],border:`1px solid ${roleColors[v]}30`}}/>},
            {key:'is_active',label:'Status',render:v=>v?<Badge label="Active" style={{background:'var(--success-bg)',color:'var(--success-bold)',border:'1px solid var(--success-bd)'}}/>:<Badge label="Inactive" style={{background:'var(--n100)',color:'var(--n400)',border:'1px solid var(--n200)'}}/>},
            {key:'last_login',label:'Last Login',render:v=>v?fmtDate(v):'Never'},
            {key:'created_at',label:'Created',render:v=>fmtDate(v)},
          ]} data={users}/>
        )}
      </Card>
    </div>
  );
};

const AdminSemestersPage = () => {
  const [semesters,setSemesters] = useState([]);
  const [loading,setLoading] = useState(true);
  const load = ()=>adminAPI.getSemesters().then(r=>setSemesters(r.data.data)).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);
  const changeStatus = async(id,status)=>{ try{ await adminAPI.updateSemesterStatus(id,status); toast.success(`Updated to ${status}`); load(); }catch(err){toast.error(err.response?.data?.message||'Failed');} };
  const semTypeColors={fall:'var(--brand-500)',spring:'#059669',summer:'#d97706'};
  return (
    <div>
      <PageHeader title="Semester Management" subtitle="Control semester lifecycle and registration windows"/>
      <Card noPad>
        {loading?<Spinner/>:(
          <DataTable columns={[
            {key:'label',label:'Semester',render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div><div style={{fontSize:11,color:'var(--n400)'}}>{r.year_label}</div></div>},
            {key:'semester_type',label:'Type',render:v=><Badge label={v} style={{background:semTypeColors[v]+'15',color:semTypeColors[v],border:`1px solid ${semTypeColors[v]}30`}}/>},
            {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
            {key:'start_date',label:'Start',render:v=>fmtDate(v)},
            {key:'end_date',label:'End',render:v=>fmtDate(v)},
            {key:'registration_end',label:'Reg. Deadline',render:v=>fmtDate(v)},
            {key:'id',label:'Change Status',render:(id,row)=><select className="form-select" style={{padding:'5px 10px',fontSize:12,width:'auto'}} defaultValue={row.status} onChange={e=>changeStatus(id,e.target.value)}>{['upcoming','registration','active','grading','closed'].map(s=><option key={s} value={s}>{s}</option>)}</select>},
          ]} data={semesters}/>
        )}
      </Card>
    </div>
  );
};

const AdminReportsPage = () => {
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState('distribution');
  useEffect(()=>{ adminAPI.getAcademicReport().then(r=>setData(r.data.data)).finally(()=>setLoading(false)); },[]);
  if(loading)return<Spinner/>;
  if(!data)return null;
  const dist=data.gpaDistribution;
  const distData=[{label:'Excellent (≥ 3.5)',count:dist?.excellent||0,color:'#059669'},{label:'Very Good (3.0–3.5)',count:dist?.very_good||0,color:'var(--brand-500)'},{label:'Good (2.5–3.0)',count:dist?.good||0,color:'#7c3aed'},{label:'Satisfactory (2.0–2.5)',count:dist?.satisfactory||0,color:'#d97706'},{label:'Below Average (< 2.0)',count:dist?.below_average||0,color:'#dc2626'}];
  const totalDist=distData.reduce((s,d)=>s+d.count,0);
  return (
    <div>
      <PageHeader title="Academic Reports" subtitle="Faculty-wide academic performance analytics"/>
      <Card title="GPA Distribution" subtitle="Active students by academic standing" style={{marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {distData.map(d=>(
            <div key={d.label} style={{padding:14,background:d.color+'10',border:`1px solid ${d.color}22`,borderRadius:'var(--radius-md)',textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:800,color:d.color}}>{d.count}</div>
              <div style={{fontSize:11,color:'var(--n500)',marginTop:4,lineHeight:1.3}}>{d.label}</div>
              {totalDist>0&&<div style={{fontSize:11,color:d.color,fontWeight:700,marginTop:4}}>{Math.round((d.count/totalDist)*100)}%</div>}
            </div>
          ))}
        </div>
        {distData.map(d=>(
          <div key={d.label} style={{marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontSize:12,color:'var(--n500)',width:180,flexShrink:0}}>{d.label}</div>
            <div style={{flex:1}}><div className="gpa-bar-wrap"><div className="gpa-bar-fill" style={{width:totalDist>0?`${(d.count/totalDist)*100}%`:'0%',background:d.color}}/></div></div>
            <div style={{fontSize:13,fontWeight:700,color:d.color,width:32,textAlign:'right'}}>{d.count}</div>
          </div>
        ))}
      </Card>
      <div style={{marginBottom:20}}><div className="tabs">{[['top','🏆 Top Students'],['dismissed','🚫 Dismissed']].map(([k,l])=><button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div></div>
      {tab==='top'&&<Card title="Top 20 Students by CGPA" noPad><DataTable columns={[{key:'student_code',label:'Code',render:v=><span className="code-mono">{v}</span>},{key:'full_name_en',label:'Name'},{key:'specialization',label:'Spec.'},{key:'cgpa',label:'CGPA',render:v=><span className={`gpa-number ${gpaClass(v)}`} style={{fontWeight:800}}>{parseFloat(v||0).toFixed(3)}</span>},{key:'total_credits_passed',label:'Credits'},{key:'current_level',label:'Level'}]} data={data.topStudents||[]}/></Card>}
      {tab==='dismissed'&&<Card title="Dismissed Students" noPad><DataTable columns={[{key:'student_code',label:'Code',render:v=><span className="code-mono">{v}</span>},{key:'full_name_en',label:'Name'},{key:'specialization',label:'Spec.'},{key:'cgpa',label:'Final CGPA',render:v=><span style={{color:'var(--danger-bold)',fontWeight:700}} className="gpa-number">{parseFloat(v||0).toFixed(3)}</span>},{key:'total_warnings',label:'Warnings'}]} data={data.dismissedStudents||[]} emptyMsg="No dismissed students"/></Card>}
    </div>
  );
};

const AnnouncementsPage = () => {
  const {user} = useAuth();
  const [anns,setAnns] = useState([]);
  const [loading,setLoading] = useState(true);
  const [form,setForm] = useState({title:'',body:'',targetRole:'',isPinned:false});
  const [creating,setCreating] = useState(false);
  const load = ()=>adminAPI.getAnnouncements().then(r=>setAnns(r.data.data)).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);
  const create = async(e)=>{ e.preventDefault(); setCreating(true); try{ await adminAPI.createAnnouncement(form); toast.success('Published'); setForm({title:'',body:'',targetRole:'',isPinned:false}); load(); }catch{toast.error('Failed');}finally{setCreating(false);} };
  const roleColors={student:'var(--student-color)',doctor:'var(--doctor-color)',admin:'var(--admin-color)'};
  return (
    <div>
      <PageHeader title="Announcements" subtitle="System-wide communications and notices"/>
      <div style={{display:'grid',gridTemplateColumns:user?.role==='admin'?'1fr 1.4fr':'1fr',gap:20}}>
        {user?.role==='admin'&&(
          <Card title="New Announcement">
            <form onSubmit={create}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="Announcement title…"/></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} required rows={5} placeholder="Write your announcement here…"/></div>
              <div style={{display:'flex',gap:12,marginBottom:20}}>
                <div style={{flex:1}}><label className="form-label">Target Audience</label><select className="form-select" value={form.targetRole} onChange={e=>setForm(f=>({...f,targetRole:e.target.value}))}><option value="">All Users</option><option value="student">Students Only</option><option value="doctor">Faculty Only</option><option value="admin">Admins Only</option></select></div>
                <div style={{display:'flex',alignItems:'flex-end',paddingBottom:2}}><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,fontWeight:600,color:'var(--n600)'}}><input type="checkbox" checked={form.isPinned} onChange={e=>setForm(f=>({...f,isPinned:e.target.checked}))}/>📌 Pin</label></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating} style={{width:'100%',justifyContent:'center'}}>{creating?'Publishing…':'Publish Announcement'}</button>
            </form>
          </Card>
        )}
        <Card title="All Announcements">
          {loading?<Spinner/>:anns.length===0?(
            <div className="empty-state"><div className="empty-state-icon">📢</div><div className="empty-state-text">No announcements yet</div></div>
          ):anns.map(a=>(
            <div key={a.id} className="ann-card">
              {a.is_pinned&&<div className="ann-pin">📌 Pinned</div>}
              <div style={{fontWeight:700,fontSize:15,color:'var(--n800)',marginBottom:6}}>{a.title}</div>
              <p style={{fontSize:13.5,color:'var(--n600)',lineHeight:1.6,marginBottom:8}}>{a.body}</p>
              <div style={{display:'flex',gap:8,alignItems:'center',fontSize:12,color:'var(--n400)',flexWrap:'wrap'}}>
                <span>{a.created_by_name}</span><span>·</span><span>{fmtDate(a.created_at)}</span>
                {a.target_role&&<><span>·</span><Badge label={`For ${a.target_role}s`} style={{background:(roleColors[a.target_role]||'var(--n400)')+'15',color:roleColors[a.target_role]||'var(--n400)',border:`1px solid ${(roleColors[a.target_role]||'var(--n300)')}30`}}/></>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE + APP ROUTER
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'var(--n50)', flexDirection:'column', gap:16 }}>
      <GlobalStyles />
      <div className="spinner" />
      <div style={{ fontSize:13, color:'var(--n400)' }}>Loading FCIT SRS…</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.mustChangePw && window.location.pathname !== '/change-password')
    return <Navigate to="/change-password" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={`/${user.role}`} replace />;

  return (
    <>
      <GlobalStyles />
      <Layout>{children}</Layout>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              borderRadius: 10,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              border: '1px solid #e4e8f0',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<><GlobalStyles /><LoginPage /></>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

          {/* ── Student routes ── */}
          <Route path="/student"              element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses"      element={<ProtectedRoute allowedRoles={['student']}><CourseRegistrationPage /></ProtectedRoute>} />
          <Route path="/student/schedule"     element={<ProtectedRoute allowedRoles={['student']}><StudentSchedulePage /></ProtectedRoute>} />
          <Route path="/student/transcript"   element={<ProtectedRoute allowedRoles={['student']}><TranscriptPage /></ProtectedRoute>} />
          <Route path="/student/graduation"   element={<ProtectedRoute allowedRoles={['student']}><GraduationStatusPage /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student','doctor','admin']}><NotificationsPage /></ProtectedRoute>} />

          {/* ── Doctor routes ── */}
          <Route path="/doctor"                     element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/courses"             element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/courses/:offeringId" element={<ProtectedRoute allowedRoles={['doctor','admin']}><CourseRosterPage /></ProtectedRoute>} />
          <Route path="/doctor/notifications"       element={<ProtectedRoute allowedRoles={['doctor','admin']}><NotificationsPage /></ProtectedRoute>} />

          {/* ── Admin routes ── */}
          <Route path="/admin"                      element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students"             element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentsPage /></ProtectedRoute>} />
          <Route path="/admin/students/:studentId"  element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentDetailPage /></ProtectedRoute>} />
          <Route path="/admin/users"                element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/semesters"            element={<ProtectedRoute allowedRoles={['admin']}><AdminSemestersPage /></ProtectedRoute>} />
          <Route path="/admin/reports"              element={<ProtectedRoute allowedRoles={['admin']}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/announcements"        element={<ProtectedRoute allowedRoles={['admin']}><AnnouncementsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="/"   element={<Navigate to="/login" replace />} />
          <Route path="*"   element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
