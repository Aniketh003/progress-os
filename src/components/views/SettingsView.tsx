'use client';

import React, { useState, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
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
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  RotateCcw,
  Archive,
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
    handleSignOut,
    learningMaps,
    deletedMaps,
    handleRestoreMap,
    handlePermanentlyDeleteMap,
    journalEntries,
    todos,
  } = useProgressOS();

  const { data: session } = useSession();
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string | null>(null);

  const [userName, setUserName] = useState(
    session?.user?.name || (settings.userName && settings.userName !== 'Guest' ? settings.userName : '') || 'Guest'
  );
  const [dailyMinutes, setDailyMinutes] = useState(settings.dailyCommitmentMinutes || 180);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [clearConfirmation, setClearConfirmation] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloudSync = async () => {
    if (!session?.user) return;
    setIsCloudSyncing(true);
    setCloudSyncMessage(null);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maps: learningMaps,
          journals: journalEntries,
          todos,
          settings,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCloudSyncMessage(`Cloud sync successful! Synced ${data.maps?.length || 0} roadmaps, ${data.journals?.length || 0} journals, and ${data.todos?.length || 0} tasks to MongoDB.`);
      } else {
        setCloudSyncMessage(`Sync response: ${data.error || 'Server unavailable'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCloudSyncMessage(`Sync failed: ${msg}`);
    } finally {
      setIsCloudSyncing(false);
    }
  };

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
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
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

      {/* Cloud Account & Multi-User Sync */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Cloud className="w-4 h-4 text-primary" /> Cloud Database & Google Account
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in with Google to sync your learning roadmaps across all devices and MongoDB.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
            Multi-Tenant Ready
          </span>
        </div>

        {session?.user ? (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                    {session.user.name?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-semibold text-foreground">{session.user.name || 'Signed In'}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{session.user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSignOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 text-xs font-medium text-muted-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-muted-foreground">
                Local-first IndexedDB is connected to your cloud profile.
              </div>
              <button
                type="button"
                onClick={handleCloudSync}
                disabled={isCloudSyncing}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                <span>{isCloudSyncing ? 'Syncing to Cloud...' : 'Sync Local Data to Cloud'}</span>
              </button>
            </div>

            {cloudSyncMessage && (
              <p className="text-xs font-mono text-primary bg-primary/5 p-2 rounded-lg border border-primary/20">
                {cloudSyncMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-foreground">You are currently using ProgressOS in Guest Mode.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                All data is stored locally in your browser (IndexedDB). Sign in with Google to enable cloud sync and share with team members.
              </p>
            </div>
            <button
              type="button"
              onClick={() => signIn('google')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground text-xs font-medium transition-all shadow-xs shrink-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>

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
            <Upload className="w-4 h-4 text-primary" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-accent/40 text-xs font-medium text-foreground transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-primary" />
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

      {/* 4. Trash & Roadmap Recovery (7-Day Auto Purge) */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Archive className="w-4 h-4 text-primary" />
              <span>Trash & Roadmap Recovery</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deleted roadmaps are preserved here for 7 days before automatic permanent deletion.
            </p>
          </div>
          {deletedMaps.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
              {deletedMaps.length} in trash
            </span>
          )}
        </div>

        {deletedMaps.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 text-xs text-muted-foreground">
            Trash is empty. When you delete a roadmap, it can be recovered here within 7 days.
          </div>
        ) : (
          <div className="space-y-2">
            {deletedMaps.map((map) => {
              const deletedDate = map.deletedAt ? new Date(map.deletedAt).getTime() : Date.now();
              const daysRemaining = Math.max(1, 7 - Math.floor((Date.now() - deletedDate) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={map.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card/70 hover:bg-card transition-colors"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: map.accentColor || '#6366f1' }}
                      />
                      <h4 className="text-xs font-semibold text-foreground truncate">{map.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {map.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Deleted {map.deletedAt ? new Date(map.deletedAt).toLocaleDateString() : 'recently'} ·{' '}
                      <span className="text-amber-500 font-medium">Auto-purges in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreMap(map.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40 text-xs font-medium text-foreground transition-colors"
                      title="Restore roadmap back to your active list"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Recover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Permanently delete "${map.title}"? This cannot be undone.`)) {
                          handlePermanentlyDeleteMap(map.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 text-xs text-muted-foreground transition-colors"
                      title="Delete permanently right now"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Danger Zone */}
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
