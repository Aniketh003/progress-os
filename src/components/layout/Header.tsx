'use client';

import React from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  ExternalLink,
  Calendar,
  Menu,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView: string;
  onNavigateBack: () => void;
  onOpenQuickTask: () => void;
  onOpenSearch: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Header({
  currentView,
  onNavigateBack,
  onOpenQuickTask,
  onOpenSearch,
  onToggleMobileSidebar,
}: HeaderProps) {
  const { activeMap } = useProgressOS();

  const isHome = currentView === 'overview';

  const getViewDetails = () => {
    switch (currentView) {
      case 'overview':
        return { title: 'Workspace', subtitle: '' };
      case 'my-day':
        return { title: 'My Day', subtitle: 'Daily Todos & Focus' };
      case 'journal':
        return { title: 'Learning Journal', subtitle: 'Reflections & Insights' };
      case 'activity':
        return { title: 'Activity & Analytics', subtitle: 'Consistency & Velocity' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Preferences & Backups' };
      case 'map':
        return {
          title: activeMap?.title || 'Learning Roadmap',
          subtitle: activeMap?.category || 'Roadmap',
        };
      default:
        return { title: 'ProgressOS', subtitle: '' };
    }
  };

  const { title, subtitle } = getViewDetails();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-14 border-b border-border/40 bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 select-none">
      {/* Left: Mobile hamburger + Dedicated Back Button + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu toggle button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 rounded-lg border border-border/70 hover:bg-accent/60 text-muted-foreground hover:text-foreground md:hidden shrink-0 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {!isHome && (
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/70 hover:border-border hover:bg-accent/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-all group shrink-0"
            title="Back to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0 text-xs">
          {isHome ? (
            <div className="flex items-center gap-2 font-mono text-muted-foreground">
              <span className="text-foreground font-semibold tracking-tight">ProgressOS</span>
              <span className="text-border">/</span>
              <span className="text-muted-foreground">Overview</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-muted-foreground hidden sm:inline">ProgressOS</span>
              <span className="text-border hidden sm:inline">/</span>
              <h1 className="text-xs font-semibold text-foreground truncate tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <span className="text-[11px] text-muted-foreground hidden md:inline font-mono">
                  · {subtitle}
                </span>
              )}
              {currentView === 'map' && activeMap && (
                <span
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0"
                  style={{
                    backgroundColor: `${activeMap.accentColor || '#e11d48'}15`,
                    borderColor: `${activeMap.accentColor || '#e11d48'}30`,
                    color: activeMap.accentColor || '#e11d48',
                  }}
                >
                  {activeMap.status}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Repo Link if active map */}
        {currentView === 'map' && activeMap?.repositoryUrl && (
          <a
            href={activeMap.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-accent/60 text-xs text-foreground font-medium transition-colors"
            title="Open GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Repository</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        )}

        {/* Date Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 text-muted-foreground text-xs font-mono border border-border/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>{todayFormatted}</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="p-1.5 rounded-md border border-border/60 hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenQuickTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">New Task</span>
          <kbd className="hidden sm:inline text-[9px] bg-primary-foreground/20 px-1 py-0.2 rounded font-mono">
            C
          </kbd>
        </button>
      </div>
    </header>
  );
}
