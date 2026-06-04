/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar — Collapsible right sidebar for RTL layout
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_ITEMS } from '../../utils/constants';
import { getInitials, ROLE_AR } from '../../utils/helpers';
import {
  LayoutDashboard, Users, BookOpen, Settings, Calendar,
  ClipboardList, FolderOpen, Building2, Scale, BarChart3,
  Megaphone, Bell, FileText, GraduationCap, LogOut, ChevronLeft,
} from 'lucide-react';
import styles from './layout.module.css';

const ICON_MAP = {
  LayoutDashboard, Users, BookOpen, Settings, Calendar,
  ClipboardList, FolderOpen, Building2, Scale, BarChart3,
  Megaphone, Bell, FileText, GraduationCap,
};

/* Role-specific logo accent colors */
const ROLE_LOGO_BG = {
  admin:   'var(--color-role-admin)',
  doctor:  'var(--color-role-doctor)',
  student: 'var(--color-primary)',
};

export default function Sidebar({ mobileOpen, onMobileClose, collapsed, onCollapseToggle, unread = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = NAV_ITEMS.filter(l => l.roles.includes(user?.role));
  const initials = getInitials(user);
  const logoBg = ROLE_LOGO_BG[user?.role] || 'var(--color-primary)';

  const isActive = (to) => {
    const exactPaths = ['/admin', '/doctor', '/student'];
    return exactPaths.includes(to) ? location.pathname === to : location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarClass = [
    styles.sidebar,
    mobileOpen && styles.sidebar_mobileOpen,
    collapsed && styles.sidebar_collapsed,
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={sidebarClass}
        dir="rtl"
        role="navigation"
        aria-label="القائمة الرئيسية"
      >
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon} style={{ background: logoBg }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".95"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".5"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity=".95"/>
            </svg>
          </div>
          {!collapsed && (
            <div className={styles.logoTextWrap}>
              <div className={styles.logoText}>UniSmart</div>
              <div className={styles.logoSub}>نظام إدارة جامعي</div>
            </div>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            className={styles.collapseBtn}
            onClick={onCollapseToggle}
            aria-label={collapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
            title={collapsed ? 'توسيع' : 'طي'}
          >
            <ChevronLeft
              size={16}
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
            />
          </button>
        </div>

        {/* Navigation links */}
        <nav className={styles.sidebarNav}>
          {links.map(link => {
            const Icon = ICON_MAP[link.icon];
            const active = isActive(link.to);
            const isBell = link.icon === 'Bell';
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.navLink} ${active ? styles.navLink_active : ''}`}
                onClick={mobileOpen ? onMobileClose : undefined}
                title={collapsed ? link.label : undefined}
                aria-label={link.label}
              >
                <span className={styles.navIcon}>
                  {Icon ? <Icon size={18} /> : null}
                  {/* Notification pulse dot on Bell icon */}
                  {isBell && unread > 0 && (
                    <span className={styles.navNotifDot} aria-hidden="true" />
                  )}
                </span>
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className={styles.sidebarBottom}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>{initials}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {user?.fullNameAr || user?.fullNameEn || 'مستخدم'}
                </div>
                <div className={styles.userRole}>{ROLE_AR[user?.role] || user?.role}</div>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} aria-label="تسجيل الخروج">
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}

        {collapsed && (
          <div className={styles.sidebarBottomCollapsed}>
            <div className={styles.userAvatarCollapsed} title={user?.fullNameAr || user?.fullNameEn || 'مستخدم'}>
              {initials}
            </div>
            <button
              className={styles.logoutBtnCollapsed}
              onClick={handleLogout}
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
