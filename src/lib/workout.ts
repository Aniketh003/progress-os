import { WorkoutPlan, WorkoutSession, RestDayConfig } from '@/types';
import { WorkoutPlanSchema } from '@/lib/schema';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Returns formatted YYYY-MM-DD for a given date in local time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the calendar days difference between startStr and targetStr (target - start)
 * Uses Date.UTC to guarantee no DST or timezone shifting bugs.
 */
export function getCalendarDaysDiff(startStr: string, targetStr: string): number {
  const [sYear, sMonth, sDay] = startStr.split('-').map(Number);
  const [tYear, tMonth, tDay] = targetStr.split('-').map(Number);

  const startUTC = Date.UTC(sYear, sMonth - 1, sDay);
  const targetUTC = Date.UTC(tYear, tMonth - 1, tDay);

  return Math.floor((targetUTC - startUTC) / (24 * 60 * 60 * 1000));
}

/**
 * Determines the scheduled workout for a specific date given a WorkoutPlan.
 */
export function getWorkoutForDate(
  plan: WorkoutPlan,
  targetDate: Date | string = new Date()
): {
  targetDateStr: string;
  dayName: string;
  isRestDay: boolean;
  workoutId: string;
  session?: WorkoutSession;
  restDay?: RestDayConfig;
} {
  const d = typeof targetDate === 'string' ? parseDateString(targetDate) : targetDate;
  const targetDateStr = getLocalDateString(d);
  const dayName = DAYS_OF_WEEK[d.getDay()];

  if (!plan || !plan.schedule || plan.schedule.length === 0) {
    return {
      targetDateStr,
      dayName,
      isRestDay: true,
      workoutId: 'rest',
      restDay: {
        id: 'rest',
        name: 'Rest / Recovery',
        activities: ['Take an active rest day and hydrate well.'],
      },
    };
  }

  // 1. Look for matching day of week in the schedule (case-insensitive)
  const matchedScheduleItem = plan.schedule.find(
    (item) => item.day.trim().toLowerCase() === dayName.toLowerCase()
  );

  let workoutId = 'rest';
  if (matchedScheduleItem) {
    workoutId = matchedScheduleItem.workout_id;
  } else if (plan.startDate) {
    // If schedule is an arbitrary N-day rotation not labeled with standard day names
    const diff = getCalendarDaysDiff(plan.startDate, targetDateStr);
    const cycleLen = plan.schedule.length;
    const cycleIndex = ((diff % cycleLen) + cycleLen) % cycleLen;
    workoutId = plan.schedule[cycleIndex].workout_id;
  }

  const isRest = workoutId.toLowerCase() === 'rest';

  if (isRest) {
    const customRest = plan.rest_days?.find((r) => r.id === workoutId) ||
      plan.rest_days?.[0] || {
        id: 'rest',
        name: 'Rest / Recovery',
        activities: [
          'Optional easy walk',
          'Light mobility & stretching',
          'Adequate food and hydration',
          '7-9 hours of restorative sleep',
        ],
      };

    return {
      targetDateStr,
      dayName,
      isRestDay: true,
      workoutId,
      restDay: customRest,
    };
  }

  const session = plan.workouts.find(
    (w) => w.id.toLowerCase() === workoutId.toLowerCase()
  );

  return {
    targetDateStr,
    dayName,
    isRestDay: false,
    workoutId,
    session,
  };
}

/**
 * Safe date parsing for YYYY-MM-DD
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

/**
 * Validates any JSON input against WorkoutPlanSchema
 */
export function validateWorkoutPlan(json: unknown): {
  success: boolean;
  data?: WorkoutPlan;
  error?: string;
} {
  try {
    const parsed = WorkoutPlanSchema.safeParse(json);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
        : 'Invalid workout plan structure';
      return { success: false, error: message };
    }
    return { success: true, data: parsed.data as WorkoutPlan };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown validation error',
    };
  }
}
