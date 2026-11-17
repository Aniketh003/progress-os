import React from 'react';

export function ProgressOSLogo({ className = 'w-7 h-7', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Rounded squircle container with subtle glass border */}
      <rect width="32" height="32" rx="8" fill="url(#progress-grad)" />
      <rect width="32" height="32" rx="8" stroke="url(#glow-grad)" strokeWidth="1" />

      {/* Stepped progress milestone bars ascending into an arrow / 'P' stem */}
      {/* Base vertical stem */}
      <rect x="7" y="7" width="3.5" height="18" rx="1.75" fill="#ffffff" />

      {/* Ascending milestone tiers */}
      {/* Level 1 milestone */}
      <rect x="12.5" y="19" width="4.5" height="6" rx="1.5" fill="#ffffff" fillOpacity="0.5" />

      {/* Level 2 milestone */}
      <rect x="19" y="14" width="4.5" height="11" rx="1.5" fill="#ffffff" fillOpacity="0.75" />

      {/* Top loop connecting the 'P' and forward trajectory */}
      <path
        d="M8.75 7H17.5C19.9853 7 22 9.01472 22 11.5C22 13.9853 19.9853 16 17.5 16H8.75"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Progress focal spark dot */}
      <circle cx="16" cy="11.5" r="1.5" fill="#ffffff" />
    </svg>
  );
}
