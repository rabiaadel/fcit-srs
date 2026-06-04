/* ═══════════════════════════════════════════════════════════════════════════
   useToast — Centralised toast hook wrapping react-hot-toast
   Arabic-optimised styles, RTL text-align, consistent icon alignment
   ═══════════════════════════════════════════════════════════════════════════ */
import { toast as _toast } from 'react-hot-toast';

const BASE = {
  style: {
    fontFamily: 'var(--font-family)',
    direction: 'rtl',
    textAlign: 'right',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--color-gray-200)',
    background: 'var(--surface-card)',
    color: 'var(--color-gray-800)',
    fontSize: '14px',
    padding: '12px 16px',
    maxWidth: '360px',
  },
};

export function useToast() {
  return {
    success: (msg, opts = {}) => _toast.success(msg, {
      ...BASE,
      duration: 3500,
      iconTheme: { primary: 'var(--color-success)', secondary: '#fff' },
      ...opts,
    }),
    error: (msg, opts = {}) => _toast.error(msg, {
      ...BASE,
      duration: 5000,
      iconTheme: { primary: 'var(--color-error)', secondary: '#fff' },
      ...opts,
    }),
    info: (msg, opts = {}) => _toast(msg, {
      ...BASE,
      duration: 3500,
      icon: 'ℹ️',
      ...opts,
    }),
    loading: (msg, opts = {}) => _toast.loading(msg, {
      ...BASE,
      ...opts,
    }),
    dismiss: _toast.dismiss,
  };
}
