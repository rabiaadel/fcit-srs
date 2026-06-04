/* ═══════════════════════════════════════════════════════════════════════════
   AppLayout — Main app shell combining TopBar + Sidebar + content
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI, doctorAPI, adminAPI } from '../../services/api';
import { D } from '../../utils/helpers';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import styles from './layout.module.css';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('unismart-sidebar-collapsed') === 'true'; }
    catch { return false; }
  });
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  /* Sync sidebar width CSS variable */
  useEffect(() => {
    const w = collapsed
      ? 'var(--sidebar-collapsed-width)'
      : 'var(--sidebar-width)';
    document.documentElement.style.setProperty('--sidebar-current-width', w);
  }, [collapsed]);

  const handleCollapseToggle = () => {
    setCollapsed(p => {
      const next = !p;
      try { localStorage.setItem('unismart-sidebar-collapsed', String(next)); }
      catch { /* ignore */ }
      return next;
    });
  };

  /* Fetch unread notification count */
  useEffect(() => {
    if (!user) return;
    const apiMap = { admin: adminAPI, doctor: doctorAPI, student: studentAPI };
    const api = apiMap[user.role] || studentAPI;

    const load = () => {
      api.getUnreadCount?.()
        .then(r => setUnread(D(r)?.count || r?.data?.count || 0))
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [user]);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [children]);

  return (
    <div
      className={styles.appLayout}
      style={{ '--sidebar-current-width': collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      <TopBar
        unread={unread}
        onMobileMenuToggle={() => setMobileOpen(p => !p)}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapseToggle={handleCollapseToggle}
        unread={unread}
      />
      <main className={`${styles.main} ${collapsed ? styles.main_sidebarCollapsed : ''}`}>
        {children}
      </main>
    </div>
  );
}
