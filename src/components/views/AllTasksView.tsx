'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  Compass,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { StandaloneTodo, TaskStatus, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';

interface AllTasksViewProps {
  onOpenQuickTask: () => void;
}

export function AllTasksView({ onOpenQuickTask }: AllTasksViewProps) {
  const {
    todos,
    learningMaps,
    handleToggleTodoStatus,
    handleDeleteTodo,
    handleToggleTaskStatus,
  } = useProgressOS();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [mapFilter, setMapFilter] = useState<string>('all');

  // Also collect all tasks nested inside learning maps for unified cross-roadmap visibility!
  const allConsolidatedTasks = useMemo(() => {
    const list: (StandaloneTodo & { isFromMapDay?: boolean; dayId?: string; mapId?: string })[] = [];

    // 1. Add standalone todos
    todos.forEach((t) => {
      list.push(t);
    });

    // 2. Add tasks directly inside map days
    learningMaps.forEach((map) => {
      map.weeks.forEach((week) => {
        week.days.forEach((day) => {
          day.tasks.forEach((task) => {
            list.push({
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate || '',
              learningMapId: map.id,
              learningMapTitle: map.title,
              dayId: day.id,
              dayNumber: day.dayNumber,
              repositoryUrl: task.repositoryUrl || day.repositoryUrl,
              order: 0,
              createdAt: '',
              isFromMapDay: true,
              mapId: map.id,
            });
          });
        });
      });
    });

    return list;
  }, [todos, learningMaps]);

  const filteredTasks = useMemo(() => {
    return allConsolidatedTasks.filter((task) => {
      // Status filter
      if (statusFilter === 'todo' && task.status === 'done') return false;
      if (statusFilter === 'done' && task.status !== 'done') return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Map filter
      if (mapFilter !== 'all') {
        if (mapFilter === 'standalone' && task.learningMapId) return false;
        if (mapFilter !== 'standalone' && task.learningMapId !== mapFilter) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q)) ||
          (task.learningMapTitle && task.learningMapTitle.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [allConsolidatedTasks, statusFilter, priorityFilter, mapFilter, search]);

  const completedCount = filteredTasks.filter((t) => t.status === 'done').length;
  const totalCount = filteredTasks.length;

  const handleToggle = async (task: any) => {
    if (task.isFromMapDay && task.mapId && task.dayId) {
      await handleToggleTaskStatus(task.mapId, task.dayId, task.id, task.status);
    } else {
      await handleToggleTodoStatus(task.id, task.status);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">All Tasks</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {completedCount}/{totalCount} Completed
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Global task ledger across all learning roadmaps and personal todos
          </p>
        </div>

        <button
          onClick={onOpenQuickTask}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks by name or description..."
            className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/70 rounded-xl text-xs outline-none focus:border-primary text-foreground"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="p-2 bg-muted/30 border border-border/70 rounded-xl text-xs text-foreground outline-none"
        >
          <option value="all">All Status</option>
          <option value="todo">Pending / Todo</option>
          <option value="done">Completed</option>
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="p-2 bg-muted/30 border border-border/70 rounded-xl text-xs text-foreground outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Learning Map */}
        <select
          value={mapFilter}
          onChange={(e) => setMapFilter(e.target.value)}
          className="p-2 bg-muted/30 border border-border/70 rounded-xl text-xs text-foreground outline-none"
        >
          <option value="all">All Roadmaps</option>
          <option value="standalone">Standalone Only</option>
          {learningMaps.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-1.5">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border/60 rounded-xl bg-muted/10">
            <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-medium text-foreground">No matching tasks found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Try adjusting your search criteria or create a new task.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={`${task.learningMapId || 'standalone'}-${task.id}`}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all group',
                  isDone
                    ? 'bg-muted/15 border-border/40 text-muted-foreground'
                    : 'bg-card border-border/70 text-foreground hover:border-primary/40 shadow-xs'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <button
                    onClick={() => handleToggle(task)}
                    className="shrink-0 transition-transform active:scale-90"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-500" />
                    )}
                  </button>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        'text-xs font-medium truncate leading-normal',
                        isDone && 'line-through opacity-70'
                      )}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.learningMapTitle && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground truncate max-w-[150px]">
                      {task.learningMapTitle}
                    </span>
                  )}

                  {task.dayNumber && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                      Day {task.dayNumber}
                    </span>
                  )}

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

                  {task.repositoryUrl && (
                    <a
                      href={task.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {!task.isFromMapDay && (
                    <button
                      onClick={() => handleDeleteTodo(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
