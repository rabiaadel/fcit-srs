/* ═══════════════════════════════════════════════════════════════════════════
   UI Component Library — FCIT-SRS
   All reusable primitives for the university SaaS dashboard
   ═══════════════════════════════════════════════════════════════════════════ */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './ui.module.css';

/* ════════════ Button ════════════ */
export function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, fullWidth = false, className = '', type = 'button', ...props
}) {
  const cls = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    fullWidth && styles.btn_full,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.btnSpinner} />}
      {children}
    </button>
  );
}

/* ════════════ Input ════════════ */
export function Input({
  label, error, hint, id, className = '', wrapperClassName = '', ...props
}) {
  const inputId = id || `input-${label?.replace(/\s/g, '-')}`;
  return (
    <div className={`${styles.field} ${wrapperClassName}`}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.input_error : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && <span id={`${inputId}-error`} className={styles.errorText} role="alert">{error}</span>}
      {hint && !error && <span className={styles.hintText}>{hint}</span>}
    </div>
  );
}

/* ════════════ PasswordInput ════════════ */
export function PasswordInput({ label, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.passwordWrap}>
        <input
          type={show ? 'text' : 'password'}
          className={styles.input}
          {...props}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => setShow(p => !p)}
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          tabIndex={-1}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  );
}

