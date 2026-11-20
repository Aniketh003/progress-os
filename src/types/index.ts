export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type DayStatus = 'pending' | 'in-progress' | 'completed';
export type MapStatus = 'not-started' | 'active' | 'paused' | 'completed';

export interface DayTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  repositoryUrl?: string;
  dueDate?: string;
  completedAt?: string | null;
}

export interface Day {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  objectives: string[];
  topics: string[];
  repositoryUrl?: string;
  estimatedMinutes: number;
  status: DayStatus;
  tasks: DayTask[];
  notes?: string;
  completedAt?: string | null;
  timeSpentMinutes?: number;
}

export interface Week {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  deliverable: string;
  objective?: string;
  topics?: string[];
  reviewChecklist?: string[];
  days: Day[];
}

export interface LearningMap {
  schemaVersion: string;
  id: string;
  title: string;
  description: string;
  category: string;
  status: MapStatus;
  startDate?: string | null;
  targetDate?: string | null;
  dailyCommitmentMinutes: number;
  repositoryUrl?: string;
  icon?: string;
  accentColor?: string;
  weeks: Week[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface StandaloneTodo {
  id: string;
  title: string;
  description?: string;
  learningMapId?: string;
  learningMapTitle?: string;
  dayId?: string;
  dayNumber?: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  repositoryUrl?: string;
  order: number;
  createdAt: string;
  completedAt?: string | null;
  isDaily?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  learningMapId?: string;
  learningMapTitle?: string;
  topicsCovered: string[];
  whatILearned: string;
  whatIBuilt?: string;
  problemsEncountered?: string;
  keyTakeaways?: string;
  tomorrowPlan?: string;
  timeSpentMinutes: number;
  repositoryUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string; // 'current'
  theme: 'light' | 'dark' | 'system';
  dailyCommitmentMinutes: number;
  userName: string;
  email?: string;
}

// Workout Planner Types
export interface WorkoutExerciseTrackingSet {
  weight_kg: number | null;
  reps: number | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  rep_range: string;
  rest_seconds: number;
  equipment?: string;
  notes?: string;
  tracking?: {
    completed?: boolean;
    sets?: WorkoutExerciseTrackingSet[];
  };
}

export interface WorkoutSession {
  id: string;
  name: string;
  day_order?: number;
  muscle_groups: string[];
  exercises: WorkoutExercise[];
}

export interface RestDayConfig {
  id: string;
  name: string;
  activities: string[];
}

export interface WorkoutScheduleDay {
  day: string; // "Monday", "Tuesday", etc.
  workout_id: string; // "push", "pull", "legs", "upper", "lower", "rest"
}

export interface WorkoutTrainingGuidelines {
  warm_up_minutes?: string;
  compound_rest_seconds?: string;
  isolation_rest_seconds?: string;
  target_reps_in_reserve?: string;
  progression?: string;
  working_sets_only?: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  version?: number;
  goal?: string;
  startDate?: string; // YYYY-MM-DD, e.g. "2026-11-20"
  schedule: WorkoutScheduleDay[];
  training_guidelines?: WorkoutTrainingGuidelines;
  workouts: WorkoutSession[];
  rest_days?: RestDayConfig[];
  progress_tracking?: any;
  updatedAt?: string;
  userEmail?: string;
}

