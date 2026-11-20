'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, ToastType } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getIconWrapperClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'error':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'info':
      default:
        return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-5 right-3 sm:right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-[calc(100vw-1.5rem)] sm:w-96"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-card/95 border border-border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 fade-in duration-200 transition-all"
        >
          <div
            className={cn(
              'p-1.5 rounded-lg border shrink-0 mt-0.5',
              getIconWrapperClass(toast.type)
            )}
          >
            {getIcon(toast.type)}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            {toast.title && (
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                {toast.title}
              </h4>
            )}
            <p className={cn('text-xs text-muted-foreground leading-relaxed', toast.title && 'mt-0.5')}>
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
