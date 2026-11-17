'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Activity,
  Settings,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  FolderKanban,
  Sun,
  Moon,
  Laptop,
  Compass,
  Cpu,
  Database,
  Server,
  Layers,
  Search,
} from 'lucide-react';
import { useProgressOS } from '@/context/ProgressOSContext';
import { getMapStats, cn } from '@/lib/utils';
import { LearningMap } from '@/types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenImport: () => void;
  onOpenNewMap: () => void;
  onOpenEditMap: (map: LearningMap) => void;
  onOpenSearch: () => void;
}

export function Sidebar({
  currentView,
  setCurrentView,
  onOpenImport,
  onOpenNewMap,
  onOpenEditMap,
  onOpenSearch,
}: SidebarProps) {
  const {
    learningMaps,
    activeMapId,
    setActiveMapId,
    handleExportMap,
    handleDeleteMap,
    theme,
    setTheme,
  } = useProgressOS();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenuMapId, setActiveMenuMapId] = useState<string | null>(null);

  const getMapIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cpu':
        return <Cpu className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'server':
        return <Server className="w-4 h-4" />;
      case 'layers':
        return <Layers className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-day', label: 'My Day', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand & Collapse Button */}
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-border/40">
        {!isCollapsed && (
          <div
            onClick={() => setCurrentView('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-sm shadow-rose-600/30 font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight leading-none text-foreground flex items-center gap-1.5">
                ProgressOS
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  v1.0
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Learning Engine</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            onClick={() => setIsCollapsed(false)}
            className="w-7 h-7 mx-auto rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm shadow-rose-600/30"
          >
            P
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors',
            isCollapsed && 'hidden'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search Button */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search everything...</span>
            </span>
            <kbd className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded border border-border/80 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-6">
        {/* Workspace section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Workspace
            </div>
          )}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Learning Maps Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            {!isCollapsed && (
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Learning Maps
              </span>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenImport}
                title="Import Learning Map (JSON)"
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenNewMap}
                title="Create Learning Map"
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-0.5">
            {learningMaps.length === 0 ? (
              !isCollapsed && (
                <div className="px-2 py-3 text-center border border-dashed border-border/60 rounded-md bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">No roadmaps loaded</p>
                  <button
                    onClick={onOpenImport}
                    className="mt-1.5 text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Import JSON
                  </button>
                </div>
              )
            ) : (
              learningMaps.map((map) => {
                const stats = getMapStats(map);
                const isSelected = currentView === 'map' && activeMapId === map.id;
                const isMenuOpen = activeMenuMapId === map.id;

                return (
                  <div key={map.id} className="relative group">
                    <button
                      onClick={() => {
                        setActiveMapId(map.id);
                        setCurrentView('map');
                      }}
                      title={isCollapsed ? map.title : undefined}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all text-left relative',
                        isSelected
                          ? 'bg-accent/80 text-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-6">
                        <span
                          className="shrink-0 p-1 rounded-md"
                          style={{
                            color: map.accentColor || '#6366f1',
                            backgroundColor: `${map.accentColor || '#6366f1'}15`,
                          }}
                        >
                          {getMapIcon(map.icon)}
                        </span>
                        {!isCollapsed && (
                          <div className="flex flex-col min-w-0">
                            <span className="truncate leading-tight text-foreground">
                              {map.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                              {stats.taskProgress}% · {stats.completedTasks}/{stats.totalTasks} tasks
                            </span>
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r" />
                      )}
                    </button>

                    {/* Context menu button */}
                    {!isCollapsed && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMapId(isMenuOpen ? null : map.id);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background/80"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-2 top-8 w-40 py-1 rounded-md bg-popover border border-border shadow-lg z-50 text-xs animate-in fade-in-50 zoom-in-95"
                        onMouseLeave={() => setActiveMenuMapId(null)}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuMapId(null);
                            onOpenEditMap(map);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-accent text-left"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuMapId(null);
                            handleExportMap(map);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-accent text-left"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export JSON</span>
                        </button>
                        <div className="my-1 border-t border-border/50" />
                        <button
                          onClick={() => {
                            setActiveMenuMapId(null);
                            if (confirm(`Are you sure you want to delete "${map.title}"?`)) {
                              handleDeleteMap(map.id);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-destructive hover:bg-destructive/10 text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Map</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer / Theme & Settings */}
      <div className="p-2 border-t border-border/40 space-y-1">
        <button
          onClick={() => setCurrentView('settings')}
          title={isCollapsed ? 'Settings' : undefined}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors',
            currentView === 'settings'
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {!isCollapsed && (
          <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground">
            <span>Theme</span>
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/50">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'p-1 rounded transition-colors',
                  theme === 'light' ? 'bg-background text-foreground shadow-xs' : 'hover:text-foreground'
                )}
                title="Light Mode"
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-1 rounded transition-colors',
                  theme === 'dark' ? 'bg-background text-foreground shadow-xs' : 'hover:text-foreground'
                )}
                title="Dark Mode"
              >
                <Moon className="w-3 h-3" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'p-1 rounded transition-colors',
                  theme === 'system' ? 'bg-background text-foreground shadow-xs' : 'hover:text-foreground'
                )}
                title="System Mode"
              >
                <Laptop className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
