'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { CommandPalette } from '@/components/modals/CommandPalette';
import { ImportModal } from '@/components/modals/ImportModal';
import { ImportGuideModal } from '@/components/modals/ImportGuideModal';
import { MapModal } from '@/components/modals/MapModal';
import { QuickTaskModal } from '@/components/modals/QuickTaskModal';
import { DayDrawer } from '@/components/modals/DayDrawer';
import { JournalModal } from '@/components/modals/JournalModal';
import { ProgressOSLogo } from '@/components/icons/ProgressOSLogo';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useUI } from '@/context/UIContext';
import { useProgressRouter } from '@/context/NavigationProgressContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useProgressRouter();
  const { isInitialized, learningMaps, activeMapId, setActiveMapId } = useProgressOS();
  const {
    isSearchOpen,
    closeSearch,
    isImportOpen,
    closeImport,
    openImportGuide,
    isImportGuideOpen,
    closeImportGuide,
    openImport,
    isNewMapOpen,
    mapToEdit,
    closeMapModal,
    openQuickTask,
    isQuickTaskOpen,
    closeQuickTask,
    selectedDayDrawer,
    openDayDrawer,
    closeDayDrawer,
    isJournalOpen,
    journalToEdit,
    closeJournalModal,
  } = useUI();

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4 select-none">
        <ProgressOSLogo className="w-14 h-14 shadow-xl shadow-rose-600/30 animate-pulse" />
        <div className="flex flex-col items-center space-y-1">
          <span className="text-sm font-semibold tracking-tight text-foreground">ProgressOS</span>
          <p className="text-xs text-muted-foreground animate-pulse">
            Initializing local learning engine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-16 sm:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onOpenQuickTask={openQuickTask} />

      {/* 3. Global Modals & Drawers */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onNavigateView={(view, mapId) => {
          closeSearch();
          if (view === 'overview') {
            router.push('/');
          } else if (view === 'map' && mapId) {
            router.push(`/maps/${mapId}`);
          } else if (view === 'map' && activeMapId) {
            router.push(`/maps/${activeMapId}`);
          } else {
            router.push(`/${view}`);
          }
        }}
        onOpenDay={(map, day) => {
          openDayDrawer(map, day);
        }}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={closeImport}
        onOpenGuide={openImportGuide}
        onSuccess={(mapId) => {
          if (mapId) {
            setActiveMapId(mapId);
            router.push(`/maps/${mapId}`);
          }
        }}
      />

      <ImportGuideModal
        isOpen={isImportGuideOpen}
        onClose={closeImportGuide}
        onOpenImport={openImport}
      />

      <MapModal
        isOpen={isNewMapOpen || !!mapToEdit}
        mapToEdit={mapToEdit}
        onClose={closeMapModal}
        onSuccess={(mapId) => {
          if (mapId) {
            setActiveMapId(mapId);
            router.push(`/maps/${mapId}`);
          }
        }}
      />

      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={closeQuickTask}
      />

      {selectedDayDrawer && (
        <DayDrawer
          isOpen={true}
          learningMap={selectedDayDrawer.map}
          day={
            learningMaps
              .find((m) => m.id === selectedDayDrawer.map.id)
              ?.weeks.flatMap((w) => w.days)
              .find((d) => d.id === selectedDayDrawer.day.id) || selectedDayDrawer.day
          }
          onClose={closeDayDrawer}
        />
      )}

      <JournalModal
        isOpen={isJournalOpen}
        entryToEdit={journalToEdit}
        onClose={closeJournalModal}
      />
    </div>
  );
}
