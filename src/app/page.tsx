'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewView } from '@/components/views/OverviewView';
import { MyDayView } from '@/components/views/MyDayView';
import { MapDetailView } from '@/components/views/MapDetailView';
import { AllTasksView } from '@/components/views/AllTasksView';
import { JournalView } from '@/components/views/JournalView';
import { ActivityView } from '@/components/views/ActivityView';
import { SettingsView } from '@/components/views/SettingsView';

import { CommandPalette } from '@/components/modals/CommandPalette';
import { ImportModal } from '@/components/modals/ImportModal';
import { MapModal } from '@/components/modals/MapModal';
import { QuickTaskModal } from '@/components/modals/QuickTaskModal';
import { DayDrawer } from '@/components/modals/DayDrawer';
import { JournalModal } from '@/components/modals/JournalModal';

import { useProgressOS } from '@/context/ProgressOSContext';
import { LearningMap, Day, JournalEntry } from '@/types';

export default function ProgressOSApp() {
  const {
    isInitialized,
    learningMaps,
    activeMapId,
    setActiveMapId,
    activeMap,
  } = useProgressOS();

  const [currentView, setCurrentView] = useState('overview');

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNewMapOpen, setIsNewMapOpen] = useState(false);
  const [mapToEdit, setMapToEdit] = useState<LearningMap | null>(null);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  // Day Drawer State
  const [selectedDayDrawer, setSelectedDayDrawer] = useState<{
    map: LearningMap;
    day: Day;
  } | null>(null);

  // Journal Modal State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<JournalEntry | null>(null);

  // Global Keyboard Shortcuts (Cmd+K for search, C for new task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // 'c' or 'C' key when not focused on an input/textarea
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

  const handleOpenDay = (map: LearningMap, day: Day) => {
    setSelectedDayDrawer({ map, day });
  };

  const handleOpenEditMap = (map: LearningMap) => {
    setMapToEdit(map);
  };

  const handleOpenEditJournal = (entry: JournalEntry) => {
    setJournalToEdit(entry);
    setIsJournalOpen(true);
  };

  const handleOpenNewJournal = () => {
    setJournalToEdit(null);
    setIsJournalOpen(true);
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg animate-pulse">
          P
        </div>
        <p className="text-xs font-medium text-muted-foreground animate-pulse">
          Initializing ProgressOS local storage...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenNewMap={() => setIsNewMapOpen(true)}
        onOpenEditMap={handleOpenEditMap}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          onNavigateBack={() => setCurrentView('overview')}
          onOpenQuickTask={() => setIsQuickTaskOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Scrollable View Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {currentView === 'overview' && (
            <OverviewView
              onOpenQuickTask={() => setIsQuickTaskOpen(true)}
              onSelectMap={(mapId) => {
                setActiveMapId(mapId);
                setCurrentView('map');
              }}
              onNavigateView={setCurrentView}
            />
          )}

          {currentView === 'my-day' && (
            <MyDayView onOpenQuickTask={() => setIsQuickTaskOpen(true)} />
          )}

          {currentView === 'map' && activeMap && (
            <MapDetailView
              learningMap={activeMap}
              onOpenDay={handleOpenDay}
              onOpenEditMap={handleOpenEditMap}
              onNavigateBack={() => setCurrentView('overview')}
            />
          )}

          {currentView === 'tasks' && (
            <AllTasksView onOpenQuickTask={() => setIsQuickTaskOpen(true)} />
          )}

          {currentView === 'journal' && (
            <JournalView
              onOpenNewJournal={handleOpenNewJournal}
              onOpenEditJournal={handleOpenEditJournal}
            />
          )}

          {currentView === 'activity' && <ActivityView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* MODALS & DRAWERS */}
      {/* 1. Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateView={(view) => {
          setCurrentView(view);
          setIsSearchOpen(false);
        }}
        onOpenDay={(map, day) => {
          setSelectedDayDrawer({ map, day });
        }}
      />

      {/* 2. Import JSON Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={(mapId) => {
          setActiveMapId(mapId);
          setCurrentView('map');
        }}
      />

      {/* 3. Create or Edit Learning Map Modal */}
      <MapModal
        isOpen={isNewMapOpen || !!mapToEdit}
        mapToEdit={mapToEdit}
        onClose={() => {
          setIsNewMapOpen(false);
          setMapToEdit(null);
        }}
        onSuccess={(mapId) => {
          setActiveMapId(mapId);
          setCurrentView('map');
        }}
      />

      {/* 4. Quick Add Task Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
      />

      {/* 5. Day Detail Drawer */}
      {selectedDayDrawer && (
        <DayDrawer
          isOpen={true}
          learningMap={selectedDayDrawer.map}
          day={
            // Keep fresh reference from active map in context
            learningMaps
              .find((m) => m.id === selectedDayDrawer.map.id)
              ?.weeks.flatMap((w) => w.days)
              .find((d) => d.id === selectedDayDrawer.day.id) || selectedDayDrawer.day
          }
          onClose={() => setSelectedDayDrawer(null)}
        />
      )}

      {/* 6. Daily Journal Entry Modal */}
      <JournalModal
        isOpen={isJournalOpen}
        entryToEdit={journalToEdit}
        onClose={() => {
          setIsJournalOpen(false);
          setJournalToEdit(null);
        }}
      />
    </div>
  );
}
