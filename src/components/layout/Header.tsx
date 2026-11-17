'use client';

import React from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Github } from '@/components/icons/GithubIcon';
import { useProgressOS } from '@/context/ProgressOSContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView: string;
  onOpenQuickTask: () => void;
  onOpenSearch: () => void;
}

export function Header({ currentView, onOpenQuickTask, onOpenSearch }: HeaderProps) {
  const { activeMap } = useProgressOS();

  const getViewTitle = () => {
    switch (currentView) {
      case 'overview':
        return { title: 'Dashboard Overview', subtitle: 'Your learning journey at a glance' };
      case 'my-day':
        return { title: 'My Day', subtitle: 'Focus on today’s todos and micro-goals' };
      case 'tasks':
        return { title: 'All Tasks', subtitle: 'Global backlog across all learning maps' };
      case 'journal':
        return { title: 'Learning Journal', subtitle: 'Document insights, builds, and reflections' };
      case 'activity':
        return { title: 'Activity & Analytics', subtitle: 'Consistency metrics and progress velocity' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Preferences, backups, and local-first data' };
      case 'map':
        return {
          title: activeMap?.title || 'Learning Roadmap',
          subtitle: activeMap?.category || 'Learning Map',
        };
      default:
        return { title: 'ProgressOS', subtitle: 'Personal Learning Engine' };
    }
  };

  const { title, subtitle } = getViewTitle();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-14 border-b border-border/40 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Left Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground truncate tracking-tight">
              {title}
            </h1>
            {currentView === 'map' && activeMap && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${activeMap.accentColor || '#6366f1'}15`,
                  borderColor: `${activeMap.accentColor || '#6366f1'}30`,
                  color: activeMap.accentColor || '#6366f1',
                }}
              >
                {activeMap.status}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground truncate hidden sm:block">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Repo Link if active map */}
        {currentView === 'map' && activeMap?.repositoryUrl && (
          <a
            href={activeMap.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 hover:bg-accent text-xs text-foreground font-medium transition-colors"
            title="Open Learning Map GitHub Repository"
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
          className="p-1.5 rounded-md border border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenQuickTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
          <kbd className="hidden sm:inline text-[9px] bg-primary-foreground/20 px-1 py-0.2 rounded font-mono">
            C
          </kbd>
        </button>
      </div>
    </header>
  );
}
