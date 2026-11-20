'use client';

import React from 'react';
import Link from 'next/link';
import { useProgressRouter } from '@/context/NavigationProgressContext';
import {
  Compass,
  ArrowLeft,
  Calendar,
  Settings,
  BookOpen,
  Home,
  CheckSquare,
} from 'lucide-react';
import { ProgressOSLogo } from '@/components/icons/ProgressOSLogo';

export default function NotFound() {
  const router = useProgressRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/20">
          <Compass className="w-10 h-10 animate-pulse text-rose-500" />
        </div>
        <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold shadow-md">
          404
        </div>
      </div>

      <span className="text-[11px] font-mono uppercase tracking-widest text-rose-500 font-semibold mb-1">
        Route Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
        Lost in the Roadmap?
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        The destination you navigated to doesn&apos;t exist, was moved, or the URL might have a typo. ProgressOS is ready to get you back on track.
      </p>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Return to Overview</span>
        </button>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 hover:bg-muted/50 text-foreground text-xs font-medium transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Quick Links Box */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md max-w-sm w-full space-y-2 text-left">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block px-1">
          Quick Navigation
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-primary" />
            <span>Overview</span>
          </Link>
          <Link
            href="/my-day"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>My Day</span>
          </Link>
          <Link
            href="/tasks"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>All Tasks</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-rose-500" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
