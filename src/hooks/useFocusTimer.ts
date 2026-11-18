'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const TIMER_STORAGE_KEY = 'progressos_focus_timer';
const TIMER_EVENT = 'progressos_timer_change';

export interface FocusTimerState {
  durationSeconds: number;
  remainingSeconds: number;
  targetEndTime: number | null;
  status: 'idle' | 'running' | 'paused' | 'completed';
}

const DEFAULT_STATE: FocusTimerState = {
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  targetEndTime: null,
  status: 'idle',
};

export function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First soft chime tone (523.25 Hz - C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second soft chime tone (659.25 Hz - E5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.15);
    gain2.gain.setValueAtTime(0.18, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.65);
  } catch {
    // Ignore audio permission or autoplay issues
  }
}

function getStoredTimerState(): FocusTimerState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as FocusTimerState;

    if (parsed.status === 'running' && parsed.targetEndTime) {
      const now = Date.now();
      const diff = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000));
      if (diff <= 0) {
        return {
          ...parsed,
          remainingSeconds: 0,
          targetEndTime: null,
          status: 'completed',
        };
      }
      return {
        ...parsed,
        remainingSeconds: diff,
      };
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function persistTimerState(state: FocusTimerState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(TIMER_EVENT, { detail: state }));
  } catch {
    // Ignore localStorage write error
  }
}

export function useFocusTimer() {
  const [timerState, setTimerState] = useState<FocusTimerState>(DEFAULT_STATE);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    const current = getStoredTimerState();
    setTimerState(current);
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<FocusTimerState>;
      if (customEvent.detail) {
        setTimerState(customEvent.detail);
      } else {
        syncFromStorage();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TIMER_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    window.addEventListener(TIMER_EVENT, handleCustomChange);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(TIMER_EVENT, handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncFromStorage]);

  // Active countdown loop
  useEffect(() => {
    if (timerState.status === 'running' && timerState.targetEndTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.round((timerState.targetEndTime! - now) / 1000));

        if (diff <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const nextState: FocusTimerState = {
            ...timerState,
            remainingSeconds: 0,
            targetEndTime: null,
            status: 'completed',
          };
          setTimerState(nextState);
          persistTimerState(nextState);
          playChimeSound();
        } else {
          setTimerState((prev) => {
            if (prev.status !== 'running') return prev;
            return {
              ...prev,
              remainingSeconds: diff,
            };
          });
        }
      }, 500);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [timerState.status, timerState.targetEndTime, timerState]);

  // Actions
  const startTimer = useCallback((customDurationSeconds?: number) => {
    const duration = customDurationSeconds ?? timerState.durationSeconds;
    const targetEndTime = Date.now() + duration * 1000;
    const nextState: FocusTimerState = {
      durationSeconds: duration,
      remainingSeconds: duration,
      targetEndTime,
      status: 'running',
    };
    setTimerState(nextState);
    persistTimerState(nextState);
  }, [timerState.durationSeconds]);

  const pauseTimer = useCallback(() => {
    if (timerState.status !== 'running' || !timerState.targetEndTime) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.round((timerState.targetEndTime - now) / 1000));
    const nextState: FocusTimerState = {
      ...timerState,
      remainingSeconds: remaining,
      targetEndTime: null,
      status: 'paused',
    };
    setTimerState(nextState);
    persistTimerState(nextState);
  }, [timerState]);

  const resumeTimer = useCallback(() => {
    if (timerState.status !== 'paused') return;
    const targetEndTime = Date.now() + timerState.remainingSeconds * 1000;
    const nextState: FocusTimerState = {
      ...timerState,
      targetEndTime,
      status: 'running',
    };
    setTimerState(nextState);
    persistTimerState(nextState);
  }, [timerState]);

  const resetTimer = useCallback((newDurationSeconds?: number) => {
    const duration = newDurationSeconds ?? timerState.durationSeconds;
    const nextState: FocusTimerState = {
      durationSeconds: duration,
      remainingSeconds: duration,
      targetEndTime: null,
      status: 'idle',
    };
    setTimerState(nextState);
    persistTimerState(nextState);
  }, [timerState.durationSeconds]);

  const endSession = useCallback(() => {
    const nextState: FocusTimerState = {
      durationSeconds: timerState.durationSeconds,
      remainingSeconds: timerState.durationSeconds,
      targetEndTime: null,
      status: 'idle',
    };
    setTimerState(nextState);
    persistTimerState(nextState);
  }, [timerState.durationSeconds]);

  const setDuration = useCallback((seconds: number) => {
    const nextState: FocusTimerState = {
      durationSeconds: seconds,
      remainingSeconds: seconds,
      targetEndTime: null,
      status: 'idle',
    };
    setTimerState(nextState);
    persistTimerState(nextState);
  }, []);

  return {
    ...timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    endSession,
    setDuration,
  };
}
