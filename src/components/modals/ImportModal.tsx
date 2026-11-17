'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  FileJson,
  X,
  Layers,
  Calendar,
  CheckSquare,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useProgressOS } from '@/context/ProgressOSContext';
import { LearningMapSchema } from '@/lib/schema';
import { LearningMap } from '@/types';
import { cn } from '@/lib/utils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mapId: string) => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const { learningMaps, handleImportMap } = useProgressOS();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<LearningMap | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [conflictMode, setConflictMode] = useState<'replace' | 'duplicate'>('replace');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setRawText('');
    setParsedData(null);
    setValidationError(null);
    setConflictMode('replace');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processJsonString = (jsonString: string) => {
    try {
      setValidationError(null);
      const parsed = JSON.parse(jsonString);
      const result = LearningMapSchema.safeParse(parsed);

      if (!result.success) {
        const issues = result.error.issues
          .map((i) => `• [${i.path.join('.') || 'root'}]: ${i.message}`)
          .join('\n');
        setValidationError(`Schema validation failed:\n${issues}`);
        setParsedData(null);
        return;
      }

      setParsedData(result.data as LearningMap);
    } catch (err: unknown) {
      setValidationError(`Invalid JSON syntax: ${err instanceof Error ? err.message : 'Parse error'}`);
      setParsedData(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      processJsonString(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawText(content);
        processJsonString(content);
      };
      reader.readAsText(file);
    }
  };

  const existsConflict = parsedData
    ? learningMaps.some((m) => m.id === parsedData.id)
    : false;

  const handleConfirmImport = async () => {
    if (!parsedData) return;
    setIsSubmitting(true);

    try {
      const res = await handleImportMap(parsedData, conflictMode);
      if (res.success && res.id) {
        onSuccess(res.id);
        handleClose();
      } else {
        setValidationError(res.error || 'Failed to import map into database.');
      }
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Unknown import error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Compute stats for preview
  const totalWeeks = parsedData?.weeks?.length || 0;
  const totalDays = parsedData?.weeks?.reduce((acc, w) => acc + (w.days?.length || 0), 0) || 0;
  const totalTasks = parsedData?.weeks?.reduce(
    (acc, w) => acc + (w.days?.reduce((dAcc, d) => dAcc + (d.tasks?.length || 0), 0) || 0),
    0
  ) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Import Learning Map</h2>
              <p className="text-xs text-muted-foreground">Upload or paste a JSON roadmap file</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* File Upload Zone */}
          {!parsedData && (
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
              >
                <FileJson className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">
                  Click to browse or drag and drop your .json roadmap file
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Must conform to ProgressOS Learning Map v1.0 schema
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Or paste JSON */}
              <div className="mt-4">
                <div className="text-xs font-medium text-foreground mb-1.5 flex items-center justify-between">
                  <span>Or paste raw JSON:</span>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (e.target.value.trim()) {
                      processJsonString(e.target.value);
                    }
                  }}
                  placeholder='{"schemaVersion": "1.0", "id": "my-roadmap", "title": "...", "weeks": [...] }'
                  rows={4}
                  className="w-full text-xs font-mono p-3 bg-muted/30 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 resize-none"
                />
              </div>
            </div>
          )}

          {/* Validation Error banner */}
          {validationError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>JSON Validation Error</span>
              </div>
              <pre className="text-[11px] whitespace-pre-wrap font-mono mt-1 max-h-32 overflow-y-auto">
                {validationError}
              </pre>
            </div>
          )}

          {/* Preview of Validated Learning Map */}
          {parsedData && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">
                      Valid ProgressOS Schema v{parsedData.schemaVersion || '1.0'}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground mt-0.5">{parsedData.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {parsedData.description || 'No description provided.'}
                    </p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                    ID: {parsedData.id}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                  <div className="p-2 rounded bg-background/60 border border-border/40">
                    <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Layers className="w-3 h-3" /> Weeks
                    </span>
                    <span className="text-sm font-semibold text-foreground">{totalWeeks}</span>
                  </div>
                  <div className="p-2 rounded bg-background/60 border border-border/40">
                    <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" /> Days
                    </span>
                    <span className="text-sm font-semibold text-foreground">{totalDays}</span>
                  </div>
                  <div className="p-2 rounded bg-background/60 border border-border/40">
                    <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <CheckSquare className="w-3 h-3" /> Tasks
                    </span>
                    <span className="text-sm font-semibold text-foreground">{totalTasks}</span>
                  </div>
                </div>
              </div>

              {/* ID Conflict Handling */}
              {existsConflict && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-500">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>A learning map with ID &quot;{parsedData.id}&quot; already exists in ProgressOS.</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Choose how to proceed:
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setConflictMode('replace')}
                      className={cn(
                        'flex flex-col items-start p-2.5 rounded-lg border text-left transition-all',
                        conflictMode === 'replace'
                          ? 'border-primary bg-primary/10 text-foreground font-medium'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        <RefreshCw className="w-3.5 h-3.5" /> Replace Existing
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Preserves completed task checks & user notes.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConflictMode('duplicate')}
                      className={cn(
                        'flex flex-col items-start p-2.5 rounded-lg border text-left transition-all',
                        conflictMode === 'duplicate'
                          ? 'border-primary bg-primary/10 text-foreground font-medium'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        <Copy className="w-3.5 h-3.5" /> Import as Copy
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Creates a separate copy with a new unique ID.
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
          {parsedData ? (
            <button
              onClick={resetState}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Choose another file
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 rounded-md border border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={!parsedData || isSubmitting}
              className={cn(
                'px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium transition-all shadow-xs flex items-center gap-1.5',
                (!parsedData || isSubmitting) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Importing...' : 'Confirm Import'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
