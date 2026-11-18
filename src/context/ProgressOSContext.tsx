'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSession } from 'next-auth/react';
import confetti from 'canvas-confetti';
import {
  db,
  initializeDatabase,
  getLearningMaps,
  saveLearningMap,
  deleteLearningMap,
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
  const learningMaps = useLiveQuery(() => db.learningMaps.toArray(), []) || [];
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

      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maps: currentMaps,
          todos: currentTodos,
          journals: currentJournals,
          settings: currentSettings,
        }),
      });
    } catch (e) {
      console.warn('ProgressOS: Background cloud sync error:', e);
    }
  }, [session?.user?.email]);

  // Automatic Cloud Hydration upon Auth state change
  useEffect(() => {
    async function handleAuthSync() {
      if (authStatus === 'loading') return;

      const userEmail = session?.user?.email || null;
      if (userEmail === prevEmailRef.current) return;
      const previousEmail = prevEmailRef.current;
      prevEmailRef.current = userEmail;

      if (userEmail) {
        // User logged in: fetch their cloud data from MongoDB
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
              if (data.maps[0]?.id) {
                setActiveMapId(data.maps[0].id);
              }
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
      } else if (previousEmail !== undefined && previousEmail !== null && userEmail === null) {
        // User logged out: clear private IndexedDB state and reload clean default seed
        await clearAllData();
        await initializeDatabase();
        setActiveMapId(null);
        console.log('ProgressOS: Cleared private local data on logout');
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

  // Set default active map if none selected
  useEffect(() => {
    if (!activeMapId && learningMaps.length > 0) {
      setActiveMapId(learningMaps[0].id);
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
    syncToCloud();
    return res;
  }, [syncToCloud]);

  const handleDeleteMap = useCallback(async (id: string) => {
    await deleteLearningMap(id);
    if (activeMapId === id) {
      setActiveMapId(null);
    }
    syncToCloud();
  }, [activeMapId, syncToCloud]);

  const handleUpdateDay = useCallback(async (mapId: string, dayId: string, updater: (day: Day) => Day) => {
    await updateDayInMap(mapId, dayId, updater);
    syncToCloud();
  }, [syncToCloud]);

  const handleUpdateTask = useCallback(async (mapId: string, dayId: string, taskId: string, updates: Partial<DayTask>) => {
    await updateTaskInDay(mapId, dayId, taskId, updates);
    syncToCloud();
  }, [syncToCloud]);

  const handleToggleTaskStatus = useCallback(async (mapId: string, dayId: string, taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
    if (nextStatus === 'done') {
      triggerCompletionEffect();
    }
    await updateTaskInDay(mapId, dayId, taskId, { status: nextStatus });
    syncToCloud();
  }, [triggerCompletionEffect, syncToCloud]);

  const handleToggleDayStatus = useCallback(async (mapId: string, dayId: string, currentStatus: DayStatus) => {
    const nextStatus: DayStatus = currentStatus === 'completed' ? 'in-progress' : 'completed';
    if (nextStatus === 'completed') {
      triggerCompletionEffect();
    }
    await updateDayInMap(mapId, dayId, (day) => {
      day.status = nextStatus;
      day.completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
      // Mark all tasks done if day completed
      if (nextStatus === 'completed') {
        day.tasks.forEach((t) => {
          t.status = 'done';
          t.completedAt = new Date().toISOString();
        });
      }
      return day;
    });
    syncToCloud();
  }, [triggerCompletionEffect, syncToCloud]);

  const handleImportMap = useCallback(async (data: unknown, mode: 'replace' | 'duplicate' = 'replace') => {
    const result = await importLearningMap(data, mode);
    if (result.success && result.id) {
      setActiveMapId(result.id);
    }
    syncToCloud();
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
    syncToCloud();
    return res;
  }, [syncToCloud]);

  const handleUpdateTodo = useCallback(async (todo: StandaloneTodo) => {
    await saveTodo(todo);
    syncToCloud();
  }, [syncToCloud]);

  const handleDeleteTodo = useCallback(async (id: string) => {
    await deleteTodo(id);
    syncToCloud();
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
      syncToCloud();
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
    syncToCloud();
    return res;
  }, [syncToCloud]);

  const handleUpdateJournal = useCallback(async (entry: JournalEntry) => {
    await saveJournalEntry(entry);
    syncToCloud();
  }, [syncToCloud]);

  const handleDeleteJournal = useCallback(async (id: string) => {
    await deleteJournalEntry(id);
    syncToCloud();
  }, [syncToCloud]);

  // Settings & DB Actions
  const handleUpdateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const current = (await db.settings.get('current')) || DEFAULT_SETTINGS;
    const merged = { ...current, ...newSettings };
    await db.settings.put(merged);
    syncToCloud();
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

  return (
    <ProgressOSContext.Provider
      value={{
        isInitialized,
        learningMaps,
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
