'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  Sparkles,
  AlertTriangle,
  Hammer,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { JournalEntry } from '@/types';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: JournalEntry | null;
}

export function JournalModal({ isOpen, onClose, entryToEdit }: JournalModalProps) {
  const { learningMaps, activeMapId, handleAddJournal, handleUpdateJournal } = useProgressOS();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMapId, setSelectedMapId] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [whatIBuilt, setWhatIBuilt] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(180);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setDate(entryToEdit.date);
      setSelectedMapId(entryToEdit.learningMapId || '');
      setTopicsInput(entryToEdit.topicsCovered?.join(', ') || '');
      setWhatILearned(entryToEdit.whatILearned || '');
      setWhatIBuilt(entryToEdit.whatIBuilt || '');
      setProblemsEncountered(entryToEdit.problemsEncountered || '');
      setKeyTakeaways(entryToEdit.keyTakeaways || '');
      setTomorrowPlan(entryToEdit.tomorrowPlan || '');
      setTimeSpentMinutes(entryToEdit.timeSpentMinutes || 180);
      setRepositoryUrl(entryToEdit.repositoryUrl || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedMapId(activeMapId || (learningMaps[0]?.id ?? ''));
      setTopicsInput('');
      setWhatILearned('');
      setWhatIBuilt('');
      setProblemsEncountered('');
      setKeyTakeaways('');
      setTomorrowPlan('');
      setTimeSpentMinutes(180);
      setRepositoryUrl('');
    }
  }, [entryToEdit, isOpen, activeMapId, learningMaps]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatILearned.trim()) return;

    setIsSubmitting(true);
    try {
      const topics = topicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const chosenMap = learningMaps.find((m) => m.id === selectedMapId);

      if (entryToEdit) {
        await handleUpdateJournal({
          ...entryToEdit,
          date,
          learningMapId: selectedMapId || undefined,
          learningMapTitle: chosenMap?.title,
          topicsCovered: topics,
          whatILearned: whatILearned.trim(),
          whatIBuilt: whatIBuilt.trim(),
          problemsEncountered: problemsEncountered.trim(),
          keyTakeaways: keyTakeaways.trim(),
          tomorrowPlan: tomorrowPlan.trim(),
          timeSpentMinutes: Number(timeSpentMinutes),
          repositoryUrl: repositoryUrl.trim(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        await handleAddJournal({
          date,
          learningMapId: selectedMapId || undefined,
          learningMapTitle: chosenMap?.title,
          topicsCovered: topics,
          whatILearned: whatILearned.trim(),
          whatIBuilt: whatIBuilt.trim(),
          problemsEncountered: problemsEncountered.trim(),
          keyTakeaways: keyTakeaways.trim(),
          tomorrowPlan: tomorrowPlan.trim(),
          timeSpentMinutes: Number(timeSpentMinutes),
          repositoryUrl: repositoryUrl.trim(),
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {entryToEdit ? 'Edit Journal Entry' : 'Daily Learning Journal'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Capture lessons, code artifacts, and deep reflections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-muted-foreground" /> Learning Map
              </label>
              <select
                value={selectedMapId}
                onChange={(e) => setSelectedMapId(e.target.value)}
                className="w-full p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
              >
                <option value="">(None / General)</option>
                {learningMaps.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" /> Time Spent (Mins)
              </label>
              <input
                type="number"
                min={0}
                step={15}
                value={timeSpentMinutes}
                onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                className="w-full p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground font-mono"
              />
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Topics Covered (Comma-separated)
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g. LLM Attention, QKV Matrices, Streaming API"
              className="w-full p-2 bg-muted/40 border border-border/80 rounded-md outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* What I Learned */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> What I Learned{' '}
              <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={whatILearned}
              onChange={(e) => setWhatILearned(e.target.value)}
              placeholder="Core concepts, mental models, breakthrough moments..."
              className="w-full p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
            />
          </div>

          {/* What I Built */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <Hammer className="w-3.5 h-3.5 text-blue-500" /> What I Built / Implemented
            </label>
            <textarea
              rows={2}
              value={whatIBuilt}
              onChange={(e) => setWhatIBuilt(e.target.value)}
              placeholder="Features added, scripts written, repos created, benchmarks run..."
              className="w-full p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
            />
          </div>

          {/* Problems Encountered */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Problems Encountered & Fixes
            </label>
            <textarea
              rows={2}
              value={problemsEncountered}
              onChange={(e) => setProblemsEncountered(e.target.value)}
              placeholder="Bugs, unexpected behaviors, edge cases, how you solved them..."
              className="w-full p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Key Takeaways */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Key Takeaways & Best Practices
              </label>
              <textarea
                rows={2}
                value={keyTakeaways}
                onChange={(e) => setKeyTakeaways(e.target.value)}
                placeholder="Heuristics to remember..."
                className="w-full p-2 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
              />
            </div>

            {/* Tomorrow's Plan */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Tomorrow’s Focus
              </label>
              <textarea
                rows={2}
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                placeholder="Next day’s goal or challenge..."
                className="w-full p-2 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
              />
            </div>
          </div>

          {/* Related GitHub Commit / Repo URL */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <Github className="w-3 h-3 text-muted-foreground" /> Related GitHub Commit or PR URL
            </label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/developer/forge/commit/abc123"
              className="w-full p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !whatILearned.trim()}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium shadow-xs hover:bg-primary/90 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{entryToEdit ? 'Save Changes' : 'Record Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
