import React from 'react';

export interface ProgressOSLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  imgClassName?: string;
  badge?: boolean;
}

export function ProgressOSLogo({
  className = 'w-7 h-7',
  imgClassName = '',
  badge = true,
  ...props
}: ProgressOSLogoProps) {
  if (!badge) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
        {...props}
      >
        <img
          src="/logo.png"
          alt="ProgressOS"
          className={`w-full h-full object-contain pointer-events-none drop-shadow-md ${imgClassName}`}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none rounded-lg bg-zinc-950 border border-zinc-800/80 shadow-md shadow-rose-950/20 p-1 overflow-hidden ${className}`}
      {...props}
    >
      {/* Subtle crimson accent glow in badge corner */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-600/15 via-transparent to-transparent pointer-events-none" />
      <img
        src="/logo.png"
        alt="ProgressOS"
        className={`w-full h-full object-contain relative z-10 pointer-events-none filter drop-shadow-[0_1px_4px_rgba(225,29,72,0.35)] ${imgClassName}`}
        draggable={false}
      />
    </div>
  );
}
