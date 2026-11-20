'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  FileJson,
  X,
  Dumbbell,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { WorkoutPlan } from '@/types';
import { validateWorkoutPlan } from '@/lib/workout';
import { cn } from '@/lib/utils';

interface WorkoutImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (plan: WorkoutPlan) => void;
  onLoadDefault: () => void;
}

export function WorkoutImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  onLoadDefault,
}: WorkoutImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<WorkoutPlan | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setParsedData(null);
    setValidationError(null);
    setIsSubmitting(false);
    setIsDragging(false);
    onClose();
  };

  const processJsonString = (content: string) => {
    setValidationError(null);
    setParsedData(null);
    try {
      const json = JSON.parse(content);
      const validation = validateWorkoutPlan(json);
      if (!validation.success || !validation.data) {
        setValidationError(validation.error || 'Invalid workout plan structure.');
        return;
      }
      setParsedData(validation.data);
    } catch {
      setValidationError('Invalid JSON syntax. Please check for missing quotes or brackets.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processJsonString(text);
    };
    reader.onerror = () => {
      setValidationError('Failed to read file from disk.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processJsonString(text);
      };
      reader.readAsText(file);
    } else {
      setValidationError('Please upload a valid .json file.');
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;
    setIsSubmitting(true);
    try {
      onImportSuccess(parsedData);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Import Workout Schedule
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload your custom workout JSON file or switch schedules
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!parsedData ? (
            <>
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : 'border-border/70 hover:border-primary/50 hover:bg-accent/30'
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,application/json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center text-muted-foreground mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Choose a workout JSON file or drag it here
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Accepts valid ProgressOS workout schedule schemas containing weekly splits, workouts, and exercises.
                </p>
              </div>

              {/* Validation Error Banner */}
              {validationError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Validation Error: </span>
                    {validationError}
                  </div>
                </div>
              )}

              {/* Quick Preset: Load Default PPL + Upper/Lower */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Want the standard schedule?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onLoadDefault();
                    handleClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load PPL + Upper/Lower Default
                </button>
              </div>
            </>
          ) : (
            /* Plan Preview */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Valid Workout Schema
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {parsedData.name}
                  </h3>
                  {parsedData.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {parsedData.description}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  v{parsedData.version || 1}
                </span>
              </div>

              {/* Weekly Split Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    7-Day Schedule
                  </span>
                  <span>{parsedData.schedule.length} Days</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {parsedData.schedule.map((dayItem, idx) => {
                    const isRest = dayItem.workout_id.toLowerCase() === 'rest';
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-2 rounded-lg text-center border text-[11px] flex flex-col items-center justify-center',
                          isRest
                            ? 'bg-muted/30 border-border/40 text-muted-foreground'
                            : 'bg-card border-border/80 font-medium text-foreground'
                        )}
                      >
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {dayItem.day.slice(0, 3)}
                        </span>
                        <span className="text-xs font-bold capitalize mt-0.5 truncate max-w-full">
                          {dayItem.workout_id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Workouts Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">
                  Workouts ({parsedData.workouts.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {parsedData.workouts.map((w) => (
                    <div
                      key={w.id}
                      className="p-2.5 rounded-lg bg-card/60 border border-border/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{w.name}</span>
                        <div className="text-[11px] text-muted-foreground">
                          {w.muscle_groups.join(' • ')}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {w.exercises.length} exercises
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between bg-card/50">
          {parsedData ? (
            <>
              <button
                type="button"
                onClick={() => setParsedData(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Choose Different File
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmImport}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  Confirm & Import
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
