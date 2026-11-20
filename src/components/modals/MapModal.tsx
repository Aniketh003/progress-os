'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Palette,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useToast } from '@/context/ToastContext';
import { LearningMap, MapStatus } from '@/types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapToEdit?: LearningMap | null;
  onSuccess: (mapId: string) => void;
}

export function MapModal({ isOpen, onClose, mapToEdit, onSuccess }: MapModalProps) {
  const { handleSaveMap } = useProgressOS();
  const { toast } = useToast();

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [status, setStatus] = useState<MapStatus>('active');
  const [dailyCommitmentMinutes, setDailyCommitmentMinutes] = useState(180);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#e11d48');
  const [icon, setIcon] = useState('Compass');
  const [numWeeks, setNumWeeks] = useState(4);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mapToEdit) {
      setId(mapToEdit.id);
      setTitle(mapToEdit.title);
      setDescription(mapToEdit.description);
      setCategory(mapToEdit.category);
      setStatus(mapToEdit.status);
      setDailyCommitmentMinutes(mapToEdit.dailyCommitmentMinutes);
      setRepositoryUrl(mapToEdit.repositoryUrl || '');
      setAccentColor(mapToEdit.accentColor || '#e11d48');
      setIcon(mapToEdit.icon || 'Compass');
    } else {
      const generatedId = `map-${Date.now().toString(36)}`;
      setId(generatedId);
      setTitle('');
      setDescription('');
      setCategory('Technology');
      setStatus('active');
      setDailyCommitmentMinutes(180);
      setRepositoryUrl('');
      setAccentColor('#e11d48');
      setIcon('Compass');
      setNumWeeks(4);
      setDaysPerWeek(5);
    }
  }, [mapToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (mapToEdit) {
        // Edit existing map
        const updated: LearningMap = {
          ...mapToEdit,
          title: title.trim(),
          description: description.trim(),
          category,
          status,
          dailyCommitmentMinutes: Number(dailyCommitmentMinutes),
          repositoryUrl: repositoryUrl.trim(),
          accentColor,
          icon,
          updatedAt: new Date().toISOString(),
        };
        await handleSaveMap(updated);
        toast.success(`Roadmap "${updated.title}" updated successfully`, 'Roadmap Saved');
        onSuccess(updated.id);
      } else {
        // Generate new map with template weeks and days
        let dayCounter = 1;
        const weeks = Array.from({ length: numWeeks }, (_, wIdx) => {
          const weekNum = wIdx + 1;
          const days = Array.from({ length: daysPerWeek }, (_, dIdx) => {
            const currentDayNum = dayCounter++;
            return {
              id: `day-${currentDayNum}`,
              dayNumber: currentDayNum,
              title: `Day ${currentDayNum} - Topic & Goals`,
              description: `Study plan and implementation for day ${currentDayNum}.`,
              objectives: ['Complete core study modules', 'Practical implementation'],
              topics: ['Fundamentals', 'Implementation'],
              repositoryUrl: repositoryUrl ? `${repositoryUrl}/tree/main/day-${currentDayNum}` : '',
              estimatedMinutes: Number(dailyCommitmentMinutes),
              status: 'pending' as const,
              tasks: [
                {
                  id: `task-d${currentDayNum}-1`,
                  title: 'Read core documentation and resources',
                  priority: 'medium' as const,
                  status: 'todo' as const,
                },
                {
                  id: `task-d${currentDayNum}-2`,
                  title: 'Hands-on coding exercise',
                  priority: 'high' as const,
                  status: 'todo' as const,
                },
              ],
              notes: '',
              completedAt: null,
              timeSpentMinutes: 0,
            };
          });

          return {
            id: `week-${weekNum}`,
            weekNumber: weekNum,
            title: `Week ${weekNum} Milestone`,
            description: `Core concepts and project deliverable for week ${weekNum}.`,
            deliverable: `Working week ${weekNum} project / deliverable.`,
            objective: `Master week ${weekNum} competencies.`,
            topics: ['Engineering', 'Design'],
            reviewChecklist: ['Unit tests pass', 'Documentation updated'],
            days,
          };
        });

        const newMap: LearningMap = {
          schemaVersion: '1.0',
          id: id.trim() || `map-${Date.now().toString(36)}`,
          title: title.trim(),
          description: description.trim(),
          category,
          status,
          startDate: new Date().toISOString().split('T')[0],
          targetDate: new Date(Date.now() + numWeeks * 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          dailyCommitmentMinutes: Number(dailyCommitmentMinutes),
          repositoryUrl: repositoryUrl.trim(),
          accentColor,
          icon,
          weeks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await handleSaveMap(newMap);
        toast.success(`Roadmap "${newMap.title}" created successfully`, 'Roadmap Created');
        onSuccess(newMap.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save roadmap:', err);
      toast.error('Failed to save roadmap. Please try again.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    '#e11d48', // Crimson Red
    '#f43f5e', // Rose
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {mapToEdit ? 'Edit Learning Map' : 'Create Learning Map'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mapToEdit ? 'Update roadmap properties' : 'Design a new learning journey'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Design — 60 Days"
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the learning journey and target outcomes..."
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Backend, AI, Infra"
                className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MapStatus)}
                className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
              >
                <option value="active">Active</option>
                <option value="not-started">Not Started</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Daily Commitment */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" /> Daily Target (mins)
              </label>
              <input
                type="number"
                min={15}
                max={600}
                step={15}
                value={dailyCommitmentMinutes}
                onChange={(e) => setDailyCommitmentMinutes(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Palette className="w-3 h-3 text-muted-foreground" /> Accent Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: accentColor === c ? 'white' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* GitHub Repo */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <Github className="w-3 h-3 text-muted-foreground" /> GitHub Repository URL
            </label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* If creating new, specify weeks & days scaffold */}
          {!mapToEdit && (
            <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <span className="text-xs font-medium text-foreground block">
                Roadmap Scaffold Generator
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    Number of Weeks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={numWeeks}
                    onChange={(e) => setNumWeeks(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-background border border-border/80 rounded-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    Days per Week
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-background border border-border/80 rounded-md outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Will create {numWeeks * daysPerWeek} modular day lessons with checklist templates.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:bg-primary/90 flex items-center gap-1.5 disabled:opacity-60 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{mapToEdit ? 'Saving Changes...' : 'Creating Roadmap...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{mapToEdit ? 'Save Changes' : 'Create Roadmap'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
