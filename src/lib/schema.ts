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
  accentColor: z.string().optional().default('#6366f1'),
  weeks: z.array(WeekSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type LearningMapInput = z.infer<typeof LearningMapSchema>;
