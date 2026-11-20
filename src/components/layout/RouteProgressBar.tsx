'use client';

import React from 'react';
import { useNavigationProgress } from '@/context/NavigationProgressContext';
import { cn } from '@/lib/utils';

interface RouteProgressBarProps {
  className?: string;
  position?: 'bottom' | 'top';
}

export function RouteProgressBar({
  className,
  position = 'bottom',
}: RouteProgressBarProps) {
  const { isNavigating, progress } = useNavigationProgress();

  if (!isNavigating && progress === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute left-0 right-0 h-[2.5px] pointer-events-none z-50 overflow-hidden select-none transition-opacity duration-300',
        position === 'bottom' ? '-bottom-[1px]' : 'top-0',
        isNavigating || progress > 0 ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {/* Background track subtle glow */}
      <div className="absolute inset-0 bg-primary/10 backdrop-blur-xs" />

      {/* Animated Progress Bar */}
      <div
        className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 relative transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '220ms',
        }}
      >
        {/* Leading edge light ray / glow peg */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/50 to-white shadow-[0_0_12px_rgba(244,63,94,1),0_0_6px_rgba(251,191,36,0.9)]" />
      </div>
    </div>
  );
}
