'use client';

import React, { useState, useRef } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Clock,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Database,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useProgressOS } from '@/context/ProgressOSContext';
import { formatMinutes, cn } from '@/lib/utils';

export function SettingsView() {
  const {
    settings,
    theme,
    setTheme,
    handleUpdateSettings,
    handleExportAll,
    handleRestoreAll,
    handleClearAll,
  } = useProgressOS();

  const [userName, setUserName] = useState(settings.userName || 'Engineer');
  const [dailyMinutes, setDailyMinutes] = useState(settings.dailyCommitmentMinutes || 180);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [clearConfirmation, setClearConfirmation] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateSettings({
      userName: userName.trim(),
      dailyCommitmentMinutes: Number(dailyMinutes),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleBackupUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await handleRestoreAll(content);
      if (res.success) {
        setRestoreMessage('Backup restored successfully!');
      } else {
        setRestoreMessage(`Failed to restore: ${res.error}`);
      }
      setTimeout(() => setRestoreMessage(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleConfirmClear = async () => {
    if (clearConfirmation === 'DELETE') {
      await handleClearAll();
      setShowClearModal(false);
      setClearConfirmation('');
      alert('All local ProgressOS data has been cleared.');
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-border/40">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Customize your workspace, study parameters, and local data persistence
        </p>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Interface Appearance</h2>
          <p className="text-xs text-muted-foreground">
            Select your preferred display mode or match system configuration
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-medium gap-2 transition-all',
              theme === 'light'
                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            <Sun className="w-5 h-5" />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-medium gap-2 transition-all',
              theme === 'dark'
                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            <Moon className="w-5 h-5" />
            <span>Dark Mode</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-medium gap-2 transition-all',
              theme === 'system'
                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            <Laptop className="w-5 h-5" />
            <span>System Default</span>
          </button>
        </div>
      </div>

      {/* 2. Profile & Learning Commitment */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs"
      >
        <div>
          <h2 className="text-sm font-semibold text-foreground">Learning Target & Profile</h2>
          <p className="text-xs text-muted-foreground">
            Set your daily learning target minutes and display identity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Your Name / Alias
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Daily Target (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={720}
              step={15}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-muted/40 border border-border/80 rounded-lg outline-none focus:border-primary text-foreground font-mono"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Equal to {formatMinutes(dailyMinutes)} per day
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preferences saved!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:bg-primary/90 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* 3. Data Portability & Backup */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Data Portability & Backups</h2>
          <p className="text-xs text-muted-foreground">
            ProgressOS is local-first. You own all your roadmaps, todos, notes, and journal entries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportAll}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-accent/40 text-xs font-medium text-foreground transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-accent/40 text-xs font-medium text-foreground transition-all shadow-xs"
          >
            <Upload className="w-4 h-4 text-primary" />
            <span>Restore Backup File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleBackupUpload}
            className="hidden"
          />
        </div>

        {restoreMessage && (
          <div className="p-3 rounded-lg bg-muted text-xs text-foreground font-mono">
            {restoreMessage}
          </div>
        )}
      </div>

      {/* 4. Danger Zone */}
      <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently clear all roadmaps, tasks, and journal entries stored in IndexedDB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowClearModal(true)}
          className="px-3.5 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-all flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Local Data</span>
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border border-destructive/40 shadow-2xl rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-destructive font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Are you absolutely certain?</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. All your local roadmaps, checkmarks, daily journal entries, and custom notes will be permanently erased.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Type <span className="font-mono text-destructive">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={clearConfirmation}
                onChange={(e) => setClearConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-lg outline-none text-foreground font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setClearConfirmation('');
                }}
                className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={clearConfirmation !== 'DELETE'}
                className="px-3.5 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-medium disabled:opacity-40"
              >
                Confirm Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
