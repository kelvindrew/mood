import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Screen WakeLock Hook for PLAYFLIX Mobile Controllers
 * Prevents smartphone screens from dimming or locking during active gameplay,
 * which prevents unwanted WebSocket background disconnects.
 */
export function useWakeLock(enabled: boolean = true) {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const wakeLockRef = useRef<any>(null);

  const requestLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    try {
      if (!wakeLockRef.current || wakeLockRef.current.released) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setIsLocked(true);

        wakeLockRef.current.addEventListener('release', () => {
          setIsLocked(false);
        });
      }
    } catch (err: any) {
      // Wake Lock may fail if battery saver is on or page is not active
      console.debug('[WakeLock] Request failed:', err?.message || err);
      setIsLocked(false);
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch {}
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      releaseLock();
      return;
    }

    requestLock();

    // Re-acquire lock when user returns to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [enabled, requestLock, releaseLock]);

  return { isLocked };
}
