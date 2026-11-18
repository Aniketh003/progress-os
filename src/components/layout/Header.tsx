'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  ExternalLink,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { ProgressOSLogo } from '@/components/icons/ProgressOSLogo';
import { UserAuthButton } from '@/components/auth/UserAuthButton';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useUI } from '@/context/UIContext';
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
  const router = useRouter();
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
    <header className="h-14 border-b border-border/40 bg-card/60 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 select-none shrink-0 gap-2">
      {/* 1. Left: ProgressOS Brand Logo (No breadcrumbs) & Back button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer group"
          title="ProgressOS Overview"
        >
          <ProgressOSLogo className="w-6 h-6 shrink-0 shadow-sm shadow-rose-600/30 group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">
              ProgressOS
            </span>
            <span className="hidden sm:inline text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
              v1.0
            </span>
          </div>
        </div>

        {!isHome && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/60 hover:border-border hover:bg-accent/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all group shrink-0"
            title="Back to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
      </div>

      {/* 2. Middle: Workspace Navigation (Only icons and text, no "Workspace" label) */}
      <nav className="flex items-center gap-1 bg-muted/40 p-0.5 sm:p-1 rounded-xl border border-border/50">
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
                'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all select-none',
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
              <span className="hidden xs:inline sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Extreme Right: Quick Task, Search, Theme, Settings, and User Login */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Repo Link if inside an active roadmap */}
        {isMapRoute && currentMap?.repositoryUrl && (
          <a
            href={currentMap.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/60 hover:bg-accent/60 text-xs text-foreground font-medium transition-colors"
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
          className="p-1.5 rounded-lg border border-border/60 hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={handleQuickTask}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-xs transition-all active:scale-95"
          title="New Task (C)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">New Task</span>
          <kbd className="hidden sm:inline text-[9px] bg-primary-foreground/20 px-1 rounded font-mono">
            C
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-1.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => router.push('/settings')}
          title="Settings"
          className={cn(
            'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary border-primary/20 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </button>

        {/* Login / User Auth Button at the extreme right */}
        <UserAuthButton variant="navbar" />
      </div>
    </header>
  );
}
