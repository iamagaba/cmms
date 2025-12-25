import { useEffect, useState } from 'react';

export const useDeviceType = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = () => setIsMobile(mq.matches);
    try {
      mq.addEventListener?.('change', handler);
    } catch {
      // Safari fallback for older browsers that only support addListener
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - legacy fallback may not match type definitions
  mq.addListener?.(handler);
    }
    handler();
    return () => {
      try {
        mq.removeEventListener?.('change', handler);
      } catch {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - legacy fallback may not match type definitions
  mq.removeListener?.(handler);
      }
    };
  }, [breakpoint]);

  return { isMobile };
};

export default useDeviceType;
