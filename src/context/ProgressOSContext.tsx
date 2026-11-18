'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSession, signOut } from 'next-auth/react';
import confetti from 'canvas-confetti';
import {
  db,
  initializeDatabase,
  getLearningMaps,
  saveLearningMap,
  deleteLearningMap,
  softDeleteLearningMap,
  restoreLearningMap,
  permanentlyDeleteLearningMap,
  updateDayInMap,
  updateTaskInDay,
  importLearningMap,
  getAllTodos,
  saveTodo,
  deleteTodo,
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  exportAllData,
  restoreAllData,
  hydrateUserCloudData,
  clearAllData,
  DEFAULT_SETTINGS,
} from '@/lib/db';
import {
  LearningMap,
  StandaloneTodo,
  JournalEntry,
  UserSettings,
  Day,
  DayTask,
  TaskStatus,
  DayStatus,
} from '@/types';

interface ProgressOSContextType {
  isInitialized: boolean;
  learningMaps: LearningMap[];
  deletedMaps: LearningMap[];
  activeMapId: string | null;
  setActiveMapId: (id: string | null) => void;
  activeMap: LearningMap | undefined;
  todos: StandaloneTodo[];
  journalEntries: JournalEntry[];
  settings: UserSettings;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Actions
  handleSaveMap: (map: LearningMap) => Promise<string>;
  handleDeleteMap: (id: string) => Promise<void>;
  handleRestoreMap: (id: string) => Promise<void>;
  handlePermanentlyDeleteMap: (id: string) => Promise<void>;
  handleUpdateDay: (mapId: string, dayId: string, updater: (day: Day) => Day) => Promise<void>;
  handleUpdateTask: (mapId: string, dayId: string, taskId: string, updates: Partial<DayTask>) => Promise<void>;
  handleToggleTaskStatus: (mapId: string, dayId: string, taskId: string, currentStatus: TaskStatus) => Promise<void>;
  handleToggleDayStatus: (mapId: string, dayId: string, currentStatus: DayStatus) => Promise<void>;
  handleImportMap: (data: unknown, mode?: 'replace' | 'duplicate') => Promise<{ success: boolean; id?: string; error?: string }>;
  handleExportMap: (map: LearningMap) => void;

  // Standalone / Quick Todos
  handleAddTodo: (todo: Omit<StandaloneTodo, 'id' | 'createdAt' | 'order'>) => Promise<string>;
  handleUpdateTodo: (todo: StandaloneTodo) => Promise<void>;
  handleDeleteTodo: (id: string) => Promise<void>;
  handleToggleTodoStatus: (id: string, currentStatus: TaskStatus) => Promise<void>;

  // Journal
  handleAddJournal: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  handleUpdateJournal: (entry: JournalEntry) => Promise<void>;
  handleDeleteJournal: (id: string) => Promise<void>;

  // Settings & DB
  handleUpdateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  handleExportAll: () => Promise<void>;
  handleRestoreAll: (backupJson: string) => Promise<{ success: boolean; error?: string }>;
  handleClearAll: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  triggerCompletionEffect: () => void;
  isCloudSyncing: boolean;
  syncToCloud: () => Promise<void>;
}

const ProgressOSContext = createContext<ProgressOSContextType | null>(null);