/* ════════════ Select ════════════ */
export function Select({
  label, error, id, children, className = '', wrapperClassName = '', ...props
}) {
  const selectId = id || `select-${label?.replace(/\s/g, '-')}`;
  return (
    <div className={`${styles.field} ${wrapperClassName}`}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.input_error : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
}

/* ════════════ Card ════════════ */
export function Card({
  children, title, headerActions, className = '', noPadding = false,
  variant = 'default', action, collapsible = false, style, ...props
}) {
  const [collapsed, setCollapsed] = useState(false);

  const variantClass = variant !== 'default' ? styles[`card_${variant}`] : '';

  return (
    <div
      className={`${styles.card} ${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {(title || headerActions || action) && (
        <div
          className={`${styles.cardHeader} ${collapsible ? styles.cardCollapsibleToggle : ''}`}
          onClick={collapsible ? () => setCollapsed(p => !p) : undefined}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={collapsible ? (e) => e.key === 'Enter' && setCollapsed(p => !p) : undefined}
          aria-expanded={collapsible ? !collapsed : undefined}
        >
          {title && <h2 className={styles.cardTitle}>{title}</h2>}
          <div className={styles.cardActions}>
            {action && action}
            {headerActions && headerActions}
          </div>
        </div>
      )}
      <div
        className={collapsible
          ? `${styles.cardCollapsibleBody} ${collapsed ? styles.cardCollapsibleBody_collapsed : ''}`
          : undefined}
      >
        <div className={noPadding ? '' : styles.cardBody}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════ StatCard ════════════ */
export function StatCard({ icon, iconBg, value, label, className = '', trend, style }) {
  const trendClass = trend?.direction
    ? styles[`statTrend_${trend.direction}`]
    : styles.statTrend_neutral;

  const TrendIcon = trend?.direction === 'up'
    ? TrendingUp
    : trend?.direction === 'down'
    ? TrendingDown
    : Minus;

  return (
    <div
      className={`${styles.statCard} ${className}`}
      style={{ '--stat-accent': iconBg || 'var(--color-primary)', ...style }}
    >
      <div className={styles.statIcon} style={{ background: iconBg || 'var(--color-primary-50)' }}>
        {icon}
      </div>
      <div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {trend && (
          <div className={`${styles.statTrend} ${trendClass}`}>
            <TrendIcon size={10} />
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════ Badge ════════════ */
export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const cls = [
    styles.badge,
    styles[`badge_${variant}`],
    size === 'sm' && styles.badge_sm,
    size === 'lg' && styles.badge_lg,
    className,
  ].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}

/* ════════════ StatusBadge (semantic) ════════════ */
export function StatusBadge({ status }) {
  const map = {
    active:      ['success', 'فعال'],
    registered:  ['success', 'مسجل'],
    completed:   ['default', 'مكتمل'],
    withdrawn:   ['warning', 'منسحب'],
    dropped:     ['error',   'محذوف'],
    upcoming:    ['info',    'قادم'],
    registration:['info',   'تسجيل'],
    grading:     ['warning', 'تقييم'],
    closed:      ['default', 'مكتمل'],
    enabled:     ['success', 'مفعل'],
    disabled:    ['error',   'معطل'],
    warning:     ['warning', 'إنذار'],
    dismissed:   ['error',   'مفصول'],
  };
  const [variant, label] = map[status?.toLowerCase?.()] || ['default', status || '—'];
  return <Badge variant={variant}>{label}</Badge>;
}

/* ════════════ GradeBadge ════════════ */
export function GradeBadge({ grade }) {
  if (!grade) return <span className={styles.gradeEmpty}>—</span>;
  const colorMap = {
    'A+': 'excellent', 'A': 'excellent', 'A-': 'excellent',
    'B+': 'veryGood',  'B': 'veryGood',  'B-': 'veryGood',
    'C+': 'good',      'C': 'good',      'C-': 'good',
    'D+': 'pass',      'D': 'pass',      'D-': 'pass',
    'F': 'fail',       'Abs': 'fail',    'W': 'withdrawn',
  };
  const cls = colorMap[grade] || '';
  return <span className={`${styles.gradeBadge} ${styles[`grade_${cls}`] || ''}`}>{grade}</span>;
}

/* ════════════ SpecBadge ════════════ */
export function SpecBadge({ spec }) {
  const s = (spec || '').toUpperCase();
  // [AUDIT-I-22 FIX] SE removed — only CS, IS, IT are active specializations
  const map = { CS: 'cs', IT: 'it', IS: 'is' };
  if (!s || !map[s]) {
    return (
      <span className={`${styles.badge} ${styles.badge_default}`}
            style={{ background: 'rgba(100, 116, 139, 0.12)', color: 'var(--color-gray-600)', fontWeight: 700 }}>
        عام
      </span>
    );
  }
  return (
    <span className={`${styles.badge} ${styles[`spec_${map[s]}`] || styles.badge_default}`}>
      {s}
    </span>
  );
}

/* ════════════ Table ════════════ */
export function Table({ children, className = '' }) {
  return (
    <div className={styles.tableWrap}>
      <table className={`${styles.table} ${className}`}>
        {children}
      </table>
    </div>
  );
}
export function Th({ children, sortable = false, ...props }) {
  const cls = [styles.th, sortable && styles.thSortable].filter(Boolean).join(' ');
  return (
    <th className={cls} scope="col" {...props}>
      {children}
    </th>
  );
}
export function Td({ children, className = '', ...props }) {
  return <td className={`${styles.td} ${className}`} {...props}>{children}</td>;
}

/* ════════════ Tabs ════════════ */
export function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`${styles.tabs} ${className}`} role="tablist">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          className={`${styles.tab} ${active === key ? styles.tab_active : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ════════════ Spinner ════════════ */
export function Spinner({ size = 32, className = '' }) {
  return (
    <div className={`${styles.spinnerWrap} ${className}`}>
      <div className={styles.spinner} style={{ width: size, height: size }} />
    </div>
  );
}

/* ════════════ Skeleton ════════════ */
export function Skeleton({ width = '100%', height = '16px', radius, style, className = '' }) {
  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius: radius || undefined,
        display: 'block',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      <Skeleton className={styles.skeletonCardIcon} width="48px" height="48px" radius="var(--radius-lg)" />
      <div className={styles.skeletonCardContent}>
        <Skeleton width="40%" height="24px" radius="var(--radius-sm)" />
        <Skeleton width="65%" height="13px" radius="var(--radius-sm)" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  const colWidths = ['30%', '20%', '25%', '15%', '10%'];
  return (
    <div className={styles.skeletonTable}>
      <div className={`${styles.skeletonTableRow} ${styles.skeletonTableHeader}`}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={colWidths[i] || '20%'} height="13px" radius="var(--radius-sm)" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={styles.skeletonTableRow}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              width={c === 0 ? '35%' : colWidths[c] || '20%'}
              height="13px"
              radius="var(--radius-sm)"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ════════════ EmptyState ════════════ */
export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`${styles.empty} ${className}`} role="status" aria-live="polite">
      {icon && (
        <div className={styles.emptyIconWrap} aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <div className={styles.emptyTitle}>{title}</div>}
      {description && <div className={styles.emptyDesc}>{description}</div>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

/* ════════════ SearchInput ════════════ */
export function SearchInput({ value, onChange, placeholder = 'بحث...', className = '' }) {
  return (
    <div className={`${styles.searchWrap} ${className}`}>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label={placeholder}
      />
      <span className={styles.searchIcon}>🔍</span>
    </div>
  );
}

/* ════════════ Pagination ════════════ */
export function Pagination({ page, totalPages, hasMore, onPrev, onNext, className = '' }) {
  return (
    <div className={`${styles.pagination} ${className}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <button
        className={styles.pageBtn}
        onClick={onNext}
        disabled={!hasMore}
        aria-label="الصفحة التالية"
      >
        التالي
      </button>
      <span className={styles.pageInfo} style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-gray-600)' }}>
        صفحة {page} {totalPages ? `من ${totalPages}` : ''}
      </span>
      <button
        className={styles.pageBtn}
        onClick={onPrev}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        السابق
      </button>
    </div>
  );
}

/* ════════════ Modal ════════════ */
export function Modal({ open, onClose, title, children, maxWidth = 500, className = '' }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else       { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.modalOverlay}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={contentRef}
        className={`${styles.modalContent} ${className}`}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>{title}</h3>
            <button className={styles.modalClose} onClick={onClose} aria-label="إغلاق">✕</button>
          </div>
        )}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

/* ════════════ ProgressBar ════════════ */
export function ProgressBar({ value, max = 100, color, showLabel = false, className = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`${styles.progressTrack} ${className}`}>
      <div
        className={styles.progressFill}
        style={{ width: `${pct}%`, background: color || undefined }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {showLabel && pct > 15 && (
          <span className={styles.progressLabel}>{pct}%</span>
        )}
      </div>
    </div>
  );
}
