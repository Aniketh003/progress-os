'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Compass,
  Calendar,
  CheckSquare,
  BookOpen,
  ArrowRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { useProgressOS } from '@/context/ProgressOSContext';
import { LearningMap, Day } from '@/types';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: string) => void;
  onOpenDay: (map: LearningMap, day: Day) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigateView,
  onOpenDay,
}: CommandPaletteProps) {
  const { learningMaps, todos, journalEntries, setActiveMapId } = useProgressOS();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search Results
  const results = useMemo(() => {
    if (!query.trim()) {
      return [
        { type: 'nav', id: 'overview', title: 'Go to Overview', icon: Compass, view: 'overview' },
        { type: 'nav', id: 'my-day', title: 'Go to My Day', icon: Calendar, view: 'my-day' },
        { type: 'nav', id: 'activity', title: 'Go to Activity Analytics', icon: Compass, view: 'activity' },
        { type: 'nav', id: 'journal', title: 'Go to Learning Journal', icon: BookOpen, view: 'journal' },
        { type: 'nav', id: 'settings', title: 'Go to Settings', icon: Compass, view: 'settings' },
      ];
    }

    const q = query.toLowerCase();
    const list: any[] = [];

    // Search Learning Maps
    learningMaps.forEach((map) => {
      if (map.title.toLowerCase().includes(q) || map.description.toLowerCase().includes(q)) {
        list.push({
          type: 'map',
          id: `map-${map.id}`,
          title: map.title,
          subtitle: `Learning Map · ${map.category}`,
          icon: Compass,
          mapId: map.id,
        });
      }

      // Search Days & Tasks within maps
      map.weeks.forEach((week) => {
        week.days.forEach((day) => {
          const matchDay =
            day.title.toLowerCase().includes(q) ||
            day.description.toLowerCase().includes(q) ||
            day.topics.some((t) => t.toLowerCase().includes(q)) ||
            `day ${day.dayNumber}`.includes(q);

          if (matchDay) {
            list.push({
              type: 'day',
              id: `day-${day.id}`,
              title: `Day ${day.dayNumber}: ${day.title}`,
              subtitle: `${map.title} · Week ${week.weekNumber}`,
              icon: Calendar,
              map,
              day,
            });
          }

          // Tasks within day
          day.tasks.forEach((task) => {
            if (task.title.toLowerCase().includes(q)) {
              list.push({
                type: 'dayTask',
                id: `task-${task.id}`,
                title: task.title,
                subtitle: `Task in Day ${day.dayNumber} (${map.title})`,
                icon: CheckSquare,
                map,
                day,
              });
            }
          });
        });
      });
    });

    // Standalone Todos
    todos.forEach((todo) => {
      if (todo.title.toLowerCase().includes(q)) {
        list.push({
          type: 'todo',
          id: `todo-${todo.id}`,
          title: todo.title,
          subtitle: 'Standalone Todo',
          icon: CheckSquare,
          view: 'my-day',
        });
      }
    });

    // Journal entries
    journalEntries.forEach((entry) => {
      if (
        entry.whatILearned.toLowerCase().includes(q) ||
        entry.topicsCovered.some((t) => t.toLowerCase().includes(q))
      ) {
        list.push({
          type: 'journal',
          id: `journal-${entry.id}`,
          title: `Journal: ${entry.date}`,
          subtitle: entry.topicsCovered.slice(0, 3).join(', '),
          icon: BookOpen,
          view: 'journal',
        });
      }
    });

    return list.slice(0, 12);
  }, [query, learningMaps, todos, journalEntries]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectedIndex];
      if (item) {
        handleSelect(item);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: any) => {
    if (item.type === 'nav') {
      onNavigateView(item.view);
    } else if (item.type === 'map') {
      setActiveMapId(item.mapId);
      onNavigateView('map');
    } else if (item.type === 'day' || item.type === 'dayTask') {
      setActiveMapId(item.map.id);
      onNavigateView('map');
      onOpenDay(item.map, item.day);
    } else if (item.type === 'todo') {
      onNavigateView('my-day');
    } else if (item.type === 'journal') {
      onNavigateView('journal');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Input box */}
        <div className="flex items-center px-4 py-3 border-b border-border/60 gap-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search roadmaps, days, tasks..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching roadmap, day, task, or command found.
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors',
                    isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <Icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-foreground font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[11px] text-muted-foreground truncate">{item.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 bg-muted/30 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono text-[10px]">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono text-[10px]">esc</kbd> Close
            </span>
          </div>
          <span>ProgressOS Command</span>
        </div>
      </div>
    </div>
  );
}
