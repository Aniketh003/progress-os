'use client';

import React from 'react';
import { MyDayView } from '@/components/views/MyDayView';
import { useUI } from '@/context/UIContext';

export default function MyDayPage() {
  const { openQuickTask } = useUI();

  return <MyDayView onOpenQuickTask={openQuickTask} />;
}
