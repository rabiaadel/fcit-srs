import { useState } from 'react';

/**
 * Responsive breakpoint detection hook
 * @param {string} query - CSS media query string, e.g. '(max-width: 768px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  // Use useEffect-free approach with matchMedia listener for SSR safety
  if (typeof window !== 'undefined') {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    // Modern browsers
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    }
  }

  return matches;
}

/** Convenience breakpoints */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
