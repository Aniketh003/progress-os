'use client';

import React from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import {
  getMapStats,
  calculateLearningStreak,
  getTimeGreeting,
  formatMinutes,
  cn,
} from '@/lib/utils';
import { LearningMap } from '@/types';

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
  } = useProgressOS();

  const { greeting, quote } = getTimeGreeting();
  const todayStr = new Date().toISOString().split('T')[0];

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

  // Streak calculation
  const journalDates = journalEntries.map((j) => j.date);
  const { streak, totalActiveDays, activityData } = calculateLearningStreak(
    learningMaps,
    journalDates
  );

  // Today's focus tasks
  const todayTodos = todos.filter((t) => t.dueDate === todayStr || !t.dueDate);
  const pendingToday = todayTodos.filter((t) => t.status !== 'done');
  const completedToday = todayTodos.filter((t) => t.status === 'done');

  // Overdue tasks
  const overdueTodos = todos.filter(
    (t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done'
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Refined Welcome & Motivation (single clean heading, no duplicate task button) */}
      <div className="pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              Daily Focus
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {greeting}, {settings.userName || 'Aniketh'}
          </h1>
          <p className="text-xs text-muted-foreground/90 font-normal italic tracking-wide">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Total Maps */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
            Roadmaps
            <Compass className="w-3.5 h-3.5 text-primary" />
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground">
              {learningMaps.length}
            </span>
            <span className="text-[10px] text-muted-foreground">active</span>
          </div>
        </div>

        {/* Overall % */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
            Progress
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground">
              {overallPercent}%
            </span>
            <span className="text-[10px] text-muted-foreground">velocity</span>
          </div>
        </div>

        {/* Learning Streak */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
            Streak
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground">
              {streak}
            </span>
            <span className="text-[10px] text-amber-500 font-medium">days</span>
          </div>
        </div>

        {/* Total Active Days */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
            Active Days
            <Calendar className="w-3.5 h-3.5 text-primary" />
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground">
              {totalActiveDays}
            </span>
            <span className="text-[10px] text-muted-foreground">logged</span>
          </div>
        </div>
      </div>

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
          {learningMaps.length === 0 ? (
            <div className="col-span-full p-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
              <Compass className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-foreground font-medium">
                No active learning maps available
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Import the 90-day AI Engineering roadmap or create a custom one from the sidebar.
              </p>
            </div>
          ) : (
            learningMaps.map((map) => {
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

      {/* 4. Split Section: Today's Focus & 30-Day Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Today’s Focus</h2>
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

          <div className="flex-1 space-y-2 overflow-y-auto max-h-72">
            {overdueTodos.length > 0 && (
              <div className="text-[11px] font-semibold text-destructive uppercase tracking-wider mb-1">
                Overdue ({overdueTodos.length})
              </div>
            )}
            {overdueTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <button
                    onClick={() => handleToggleTodoStatus(todo.id, todo.status)}
                    className="shrink-0"
                  >
                    <Circle className="w-4 h-4 text-destructive hover:text-emerald-500" />
                  </button>
                  <span className="text-foreground truncate font-medium">{todo.title}</span>
                </div>
                <span className="text-[10px] text-destructive shrink-0">Due {todo.dueDate}</span>
              </div>
            ))}

            {todayTodos.length === 0 && overdueTodos.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-lg">
                No pending tasks for today. Click &quot;Add Task&quot; above to create one.
              </div>
            ) : (
              todayTodos.map((todo) => {
                const isDone = todo.status === 'done';
                return (
                  <div
                    key={todo.id}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors',
                      isDone
                        ? 'bg-muted/20 border-border/40 text-muted-foreground'
                        : 'bg-card border-border/70 text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <button
                        onClick={() => handleToggleTodoStatus(todo.id, todo.status)}
                        className="shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-500" />
                        )}
                      </button>
                      <span className={cn('truncate', isDone && 'line-through opacity-70')}>
                        {todo.title}
                      </span>
                    </div>

                    {todo.learningMapTitle && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 truncate max-w-[120px]">
                        {todo.learningMapTitle}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 30-Day Activity & Consistency Heatmap */}
        <div className="p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">
                30-Day Learning Consistency
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {streak} day streak
            </span>
          </div>

          {/* Activity Matrix */}
          <div className="space-y-2">
            <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
              {activityData.map((d, idx) => {
                let colorClass = 'bg-muted/50 border border-border/40';
                if (d.count >= 4) {
                  colorClass = 'bg-primary text-primary-foreground font-bold shadow-xs';
                } else if (d.count >= 2) {
                  colorClass = 'bg-primary/70';
                } else if (d.count >= 1) {
                  colorClass = 'bg-primary/40';
                }

                return (
                  <div
                    key={idx}
                    title={`${d.date}: ${d.count} learning activities`}
                    className={cn(
                      'aspect-square rounded-md transition-all hover:scale-110 flex items-center justify-center text-[9px]',
                      colorClass
                    )}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
              <span>30 days ago</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-muted/50" />
                <span className="w-2.5 h-2.5 rounded bg-primary/40" />
                <span className="w-2.5 h-2.5 rounded bg-primary/70" />
                <span className="w-2.5 h-2.5 rounded bg-primary" />
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Daily Commitment Goal:</span>
            <span className="font-semibold text-foreground font-mono">
              {formatMinutes(settings.dailyCommitmentMinutes || 180)} / day
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
