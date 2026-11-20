'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import confetti from 'canvas-confetti';
import { Heart, X, Sparkles } from 'lucide-react';

export const SPECIAL_PEPS = [
  'ketakichikhale006@gmail.com',
  'anikethbusavale03@gmail.com',
];

export function isSpecialPep(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SPECIAL_PEPS.some((pep) => pep.toLowerCase() === normalized);
}

// Pre-calculated fixed distribution for smooth, deterministic floating hearts
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
  { id: 1, left: 4, size: 12, opacity: 0.28, duration: 14, delay: 0, sway: 16, rot: 15 },
  { id: 2, left: 10, size: 9, opacity: 0.22, duration: 17, delay: 4, sway: -14, rot: -12 },
  { id: 3, left: 16, size: 14, opacity: 0.32, duration: 13, delay: 8, sway: 18, rot: 20 },
  { id: 4, left: 23, size: 10, opacity: 0.25, duration: 16, delay: 2, sway: -12, rot: -15 },
  { id: 5, left: 29, size: 13, opacity: 0.3, duration: 15, delay: 6, sway: 15, rot: 10 },
  { id: 6, left: 36, size: 11, opacity: 0.24, duration: 18, delay: 1, sway: -18, rot: -18 },
  { id: 7, left: 42, size: 15, opacity: 0.35, duration: 12, delay: 9, sway: 14, rot: 16 },
  { id: 8, left: 48, size: 9, opacity: 0.2, duration: 19, delay: 3, sway: -15, rot: -10 },
  { id: 9, left: 55, size: 13, opacity: 0.28, duration: 14, delay: 7, sway: 16, rot: 14 },
  { id: 10, left: 62, size: 10, opacity: 0.22, duration: 16, delay: 11, sway: -14, rot: -16 },
  { id: 11, left: 69, size: 14, opacity: 0.33, duration: 13, delay: 5, sway: 17, rot: 18 },
  { id: 12, left: 75, size: 11, opacity: 0.26, duration: 15, delay: 10, sway: -16, rot: -12 },
  { id: 13, left: 82, size: 13, opacity: 0.3, duration: 17, delay: 3, sway: 14, rot: 15 },
  { id: 14, left: 88, size: 9, opacity: 0.22, duration: 20, delay: 8, sway: -13, rot: -14 },
  { id: 15, left: 94, size: 14, opacity: 0.34, duration: 14, delay: 1, sway: 15, rot: 19 },
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
      // Small timeout for smooth entrance
      const timer = setTimeout(() => {
        setIsPopupOpen(true);
        sessionStorage.setItem(storageKey, 'true');

        try {
          confetti({
            particleCount: 65,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#fbbf24'],
          });
        } catch {
          // Ignore
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isSpecial, userEmail]);

  // Listen to custom event so the user can re-open their bouquet anytime from navbar
  useEffect(() => {
    const handleReopen = () => {
      if (isSpecial) {
        setIsPopupOpen(true);
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
      }
    };

    window.addEventListener('reopen-shembdu-welcome', handleReopen);
    return () => window.removeEventListener('reopen-shembdu-welcome', handleReopen);
  }, [isSpecial]);

  if (!isSpecial) return null;

  return (
    <>
      {/* 1. Subtle, Minimal Red Hearts in the Background (Always Active) */}
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
              className="text-rose-600/80 fill-rose-600/70 drop-shadow-[0_2px_8px_rgba(225,29,72,0.4)]"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 2. Welcome Shembdu Popup with Flower Bouquet */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-3xl bg-card/95 border border-rose-500/40 p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.35)] backdrop-blur-xl text-center overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Ambient soft glow background */}
            <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Flower Bouquet (Bockage) Visual Card */}
            <div className="mx-auto my-2 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Glowing ring */}
                <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-400/20 to-amber-300/20 animate-pulse blur-md" />

                {/* Animated Flower Bouquet Container */}
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-500/30 flex items-center justify-center shadow-inner animate-gentle-pulse">
                  <span className="text-5xl select-none filter drop-shadow-md">
                    💐
                  </span>
                  <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1.5 -right-1.5 animate-spin duration-3000" />
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 absolute -bottom-1 -left-1 animate-bounce" />
                </div>
              </div>

              {/* Bouquet Sub-ribbon */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold tracking-wide">
                <span>Special Flower Bouquet</span>
                <span>🌸</span>
              </div>
            </div>

            {/* Welcome Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-3 flex items-center justify-center gap-2">
              <span>Welcome Shembdu</span>
              <span className="text-rose-500 animate-pulse">❤️</span>
            </h2>

            {/* Warm, Loving Message */}
            <p className="text-xs sm:text-sm text-muted-foreground mt-2.5 leading-relaxed px-2">
              Here is a fresh flower bouquet made just for you! Sending you warmth, happiness, and good energy for your learning journey today.
            </p>

            {/* Action Dismiss Button */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  try {
                    confetti({
                      particleCount: 35,
                      spread: 60,
                      origin: { y: 0.7 },
                      colors: ['#e11d48', '#f43f5e', '#fb7185'],
                    });
                  } catch {
                    // Ignore
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
