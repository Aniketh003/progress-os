'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import {
  LogIn,
  LogOut,
  Cloud,
  RefreshCw,
  Settings,
  User as UserIcon,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useProgressOS } from '@/context/ProgressOSContext';
import { isSpecialPep } from '@/components/special/SpecialPepsExperience';
import { cn } from '@/lib/utils';

export function UserAuthButton({
  variant = 'navbar',
}: {
  collapsed?: boolean;
  variant?: 'sidebar' | 'navbar';
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isCloudSyncing, syncToCloud, handleSignOut } = useProgressOS();
  const [isOpen, setIsOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSync = async () => {
    if (!session?.user || isCloudSyncing) return;
    try {
      await syncToCloud();
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to sync:', e);
    }
  };

  const handleNavigateSettings = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await handleSignOut();
  };

  // Loading skeleton
  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-muted/60 animate-pulse border border-border/40 shrink-0" />
    );
  }

  // Logged-in profile icon & popup
  if (session?.user) {
    const userImage = session.user.image;
    const userName = session.user.name || 'User';
    const userEmail = session.user.email || '';
    const firstName = userName.split(' ')[0];

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Profile Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-1.5 p-1 sm:pl-1 sm:pr-2.5 rounded-full border transition-all select-none',
            isOpen
              ? 'border-primary/60 bg-accent text-foreground shadow-xs ring-1 ring-primary/20'
              : 'border-border/70 hover:border-primary/40 bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground'
          )}
          title="Account & Sync options"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {userImage && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt={userName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-6 h-6 rounded-full border border-border/70 shrink-0 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
              {userName.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
            </div>
          )}

          <span className="text-xs font-medium text-foreground max-w-[85px] truncate hidden md:inline">
            {firstName}
          </span>

          <ChevronDown
            className={cn(
              'w-3 h-3 text-muted-foreground transition-transform duration-200 hidden sm:inline',
              isOpen && 'rotate-180 text-foreground'
            )}
          />
        </button>

        {/* Dropdown Popup Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* User Info Header */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/40">
              {userImage && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-9 h-9 rounded-full border border-border/80 shrink-0 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {userName.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate leading-tight">
                  {userName}
                </span>
                <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {userEmail}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-500 font-mono font-medium">
                    Cloud Synced
                  </span>
                </div>
              </div>
            </div>

            <div className="my-1.5 border-t border-border/40" />

            {/* Menu Options: Sync, Settings, Logout */}
            <div className="space-y-0.5">
              {/* 1. Sync Button */}
              <button
                onClick={handleSync}
                disabled={isCloudSyncing}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-foreground hover:bg-accent/60 transition-colors disabled:opacity-60 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <RefreshCw
                      className={cn(
                        'w-3.5 h-3.5',
                        isCloudSyncing && 'animate-spin text-primary'
                      )}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span>{isCloudSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {lastSynced ? `Last synced: ${lastSynced}` : 'MongoDB Atlas connected'}
                    </span>
                  </div>
                </div>
                {syncSuccess && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </button>

              {/* 2. Settings Button */}
              <button
                onClick={handleNavigateSettings}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-foreground hover:bg-accent/60 transition-colors text-left group"
              >
                <div className="p-1.5 rounded-lg bg-muted text-muted-foreground border border-border/60 group-hover:text-foreground transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span>Settings & Preferences</span>
                  <span className="text-[10px] text-muted-foreground">
                    Theme, Roadmaps trash, Backups
                  </span>
                </div>
              </button>

              {/* Special Pep: Shembdu Bouquet */}
              {isSpecialPep(session?.user?.email) && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('reopen-shembdu-welcome'));
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left group"
                >
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                    <span className="text-xs">💐</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-rose-400">Shembdu Bouquet</span>
                    <span className="text-[10px] text-muted-foreground">
                      View your special flowers & note
                    </span>
                  </div>
                </button>
              )}

              <div className="my-1 border-t border-border/40" />

              {/* 3. Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left group"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Sign Out</span>
                  <span className="text-[10px] text-rose-500/80">
                    Clear session on this device
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged-out state: Clean Google Sign-in button
  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-accent hover:border-primary/40 text-xs font-medium text-foreground transition-all shrink-0 shadow-xs active:scale-95"
      title="Sign in with Google to sync progress to cloud"
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}
