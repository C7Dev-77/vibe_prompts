import React from 'react';

interface SpeechBubbleProps {
  children: React.ReactNode;
  visible?: boolean;
  className?: string;
  tailPosition?: 'bottom' | 'top';
  icon?: React.ReactNode;
}

/**
 * Reusable physical speech bubble inspired by dontlookup.app.
 * Uses exact stroked SVG tail path to cleanly attach to elements.
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  visible = true,
  className = '',
  tailPosition = 'bottom',
  icon
}) => {
  if (!visible) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[13px] bg-white dark:bg-[#121218] border border-black/10 dark:border-white/15 text-xs text-[#0a0a0f] dark:text-white shadow-lg backdrop-blur-md transition-all duration-300 transform scale-100 opacity-100 ${
        tailPosition === 'bottom' ? 'relative mb-2.5' : 'relative mt-2.5'
      } ${className}`}
      style={{
        animation: 'dropIn 420ms cubic-bezier(0.2, 1.5, 0.32, 1) both'
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="font-medium tracking-tight whitespace-nowrap">{children}</span>

      {/* SVG Tail identical to dontlookup.app btail */}
      {tailPosition === 'bottom' ? (
        <svg
          className="absolute left-1/2 -bottom-[8px] -translate-x-1/2 w-[16px] h-[9px] overflow-visible pointer-events-none"
          viewBox="-3 -5 18 14"
          aria-hidden="true"
        >
          <path
            className="fill-white dark:fill-[#121218]"
            d="M0 -5H12V-1.25L6 6 0 -1.25Z"
          />
          <path
            className="stroke-black/15 dark:stroke-white/20 fill-none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 -1.25 6 6 12 -1.25"
          />
        </svg>
      ) : (
        <svg
          className="absolute left-1/2 -top-[8px] -translate-x-1/2 w-[16px] h-[9px] overflow-visible pointer-events-none rotate-180"
          viewBox="-3 -5 18 14"
          aria-hidden="true"
        >
          <path
            className="fill-white dark:fill-[#121218]"
            d="M0 -5H12V-1.25L6 6 0 -1.25Z"
          />
          <path
            className="stroke-black/15 dark:stroke-white/20 fill-none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 -1.25 6 6 12 -1.25"
          />
        </svg>
      )}
    </div>
  );
};
