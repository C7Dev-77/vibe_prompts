import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/5 py-10 px-6 md:px-12 relative z-20 bg-white/80 dark:bg-black/60 backdrop-blur-md text-xs font-mono text-slate-500 dark:text-[#9a9a9a]">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <span className="text-slate-900 dark:text-white font-semibold">VibePrompts</span>
          <span className="opacity-30">·</span>
          <span className="text-[11px] text-slate-500 dark:text-[#bdbdbd]">
            Constelación de prompts para Vibe Coders
          </span>
        </div>

        {/* Creator Credit */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#a0a0a0]">
          <span>Creada por</span>
          <a
            href="https://c7dev-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#7c3aed] dark:text-[#8052ff] hover:text-[#6d28d9] dark:hover:text-[#a78bfa] transition-all inline-flex items-center gap-1 group py-0.5 px-1.5 rounded-md hover:bg-[#7c3aed]/10"
            title="Visitar portafolio de C7Dev_"
          >
            <span className="underline underline-offset-4 decoration-[#7c3aed]/40 group-hover:decoration-[#7c3aed]">C7Dev_</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Dynamic Phrase Slot */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] dark:bg-[#8052ff] animate-pulse" />
          <span className="italic tracking-wide text-slate-600 dark:text-[#c4c4c4]">
            «Code at the speed of thought.»
          </span>
        </div>

      </div>
    </footer>
  );
};
