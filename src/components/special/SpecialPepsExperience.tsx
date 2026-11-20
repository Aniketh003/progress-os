'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import confetti from 'canvas-confetti';
import { Heart, X } from 'lucide-react';

export const SPECIAL_PEPS = [
  'ketakichikhale006@gmail.com',
  'anikethbusavale03@gmail.com',
];

export function isSpecialPep(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SPECIAL_PEPS.some((pep) => pep.toLowerCase() === normalized);
}

// Fixed distribution of hearts across the screen width for consistent visibility
interface HeartParticle {
  id: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  sway: number;
  rot: number;
}

const PARTICLES: HeartParticle[] = [
  { id: 1, left: 3, size: 14, opacity: 0.75, duration: 13, delay: 0, sway: 16, rot: 15 },
  { id: 2, left: 9, size: 12, opacity: 0.65, duration: 16, delay: 4, sway: -14, rot: -12 },
  { id: 3, left: 14, size: 16, opacity: 0.8, duration: 12, delay: 8, sway: 18, rot: 20 },
  { id: 4, left: 20, size: 13, opacity: 0.7, duration: 15, delay: 2, sway: -12, rot: -15 },
  { id: 5, left: 26, size: 15, opacity: 0.78, duration: 14, delay: 6, sway: 15, rot: 10 },
  { id: 6, left: 32, size: 12, opacity: 0.65, duration: 17, delay: 1, sway: -18, rot: -18 },
  { id: 7, left: 39, size: 17, opacity: 0.85, duration: 11, delay: 9, sway: 14, rot: 16 },
  { id: 8, left: 45, size: 13, opacity: 0.72, duration: 16, delay: 3, sway: -15, rot: -10 },
  { id: 9, left: 52, size: 16, opacity: 0.8, duration: 13, delay: 7, sway: 16, rot: 14 },
  { id: 10, left: 58, size: 12, opacity: 0.68, duration: 15, delay: 11, sway: -14, rot: -16 },
  { id: 11, left: 65, size: 15, opacity: 0.82, duration: 12, delay: 5, sway: 17, rot: 18 },
  { id: 12, left: 71, size: 13, opacity: 0.7, duration: 14, delay: 10, sway: -16, rot: -12 },
  { id: 13, left: 78, size: 16, opacity: 0.8, duration: 16, delay: 3, sway: 14, rot: 15 },
  { id: 14, left: 84, size: 12, opacity: 0.65, duration: 18, delay: 8, sway: -13, rot: -14 },
  { id: 15, left: 91, size: 15, opacity: 0.82, duration: 13, delay: 1, sway: 15, rot: 19 },
  { id: 16, left: 96, size: 13, opacity: 0.72, duration: 15, delay: 6, sway: -12, rot: -10 },
];

export function SpecialPepsExperience() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const isSpecial = useMemo(() => isSpecialPep(userEmail), [userEmail]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (!isSpecial || !userEmail) return;

    // Trigger popup once per session
    const storageKey = `progressos_welcomed_shembdu_${userEmail.toLowerCase()}`;
    const alreadyWelcomed = sessionStorage.getItem(storageKey);

    if (!alreadyWelcomed) {
      const timer = setTimeout(() => {
        setIsPopupOpen(true);
        sessionStorage.setItem(storageKey, 'true');

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
          });
        } catch {
          // Ignore
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isSpecial, userEmail]);

  // Allow re-opening bouquet modal anytime from navbar
  useEffect(() => {
    const handleReopen = () => {
      if (isSpecial) {
        setIsPopupOpen(true);
      }
    };

    window.addEventListener('reopen-shembdu-welcome', handleReopen);
    return () => window.removeEventListener('reopen-shembdu-welcome', handleReopen);
  }, [isSpecial]);

  if (!isSpecial) return null;

  return (
    <>
      {/* 1. Visible, Minimal Red Hearts in the Background (Always Active) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute animate-float-heart"
            style={
              {
                left: `${p.left}%`,
                '--heart-duration': `${p.duration}s`,
                '--heart-delay': `${p.delay}s`,
                '--heart-opacity': p.opacity,
                '--heart-sway': `${p.sway}px`,
                '--heart-rot': `${p.rot}deg`,
              } as React.CSSProperties
            }
          >
            <Heart
              className="text-rose-500 fill-rose-500 drop-shadow-[0_1px_4px_rgba(244,63,94,0.4)]"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 2. Minimal Welcome Shembdu Popup with Flower Bouquet */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-background/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl bg-card border border-border/80 p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Clean, Minimal Flower Bouquet Container */}
            <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center mx-auto mb-4 text-4xl select-none">
              💐
            </div>

            {/* Title */}
            <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center justify-center gap-1.5">
              <span>Welcome Shembdu</span>
              <span className="text-rose-500">❤️</span>
            </h2>

            {/* Message */}
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed px-1">
              Here is a flower bouquet for you! Wishing you a wonderful time learning and building today.
            </p>

            {/* Minimal Action Button */}
            <div className="mt-5">
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  try {
                    confetti({
                      particleCount: 30,
                      spread: 50,
                      origin: { y: 0.7 },
                      colors: ['#e11d48', '#f43f5e', '#fb7185'],
                    });
                  } catch {
                    // Ignore
                  }
                }}
                className="w-full py-2 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Aww, Thank you! 💖</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
