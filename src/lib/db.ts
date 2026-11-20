import Dexie, { type Table } from 'dexie';
import { LearningMap, StandaloneTodo, JournalEntry, UserSettings, Day, DayTask, WorkoutPlan } from '@/types';
import { LearningMapSchema, WorkoutPlanSchema } from './schema';
import { DEFAULT_LEARNING_MAPS, DEFAULT_WORKOUT_PLAN } from './defaults';

export class ProgressOSDatabase extends Dexie {
  learningMaps!: Table<LearningMap, string>;
  todos!: Table<StandaloneTodo, string>;
  journalEntries!: Table<JournalEntry, string>;
  settings!: Table<UserSettings, string>;
  workoutPlans!: Table<WorkoutPlan, string>;

  constructor() {
    super('ProgressOS_DB');
    this.version(1).stores({
      learningMaps: '&id, status, category, updatedAt',
      todos: '&id, status, priority, dueDate, learningMapId, order',
      journalEntries: '&id, date, learningMapId, createdAt',
      settings: '&id',
    });
    this.version(2).stores({
      learningMaps: '&id, status, category, updatedAt',
      todos: '&id, status, priority, dueDate, learningMapId, order',
      journalEntries: '&id, date, learningMapId, createdAt',
      settings: '&id',
      workoutPlans: '&id',
    });
  }
}

export const db = new ProgressOSDatabase();

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  id: 'current',
  theme: 'dark',
  dailyCommitmentMinutes: 180,
  userName: 'Guest',
};

// Seed checker & runner
export async function initializeDatabase() {
  if (typeof window === 'undefined') return;

  try {
    // Check settings
    const settings = await db.settings.get('current');
    if (!settings) {
      await db.settings.put(DEFAULT_SETTINGS);
    }

    // Auto-purge any soft-deleted maps older than 7 days
    await purgeExpiredDeletedMaps();

    // Ensure all default learning maps exist in Dexie DB
    for (const defaultMap of DEFAULT_LEARNING_MAPS) {
      const existing = await db.learningMaps.get(defaultMap.id);
      if (!existing) {
        await db.learningMaps.put(defaultMap);
        console.log(`ProgressOS: Seed map ${defaultMap.id} loaded into local DB.`);
      }
    }

    // Ensure default workout schedule exists in local Dexie database
    try {
      const existingWorkout = await db.workoutPlans.get(DEFAULT_WORKOUT_PLAN.id);
      if (!existingWorkout) {
        await db.workoutPlans.put(DEFAULT_WORKOUT_PLAN);
        console.log('ProgressOS: Seeded default workout plan into local database.');
      }
    } catch (workoutErr) {
      console.warn('ProgressOS: Could not seed default workout plan into database', workoutErr);
    }

    // Sanitize any legacy mock/relative repository URLs for default AI Engineering map
    try {
      const aiMap = await db.learningMaps.get('ai-engineering-90-days');
      if (aiMap) {
        let modified = false;
        if (aiMap.repositoryUrl && (aiMap.repositoryUrl.includes('example') || aiMap.repositoryUrl.includes('ai-engineer'))) {
          aiMap.repositoryUrl = '';
          modified = true;
        }
        aiMap.weeks.forEach((w) => {
          w.days.forEach((d) => {
            if (d.repositoryUrl && (d.repositoryUrl.startsWith('/') || d.repositoryUrl.includes('example'))) {
              d.repositoryUrl = '';
              modified = true;
            }
          });
        });
        if (modified) {
          await db.learningMaps.put(aiMap);
        }
      }
    } catch (cleanErr) {
      console.warn('ProgressOS: Could not clean legacy repo URLs', cleanErr);
    }
  } catch (error) {
    console.error('ProgressOS: Database initialization error', error);
  }
}

// Helpers for Learning Maps
export async function getLearningMaps(): Promise<LearningMap[]> {
  return await db.learningMaps.toArray();
}

export async function getLearningMap(id: string): Promise<LearningMap | undefined> {
  return await db.learningMaps.get(id);
}

export async function saveLearningMap(map: LearningMap): Promise<string> {
  map.updatedAt = new Date().toISOString();
  await db.learningMaps.put(map);
  return map.id;
}

export async function softDeleteLearningMap(id: string): Promise<void> {
  const map = await db.learningMaps.get(id);
  if (map) {
    map.isDeleted = true;
    map.deletedAt = new Date().toISOString();
    map.updatedAt = new Date().toISOString();
    await db.learningMaps.put(map);
  }
}

export const deleteLearningMap = softDeleteLearningMap;

export async function restoreLearningMap(id: string): Promise<void> {
  const map = await db.learningMaps.get(id);
  if (map) {
    map.isDeleted = false;
    map.deletedAt = null;
    map.updatedAt = new Date().toISOString();
    await db.learningMaps.put(map);
  }
}

