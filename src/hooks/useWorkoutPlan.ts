'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { WorkoutPlan } from '@/types';
import { validateWorkoutPlan } from '@/lib/workout';
import { db } from '@/lib/db';
import { DEFAULT_WORKOUT_PLAN } from '@/lib/defaults';

const LOCAL_STORAGE_KEY_PREFIX = 'progressos_workout_plan_';

export function useWorkoutPlan() {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = session?.user?.email
    ? `${LOCAL_STORAGE_KEY_PREFIX}${session.user.email}`
    : `${LOCAL_STORAGE_KEY_PREFIX}local`;

  // Default plan directly from code
  const fetchDefaultPlan = useCallback(async (): Promise<WorkoutPlan | null> => {
    return DEFAULT_WORKOUT_PLAN;
  }, []);

  // Load the appropriate plan for the current user directly from DB
  const loadPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. If user is authenticated, pull directly from cloud MongoDB via API
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/workout');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.plan) {
              setPlan(data.plan);
              // Cache in local Dexie database
              try {
                await db.workoutPlans.put(data.plan);
              } catch {
                // Ignore local cache error
              }
              setIsLoading(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('Could not fetch cloud workout plan, trying local database fallback:', apiErr);
        }
      }

      // 2. If not authenticated or offline, pull directly from local Dexie database
      try {
        const localDbPlan =
          (await db.workoutPlans.get('ppl-upper-lower-hypertrophy')) ||
          (await db.workoutPlans.toCollection().first());
        if (localDbPlan) {
          const validation = validateWorkoutPlan(localDbPlan);
          if (validation.success && validation.data) {
            setPlan(validation.data);
            setIsLoading(false);
            return;
          }
        }
      } catch (dbErr) {
        console.warn('Could not read workout plan from Dexie DB:', dbErr);
      }

      // 3. Fallback: seed default into Dexie DB and pull from it
      const defaultPlan = await fetchDefaultPlan();
      if (defaultPlan) {
        try {
          await db.workoutPlans.put(defaultPlan);
        } catch {
          // Ignore
        }
        setPlan(defaultPlan);
      }
    } catch (err) {
      console.error('Error loading workout plan:', err);
      setError('Failed to load workout plan');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, fetchDefaultPlan]);

  useEffect(() => {
    if (status !== 'loading') {
      loadPlan();
    }
  }, [status, loadPlan]);

  // Save new plan directly to DB
  const savePlan = useCallback(
    async (newPlan: WorkoutPlan): Promise<boolean> => {
      try {
        const validation = validateWorkoutPlan(newPlan);
        if (!validation.success || !validation.data) {
          setError(validation.error || 'Invalid workout plan structure');
          return false;
        }

        const validPlan = validation.data;
        setPlan(validPlan);

        // Save directly to Dexie database
        try {
          await db.workoutPlans.put(validPlan);
        } catch (dbErr) {
          console.warn('Failed to save workout plan to Dexie DB:', dbErr);
        }

        // Save to user-specific localStorage cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(validPlan));
        }

        // If user is authenticated, save directly to MongoDB
        if (session?.user?.email) {
          await fetch('/api/workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validPlan),
          });
        }

        return true;
      } catch (err) {
        console.error('Error saving workout plan:', err);
        setError('Failed to save workout plan');
        return false;
      }
    },
    [session?.user?.email, storageKey]
  );

  // Reset to default workout plan in DB
  const resetToDefault = useCallback(async () => {
    setIsLoading(true);
    try {
      const defaultPlan = await fetchDefaultPlan();
      if (defaultPlan) {
        setPlan(defaultPlan);
        try {
          await db.workoutPlans.put(defaultPlan);
        } catch {
          // Ignore
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey);
        }
        if (session?.user?.email) {
          await fetch('/api/workout', { method: 'DELETE' });
          // Re-seed default directly into MongoDB
          await fetch('/api/workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultPlan),
          });
        }
      }
    } catch (err) {
      console.error('Error resetting workout plan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDefaultPlan, session?.user?.email, storageKey]);

  // Export current plan as a downloadable JSON file
  const exportPlan = useCallback(() => {
    if (!plan) return;
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(plan, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `${plan.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')}-schedule.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export workout plan:', err);
    }
  }, [plan]);

  return {
    plan,
    isLoading,
    error,
    savePlan,
    resetToDefault,
    exportPlan,
    reload: loadPlan,
  };
}
