'use client';

import React from 'react';
import { AllTasksView } from '@/components/views/AllTasksView';
import { useUI } from '@/context/UIContext';

export default function TasksPage() {
  const { openQuickTask } = useUI();

  return <AllTasksView onOpenQuickTask={openQuickTask} />;
}
