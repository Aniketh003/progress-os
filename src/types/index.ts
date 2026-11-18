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
