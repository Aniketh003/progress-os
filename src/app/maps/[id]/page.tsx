'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Compass, ArrowLeft, Download, Plus, AlertCircle } from 'lucide-react';
import { MapDetailView } from '@/components/views/MapDetailView';
import { useProgressOS } from '@/context/ProgressOSContext';
import { useUI } from '@/context/UIContext';
import { useProgressRouter } from '@/context/NavigationProgressContext';

export default function MapDetailPage() {
  const params = useParams();
  const router = useProgressRouter();
  const mapId = params?.id as string;

  const { learningMaps, setActiveMapId, isInitialized } = useProgressOS();
  const { openDayDrawer, openEditMap, openImport, openNewMap } = useUI();

  const currentMap = learningMaps.find((m) => m.id === mapId);

  useEffect(() => {
    if (mapId && currentMap) {
      setActiveMapId(mapId);
    }
  }, [mapId, currentMap, setActiveMapId]);

  if (!isInitialized) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-lg border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Graceful Roadmap Not Found fallback
  if (!currentMap) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/10">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500 font-semibold mb-1">
          404 · Roadmap Unavailable
        </span>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
          Roadmap Not Found
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          The learning roadmap &ldquo;<span className="text-foreground font-mono">{mapId}</span>&rdquo; could not be located. It may have been deleted, moved to trash, or the URL might be mistyped.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={openImport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/80 hover:bg-muted/50 text-foreground text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Import Roadmap</span>
          </button>

          <button
            onClick={openNewMap}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/80 hover:bg-muted/50 text-foreground text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New</span>
          </button>
        </div>

        {/* Other active maps suggestion */}
        {learningMaps.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/40 max-w-md w-full">
            <span className="text-xs font-medium text-muted-foreground block mb-3">
              Or switch to an active roadmap:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {learningMaps.slice(0, 4).map((m) => (
                <button
                  key={m.id}
                  onClick={() => router.push(`/maps/${m.id}`)}
                  className="px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 text-xs text-foreground truncate max-w-[200px] transition-colors"
                >
                  {m.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <MapDetailView
      learningMap={currentMap}
      onOpenDay={openDayDrawer}
      onOpenEditMap={openEditMap}
      onNavigateBack={() => router.push('/')}
    />
  );
}
