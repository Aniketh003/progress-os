'use client';

import React from 'react';
import { Timer, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { cn } from '@/lib/utils';

interface FocusTimerCardProps {
  onOpenModal: () => void;
}

export function FocusTimerCard({ onOpenModal }: FocusTimerCardProps) {
  const {
    durationSeconds,
    remainingSeconds,
    status,
    resumeTimer,
  } = useFocusTimer();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent =
    durationSeconds > 0
      ? Math.round(((durationSeconds - remainingSeconds) / durationSeconds) * 100)
      : 0;

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-foreground">Focus Timer</h2>
          {status === 'running' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Focusing
            </span>
          )}
          {status === 'paused' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Paused
            </span>
          )}
          {status === 'completed' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
            {timeFormatted}
          </div>
          <p className="text-xs text-muted-foreground">
            {status === 'completed'
              ? 'Great job! Session complete.'
              : status === 'running'
              ? `${progressPercent}% session completed`
              : status === 'paused'
              ? 'Timer paused. Ready to resume?'
              : `${Math.round(durationSeconds / 60)} min distraction-free sprint`}
          </p>
        </div>

        {/* Circular Progress Ring Indicator */}
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-muted/40"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className={cn(
                'transition-all duration-500',
                status === 'completed' ? 'stroke-emerald-500' : 'stroke-rose-500'
              )}
              strokeWidth="4"
              strokeDasharray={175.93}
              strokeDashoffset={175.93 - (175.93 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : status === 'running' ? (
              <Timer className="w-5 h-5 text-rose-500 animate-pulse" />
            ) : (
              <Timer className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Single Clear Action Button */}
      <div className="pt-2 border-t border-border/40">
        {status === 'idle' && (
          <button
            onClick={onOpenModal}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-xs shadow-rose-600/25 active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Focus</span>
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={onOpenModal}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-xs shadow-rose-600/25 active:scale-98"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Open Timer</span>
          </button>
        )}

        {status === 'paused' && (
          <div className="flex items-center gap-2">
            <button
              onClick={resumeTimer}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-xs shadow-rose-600/25 active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume</span>
            </button>
            <button
              onClick={onOpenModal}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-all border border-border/60 active:scale-98"
            >
              <span>Open Timer</span>
            </button>
          </div>
        )}

        {status === 'completed' && (
          <button
            onClick={onOpenModal}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Session Complete · Open Timer</span>
          </button>
        )}
      </div>
    </div>
  );
}
