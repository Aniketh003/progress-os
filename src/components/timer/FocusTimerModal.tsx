'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  CheckCircle2,
  Clock,
  Timer,
} from 'lucide-react';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { cn } from '@/lib/utils';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_DURATIONS = [15, 25, 30, 45, 50, 60];

export function FocusTimerModal({ isOpen, onClose }: FocusTimerModalProps) {
  const {
    durationSeconds,
    remainingSeconds,
    status,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    endSession,
    setDuration,
  } = useFocusTimer();

  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent =
    durationSeconds > 0
      ? Math.max(0, Math.min(100, Math.round(((durationSeconds - remainingSeconds) / durationSeconds) * 100)))
      : 0;

  // SVG circular dimensions
  const strokeWidth = 8;
  const radius = 110;
  const circumference = 2 * Math.PI * radius; // ~691.15
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const handleSelectPreset = (mins: number) => {
    setShowCustomInput(false);
    setDuration(mins * 60);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      setDuration(val * 60);
      setShowCustomInput(false);
      setCustomMinutes('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Close Focus Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Timer className="w-3.5 h-3.5" />
            <span>ProgressOS Focus Mode</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Distraction-free sprint. Lock in and do deep work.
          </p>
        </div>

        {/* Big Circular Progress Countdown */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
            {/* Background ring */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              className="stroke-muted/30"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress ring */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              className={cn(
                'transition-all duration-500',
                status === 'completed'
                  ? 'stroke-emerald-500'
                  : 'stroke-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
              )}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 select-none">
            {status === 'completed' ? (
              <div className="flex flex-col items-center space-y-2 animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <span className="text-base font-bold text-foreground">
                  Focus Session Completed!
                </span>
                <span className="text-xs text-muted-foreground">
                  Take a short breather or start another sprint.
                </span>
              </div>
            ) : (
              <>
                <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-foreground">
                  {timeFormatted}
                </span>
                <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase pt-1">
                  {status === 'running'
                    ? 'In Progress'
                    : status === 'paused'
                    ? 'Timer Paused'
                    : `${Math.round(durationSeconds / 60)} Minutes Goal`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Duration Selection (Available when idle) */}
        {status === 'idle' && (
          <div className="w-full space-y-2 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Select Session Duration:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {PRESET_DURATIONS.map((mins) => {
                const isSelected = durationSeconds === mins * 60 && !showCustomInput;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectPreset(mins)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                    )}
                  >
                    {mins}m
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  showCustomInput
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                )}
              >
                Custom
              </button>
            </div>

            {showCustomInput && (
              <form
                onSubmit={handleCustomSubmit}
                className="flex items-center justify-center gap-2 pt-2 animate-in fade-in duration-150"
              >
                <input
                  type="number"
                  min="1"
                  max="180"
                  autoFocus
                  placeholder="Minutes (1-180)"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-32 px-3 py-1.5 text-xs text-center bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-rose-500 text-foreground"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
                >
                  Set
                </button>
              </form>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 w-full pt-2">
          {status === 'idle' && (
            <button
              onClick={() => startTimer()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-md shadow-rose-600/25 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus</span>
            </button>
          )}

          {status === 'running' && (
            <>
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-medium text-xs border border-border/70 transition-all hover:scale-105"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={() => resetTimer()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs border border-border/50 transition-all"
                title="Reset to beginning"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={endSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium text-xs border border-destructive/20 transition-all"
                title="End session early"
              >
                <Square className="w-3.5 h-3.5 fill-destructive" />
                <span>End Session</span>
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button
                onClick={resumeTimer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/25 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </button>
              <button
                onClick={() => resetTimer()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs border border-border/50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={endSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium text-xs border border-destructive/20 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-destructive" />
                <span>End Session</span>
              </button>
            </>
          )}

          {status === 'completed' && (
            <>
              <button
                onClick={() => {
                  resetTimer();
                  startTimer();
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/25 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Another Sprint</span>
              </button>
              <button
                onClick={() => {
                  resetTimer();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-xs border border-border/60 transition-all"
              >
                <span>Done</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
