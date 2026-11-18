'use client';

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  TrendingUp,
  Trash2,
  HelpCircle,
  Download,
  Edit2,
  Upload,
  MoreVertical,
  Cpu,
  Database,
  Server,
  BookOpen,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useUI } from '@/context/UIContext';
import {
  getMapStats,
  calculateLearningStreak,
  getTimeGreeting,
  cn,
} from '@/lib/utils';
import { FocusTimerCard } from '@/components/timer/FocusTimerCard';
import { FocusTimerModal } from '@/components/timer/FocusTimerModal';

interface OverviewViewProps {
  onOpenQuickTask: () => void;
  onSelectMap: (mapId: string) => void;
  onNavigateView: (view: string) => void;
}

export function OverviewView({
  onOpenQuickTask,
  onSelectMap,
  onNavigateView,
}: OverviewViewProps) {
  const {
    learningMaps,
    todos,
    journalEntries,
    settings,
    handleToggleTodoStatus,
    handleDeleteTodo,
    handleExportMap,
    handleDeleteMap,
  } = useProgressOS();

  const { openImport, openImportGuide, openNewMap, openEditMap } = useUI();

  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [activeMenuMapId, setActiveMenuMapId] = useState<string | null>(null);

  const { greeting, quote } = getTimeGreeting();
  const todayStr = new Date().toISOString().split('T')[0];

  const getMapIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cpu':
        return <Cpu className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'server':
        return <Server className="w-4 h-4" />;
      case 'layers':
        return <Layers className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  // Aggregated stats across all learning maps
  let globalTotalTasks = 0;
  let globalCompletedTasks = 0;
  let globalTotalDays = 0;
  let globalCompletedDays = 0;

  learningMaps.forEach((map) => {
    const stats = getMapStats(map);
    globalTotalTasks += stats.totalTasks;
    globalCompletedTasks += stats.completedTasks;
    globalTotalDays += stats.totalDays;
    globalCompletedDays += stats.completedDays;
  });

  // Include standalone todos in total
  globalTotalTasks += todos.length;
  globalCompletedTasks += todos.filter((t) => t.status === 'done').length;

  const overallPercent =
    globalTotalTasks > 0
      ? Math.round((globalCompletedTasks / globalTotalTasks) * 100)
      : 0;

  // Streak calculation for metrics
  const journalDates = journalEntries.map((j) => j.date);
  const { streak, totalActiveDays } = calculateLearningStreak(
    learningMaps,
    journalDates
  );

  // Today's focus tasks
  const todayTodos = todos.filter((t) => t.dueDate === todayStr || !t.dueDate);
  const pendingToday = todayTodos.filter((t) => t.status !== 'done');
  const completedToday = todayTodos.filter((t) => t.status === 'done');

  // Filter for started or progress-made learning roadmaps
  const inProgressMaps = learningMaps.filter((map) => {
    const stats = getMapStats(map);
    return stats.completedTasks > 0 || stats.completedDays > 0;
  });

  // Overdue tasks
  const overdueTodos = todos.filter(
    (t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done'
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. Top Header: Greeting (Left) & Compact Metrics (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        {/* Left: Greeting & Focus */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              Daily Focus
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {settings.userName || 'Aniketh'}
          </h1>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Right: Compact Metrics Grid Side-by-Side */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 lg:max-w-md w-full">
          {/* Total Maps */}
          <div className="p-2.5 sm:p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center justify-between">
              Roadmaps
              <Compass className="w-3 h-3 text-primary" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {learningMaps.length}
              </span>
              <span className="text-[9px] text-muted-foreground">active</span>
            </div>
          </div>

          {/* Progress */}
          <div className="p-2.5 sm:p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center justify-between">
              Progress
              <TrendingUp className="w-3 h-3 text-rose-500" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {overallPercent}%
              </span>
              <span className="text-[9px] text-muted-foreground">velocity</span>
            </div>
          </div>

          {/* Streak */}
          <div className="p-2.5 sm:p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center justify-between">
              Streak
              <Flame className="w-3 h-3 text-amber-500" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {streak}
              </span>
              <span className="text-[9px] text-amber-500 font-medium">days</span>
            </div>
          </div>

          {/* Active Days */}
          <div className="p-2.5 sm:p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col justify-between">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center justify-between">
              Active Days
              <Calendar className="w-3 h-3 text-emerald-500" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {totalActiveDays}
              </span>
              <span className="text-[9px] text-muted-foreground">logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Focus & Focus Timer Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Focus (Max 3 items, scrollable) */}
        <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Today’s Focus</h2>
              {todayTodos.length > 0 && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  ({completedToday.length}/{todayTodos.length} done)
                </span>
              )}
            </div>
            <button
              onClick={onOpenQuickTask}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-all shadow-xs"
              title="Add task for today"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Max 3 visible items with smooth scrolling */}
          <div className="space-y-1.5 overflow-y-auto max-h-[144px] pr-1">
            {overdueTodos.length > 0 && (
              <div className="text-[10px] font-semibold text-destructive uppercase tracking-wider py-0.5">
                Overdue ({overdueTodos.length})
              </div>
            )}
            {overdueTodos.map((todo) => (
              <div
                key={todo.id}
                onClick={() => handleToggleTodoStatus(todo.id, todo.status)}
                className="group flex items-center justify-between p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs cursor-pointer select-none hover:border-destructive/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="shrink-0">
                    <Circle className="w-4 h-4 text-destructive group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <span className="text-foreground truncate font-medium">{todo.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-destructive shrink-0">Due {todo.dueDate}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTodo(todo.id);
                    }}
                    className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {todayTodos.length === 0 && overdueTodos.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-lg">
                No pending tasks for today. Click &quot;Add Task&quot; above to create one.
              </div>
            ) : (
              todayTodos.map((todo) => {
                const isDone = todo.status === 'done';
                return (
                  <div
                    key={todo.id}
                    onClick={() => handleToggleTodoStatus(todo.id, todo.status)}
                    className={cn(
                      'group flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors cursor-pointer select-none hover:border-primary/50',
                      isDone
                        ? 'bg-muted/20 border-border/40 text-muted-foreground'
                        : 'bg-card border-border/70 text-foreground hover:bg-muted/10'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                        )}
                      </div>
                      <span className={cn('truncate font-medium', isDone && 'line-through opacity-70')}>
                        {todo.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {todo.learningMapTitle && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[120px]">
                          {todo.learningMapTitle}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTodo(todo.id);
                        }}
                        className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Focus Timer Dashboard Card */}
        <FocusTimerCard onOpenModal={() => setIsTimerModalOpen(true)} />
      </div>

      {/* Focus Timer Fullscreen Modal */}
      <FocusTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />

      {/* 3. Continue Learning Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Continue Learning
            </h2>
            <p className="text-xs text-muted-foreground">
              Jump back into your active roadmap milestones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inProgressMaps.length === 0 ? (
            <div className="col-span-full p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
              <Compass className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-foreground font-medium">
                No learning roadmaps currently in progress
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Select a roadmap below under &ldquo;Learning Paths&rdquo; to start tracking your learning journey.
              </p>
            </div>
          ) : (
            inProgressMaps.map((map) => {
              const stats = getMapStats(map);
              return (
                <div
                  key={map.id}
                  onClick={() => onSelectMap(map.id)}
                  className="group relative p-4 rounded-xl border border-border/70 hover:border-primary/50 bg-card/70 hover:bg-card/90 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: map.accentColor || '#6366f1' }}
                        />
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {map.title}
                        </h3>
                      </div>
                      {map.repositoryUrl && (
                        <a
                          href={map.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title="Open GitHub Repository"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {map.description}
                    </p>
                  </div>

                  {/* Progress & Milestone */}
                  <div className="mt-4 pt-3 border-t border-border/40 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground truncate font-mono">
                        {stats.currentMilestone}
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {stats.taskProgress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.taskProgress}%`,
                          backgroundColor: map.accentColor || '#6366f1',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                      <span>
                        {stats.completedTasks} of {stats.totalTasks} tasks done
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-foreground font-medium">
                        Open Map <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Learning Paths Section with the three action icons with pretext */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Learning Paths
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                {learningMaps.length} {learningMaps.length === 1 ? 'path' : 'paths'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore, customize, and manage all your structured learning roadmaps
            </p>
          </div>

          {/* The three icons from the sidebar with descriptive pretext */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. HelpCircle: AI Prompt Guide */}
            <button
              onClick={openImportGuide}
              title="Roadmap Schema & AI Prompt Guide"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/50 text-xs text-foreground font-medium transition-all shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>AI Prompt Guide</span>
            </button>

            {/* 2. Download: Import Learning Map (JSON) */}
            <button
              onClick={openImport}
              title="Import Learning Map (JSON)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/50 text-xs text-foreground font-medium transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Import JSON</span>
            </button>

            {/* 3. Plus: Create Learning Map */}
            <button
              onClick={openNewMap}
              title="Create New Learning Map"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Path</span>
            </button>
          </div>
        </div>

        {/* Grid of all Learning Paths */}
        {learningMaps.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
            <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-foreground font-semibold">
              No learning paths found
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
              Import a pre-configured curriculum JSON or create a custom learning roadmap to get started.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={openImport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <button
                onClick={openNewMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted/40 text-foreground text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Path</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningMaps.map((map) => {
              const stats = getMapStats(map);
              const isMenuOpen = activeMenuMapId === map.id;

              return (
                <div
                  key={map.id}
                  onClick={() => onSelectMap(map.id)}
                  className="group relative p-4 rounded-xl border border-border/70 hover:border-primary/50 bg-card/80 hover:bg-card transition-all cursor-pointer shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header with Icon, Category, Title, and Context Menu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="shrink-0 p-2 rounded-lg"
                          style={{
                            color: map.accentColor || '#e11d48',
                            backgroundColor: `${map.accentColor || '#e11d48'}15`,
                          }}
                        >
                          {getMapIcon(map.icon)}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">
                            {map.category || 'Roadmap'}
                          </span>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {map.title}
                          </h3>
                        </div>
                      </div>

                      {/* Dropdown Menu Trigger */}
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMapId(isMenuOpen ? null : map.id);
                          }}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Menu Options */}
                        {isMenuOpen && (
                          <div
                            className="absolute right-0 top-7 w-40 py-1 rounded-xl bg-popover border border-border/80 shadow-xl z-50 text-xs animate-in fade-in-50 zoom-in-95 select-none"
                            onMouseLeave={() => setActiveMenuMapId(null)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuMapId(null);
                                openEditMap(map);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-accent text-left font-medium"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuMapId(null);
                                handleExportMap(map);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-accent text-left font-medium"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Export JSON</span>
                            </button>
                            <div className="my-1 border-t border-border/50" />
                            <button
                              onClick={() => {
                                setActiveMenuMapId(null);
                                if (confirm(`Are you sure you want to delete "${map.title}"?`)) {
                                  handleDeleteMap(map.id);
                                }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 text-left font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Path</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {map.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Progress & Milestone Footer */}
                  <div className="mt-4 pt-3 border-t border-border/40 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground truncate font-mono">
                        {stats.currentMilestone}
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {stats.taskProgress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.taskProgress}%`,
                          backgroundColor: map.accentColor || '#e11d48',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                      <span>
                        {stats.completedTasks} / {stats.totalTasks} tasks · {stats.completedDays} / {stats.totalDays} days
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-foreground font-semibold">
                        View Path <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
