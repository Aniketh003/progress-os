'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  BookOpen,
  Plus,
  Trash2,
  CheckSquare,
  FileText,
  Sparkles,
  Tag,
  Loader2,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useToast } from '@/context/ToastContext';
import { LearningMap, Day, TaskStatus, TaskPriority, DayTask } from '@/types';
import { formatMinutes, cn } from '@/lib/utils';

interface DayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  learningMap: LearningMap;
  day: Day | null;
}

export function DayDrawer({ isOpen, onClose, learningMap, day }: DayDrawerProps) {
  const { handleUpdateDay, handleToggleTaskStatus, handleToggleDayStatus } = useProgressOS();
  const { toast } = useToast();

  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [repoUrl, setRepoUrl] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSavingRepo, setIsSavingRepo] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isTogglingDay, setIsTogglingDay] = useState(false);

  useEffect(() => {
    if (day) {
      setNotes(day.notes || '');
      setTimeSpent(day.timeSpentMinutes || 0);
      setRepoUrl(day.repositoryUrl || '');
      setNewTaskTitle('');
      setIsAddingTask(false);
      setIsSavingRepo(false);
      setIsSavingNotes(false);
      setIsTogglingDay(false);
    }
  }, [day]);

  if (!isOpen || !day) return null;

  const totalTasks = day.tasks.length;
  const completedTasks = day.tasks.filter((t) => t.status === 'done').length;
  const isCompleted = day.status === 'completed';

  const handleSaveRepoUrl = async (newUrl: string) => {
    setRepoUrl(newUrl);
    setIsSavingRepo(true);
    try {
      await handleUpdateDay(learningMap.id, day.id, (d) => {
        d.repositoryUrl = newUrl.trim();
        return d;
      });
      toast.success('Day repository link updated', 'Link Saved');
    } catch (err) {
      console.error('Failed to update repo link:', err);
      toast.error('Failed to update repository link', 'Error');
    } finally {
      setIsSavingRepo(false);
    }
  };

  const handleSaveNotes = async () => {
    if (notes === (day.notes || '')) return;
    setIsSavingNotes(true);
    try {
      await handleUpdateDay(learningMap.id, day.id, (d) => {
        d.notes = notes;
        return d;
      });
      toast.success(`Notes saved for Day ${day.dayNumber}`, 'Notes Saved');
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error('Failed to save notes', 'Error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSaveTimeSpent = async (mins: number) => {
    setTimeSpent(mins);
    try {
      await handleUpdateDay(learningMap.id, day.id, (d) => {
        d.timeSpentMinutes = mins;
        return d;
      });
      toast.success(`Logged ${formatMinutes(mins)} for Day ${day.dayNumber}`, 'Time Logged');
    } catch (err) {
      console.error('Failed to save time:', err);
      toast.error('Failed to save time spent', 'Error');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isAddingTask) return;

    setIsAddingTask(true);
    try {
      await handleUpdateDay(learningMap.id, day.id, (d) => {
        d.tasks.push({
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          status: 'todo',
          completedAt: null,
        });
        return d;
      });
      toast.success(`Task "${newTaskTitle.trim()}" added to Day ${day.dayNumber}`, 'Task Added');
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to add task:', err);
      toast.error('Failed to add task to day', 'Error');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string, title?: string) => {
    try {
      await handleUpdateDay(learningMap.id, day.id, (d) => {
        d.tasks = d.tasks.filter((t) => t.id !== taskId);
        return d;
      });
      toast.info(`Task "${title || 'item'}" removed from Day ${day.dayNumber}`, 'Task Deleted');
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Failed to delete task', 'Error');
    }
  };

  const onToggleTask = async (task: DayTask) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await handleToggleTaskStatus(learningMap.id, day.id, task.id, task.status);
      if (nextStatus === 'done') {
        toast.success(`Task completed: "${task.title}"`, 'Task Completed');
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      toast.error('Failed to update task status', 'Error');
    }
  };

  const onToggleDay = async () => {
    if (isTogglingDay) return;
    setIsTogglingDay(true);
    try {
      const nextStatus = day.status === 'completed' ? 'pending' : 'completed';
      await handleToggleDayStatus(learningMap.id, day.id, day.status);
      if (nextStatus === 'completed') {
        toast.success(`Day ${day.dayNumber}: "${day.title}" marked complete! 🎉`, 'Day Completed');
      } else {
        toast.info(`Day ${day.dayNumber} marked as pending`, 'Day Incomplete');
      }
    } catch (err) {
      console.error('Failed to toggle day:', err);
      toast.error('Failed to update day status', 'Error');
    } finally {
      setIsTogglingDay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border/60 flex items-start justify-between gap-4 bg-muted/10">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onToggleDay}
              disabled={isTogglingDay}
              className="mt-0.5 shrink-0 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              title={isCompleted ? 'Mark as In-Progress' : 'Mark Day Complete'}
            >
              {isTogglingDay ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-emerald-500" />
              )}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Day {day.dayNumber}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full',
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {day.status}
                </span>
              </div>
              <h2 className="text-base font-semibold text-foreground mt-1.5 leading-snug">
                {day.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Quick Info bar */}
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50 text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Est: {formatMinutes(day.estimatedMinutes)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {completedTasks}/{totalTasks} tasks done
              </span>
            </div>

            {day.repositoryUrl?.trim() ? (
              <a
                href={day.repositoryUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline ml-auto font-medium"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Day Code</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>

          {/* Description */}
          {day.description && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Overview
              </h4>
              <p className="text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                {day.description}
              </p>
            </div>
          )}

          {/* Topics */}
          {day.topics && day.topics.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Key Topics
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {day.topics.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-mono border border-border/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Objectives */}
          {day.objectives && day.objectives.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Objectives
              </h4>
              <ul className="space-y-1.5">
                {day.objectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/20 border border-border/30"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="text-foreground">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Todo Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-primary" /> Tasks Checklist
              </h4>
              <span className="text-[11px] text-muted-foreground font-mono">
                {completedTasks}/{totalTasks}
              </span>
            </div>

            <div className="space-y-1.5">
              {day.tasks.map((task) => {
                const isTaskDone = task.status === 'done';
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg border transition-all group',
                      isTaskDone
                        ? 'bg-muted/20 border-border/40 text-muted-foreground'
                        : 'bg-card border-border/80 text-foreground shadow-xs'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <button
                        onClick={() => onToggleTask(task)}
                        className="transition-transform active:scale-90"
                      >
                        {isTaskDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-500" />
                        )}
                      </button>
                      <span className={cn('text-xs leading-normal', isTaskDone && 'line-through opacity-70')}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          'text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-medium',
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add task inline */}
              <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  disabled={isAddingTask}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a task to this day..."
                  className="flex-1 text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none focus:border-primary text-foreground disabled:opacity-50"
                />
                <select
                  value={newTaskPriority}
                  disabled={isAddingTask}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  className="text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground disabled:opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Med</option>
                  <option value="high">High</option>
                </select>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim() || isAddingTask}
                  className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  {isAddingTask ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Time Spent */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Actual Time Spent (Minutes)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={15}
                value={timeSpent}
                onChange={(e) => handleSaveTimeSpent(Number(e.target.value))}
                className="w-28 text-xs p-2 bg-muted/40 border border-border/80 rounded-md outline-none text-foreground font-mono"
              />
              <span className="text-xs text-muted-foreground">
                ({formatMinutes(timeSpent)})
              </span>
            </div>
          </div>

          {/* Repository Link Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-foreground" /> Day Repository URL
              </h4>
              {repoUrl.trim() ? (
                <div className="flex items-center gap-2">
                  <a
                    href={repoUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleSaveRepoUrl('')}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear Link
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">No link</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={repoUrl}
                disabled={isSavingRepo}
                onChange={(e) => setRepoUrl(e.target.value)}
                onBlur={() => handleSaveRepoUrl(repoUrl)}
                placeholder="https://github.com/user/project/tree/main/day-01"
                className="flex-1 text-xs p-2 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={isSavingRepo}
                onClick={() => handleSaveRepoUrl(repoUrl)}
                className="px-3 py-2 rounded-lg bg-card border border-border/80 hover:bg-accent text-xs font-medium text-foreground transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingRepo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingRepo ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Leave blank if this day has no code repository (reading, theory, or review).
            </p>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Personal Notes & Key Learnings
              </h4>
              {isSavingNotes && (
                <span className="text-[10px] text-primary flex items-center gap-1 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={notes}
              disabled={isSavingNotes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Record your breakthroughs, bugs fixed, or reference links for this day..."
              className="w-full text-xs p-3 bg-muted/30 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Notes automatically save when you click away.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            {day.completedAt ? (
              <span>Completed on {day.completedAt.split('T')[0]}</span>
            ) : (
              <span>Status: Incomplete</span>
            )}
          </div>

          <button
            onClick={onToggleDay}
            disabled={isTogglingDay}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50',
              isCompleted
                ? 'bg-muted border border-border text-foreground hover:bg-muted/80'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            )}
          >
            {isTogglingDay ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {isTogglingDay
                ? 'Updating...'
                : isCompleted
                ? 'Mark Incomplete'
                : 'Mark Day Complete'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
