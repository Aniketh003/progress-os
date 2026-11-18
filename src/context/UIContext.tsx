'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LearningMap, Day, JournalEntry } from '@/types';

interface UIContextType {
  // Mobile sidebar drawer
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  // Search / Command Palette (Cmd+K)
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Quick Task Modal ('C' shortcut)
  isQuickTaskOpen: boolean;
  openQuickTask: () => void;
  closeQuickTask: () => void;

  // Import JSON Modal
  isImportOpen: boolean;
  openImport: () => void;
  closeImport: () => void;

  // Import Guide & AI Prompt Template Modal
  isImportGuideOpen: boolean;
  openImportGuide: () => void;
  closeImportGuide: () => void;

  // Create / Edit Map Modal
  isNewMapOpen: boolean;
  mapToEdit: LearningMap | null;
  openNewMap: () => void;
  openEditMap: (map: LearningMap) => void;
  closeMapModal: () => void;

  // Day Detail Drawer
  selectedDayDrawer: { map: LearningMap; day: Day } | null;
  openDayDrawer: (map: LearningMap, day: Day) => void;
  closeDayDrawer: () => void;

  // Journal Modal
  isJournalOpen: boolean;
  journalToEdit: JournalEntry | null;
  openNewJournal: () => void;
  openEditJournal: (entry: JournalEntry) => void;
  closeJournalModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
  const [isNewMapOpen, setIsNewMapOpen] = useState(false);
  const [mapToEdit, setMapToEdit] = useState<LearningMap | null>(null);

  // Day Drawer State
  const [selectedDayDrawer, setSelectedDayDrawer] = useState<{
    map: LearningMap;
    day: Day;
  } | null>(null);

  // Journal Modal State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<JournalEntry | null>(null);

  // Action helpers
  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const openQuickTask = useCallback(() => setIsQuickTaskOpen(true), []);
  const closeQuickTask = useCallback(() => setIsQuickTaskOpen(false), []);

  const openImport = useCallback(() => setIsImportOpen(true), []);
  const closeImport = useCallback(() => setIsImportOpen(false), []);

  const openImportGuide = useCallback(() => setIsImportGuideOpen(true), []);
  const closeImportGuide = useCallback(() => setIsImportGuideOpen(false), []);

  const openNewMap = useCallback(() => {
    setMapToEdit(null);
    setIsNewMapOpen(true);
  }, []);

  const openEditMap = useCallback((map: LearningMap) => {
    setMapToEdit(map);
  }, []);

  const closeMapModal = useCallback(() => {
    setIsNewMapOpen(false);
    setMapToEdit(null);
  }, []);

  const openDayDrawer = useCallback((map: LearningMap, day: Day) => {
    setSelectedDayDrawer({ map, day });
  }, []);

  const closeDayDrawer = useCallback(() => {
    setSelectedDayDrawer(null);
  }, []);

  const openNewJournal = useCallback(() => {
    setJournalToEdit(null);
    setIsJournalOpen(true);
  }, []);

  const openEditJournal = useCallback((entry: JournalEntry) => {
    setJournalToEdit(entry);
    setIsJournalOpen(true);
  }, []);

  const closeJournalModal = useCallback(() => {
    setIsJournalOpen(false);
    setJournalToEdit(null);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K for search, C for quick task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K -> Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // 'c' or 'C' key when not focused in an input/textarea/select
      if (
        e.key.toLowerCase() === 'c' &&
        !['input', 'textarea', 'select'].includes(
          (e.target as HTMLElement)?.tagName?.toLowerCase() || ''
        ) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        setIsQuickTaskOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <UIContext.Provider
      value={{
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        isSearchOpen,
        openSearch,
        closeSearch,
        isQuickTaskOpen,
        openQuickTask,
        closeQuickTask,
        isImportOpen,
        openImport,
        closeImport,
        isImportGuideOpen,
        openImportGuide,
        closeImportGuide,
        isNewMapOpen,
        mapToEdit,
        openNewMap,
        openEditMap,
        closeMapModal,
        selectedDayDrawer,
        openDayDrawer,
        closeDayDrawer,
        isJournalOpen,
        journalToEdit,
        openNewJournal,
        openEditJournal,
        closeJournalModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
