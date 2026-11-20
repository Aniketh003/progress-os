'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationProgressContextType {
  isNavigating: boolean;
  progress: number;
  startNavigation: (targetUrl?: string) => void;
  completeNavigation: () => void;
}

const NavigationProgressContext = createContext<NavigationProgressContextType | undefined>(
  undefined
);

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPathRef = useRef<string>(pathname);

  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname]);

  const clearAllTimers = useCallback(() => {
    if (trickleIntervalRef.current) {
      clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const completeNavigation = useCallback(() => {
    if (trickleIntervalRef.current) {
      clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }

    setProgress(100);

    finishTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      resetTimeoutRef.current = setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 250);
  }, []);

  const startNavigation = useCallback(
    (targetUrl?: string) => {
      if (targetUrl) {
        try {
          const parsed = new URL(targetUrl, window.location.origin);
          const targetPath = parsed.pathname;
          // If clicking on current route, skip
          if (targetPath === currentPathRef.current) {
            return;
          }
        } catch {
          // If relative URL string
          if (targetUrl === currentPathRef.current) {
            return;
          }
        }
      }

      clearAllTimers();
      setIsNavigating(true);
      setProgress(15);

      trickleIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + Math.floor(Math.random() * 8 + 6);
          if (prev < 70) return prev + Math.floor(Math.random() * 5 + 3);
          if (prev < 88) return prev + Math.floor(Math.random() * 3 + 1);
          if (prev < 94) return prev + 0.5;
          return prev;
        });
      }, 120);
    },
    [clearAllTimers]
  );

  // When pathname changes, complete the progress bar
  useEffect(() => {
    completeNavigation();
  }, [pathname, completeNavigation]);

  // Global click listener to intercept internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || targetAttr === '_blank') {
        return;
      }

      // Check if external URL
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }

      startNavigation(href);
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [startNavigation]);

  // Intercept history.pushState and popstate
  useEffect(() => {
    const handlePopState = () => {
      startNavigation();
    };

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      const url = args[2];
      if (url && typeof url === 'string') {
        startNavigation(url);
      }
      return originalPushState.apply(this, args);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [startNavigation]);

  return (
    <NavigationProgressContext.Provider
      value={{
        isNavigating,
        progress,
        startNavigation,
        completeNavigation,
      }}
    >
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    throw new Error('useNavigationProgress must be used within NavigationProgressProvider');
  }
  return context;
}

export function useProgressRouter() {
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();

  const push = useCallback(
    (url: string) => {
      startNavigation(url);
      router.push(url);
    },
    [router, startNavigation]
  );

  const replace = useCallback(
    (url: string) => {
      startNavigation(url);
      router.replace(url);
    },
    [router, startNavigation]
  );

  return {
    ...router,
    push,
    replace,
  };
}
