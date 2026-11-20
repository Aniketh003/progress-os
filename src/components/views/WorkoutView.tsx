'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dumbbell,
  CheckCircle2,
  Calendar,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Moon,
  Check,
} from 'lucide-react';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { WorkoutImportModal } from '@/components/modals/WorkoutImportModal';
import {
  getWorkoutForDate,
  getLocalDateString,
  getCalendarDaysDiff,
  DAYS_OF_WEEK,
} from '@/lib/workout';
import { WorkoutExercise } from '@/types';
import { cn } from '@/lib/utils';

interface WorkoutSessionRecord {
  sessionDate: string; // YYYY-MM-DD
  completed: Record<string, boolean>;
}

type WorkoutCompletionsStorage = Record<string, WorkoutSessionRecord>;

export function WorkoutView() {
  const { data: session } = useSession();
  const { plan, isLoading, error, savePlan, resetToDefault, exportPlan } = useWorkoutPlan();

  // Selected date offset for previewing week days (default is 0 = Today)
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  // Today's actual date
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => getLocalDateString(today), [today]);

  // Target date being viewed (Today + offset)
  const targetDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + selectedDayOffset);
    return d;
  }, [today, selectedDayOffset]);

  const targetDateStr = useMemo(() => getLocalDateString(targetDate), [targetDate]);
  const isViewingToday = selectedDayOffset === 0;

  // Compute scheduled workout for target date
  const scheduled = useMemo(() => {
    if (!plan) return null;
    return getWorkoutForDate(plan, targetDate);
  }, [plan, targetDate]);

  const workoutId = scheduled?.workoutId || 'rest';

  // Exercises list for the active session
  const exercises: WorkoutExercise[] = useMemo(() => {
    if (!scheduled || scheduled.isRestDay || !scheduled.session) return [];
    return scheduled.session.exercises || [];
  }, [scheduled]);

  // Storage key isolated per user
  const completionsStorageKey = session?.user?.email
    ? `progressos_workout_checks_${session.user.email}`
    : 'progressos_workout_checks_local';

  // State of all saved workout completions: { [workoutId]: { sessionDate, completed } }
  const [allCompletions, setAllCompletions] = useState<WorkoutCompletionsStorage>({});
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Load completions from localStorage on mount / user change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(completionsStorageKey);
      if (raw) {
        setAllCompletions(JSON.parse(raw));
      } else {
        setAllCompletions({});
      }
    } catch {
      setAllCompletions({});
    } finally {
      setIsStorageLoaded(true);
    }
  }, [completionsStorageKey]);

  // Determine active completed exercises for the current workout and date.
  // Persists for 7 days until the next same workout is repeated.
  const completedExercises: Record<string, boolean> = useMemo(() => {
    if (!isStorageLoaded || scheduled?.isRestDay || workoutId === 'rest') {
      return {};
    }

    const record = allCompletions[workoutId];
    if (!record) return {};

    // Calculate days between the saved completion session and target date
    const daysDiff = getCalendarDaysDiff(record.sessionDate, targetDateStr);

    // If within 7 days of the session date, persist checkboxes!
    // If 7 days or more have elapsed, the next same workout repeats -> starts fresh!
    if (daysDiff >= 0 && daysDiff < 7) {
      return record.completed || {};
    }

    return {};
  }, [allCompletions, workoutId, targetDateStr, scheduled?.isRestDay, isStorageLoaded]);

  // Session completion calculation
  const totalCount = exercises.length;
  const completedCount = useMemo(() => {
    return exercises.filter((ex) => completedExercises[ex.id]).length;
  }, [exercises, completedExercises]);

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Identify next uncompleted exercise
  const nextExerciseId = useMemo(() => {
    const uncompleted = exercises.find((ex) => !completedExercises[ex.id]);
    return uncompleted ? uncompleted.id : null;
  }, [exercises, completedExercises]);

  // Toggle completion with 7-day persistence
  const handleToggleExercise = useCallback(
    (exerciseId: string) => {
      if (workoutId === 'rest') return;

      const updatedCompleted = {
        ...completedExercises,
        [exerciseId]: !completedExercises[exerciseId],
      };

      const updatedStorage: WorkoutCompletionsStorage = {
        ...allCompletions,
        [workoutId]: {
          sessionDate: targetDateStr,
          completed: updatedCompleted,
        },
      };

      setAllCompletions(updatedStorage);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            completionsStorageKey,
            JSON.stringify(updatedStorage)
          );
        } catch (err) {
          console.error('Failed to save workout completions:', err);
        }
      }
    },
    [workoutId, completedExercises, allCompletions, targetDateStr, completionsStorageKey]
  );

  // Reset checkboxes for current workout
  const handleResetCheckboxes = useCallback(() => {
    if (workoutId === 'rest') return;

    const updatedStorage: WorkoutCompletionsStorage = {
      ...allCompletions,
      [workoutId]: {
        sessionDate: targetDateStr,
        completed: {},
      },
    };

    setAllCompletions(updatedStorage);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          completionsStorageKey,
          JSON.stringify(updatedStorage)
        );
      } catch (err) {
        console.error('Failed to reset workout completions:', err);
      }
    }
  }, [workoutId, allCompletions, targetDateStr, completionsStorageKey]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center animate-pulse">
          <Dumbbell className="w-5 h-5" />
        </div>
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading workout schedule...
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
          <Dumbbell className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          No Workout Schedule Loaded
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {error || 'Upload your workout schedule JSON or initialize the standard PPL + Upper/Lower program.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Schedule
          </button>
          <button
            onClick={resetToDefault}
            className="px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Standard Program
          </button>
        </div>
        <WorkoutImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={(newPlan) => savePlan(newPlan)}
          onLoadDefault={resetToDefault}
        />
      </div>
    );
  }

  // 7-day pill indicator values relative to today (Monday through Sunday)
  const currentDayOfWeek = today.getDay();
  const weekDays = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun indices

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-5">
      {/* 1. Header Card with Title, Import/Export, and 7 Day Boxes */}
      <div className="relative p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm overflow-hidden">
        {/* Subtle crimson accent glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                <Dumbbell className="w-3 h-3" />
                Workout Planner
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {targetDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {isViewingToday ? (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Today
                </span>
              ) : (
                <button
                  onClick={() => setSelectedDayOffset(0)}
                  className="text-[10px] font-medium text-primary hover:underline"
                >
                  Return to Today
                </button>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {scheduled?.isRestDay
                ? 'Rest & Recovery Day'
                : scheduled?.session?.name || 'Workout Session'}
            </h1>

            {!scheduled?.isRestDay && scheduled?.session?.muscle_groups && (
              <p className="text-xs text-muted-foreground">
                Target: {scheduled.session.muscle_groups.join(' • ')}
              </p>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-border/70 hover:border-border hover:bg-accent text-xs font-medium text-foreground transition-all flex items-center gap-1.5 shadow-2xs"
              title="Import custom workout schedule JSON"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Import</span>
            </button>
            <button
              onClick={exportPlan}
              className="px-3 py-1.5 rounded-lg border border-border/70 hover:border-border hover:bg-accent text-xs font-medium text-foreground transition-all flex items-center gap-1.5 shadow-2xs"
              title="Export schedule as JSON"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Small Weekly Schedule Indicator Pills (Clean Day Names Only) */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((dayIdx) => {
              const diff = dayIdx - currentDayOfWeek;
              const isToday = diff === 0;
              const isSelected = diff === selectedDayOffset;

              return (
                <button
                  key={dayIdx}
                  type="button"
                  onClick={() => setSelectedDayOffset(diff)}
                  className={cn(
                    'py-2 px-1 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative focus:outline-none',
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : isToday
                      ? 'bg-card border-border/90 text-foreground ring-1 ring-primary/40 font-semibold'
                      : 'bg-card/40 border-border/40 hover:bg-muted/40 text-muted-foreground font-medium'
                  )}
                >
                  {isToday && (
                    <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  <span className="text-xs font-mono">
                    {DAYS_OF_WEEK[dayIdx].slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Section: Today's Workout or Rest Day */}
      {scheduled?.isRestDay ? (
        /* Minimal Rest Day Screen */
        <div className="p-8 sm:p-12 rounded-2xl bg-card border border-border/80 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-md shadow-primary/10">
            <Moon className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Recovery & Rest
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Muscles grow during recovery, not just training. Focus on quality sleep, adequate protein and hydration today.
            </p>
          </div>

          {scheduled.restDay?.activities && scheduled.restDay.activities.length > 0 && (
            <div className="max-w-md mx-auto pt-4 border-t border-border/50 text-left">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-3 text-center">
                Recommended Recovery Protocol
              </span>
              <ul className="space-y-2">
                {scheduled.restDay.activities.map((activity, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-xs text-foreground bg-muted/30 p-2.5 rounded-xl border border-border/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Workout Checklist & Exercises View */
        <div className="space-y-3.5">
          {/* Progress Bar & Counter */}
          <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Session Progress
                </span>
                <span className="font-mono text-muted-foreground">
                  {completedCount}/{totalCount} Completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleResetCheckboxes}
                className="self-end sm:self-center text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors shrink-0"
                title="Clear current session checkboxes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Training Guidelines Dropdown */}
          {plan.training_guidelines && (
            <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Training Guidelines & Rest Targets
                </span>
                <span className="text-[11px] underline">
                  {showGuidelines ? 'Hide' : 'Show'}
                </span>
              </button>

              {showGuidelines && (
                <div className="px-4 pb-3 pt-1 border-t border-border/40 space-y-2 text-muted-foreground">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="block text-foreground font-semibold">Warm-up</span>
                      <span>{plan.training_guidelines.warm_up_minutes || '5-10'} mins</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="block text-foreground font-semibold">Compound Rest</span>
                      <span>{plan.training_guidelines.compound_rest_seconds || '120-180'} sec</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="block text-foreground font-semibold">Isolation Rest</span>
                      <span>{plan.training_guidelines.isolation_rest_seconds || '60-90'} sec</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="block text-foreground font-semibold">Reps in Reserve</span>
                      <span>{plan.training_guidelines.target_reps_in_reserve || '1-3'} RIR</span>
                    </div>
                  </div>
                  {plan.training_guidelines.progression && (
                    <p className="text-[11px] leading-relaxed italic pt-1">
                      💡 {plan.training_guidelines.progression}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Exercises Checklist */}
          <div className="space-y-2.5">
            {exercises.map((exercise, index) => {
              const isCompleted = !!completedExercises[exercise.id];
              const isNext = exercise.id === nextExerciseId && !isCompleted;

              return (
                <div
                  key={exercise.id}
                  onClick={() => handleToggleExercise(exercise.id)}
                  className={cn(
                    'group relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                    isCompleted
                      ? 'bg-muted/20 border-border/40 opacity-70'
                      : isNext
                      ? 'bg-card border-primary/60 shadow-xs ring-1 ring-primary/20'
                      : 'bg-card border-border/70 hover:border-border hover:bg-card/90'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Custom Minimal Checkbox */}
                    <button
                      type="button"
                      aria-label={`Toggle ${exercise.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExercise(exercise.id);
                      }}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground shadow-2xs'
                          : 'border-border/80 group-hover:border-primary/60 bg-background'
                      )}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <h3
                          className={cn(
                            'text-sm font-semibold text-foreground transition-colors',
                            isCompleted && 'line-through text-muted-foreground'
                          )}
                        >
                          {exercise.name}
                        </h3>
                        {isNext && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                            Next Up
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="font-medium text-foreground">
                          {exercise.sets} sets × {exercise.rep_range} reps
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exercise.rest_seconds}s rest
                        </span>
                        {exercise.equipment && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] text-muted-foreground">
                              {exercise.equipment}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        'text-xs font-mono font-medium',
                        isCompleted ? 'text-emerald-500' : 'text-muted-foreground'
                      )}
                    >
                      {isCompleted ? 'Done' : `${exercise.sets} sets`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Import Modal */}
      <WorkoutImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(newPlan) => savePlan(newPlan)}
        onLoadDefault={resetToDefault}
      />
    </div>
  );
}
