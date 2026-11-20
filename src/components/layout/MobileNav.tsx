'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  CheckSquare,
  Plus,
} from 'lucide-react';
import { useProgressRouter } from '@/context/NavigationProgressContext';
import { useProgressOS } from '@/context/ProgressOSContext';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onOpenQuickTask: () => void;
}

export function MobileNav({ onOpenQuickTask }: MobileNavProps) {
  const router = useProgressRouter();
  const pathname = usePathname();
  const { todos } = useProgressOS();

  const isMapRoute = pathname?.startsWith('/maps/');

  // Count pending todos
  const pendingTodosCount = todos.filter((t) => t.status !== 'done').length;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      isActive: pathname === '/' && !isMapRoute,
    },
    {
      id: 'my-day',
      label: 'My Day',
      href: '/my-day',
      icon: Calendar,
      isActive: pathname === '/my-day',
    },
    {
      id: 'quick-task',
      label: 'New Task',
      isAction: true,
      icon: Plus,
    },
    {
      id: 'journal',
      label: 'Journal',
      href: '/journal',
      icon: BookOpen,
      isActive: pathname === '/journal',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      badge: pendingTodosCount > 0 ? pendingTodosCount : null,
      isActive: pathname === '/tasks',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/92 backdrop-blur-xl border-t border-border/70 px-3 pb-[env(safe-area-inset-bottom)] select-none shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.3)]"
    >
      <div className="h-14 flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenQuickTask}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
                title="Create New Task"
              >
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-rose-600/40 border-[3px] border-background flex items-center justify-center transition-transform active:scale-90 group-hover:scale-105">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-primary mt-0.5 tracking-tight">
                  New Task
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => item.href && router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative',
                item.isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform',
                    item.isActive ? 'scale-105 text-primary' : 'text-muted-foreground'
                  )}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={cn(
                  'text-[10px] mt-1 tracking-tight',
                  item.isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>

              {item.isActive && (
                <span className="absolute bottom-0 w-3.5 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
