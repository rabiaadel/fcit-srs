/* ═══════════════════════════════════════════════════════════════════════════
   AuthLayout — Full-screen centered layout for login/auth pages
   ═══════════════════════════════════════════════════════════════════════════ */
import React from 'react';
import { Toaster } from 'react-hot-toast';
import styles from './layout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.authLayout} dir="rtl">
      {/* Decorative Animated Orbs */}
      <div className={styles.authOrb1} />
      <div className={styles.authOrb2} />
      <div className={styles.authOrb3} />

      {/* Auth card */}
      <div className={styles.authCard}>
        {/* Content area */}
        <div className={styles.authContent}>
          <div className={styles.authBranding}>
            <div className={styles.authBrandIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.authBrandName}>UniSmart</span>
          </div>
          
          <div className={styles.authChildrenWrap}>
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.authFooter}>
          © {new Date().getFullYear()} كلية الحاسبات والمعلومات - جامعة طنطا
        </div>
      </div>
    </div>
  );
}
