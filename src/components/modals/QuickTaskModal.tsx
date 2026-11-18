'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  X,
  Plus,
  Calendar,
  AlertCircle,
  Flag,
  Compass,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { TaskPriority, TaskStatus } from '@/types';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTaskModal({ isOpen, onClose }: QuickTaskModalProps) {
  const { learningMaps, activeMapId, handleAddTodo, handleUpdateDay } = useProgressOS();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setSelectedMapId('');
      setSelectedDayId('');
      setPriority('medium');
      setStatus('todo');
      setDueDate(new Date().toISOString().split('T')[0]);
      setRepositoryUrl('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMap = learningMaps.find((m) => m.id === selectedMapId);

  // Flatten days of currentMap for dropdown
  const mapDays = currentMap
    ? currentMap.weeks.flatMap((w) =>
        w.days.map((d) => ({
          id: d.id,
          label: `Day ${d.dayNumber}: ${d.title}`,
          dayNumber: d.dayNumber,
        }))
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // If a specific map and day were chosen, also add into that day's checklist!
      if (selectedMapId && selectedDayId) {
        await handleUpdateDay(selectedMapId, selectedDayId, (day) => {
          day.tasks.push({
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title.trim(),
            description: description.trim(),
            priority,
            status,
            repositoryUrl: repositoryUrl.trim(),
            dueDate,
            completedAt: status === 'done' ? new Date().toISOString() : null,
          });
          return day;
        });
      }

      // Add to unified Standalone / Daily Todos
      const chosenDayObj = mapDays.find((d) => d.id === selectedDayId);
      await handleAddTodo({
        title: title.trim(),
        description: description.trim(),
        learningMapId: selectedMapId || undefined,
        learningMapTitle: currentMap?.title,
        dayId: selectedDayId || undefined,
        dayNumber: chosenDayObj?.dayNumber,
        priority,
        status,
        dueDate,
        repositoryUrl: repositoryUrl.trim(),
        completedAt: status === 'done' ? new Date().toISOString() : null,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Create New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Task Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details, notes, or acceptance criteria..."
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
            />
          </div>

          {/* Roadmap & Day Link */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-muted-foreground" /> Learning Map
              </label>
              <select
                value={selectedMapId}
                onChange={(e) => {
                  setSelectedMapId(e.target.value);
                  setSelectedDayId('');
                }}
                className="w-full text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
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
                <Calendar className="w-3 h-3 text-muted-foreground" /> Roadmap Day
              </label>
              <select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                disabled={!selectedMapId || mapDays.length === 0}
                className="w-full text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground disabled:opacity-50"
              >
                <option value="">(Optional Day)</option>
                {mapDays.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Flag className="w-3 h-3 text-muted-foreground" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-1.5 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
              />
            </div>
          </div>

          {/* Repository Link */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <Github className="w-3 h-3 text-muted-foreground" /> Related GitHub Link (Optional)
            </label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
