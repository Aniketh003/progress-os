'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  List,
  GitCommit,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Download,
  Share2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { LearningMap, Day, Week, TaskStatus } from '@/types';
import { getMapStats, formatMinutes, cn } from '@/lib/utils';

interface MapDetailViewProps {
  learningMap: LearningMap;
  onOpenDay: (map: LearningMap, day: Day) => void;
  onOpenEditMap: (map: LearningMap) => void;
  onNavigateBack?: () => void;
}

export function MapDetailView({
  learningMap,
  onOpenDay,
  onOpenEditMap,
  onNavigateBack,
}: MapDetailViewProps) {
  const { handleToggleDayStatus, handleExportMap } = useProgressOS();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'list'>('roadmap');
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({
    'week-01': true,
  });
  const [listSearch, setListSearch] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState<string>('all');
  const [listWeekFilter, setListWeekFilter] = useState<string>('all');

  const stats = getMapStats(learningMap);

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekId]: !prev[weekId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    learningMap.weeks.forEach((w) => {
      all[w.id] = true;
    });
    setExpandedWeeks(all);
  };

  const collapseAll = () => {
    setExpandedWeeks({});
  };

  // Flattened days for List View with search & filter
  const filteredDays = useMemo(() => {
    const days: { day: Day; week: Week }[] = [];
    learningMap.weeks.forEach((week) => {
      week.days.forEach((day) => {
        days.push({ day, week });
      });
    });

    return days.filter(({ day, week }) => {
      // Status filter
      if (listStatusFilter !== 'all' && day.status !== listStatusFilter) return false;
      // Week filter
      if (listWeekFilter !== 'all' && week.id !== listWeekFilter) return false;
      // Search
      if (listSearch.trim()) {
        const q = listSearch.toLowerCase();
        const matches =
          day.title.toLowerCase().includes(q) ||
          day.description.toLowerCase().includes(q) ||
          day.topics.some((t) => t.toLowerCase().includes(q)) ||
          `day ${day.dayNumber}`.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [learningMap, listSearch, listStatusFilter, listWeekFilter]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Overview Header */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: learningMap.accentColor || '#6366f1' }}
              />
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                {learningMap.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border bg-muted/50 text-foreground">
                {learningMap.status}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-snug">
              {learningMap.title}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {learningMap.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {learningMap.repositoryUrl && (
              <a
                href={learningMap.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs font-medium text-foreground transition-colors"
                title="View on GitHub"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            )}

            <button
              onClick={() => handleExportMap(learningMap)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs font-medium text-foreground transition-colors"
              title="Export Learning Map as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => onOpenEditMap(learningMap)}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs font-medium text-foreground transition-colors"
            >
              Edit Map
            </button>
          </div>
        </div>

        {/* Progress & Milestone Bar */}
        <div className="pt-4 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-muted-foreground block">Overall Progress</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-foreground font-mono">
                {stats.taskProgress}%
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({stats.completedTasks}/{stats.totalTasks} tasks)
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${stats.taskProgress}%`,
                  backgroundColor: learningMap.accentColor || '#6366f1',
                }}
              />
            </div>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Current Milestone</span>
            <span className="text-xs font-semibold text-foreground truncate block mt-1 font-mono">
              {stats.currentMilestone}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {stats.completedDays} of {stats.totalDays} days finished
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Daily Commitment</span>
            <span className="text-xs font-semibold text-foreground block mt-1">
              {formatMinutes(learningMap.dailyCommitmentMinutes)} / day
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Target: {learningMap.targetDate || 'Flexible'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Roadmap Structure</span>
            <span className="text-xs font-semibold text-foreground block mt-1">
              {learningMap.weeks.length} Weeks · {stats.totalDays} Days
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {learningMap.weeks.reduce((acc, w) => acc + w.days.reduce((da, d) => da + d.tasks.length, 0), 0)} Total Micro-tasks
            </span>
          </div>
        </div>
      </div>

      {/* 2. View Toggle Bar (Roadmap vs List) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 text-xs">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'roadmap'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Roadmap View</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'list'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
              {stats.totalDays}
            </span>
          </button>
        </div>

        {activeTab === 'roadmap' ? (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-md transition-colors"
            >
              Expand All Weeks
            </button>
            <span className="text-border">|</span>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-md transition-colors"
            >
              Collapse All
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            {/* Search in List */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search days or topics..."
                className="pl-8 pr-2.5 py-1 bg-muted/30 border border-border/70 rounded-lg text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            {/* Filter by status */}
            <select
              value={listStatusFilter}
              onChange={(e) => setListStatusFilter(e.target.value)}
              className="p-1 bg-muted/30 border border-border/70 rounded-lg text-xs text-foreground outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. View Content */}
      {activeTab === 'roadmap' ? (
        /* ROADMAP TIMELINE VIEW */
        <div className="space-y-6">
          {learningMap.weeks.map((week) => {
            const isExpanded = !!expandedWeeks[week.id];
            const completedDaysInWeek = week.days.filter((d) => d.status === 'completed').length;
            const totalDaysInWeek = week.days.length;
            const isWeekComplete = completedDaysInWeek === totalDaysInWeek && totalDaysInWeek > 0;

            return (
              <div
                key={week.id}
                className="rounded-2xl border border-border/70 bg-card/40 overflow-hidden shadow-xs transition-all"
              >
                {/* Week Header Accordion */}
                <div
                  onClick={() => toggleWeek(week.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <button className="text-muted-foreground">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Week {week.weekNumber}
                        </span>
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {week.title}
                        </h3>
                        {isWeekComplete && (
                          <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-0.5 truncate">
                        {week.deliverable || week.description}
                      </span>
                    </div>
                  </div>

                  {/* Week Stats Pill */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-mono font-medium text-foreground">
                        {completedDaysInWeek} / {totalDaysInWeek} days
                      </span>
                      <div className="w-20 h-1 bg-muted/60 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(completedDaysInWeek / totalDaysInWeek) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week Expanded Days */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-border/40 bg-background/30 space-y-3">
                    {/* Week Deliverable & Objectives banner */}
                    {(week.objective || week.reviewChecklist?.length) && (
                      <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 text-xs space-y-1.5 mb-3">
                        {week.objective && (
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-foreground font-medium">
                              Objective: <span className="font-normal text-muted-foreground">{week.objective}</span>
                            </span>
                          </div>
                        )}
                        {week.deliverable && (
                          <div className="flex items-start gap-2">
                            <GitCommit className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="text-foreground font-medium">
                              Deliverable: <span className="font-normal text-muted-foreground">{week.deliverable}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Day Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {week.days.map((day) => {
                        const isDayComplete = day.status === 'completed';
                        const completedTasksCount = day.tasks.filter((t) => t.status === 'done').length;

                        return (
                          <div
                            key={day.id}
                            onClick={() => onOpenDay(learningMap, day)}
                            className={cn(
                              'group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-xs',
                              isDayComplete
                                ? 'bg-muted/15 border-border/50 text-muted-foreground'
                                : 'bg-card border-border/80 hover:border-primary/50 text-foreground'
                            )}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleDayStatus(learningMap.id, day.id, day.status);
                                    }}
                                    className="shrink-0 transition-transform active:scale-90"
                                    title={isDayComplete ? 'Mark Incomplete' : 'Mark Day Complete'}
                                  >
                                    {isDayComplete ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-500" />
                                    )}
                                  </button>
                                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                                    Day {day.dayNumber}
                                  </span>
                                  <h4 className={cn('text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate', isDayComplete && 'line-through opacity-75')}>
                                    {day.title}
                                  </h4>
                                </div>

                                {day.repositoryUrl?.trim() ? (
                                  <a
                                    href={day.repositoryUrl.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                                    title="Open day code repository"
                                  >
                                    <Github className="w-3.5 h-3.5" />
                                  </a>
                                ) : null}
                              </div>

                              <p className="text-[11px] text-muted-foreground line-clamp-2">
                                {day.description}
                              </p>

                              {/* Topics Tags */}
                              {day.topics && day.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {day.topics.slice(0, 3).map((topic, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                  {day.topics.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      +{day.topics.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Footer stats */}
                            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span>
                                  {completedTasksCount}/{day.tasks.length} tasks
                                </span>
                                <span>•</span>
                                <span>{formatMinutes(day.estimatedMinutes)}</span>
                              </div>

                              <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-primary font-medium text-[10px]">
                                Details <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE LIST / TABLE VIEW */
        <div className="border border-border/70 rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground font-medium">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4 w-20">Day</th>
                  <th className="py-3 px-4">Title & Objectives</th>
                  <th className="py-3 px-4 w-32">Week</th>
                  <th className="py-3 px-4 w-24">Tasks</th>
                  <th className="py-3 px-4 w-24">Est. Time</th>
                  <th className="py-3 px-4 w-16 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredDays.map(({ day, week }) => {
                  const isDone = day.status === 'completed';
                  const completedTasksCount = day.tasks.filter((t) => t.status === 'done').length;

                  return (
                    <tr
                      key={day.id}
                      onClick={() => onOpenDay(learningMap, day)}
                      className="hover:bg-accent/40 cursor-pointer transition-colors group"
                    >
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDayStatus(learningMap.id, day.id, day.status);
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 mx-auto" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        Day {day.dayNumber}
                      </td>
                      <td className="py-3 px-4 min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {day.title}
                          </span>
                          {day.repositoryUrl?.trim() ? (
                            <a
                              href={day.repositoryUrl.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                              title="Open day code repository"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {day.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        Week {week.weekNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {completedTasksCount}/{day.tasks.length}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {formatMinutes(day.estimatedMinutes)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