export async function permanentlyDeleteLearningMap(id: string): Promise<void> {
  await db.transaction('rw', db.learningMaps, db.todos, db.journalEntries, async () => {
    await db.learningMaps.delete(id);
    await db.todos.where({ learningMapId: id }).delete();
    await db.journalEntries.where({ learningMapId: id }).delete();
  });
}

export async function purgeExpiredDeletedMaps(): Promise<string[]> {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const allMaps = await db.learningMaps.toArray();
  const expiredIds: string[] = [];

  for (const map of allMaps) {
    if (map.isDeleted && map.deletedAt) {
      const deletedTime = new Date(map.deletedAt).getTime();
      if (!isNaN(deletedTime) && deletedTime < cutoff) {
        expiredIds.push(map.id);
        await permanentlyDeleteLearningMap(map.id);
      }
    }
  }
  return expiredIds;
}

// Helper to update a single Day within a Learning Map
export async function updateDayInMap(
  mapId: string,
  dayId: string,
  updater: (day: Day) => Day
): Promise<LearningMap | undefined> {
  const map = await db.learningMaps.get(mapId);
  if (!map) return undefined;

  let found = false;
  for (const week of map.weeks) {
    const dayIndex = week.days.findIndex((d) => d.id === dayId);
    if (dayIndex !== -1) {
      week.days[dayIndex] = updater(week.days[dayIndex]);
      found = true;
      break;
    }
  }

  if (found) {
    // Dynamically update map status based on day statuses
    const allDays = map.weeks.flatMap((w) => w.days);
    const hasProgress = allDays.some((d) => d.status === 'completed' || d.status === 'in-progress');
    const allCompleted = allDays.length > 0 && allDays.every((d) => d.status === 'completed');

    if (allCompleted) {
      map.status = 'completed';
    } else if (hasProgress) {
      map.status = 'active';
    } else {
      map.status = 'not-started';
    }

    map.updatedAt = new Date().toISOString();
    await db.learningMaps.put(map);
    return map;
  }
  return map;
}

// Helper to update a task in a day
export async function updateTaskInDay(
  mapId: string,
  dayId: string,
  taskId: string,
  updates: Partial<DayTask>
): Promise<LearningMap | undefined> {
  return updateDayInMap(mapId, dayId, (day) => {
    const taskIndex = day.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      const current = day.tasks[taskIndex];
      const updated = { ...current, ...updates };
      if (updates.status === 'done' && current.status !== 'done') {
        updated.completedAt = new Date().toISOString();
      } else if (updates.status && updates.status !== 'done') {
        updated.completedAt = null;
      }
      day.tasks[taskIndex] = updated;

      // Check if all tasks in day are done
      const allDone = day.tasks.length > 0 && day.tasks.every((t) => t.status === 'done');
      const anyDone = day.tasks.some((t) => t.status === 'done');

      if (allDone) {
        day.status = 'completed';
        day.completedAt = new Date().toISOString();
      } else if (anyDone) {
        day.status = 'in-progress';
        day.completedAt = null;
      } else {
        day.status = 'pending';
        day.completedAt = null;
      }
    }
    return day;
  });
}

// Helper for Smart Import with preserve status
export async function importLearningMap(
  data: unknown,
  mode: 'replace' | 'duplicate' = 'replace'
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const parsed = LearningMapSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '),
      };
    }

    const map = parsed.data as LearningMap;
    const existing = await db.learningMaps.get(map.id);

    if (existing && mode === 'duplicate') {
      map.id = `${map.id}-${Date.now().toString(36)}`;
      map.title = `${map.title} (Copy)`;
    } else if (existing && mode === 'replace') {
      // Merge while preserving user progress & notes
      const existingDaysMap = new Map<string, Day>();
      existing.weeks.forEach((w) => {
        w.days.forEach((d) => {
          existingDaysMap.set(d.id, d);
          existingDaysMap.set(`day-${d.dayNumber}`, d);
        });
      });

      map.weeks.forEach((w) => {
        w.days.forEach((d) => {
          const prev = existingDaysMap.get(d.id) || existingDaysMap.get(`day-${d.dayNumber}`);
          if (prev) {
            // Preserve user notes if new import is empty or user had notes
            if (prev.notes && !d.notes) d.notes = prev.notes;
            if (prev.status === 'completed') {
              d.status = 'completed';
              d.completedAt = prev.completedAt;
            } else if (prev.status === 'in-progress' && d.status === 'pending') {
              d.status = 'in-progress';
            }
            if (prev.timeSpentMinutes) d.timeSpentMinutes = prev.timeSpentMinutes;

            // Preserve task states
            const prevTaskMap = new Map(prev.tasks.map((t) => [t.id, t]));
            d.tasks.forEach((t) => {
              const prevT = prevTaskMap.get(t.id) || prev.tasks.find((pt) => pt.title === t.title);
              if (prevT) {
                t.status = prevT.status;
                t.completedAt = prevT.completedAt;
              }
            });
          }
        });
      });
    }

    map.updatedAt = new Date().toISOString();
    await db.learningMaps.put(map);
    return { success: true, id: map.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown import error' };
  }
}