export function ProgressOSProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('dark');
  const prevEmailRef = useRef<string | null | undefined>(undefined);

  // Reactive live queries from Dexie
  const allLearningMaps = useLiveQuery(() => db.learningMaps.toArray(), []) || [];
  const learningMaps = useMemo(() => allLearningMaps.filter((m) => !m.isDeleted), [allLearningMaps]);
  const deletedMaps = useMemo(() => allLearningMaps.filter((m) => !!m.isDeleted), [allLearningMaps]);
  const todos = useLiveQuery(() => db.todos.orderBy('order').toArray(), []) || [];
  const journalEntries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().toArray(), []) || [];
  const settingsArray = useLiveQuery(() => db.settings.toArray(), []) || [];
  const settings = settingsArray[0] || DEFAULT_SETTINGS;

  useEffect(() => {
    async function init() {
      await initializeDatabase();
      setIsInitialized(true);
    }
    init();
  }, []);

  // Background Cloud Sync helper
  const syncToCloud = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const currentMaps = await db.learningMaps.toArray();
      const currentTodos = await db.todos.toArray();
      const currentJournals = await db.journalEntries.toArray();
      const currentSettings = (await db.settings.get('current')) || DEFAULT_SETTINGS;

      // Clean _id before sending
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanMaps = currentMaps.map(({ _id, ...rest }: any) => rest);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanTodos = currentTodos.map(({ _id, ...rest }: any) => rest);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanJournals = currentJournals.map(({ _id, ...rest }: any) => rest);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { _id, ...cleanSettings } = (currentSettings as any);

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maps: cleanMaps,
          todos: cleanTodos,
          journals: cleanJournals,
          settings: cleanSettings,
        }),
      });

      if (!res.ok) {
        console.error('ProgressOS: Cloud sync failed with status', res.status);
      }
    } catch (e) {
      console.warn('ProgressOS: Background cloud sync error:', e);
    }
  }, [session?.user?.email]);

  // Automatic Cloud Hydration upon Auth state change
  useEffect(() => {
    async function handleAuthSync() {
      if (authStatus === 'loading') return;

      const userEmail = session?.user?.email || null;
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('progressos_logged_user') : null;

      // Detect logout (either in active session change or across page reloads via localStorage)
      if (!userEmail && (storedEmail || prevEmailRef.current)) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('progressos_logged_user');
        }
        prevEmailRef.current = null;
        await clearAllData();
        await initializeDatabase();
        setActiveMapId(null);
        console.log('ProgressOS: Purged private user data from local database on logout');
        return;
      }

      if (userEmail === prevEmailRef.current) return;
      prevEmailRef.current = userEmail;

      if (userEmail) {
        // Record currently logged-in user in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('progressos_logged_user', userEmail);
        }

        // If previously a different user was logged in, clean local store first
        if (storedEmail && storedEmail !== userEmail) {
          await clearAllData();
          await initializeDatabase();
        }

        // Fetch cloud data from MongoDB
        setIsCloudSyncing(true);
        try {
          const res = await fetch('/api/sync');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.maps && data.maps.length > 0) {
              // Hydrate MongoDB cloud records into local Dexie
              await hydrateUserCloudData({
                maps: data.maps,
                todos: data.todos,
                journals: data.journals,
                settings: data.settings,
              });
              // Ensure any newly seeded local maps (e.g. default roadmaps) are synced to cloud
              await syncToCloud();

              setActiveMapId((current) => {
                if (current && data.maps.some((m: LearningMap) => m.id === current)) {
                  return current;
                }
                return data.maps[0]?.id || current;
              });
              console.log('ProgressOS: Successfully hydrated cloud data for', userEmail);
            } else {
              // New cloud user: push initial local seed state to cloud
              await syncToCloud();
            }
          }
        } catch (err) {
          console.error('ProgressOS: Error fetching cloud data on login:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    }

    handleAuthSync();
  }, [authStatus, session, syncToCloud]);

  // Theme synchronization with HTML class
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const effectiveTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Set default active map if none selected or if active map was deleted
  useEffect(() => {
    if ((!activeMapId || !learningMaps.some((m) => m.id === activeMapId)) && learningMaps.length > 0) {
      setActiveMapId(learningMaps[0].id);
    } else if (learningMaps.length === 0) {
      setActiveMapId(null);
    }
  }, [learningMaps, activeMapId]);

  const activeMap = useMemo(() => {
    return learningMaps.find((m) => m.id === activeMapId);
  }, [learningMaps, activeMapId]);

  const triggerCompletionEffect = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e11d48', '#f43f5e', '#fb7185', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback(async (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    await db.settings.update('current', { theme: newTheme });
  }, []);

  // Map actions
  const handleSaveMap = useCallback(async (map: LearningMap) => {
    const res = await saveLearningMap(map);
    await syncToCloud();
    return res;
  }, [syncToCloud]);

  const handleDeleteMap = useCallback(async (id: string) => {
    await softDeleteLearningMap(id);
    if (activeMapId === id) {
      setActiveMapId(null);
    }
    await syncToCloud();
  }, [activeMapId, syncToCloud]);

  const handleRestoreMap = useCallback(async (id: string) => {
    await restoreLearningMap(id);
    await syncToCloud();
  }, [syncToCloud]);

  const handlePermanentlyDeleteMap = useCallback(async (id: string) => {
    await permanentlyDeleteLearningMap(id);
    if (activeMapId === id) {
      setActiveMapId(null);
    }
    try {
      await fetch(`/api/maps?id=${encodeURIComponent(id)}&permanent=true`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Failed to delete map from cloud:', e);
    }
    await syncToCloud();
  }, [activeMapId, syncToCloud]);

  const handleUpdateDay = useCallback(async (mapId: string, dayId: string, updater: (day: Day) => Day) => {
    await updateDayInMap(mapId, dayId, updater);
    await syncToCloud();
  }, [syncToCloud]);

  const handleUpdateTask = useCallback(async (mapId: string, dayId: string, taskId: string, updates: Partial<DayTask>) => {
    await updateTaskInDay(mapId, dayId, taskId, updates);
    await syncToCloud();
  }, [syncToCloud]);

  const handleToggleTaskStatus = useCallback(async (mapId: string, dayId: string, taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
    if (nextStatus === 'done') {
      triggerCompletionEffect();
    }
    await updateTaskInDay(mapId, dayId, taskId, { status: nextStatus });
    await syncToCloud();
  }, [triggerCompletionEffect, syncToCloud]);

  const handleToggleDayStatus = useCallback(async (mapId: string, dayId: string, currentStatus: DayStatus) => {
    const nextStatus: DayStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    if (nextStatus === 'completed') {
      triggerCompletionEffect();
    }
    await updateDayInMap(mapId, dayId, (day) => {
      day.status = nextStatus;
      day.completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
      // Mark all tasks done if day completed, or reset all tasks to todo if unchecked
      day.tasks.forEach((t) => {
        if (nextStatus === 'completed') {
          t.status = 'done';
          t.completedAt = new Date().toISOString();
        } else {
          t.status = 'todo';
          t.completedAt = null;
        }
      });
      return day;
    });
    await syncToCloud();
  }, [triggerCompletionEffect, syncToCloud]);

  const handleImportMap = useCallback(async (data: unknown, mode: 'replace' | 'duplicate' = 'replace') => {
    const result = await importLearningMap(data, mode);
    if (result.success && result.id) {
      setActiveMapId(result.id);
    }
    await syncToCloud();
    return result;
  }, [syncToCloud]);

  const handleExportMap = useCallback((map: LearningMap) => {
    const cleanMap = {
      ...map,
      schemaVersion: '1.0',
    };
    const jsonStr = JSON.stringify(cleanMap, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.id}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Todo Actions
  const handleAddTodo = useCallback(async (todoData: Omit<StandaloneTodo, 'id' | 'createdAt' | 'order'>) => {
    const newTodo: StandaloneTodo = {
      ...todoData,
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: Date.now(),
      createdAt: new Date().toISOString(),
    };
    const res = await saveTodo(newTodo);
    await syncToCloud();
    return res;
  }, [syncToCloud]);

  const handleUpdateTodo = useCallback(async (todo: StandaloneTodo) => {
    await saveTodo(todo);
    await syncToCloud();
  }, [syncToCloud]);

  const handleDeleteTodo = useCallback(async (id: string) => {
    await deleteTodo(id);
    await syncToCloud();
  }, [syncToCloud]);

  const handleToggleTodoStatus = useCallback(async (id: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
    if (nextStatus === 'done') {
      triggerCompletionEffect();
    }
    const target = await db.todos.get(id);
    if (target) {
      target.status = nextStatus;
      target.completedAt = nextStatus === 'done' ? new Date().toISOString() : null;
      await db.todos.put(target);
      await syncToCloud();
    }
  }, [triggerCompletionEffect, syncToCloud]);

  // Journal Actions
  const handleAddJournal = useCallback(async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await saveJournalEntry(newEntry);
    await syncToCloud();
    return res;
  }, [syncToCloud]);

  const handleUpdateJournal = useCallback(async (entry: JournalEntry) => {
    await saveJournalEntry(entry);
    await syncToCloud();
  }, [syncToCloud]);

  const handleDeleteJournal = useCallback(async (id: string) => {
    await deleteJournalEntry(id);
    await syncToCloud();
  }, [syncToCloud]);

  // Settings & DB Actions
  const handleUpdateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const current = (await db.settings.get('current')) || DEFAULT_SETTINGS;
    const merged = { ...current, ...newSettings };
    await db.settings.put(merged);
    await syncToCloud();
  }, [syncToCloud]);

  const handleExportAll = useCallback(async () => {
    const backup = await exportAllData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progressos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleRestoreAll = useCallback(async (backupJson: string) => {
    try {
      const parsed = JSON.parse(backupJson);
      await restoreAllData(parsed);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Invalid backup JSON file' };
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearAllData();
    setActiveMapId(null);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('progressos_logged_user');
      }
      await clearAllData();
      await initializeDatabase();
      setActiveMapId(null);
    } catch (e) {
      console.warn('ProgressOS: Error clearing data on sign out:', e);
    }
    await signOut({ callbackUrl: '/' });
  }, []);

  return (
    <ProgressOSContext.Provider
      value={{
        isInitialized,
        learningMaps,
        deletedMaps,
        activeMapId,
        setActiveMapId,
        activeMap,
        todos,
        journalEntries,
        settings,
        theme,
        setTheme,
        handleSaveMap,
        handleDeleteMap,
        handleRestoreMap,
        handlePermanentlyDeleteMap,
        handleUpdateDay,
        handleUpdateTask,
        handleToggleTaskStatus,
        handleToggleDayStatus,
        handleImportMap,
        handleExportMap,
        handleAddTodo,
        handleUpdateTodo,
        handleDeleteTodo,
        handleToggleTodoStatus,
        handleAddJournal,
        handleUpdateJournal,
        handleDeleteJournal,
        handleUpdateSettings,
        handleExportAll,
        handleRestoreAll,
        handleClearAll,
        handleSignOut,
        triggerCompletionEffect,
        isCloudSyncing,
        syncToCloud,
      }}
    >
      {children}
    </ProgressOSContext.Provider>
  );
}

export function useProgressOS() {
  const context = useContext(ProgressOSContext);
  if (!context) {
    throw new Error('useProgressOS must be used within a ProgressOSProvider');
  }
  return context;
}
