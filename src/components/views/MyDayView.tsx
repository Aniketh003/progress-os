'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Filter,
  Flag,
  ExternalLink,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { TaskPriority, TaskStatus, StandaloneTodo } from '@/types';
import { cn } from '@/lib/utils';

interface MyDayViewProps {
  onOpenQuickTask: () => void;
}

export function MyDayView({ onOpenQuickTask }: MyDayViewProps) {
  const {
    todos,
    learningMaps,
    handleAddTodo,
    handleToggleTodoStatus,
    handleDeleteTodo,
  } = useProgressOS();

  const [selectedMapFilter, setSelectedMapFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [quickInputTitle, setQuickInputTitle] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Filter today's todos
  const filteredTodos = todos.filter((todo) => {
    // Priority filter
    if (selectedPriorityFilter !== 'all' && todo.priority !== selectedPriorityFilter) {
      return false;
    }
    // Map filter
    if (selectedMapFilter !== 'all') {
      if (selectedMapFilter === 'standalone' && todo.learningMapId) return false;
      if (selectedMapFilter !== 'standalone' && todo.learningMapId !== selectedMapFilter) return false;
    }
    return true;
  });

  const completedCount = filteredTodos.filter((t) => t.status === 'done').length;
  const totalCount = filteredTodos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group filtered todos by Learning Map
  const groupedTodos = filteredTodos.reduce<Record<string, StandaloneTodo[]>>((acc, todo) => {
    const key = todo.learningMapTitle || 'General Backlog';
    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInputTitle.trim()) return;

    await handleAddTodo({
      title: quickInputTitle.trim(),
      priority: 'medium',
      status: 'todo',
      dueDate: todayStr,
      learningMapId: selectedMapFilter !== 'all' && selectedMapFilter !== 'standalone' ? selectedMapFilter : undefined,
      learningMapTitle: learningMaps.find((m) => m.id === selectedMapFilter)?.title,
    });
    setQuickInputTitle('');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Day</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
              Today
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{todayFormatted}</p>
        </div>

        {/* Daily Progress Tracker */}
        <div className="flex items-center gap-4 bg-card/60 border border-border/60 p-3 rounded-xl min-w-[200px]">
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground font-medium">Daily Completion</span>
              <span className="font-semibold text-foreground font-mono">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">
              {completedCount} of {totalCount} completed
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Inline Quick-Add */}
      <div className="space-y-3">
        {/* Inline Add Input */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickInputTitle}
              onChange={(e) => setQuickInputTitle(e.target.value)}
              placeholder="Add a task for today and press Enter..."
              className="w-full text-xs p-3 bg-muted/30 border border-border/80 rounded-xl outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/70 shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={!quickInputTitle.trim()}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={onOpenQuickTask}
            className="px-3.5 py-3 rounded-xl border border-border/80 bg-card hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-all shrink-0"
            title="Open Full Task Form"
          >
            Detailed Task
          </button>
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Map Filter */}
          <select
            value={selectedMapFilter}
            onChange={(e) => setSelectedMapFilter(e.target.value)}
            className="p-1.5 bg-muted/30 border border-border/70 rounded-lg text-foreground text-xs outline-none"
          >
            <option value="all">All Roadmaps</option>
            <option value="standalone">Standalone Backlog</option>
            {learningMaps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="p-1.5 bg-muted/30 border border-border/70 rounded-lg text-foreground text-xs outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Grouped Todos List */}
      <div className="space-y-6 pt-2">
        {Object.keys(groupedTodos).length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <Sparkles className="w-8 h-8 text-primary/60 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">Clear Slate!</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No tasks match your filters for today. Add a new task above or pull tasks from your learning roadmap.
            </p>
          </div>
        ) : (
          Object.entries(groupedTodos).map(([groupTitle, items]) => (
            <div key={groupTitle} className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  {groupTitle}
                </span>
                <span className="font-mono text-[11px] font-normal text-muted-foreground">
                  {items.filter((i) => i.status === 'done').length}/{items.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {items.map((todo) => {
                  const isDone = todo.status === 'done';
                  return (
                    <div
                      key={todo.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border transition-all group',
                        isDone
                          ? 'bg-muted/20 border-border/40 text-muted-foreground'
                          : 'bg-card border-border/80 text-foreground shadow-xs hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <button
                          onClick={() => handleToggleTodoStatus(todo.id, todo.status)}
                          className="transition-transform active:scale-90 shrink-0"
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
                              'text-xs font-medium leading-normal truncate',
                              isDone && 'line-through opacity-70'
                            )}
                          >
                            {todo.title}
                          </span>
                          {todo.description && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {todo.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {todo.dayNumber && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Day {todo.dayNumber}
                          </span>
                        )}

                        <span
                          className={cn(
                            'text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-medium',
                            todo.priority === 'high'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : todo.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {todo.priority}
                        </span>

                        {todo.repositoryUrl && (
                          <a
                            href={todo.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-muted-foreground hover:text-foreground"
                            title="GitHub link"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
