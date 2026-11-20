import { z } from 'zod';

export const DayTaskSchema = z.object({
  id: z.string().default(() => `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  repositoryUrl: z.string().optional().default(''),
  dueDate: z.string().optional(),
  completedAt: z.string().nullable().optional().default(null),
});

export const DaySchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().positive(),
  title: z.string().min(1, 'Day title is required'),
  description: z.string().default(''),
  objectives: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  repositoryUrl: z.string().optional().default(''),
  estimatedMinutes: z.number().int().default(180),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  tasks: z.array(DayTaskSchema).default([]),
  notes: z.string().optional().default(''),
  completedAt: z.string().nullable().optional().default(null),
  timeSpentMinutes: z.number().optional().default(0),
});

export const WeekSchema = z.object({
  id: z.string(),
  weekNumber: z.number().int().positive(),
  title: z.string().min(1, 'Week title is required'),
  description: z.string().default(''),
  deliverable: z.string().default(''),
  objective: z.string().optional().default(''),
  topics: z.array(z.string()).optional().default([]),
  reviewChecklist: z.array(z.string()).optional().default([]),
  days: z.array(DaySchema).default([]),
});

export const LearningMapSchema = z.object({
  schemaVersion: z.string().default('1.0'),
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  category: z.string().default('General'),
  status: z.enum(['not-started', 'active', 'paused', 'completed']).default('active'),
  startDate: z.string().nullable().optional().default(null),
  targetDate: z.string().nullable().optional().default(null),
  dailyCommitmentMinutes: z.number().int().default(180),
  repositoryUrl: z.string().optional().default(''),
  icon: z.string().optional().default('Compass'),
  accentColor: z.string().optional().default('#e11d48'),
  weeks: z.array(WeekSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  isDeleted: z.boolean().optional().default(false),
  deletedAt: z.string().nullable().optional().default(null),
});

export type LearningMapInput = z.infer<typeof LearningMapSchema>;

export const WorkoutExerciseSchema = z.object({
  id: z.string().default(() => `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.coerce.number().int().positive().default(3),
  rep_range: z.string().default('8-12'),
  rest_seconds: z.coerce.number().int().default(90),
  equipment: z.string().optional(),
  notes: z.string().optional(),
  tracking: z.any().optional(),
});

export const WorkoutSessionSchema = z.object({
  id: z.string().min(1, 'Workout session id is required'),
  name: z.string().min(1, 'Workout session name is required'),
  day_order: z.number().optional(),
  muscle_groups: z.array(z.string()).default([]),
  exercises: z.array(WorkoutExerciseSchema).default([]),
});

export const RestDayConfigSchema = z.object({
  id: z.string().default('rest'),
  name: z.string().default('Rest / Recovery'),
  activities: z.array(z.string()).default([]),
});

export const WorkoutScheduleDaySchema = z.object({
  day: z.string().min(1, 'Day name is required'),
  workout_id: z.string().min(1, 'Workout id is required'),
});

export const WorkoutTrainingGuidelinesSchema = z.object({
  warm_up_minutes: z.string().optional(),
  compound_rest_seconds: z.string().optional(),
  isolation_rest_seconds: z.string().optional(),
  target_reps_in_reserve: z.string().optional(),
  progression: z.string().optional(),
  working_sets_only: z.boolean().optional(),
}).optional();

export const WorkoutPlanSchema = z.object({
  id: z.string().default(() => `workout-${Date.now()}`),
  name: z.string().min(1, 'Workout plan name is required'),
  description: z.string().optional().default(''),
  version: z.number().optional().default(1),
  goal: z.string().optional().default('general_fitness'),
  startDate: z.string().optional().default('2026-11-20'),
  schedule: z.array(WorkoutScheduleDaySchema).min(1, 'Schedule must include at least one day'),
  training_guidelines: WorkoutTrainingGuidelinesSchema,
  workouts: z.array(WorkoutSessionSchema).default([]),
  rest_days: z.array(RestDayConfigSchema).optional().default([]),
  updatedAt: z.string().optional(),
});

export type WorkoutPlanInput = z.infer<typeof WorkoutPlanSchema>;

