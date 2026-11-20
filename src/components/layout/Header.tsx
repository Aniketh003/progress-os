'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  ExternalLink,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { ProgressOSLogo } from '@/components/icons/ProgressOSLogo';
import { UserAuthButton } from '@/components/auth/UserAuthButton';
import { RouteProgressBar } from '@/components/layout/RouteProgressBar';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useUI } from '@/context/UIContext';
import { useProgressRouter } from '@/context/NavigationProgressContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView?: string;
  onNavigateBack?: () => void;
  onOpenQuickTask?: () => void;
  onOpenSearch?: () => void;
}

export function Header({
  currentView,
  onNavigateBack,
  onOpenQuickTask,
  onOpenSearch,
}: HeaderProps = {}) {
  const router = useProgressRouter();
  const pathname = usePathname();
  const ui = useUI();
  const { activeMap, learningMaps, theme, setTheme } = useProgressOS();

  const handleSearch = onOpenSearch ?? ui.openSearch;
  const handleQuickTask = onOpenQuickTask ?? ui.openQuickTask;

  const isHome = currentView ? currentView === 'overview' : pathname === '/';

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.push('/');
    }
  };

  const isMapRoute = currentView === 'map' || pathname?.startsWith('/maps/');
  const currentMap = (() => {
    if (activeMap) return activeMap;
    if (pathname?.startsWith('/maps/')) {
      const mapId = pathname.replace('/maps/', '');
      return learningMaps.find((m) => m.id === mapId) || null;
    }
    return null;
  })();

  const workspaceNavItems = [
    { id: 'overview', label: 'Overview', href: '/', icon: LayoutDashboard },
    { id: 'my-day', label: 'My Day', href: '/my-day', icon: Calendar },
    { id: 'journal', label: 'Journal', href: '/journal', icon: BookOpen },
  ];

  return (
    <header className="relative h-14 border-b border-border/40 bg-card/60 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 gap-2 sm:gap-4">
      {/* 1. Left: ProgressOS Brand Logo & Back button (compact & contextual on mobile) */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start min-w-0">
        {!isHome && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-lg border border-border/60 hover:border-border hover:bg-accent/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all group shrink-0"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer group min-w-0 shrink-0"
          title="ProgressOS Overview"
        >
          <ProgressOSLogo className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 shadow-sm shadow-rose-600/20 group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm tracking-tight text-foreground truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              {isHome
                ? 'ProgressOS'
                : currentMap
                ? currentMap.title
                : pathname === '/my-day'
                ? 'My Day'
                : pathname === '/journal'
                ? 'Journal'
                : pathname === '/tasks'
                ? 'Tasks'
                : pathname === '/settings'
                ? 'Settings'
                : pathname === '/activity'
                ? 'Activity'
                : 'ProgressOS'}
            </span>
            <span className="hidden sm:inline text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
              v1.0
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle: Workspace Navigation (Visible on tablet & desktop, cleanly hidden on mobile) */}
      <nav className="hidden sm:flex items-center justify-center shrink-0">
        <div className="flex items-center gap-1 bg-muted/40 p-0.5 sm:p-1 rounded-xl border border-border/50 shadow-xs">
          {workspaceNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/' && !isMapRoute
                : pathname === item.href;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-lg text-xs font-medium transition-all select-none',
                  isActive
                    ? 'bg-background text-foreground font-semibold shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Right: Search, Quick Task, Theme, and Profile (streamlined spacing on mobile) */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 min-w-0 shrink-0">
        {/* Repo Link if inside an active roadmap */}
        {isMapRoute && currentMap?.repositoryUrl && (
          <a
            href={currentMap.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-accent/60 text-xs text-foreground font-medium transition-colors"
            title="Open GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Repository</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        )}

        {/* Global Search Button */}
        <button
          onClick={handleSearch}
          className="p-1.5 rounded-lg border border-border/60 hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Task Button (Desktop / Tablet) */}
        <button
          onClick={handleQuickTask}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-xs transition-all active:scale-95 shrink-0"
          title="New Task (C)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
          <kbd className="hidden md:inline text-[9px] bg-primary-foreground/20 px-1 rounded font-mono">
            C
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-1.5 rounded-lg border border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Profile Icon with Sync, Settings, Logout Popup */}
        <UserAuthButton variant="navbar" />
      </div>

      {/* Loading Progress Bar at navbar bottom border */}
      <RouteProgressBar position="bottom" />
    </header>
  );
}
