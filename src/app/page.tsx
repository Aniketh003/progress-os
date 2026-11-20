'use client';

import React from 'react';
import { useProgressRouter } from '@/context/NavigationProgressContext';
import { OverviewView } from '@/components/views/OverviewView';
import { useUI } from '@/context/UIContext';
import { useProgressOS } from '@/context/ProgressOSContext';

export default function OverviewPage() {
  const router = useProgressRouter();
  const { openQuickTask } = useUI();
  const { setActiveMapId } = useProgressOS();

  return (
    <OverviewView
      onOpenQuickTask={openQuickTask}
      onSelectMap={(mapId) => {
        setActiveMapId(mapId);
        router.push(`/maps/${mapId}`);
      }}
      onNavigateView={(view) => {
        if (view === 'overview') {
          router.push('/');
        } else {
          router.push(`/${view}`);
        }
      }}
    />
  );
}
