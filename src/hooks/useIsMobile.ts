import { useEffect, useState } from 'react';

const QUERY = '(max-width: 1023px)';

/** True below the `lg` breakpoint, where the app switches to the full-screen + bottom-sheet layout. */
export function useIsMobile(): boolean {
  const get = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
  const [mobile, setMobile] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}

export const isMobileNow = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