// Helpers for Todos
export async function getAllTodos(): Promise<StandaloneTodo[]> {
  return await db.todos.orderBy('order').toArray();
}

export async function saveTodo(todo: StandaloneTodo): Promise<string> {
  if (!todo.id) {
    todo.id = `todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
  await db.todos.put(todo);
  return todo.id;
}

export async function deleteTodo(id: string): Promise<void> {
  await db.todos.delete(id);
}

// Helpers for Journal
export async function getJournalEntries(): Promise<JournalEntry[]> {
  return await db.journalEntries.orderBy('date').reverse().toArray();
}

export async function saveJournalEntry(entry: JournalEntry): Promise<string> {
  if (!entry.id) {
    entry.id = `journal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
  entry.updatedAt = new Date().toISOString();
  await db.journalEntries.put(entry);
  return entry.id;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await db.journalEntries.delete(id);
}

// Full backup and restore
export async function exportAllData() {
  const [learningMaps, todos, journalEntries, settings] = await Promise.all([
    db.learningMaps.toArray(),
    db.todos.toArray(),
    db.journalEntries.toArray(),
    db.settings.toArray(),
  ]);

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    learningMaps,
    todos,
    journalEntries,
    settings,
  };
}

export async function restoreAllData(backup: {
  learningMaps?: LearningMap[];
  todos?: StandaloneTodo[];
  journalEntries?: JournalEntry[];
  settings?: UserSettings[];
}) {
  await db.transaction('rw', db.learningMaps, db.todos, db.journalEntries, db.settings, async () => {
    if (backup.learningMaps?.length) {
      await db.learningMaps.clear();
      await db.learningMaps.bulkPut(backup.learningMaps);
    }
    if (backup.todos?.length) {
      await db.todos.clear();
      await db.todos.bulkPut(backup.todos);
    }
    if (backup.journalEntries?.length) {
      await db.journalEntries.clear();
      await db.journalEntries.bulkPut(backup.journalEntries);
    }
    if (backup.settings?.length) {
      await db.settings.clear();
      await db.settings.bulkPut(backup.settings);
    }
  });
}

export async function hydrateUserCloudData(cloudData: {
  maps?: LearningMap[];
  todos?: StandaloneTodo[];
  journals?: JournalEntry[];
  settings?: UserSettings | null;
}) {
  await db.transaction('rw', db.learningMaps, db.todos, db.journalEntries, db.settings, async () => {
    if (cloudData.maps && cloudData.maps.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanMaps = cloudData.maps.map(({ _id, ...rest }: any) => rest as LearningMap);
      await db.learningMaps.clear();
      await db.learningMaps.bulkPut(cleanMaps);
    }
    if (cloudData.todos) {
      await db.todos.clear();
      if (cloudData.todos.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanTodos = cloudData.todos.map(({ _id, ...rest }: any) => rest as StandaloneTodo);
        await db.todos.bulkPut(cleanTodos);
      }
    }
    if (cloudData.journals) {
      await db.journalEntries.clear();
      if (cloudData.journals.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanJournals = cloudData.journals.map(({ _id, ...rest }: any) => rest as JournalEntry);
        await db.journalEntries.bulkPut(cleanJournals);
      }
    }
    if (cloudData.settings) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { _id, ...cleanSettings } = cloudData.settings as any;
      const current = (await db.settings.get('current')) || DEFAULT_SETTINGS;
      await db.settings.put({
        ...current,
        ...cleanSettings,
        id: 'current',
      });
    }
  });

  // Ensure default seed maps are present if not in user's cloud data
  for (const defaultMap of DEFAULT_LEARNING_MAPS) {
    const existing = await db.learningMaps.get(defaultMap.id);
    if (!existing) {
      await db.learningMaps.put(defaultMap);
      console.log(`ProgressOS: Seeded missing default map ${defaultMap.id} during hydration.`);
    }
  }
}

export async function clearAllData() {
  await db.transaction('rw', db.learningMaps, db.todos, db.journalEntries, db.settings, db.workoutPlans, async () => {
    await db.learningMaps.clear();
    await db.todos.clear();
    await db.journalEntries.clear();
    await db.settings.clear();
    await db.workoutPlans.clear();
    await db.settings.put(DEFAULT_SETTINGS);
  });
}
