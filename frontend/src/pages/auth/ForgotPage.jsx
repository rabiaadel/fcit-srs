import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import styles from './auth.module.css';

/**
 * ForgotPage — Password reset is handled by admins only.
 * There is no self-service reset endpoint, so we direct the user to contact
 * their system administrator rather than faking an email dispatch.
 */
export default function ForgotPage() {
  return (
    <AuthLayout>
      <h2 className={styles.title}>إعادة تعيين كلمة المرور</h2>

      <div style={{ textAlign: 'center', lineHeight: '1.7', color: 'var(--color-text-secondary, #555)', marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.75rem' }}>
          لا يمكن إعادة تعيين كلمة المرور ذاتياً في هذا النظام.
        </p>
        <p>
          يُرجى التواصل مع{' '}
          <strong style={{ color: 'var(--color-primary, #7c3aed)' }}>مسؤول النظام</strong>
          {' '}لإعادة تعيين كلمة المرور الخاصة بك.
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', opacity: 0.8 }}>
          بريد الدعم:{' '}
          <a href="mailto:admin@fci.tanta.edu.eg" style={{ color: 'var(--color-primary, #7c3aed)' }}>
            admin@fci.tanta.edu.eg
          </a>
        </p>
      </div>

      <div className={styles.backLink}>
        <Link to="/login">العودة إلى تسجيل الدخول &rarr;</Link>
      </div>
    </AuthLayout>
  );
}
