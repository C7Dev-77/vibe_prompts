import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { sound } from '../../utils/audio';
import { triggerVibeTokenBurst } from '../ui/VibeTokensRain';
import { AuthButton } from '../auth/AuthButton';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useStore();
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const isDark = theme === 'dark';

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  const handleTriggerTokens = () => {
    sound.playPop();
    triggerVibeTokenBurst();
  };

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Explorar', path: '/prompts' },
    { label: 'Destacados', path: '/prompts?filter=featured' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full px-6 md:px-12 py-4 transition-colors duration-200 backdrop-blur-md bg-white/85 dark:bg-black/60 border-b border-slate-200/80 dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark with Dala Geometric Mark */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
        >
          {/* Stylized sharp geometric fragment in violet/teal */}
          <div className="w-7 h-7 relative flex items-center justify-center">
            <svg 
              viewBox="0 0 32 32" 
              className="w-full h-full transform transition-transform duration-300 group-hover:rotate-12"
            >
              <defs>
                <linearGradient id="vpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <polygon points="16,2 30,28 2,28" fill="url(#vpGrad)" />
              <polygon points="16,10 24,26 8,26" fill={isDark ? '#000000' : '#f8fafc'} />
              <circle cx="16" cy="19" r="2.5" fill="#f59e0b" />
            </svg>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white transition-colors">
            VibePrompts
          </span>
        </Link>

        {/* Zone 2: Navigation Links (Clean uppercase tracking) */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path && !location.search;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors duration-150 relative py-1 ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7c3aed] dark:bg-[#8052ff] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Interactive Tactile FX & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* Tactile 3D Tokens Burst Trigger (Clean icon, no long text) */}
          <button
            onClick={handleTriggerTokens}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9a9a9a] dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200 border border-slate-200/80 dark:border-white/5 group relative"
            title="Lanzar tokens 3D al cosmos"
            aria-label="Lanzar tokens 3D"
          >
            <Sparkles className="w-4 h-4 text-[#7c3aed] dark:text-[#8052ff] group-hover:scale-110 transition-transform" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos táctiles'}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9a9a9a] dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200 border border-slate-200/80 dark:border-white/5"
            title={soundEnabled ? 'Silenciar efectos táctiles' : 'Activar efectos táctiles'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#7c3aed] dark:text-[#8052ff]" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-40 text-slate-400" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema de color"
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9a9a9a] dark:hover:text-white dark:hover:bg-white/5 transition-all duration-200 border border-slate-200/80 dark:border-white/5"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#ffb829] transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#7c3aed] transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Firebase Google Auth Button */}
          <AuthButton />
        </div>

      </div>
    </header>
  );
};
