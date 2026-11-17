import Dexie, { type Table } from 'dexie';
import { LearningMap, StandaloneTodo, JournalEntry, UserSettings, Day, DayTask } from '@/types';
import { LearningMapSchema } from './schema';

export class ProgressOSDatabase extends Dexie {
  learningMaps!: Table<LearningMap, string>;
  todos!: Table<StandaloneTodo, string>;
  journalEntries!: Table<JournalEntry, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('ProgressOS_DB');
    this.version(1).stores({
      learningMaps: '&id, status, category, updatedAt',
      todos: '&id, status, priority, dueDate, learningMapId, order',
      journalEntries: '&id, date, learningMapId, createdAt',
      settings: '&id',
    });
  }
}

export const db = new ProgressOSDatabase();

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  id: 'current',
  theme: 'dark',
  dailyCommitmentMinutes: 180,
  userName: 'Aniketh',
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

    // Check if learning maps exist
    const count = await db.learningMaps.count();
    if (count === 0) {
      // Load seed data from public or bundled json
      try {
        const res = await fetch('/data/ai-engineering-90-days.json');
        if (res.ok) {
          const seedData = await res.json();
          const parsed = LearningMapSchema.safeParse(seedData);
          if (parsed.success) {
            await db.learningMaps.put(parsed.data as LearningMap);
            console.log('ProgressOS: Seed data loaded successfully.');
          } else {
            console.warn('ProgressOS: Seed data schema validation error', parsed.error);
          }
        }
      } catch (err) {
        console.error('ProgressOS: Failed to fetch seed data', err);
      }
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

export async function deleteLearningMap(id: string): Promise<void> {
  await db.transaction('rw', db.learningMaps, db.todos, db.journalEntries, async () => {
    await db.learningMaps.delete(id);
    await db.todos.where({ learningMapId: id }).delete();
    await db.journalEntries.where({ learningMapId: id }).delete();
  });
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
      if (allDone && day.status !== 'completed') {
        day.status = 'completed';
        day.completedAt = new Date().toISOString();
      } else if (!allDone && day.status === 'completed') {
        day.status = 'in-progress';
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

export async function clearAllData() {
  await db.transaction('rw', db.learningMaps, db.todos, db.journalEntries, db.settings, async () => {
    await db.learningMaps.clear();
    await db.todos.clear();
    await db.journalEntries.clear();
  });
}
