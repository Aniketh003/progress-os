'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Edit2,
  Sparkles,
  Hammer,
  AlertTriangle,
  Compass,
  Search,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { JournalEntry } from '@/types';
import { formatMinutes, cn } from '@/lib/utils';

interface JournalViewProps {
  onOpenNewJournal: () => void;
  onOpenEditJournal: (entry: JournalEntry) => void;
}

export function JournalView({ onOpenNewJournal, onOpenEditJournal }: JournalViewProps) {
  const { journalEntries, learningMaps, handleDeleteJournal } = useProgressOS();
  const [search, setSearch] = useState('');
  const [selectedMapFilter, setSelectedMapFilter] = useState('all');

  const filteredEntries = journalEntries.filter((entry) => {
    if (selectedMapFilter !== 'all' && entry.learningMapId !== selectedMapFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        entry.whatILearned.toLowerCase().includes(q) ||
        (entry.whatIBuilt && entry.whatIBuilt.toLowerCase().includes(q)) ||
        (entry.problemsEncountered && entry.problemsEncountered.toLowerCase().includes(q)) ||
        entry.topicsCovered.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalMinutesLogged = journalEntries.reduce((acc, j) => acc + (j.timeSpentMinutes || 0), 0);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Daily Learning Journal
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {journalEntries.length} Entries
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total Focus Logged: {formatMinutes(totalMinutesLogged)} across {journalEntries.length} study days
          </p>
        </div>

        <button
          onClick={onOpenNewJournal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Write Journal Entry</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries by topic, takeaways or builds..."
            className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/70 rounded-xl text-xs outline-none focus:border-primary text-foreground"
          />
        </div>

        <select
          value={selectedMapFilter}
          onChange={(e) => setSelectedMapFilter(e.target.value)}
          className="p-2 bg-muted/30 border border-border/70 rounded-xl text-xs text-foreground outline-none"
        >
          <option value="all">All Roadmaps</option>
          {learningMaps.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline Entries */}
      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border/60 rounded-2xl bg-muted/10 space-y-3">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Journal Entries Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Take 5 minutes at the end of each study session to cement what you learned and built.
            </p>
            <button
              onClick={onOpenNewJournal}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Start First Entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-4 hover:border-primary/40 transition-all relative group"
            >
              {/* Entry Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/50">
                    {entry.date}
                  </span>
                  {entry.learningMapTitle && (
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      {entry.learningMapTitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {formatMinutes(entry.timeSpentMinutes)}
                  </span>

                  {entry.repositoryUrl && (
                    <a
                      href={entry.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium"
                      title="GitHub commit / PR"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Commit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pl-2">
                    <button
                      onClick={() => onOpenEditJournal(entry)}
                      className="p-1 hover:text-foreground rounded"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this journal entry?')) {
                          handleDeleteJournal(entry.id);
                        }
                      }}
                      className="p-1 hover:text-destructive rounded"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Topics */}
              {entry.topicsCovered && entry.topicsCovered.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.topicsCovered.map((topic, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}

              {/* What I Learned */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> What I Learned
                </span>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.whatILearned}
                </p>
              </div>

              {/* What I Built */}
              {entry.whatIBuilt && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5 text-blue-500" /> What I Built
                  </span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-2.5 rounded-lg border border-border/40 font-mono">
                    {entry.whatIBuilt}
                  </p>
                </div>
              )}

              {/* Problems Encountered */}
              {entry.problemsEncountered && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Problems & Solutions
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {entry.problemsEncountered}
                  </p>
                </div>
              )}

              {/* Key Takeaways & Tomorrow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-border/30">
                {entry.keyTakeaways && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">
                      Key Takeaway
                    </span>
                    <p className="text-foreground text-[11px] italic leading-relaxed">
                      &quot;{entry.keyTakeaways}&quot;
                    </p>
                  </div>
                )}

                {entry.tomorrowPlan && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">
                      Next Up
                    </span>
                    <p className="text-foreground text-[11px] leading-relaxed">
                      → {entry.tomorrowPlan}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
