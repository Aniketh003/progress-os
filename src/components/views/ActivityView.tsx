'use client';

import React, { useMemo } from 'react';
import {
  Activity,
  Flame,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Compass,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useProgressOS } from '@/context/ProgressOSContext';
import { calculateLearningStreak, getMapStats, formatMinutes, cn } from '@/lib/utils';

export function ActivityView() {
  const { learningMaps, journalEntries, todos, settings } = useProgressOS();

  // Streak & 30-day activity calculation
  const journalDates = journalEntries.map((j) => j.date);
  const { streak, totalActiveDays, activityData } = useMemo(() => {
    return calculateLearningStreak(learningMaps, journalDates);
  }, [learningMaps, journalDates]);

  // Aggregate total minutes studied per day for last 14 days
  const dailyHoursData = useMemo(() => {
    const map = new Map<string, number>();

    // From journal entries
    journalEntries.forEach((j) => {
      map.set(j.date, (map.get(j.date) || 0) + (j.timeSpentMinutes || 0));
    });

    // From map days
    learningMaps.forEach((lm) => {
      lm.weeks.forEach((w) => {
        w.days.forEach((d) => {
          if (d.completedAt && d.timeSpentMinutes) {
            const date = d.completedAt.split('T')[0];
            map.set(date, (map.get(date) || 0) + d.timeSpentMinutes);
          }
        });
      });
    });

    const list = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = map.get(dateStr) || 0;
      const hours = Number((minutes / 60).toFixed(1));
      list.push({
        date: dateStr.slice(5), // MM-DD
        hours,
        minutes,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      });
    }
    return list;
  }, [journalEntries, learningMaps]);

  // Roadmap category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    learningMaps.forEach((m) => {
      const cat = m.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [learningMaps]);

  // Total completed vs pending tasks
  let totalTasks = 0;
  let totalCompleted = 0;
  learningMaps.forEach((map) => {
    const stats = getMapStats(map);
    totalTasks += stats.totalTasks;
    totalCompleted += stats.completedTasks;
  });
  totalTasks += todos.length;
  totalCompleted += todos.filter((t) => t.status === 'done').length;

  const totalStudyMinutes = journalEntries.reduce((acc, j) => acc + (j.timeSpentMinutes || 0), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Activity & Analytics
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Real-time Metrics
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Objective metrics derived strictly from your completed tasks, days, and journal entries
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
          <span className="text-xs text-muted-foreground flex items-center justify-between">
            Active Streak
            <Flame className="w-4 h-4 text-amber-500" />
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">{streak}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
          <span className="text-xs text-muted-foreground flex items-center justify-between">
            Active Days
            <Calendar className="w-4 h-4 text-indigo-500" />
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {totalActiveDays}
            </span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
          <span className="text-xs text-muted-foreground flex items-center justify-between">
            Total Focus
            <Clock className="w-4 h-4 text-primary" />
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {formatMinutes(totalStudyMinutes)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs">
          <span className="text-xs text-muted-foreground flex items-center justify-between">
            Overall Completion
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground font-mono">
              {totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({totalCompleted}/{totalTasks})
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart: Daily Study Hours (Last 14 Days) */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Daily Focus Hours (Last 14 Days)
            </h2>
            <p className="text-xs text-muted-foreground">
              Track consistency and daily hours committed to roadmap goals
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Target: {formatMinutes(settings.dailyCommitmentMinutes || 180)} / day
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs">
                        <p className="font-semibold text-foreground">{data.label}</p>
                        <p className="text-primary mt-0.5">
                          {data.hours} hours ({data.minutes} mins)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split Cards: 30-Day Matrix & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 30-Day Matrix */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              30-Day Learning Matrix
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {streak} Days Active
            </span>
          </div>

          <div className="grid grid-cols-10 gap-2 pt-2">
            {activityData.map((d, idx) => (
              <div
                key={idx}
                title={`${d.date}: ${d.count} activities`}
                className={cn(
                  'aspect-square rounded-md flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-110',
                  d.count >= 4
                    ? 'bg-primary text-white font-bold'
                    : d.count >= 2
                    ? 'bg-primary/70 text-white'
                    : d.count >= 1
                    ? 'bg-primary/35'
                    : 'bg-muted/40 border border-border/40 text-muted-foreground/60'
                )}
              >
                {d.dayName}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Roadmap Distribution by Category
            </h2>
            <p className="text-xs text-muted-foreground">
              Active engineering disciplines tracked in ProgressOS
            </p>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No roadmaps available.
            </div>
          ) : (
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground font-mono">{cat.value} maps</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cat.value / learningMaps.length) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/40">
            {learningMaps.length} total roadmaps currently managed in IndexedDB.
          </div>
        </div>
      </div>
    </div>
  );
}
