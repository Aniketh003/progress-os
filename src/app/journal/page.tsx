'use client';

import React from 'react';
import { JournalView } from '@/components/views/JournalView';
import { useUI } from '@/context/UIContext';

export default function JournalPage() {
  const { openNewJournal, openEditJournal } = useUI();

  return (
    <JournalView
      onOpenNewJournal={openNewJournal}
      onOpenEditJournal={openEditJournal}
    />
  );
}
