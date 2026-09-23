import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Sparkles, Copy, Check, ArrowRight, Compass, Terminal, Shield, Zap, Download } from 'lucide-react';
import { ScrollWorldCanvas } from '../components/canvas/ScrollWorldCanvas';
import { useStore } from '../store/useStore';
import { sound } from '../utils/audio';
import { triggerVibeTokenBurst } from '../components/ui/VibeTokensRain';
import { SpeechBubble } from '../components/ui/SpeechBubble';
import { downloadPromptAsMarkdown } from '../utils/downloadMarkdown';
import { Prompt } from '../types';
import confetti from 'canvas-confetti';

export const Home: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const prompts = useStore((s) => s.prompts);

  // Take featured prompts for the scroll journey
  const featuredPrompts = prompts.filter((p) => p.featured).slice(0, 4);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const current = window.scrollY;
      const progress = Math.min(Math.max(current / totalScroll, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyPrompt = (e: React.MouseEvent, id: string, body: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(body);
    setCopiedId(id);

    // Audio chime & physical 3D token cascade
    sound.playChime();
    triggerVibeTokenBurst();

    // Micro spark
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { x, y },
      colors: ['#8052ff', '#ffb829', '#00e5ff'],
      disableForReducedMotion: true
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPrompt = (e: React.MouseEvent, prompt: Prompt) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playPop();
    triggerVibeTokenBurst();
    downloadPromptAsMarkdown(prompt);
    setDownloadedId(prompt.id);
    setTimeout(() => setDownloadedId(null), 2200);
  };

  const scrollToNext = () => {
    sound.playWhoosh();
    window.scrollTo({
      top: window.innerHeight * 0.9,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative min-h-[500vh] bg-transparent text-[var(--text-primary)] select-none-text">
      {/* 3D Fixed Scroll-World WebGL Canvas */}
      <ScrollWorldCanvas scrollProgress={scrollProgress} />

      {/* ---------------- SCENE 0: HERO (z = 0) ---------------- */}
      <section className="h-screen w-full flex flex-col justify-center items-start max-w-[1280px] mx-auto px-6 md:px-16 relative z-10">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 relative p-7 sm:p-9 md:p-12 rounded-[32px] glass-panel-hero transition-all">
          <div className="animate-drop-in flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#b45309] dark:text-[#ffb829] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#d97706] dark:text-[#ffb829]" />
              <span>Colección Personal · Vibe Coding</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#7c3aed]/10 dark:bg-[#8052ff]/15 text-[#6d28d9] dark:text-[#c4b5fd] border border-[#7c3aed]/20 dark:border-[#8052ff]/30 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] dark:bg-[#8052ff] animate-pulse" />
              <span>Scroll 3D & tokens reactivos</span>
            </div>
          </div>

          {/* Dala Signature Display Typography with sculpted obsidian gradient in light mode */}
          <h1 className="animate-drop-in-delay-1 text-[52px] sm:text-[76px] md:text-[104px] font-display bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-slate-300 bg-clip-text text-transparent leading-[0.92] tracking-[-0.04em] text-balance transition-colors drop-shadow-xs dark:drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            VibePrompts
          </h1>

          {/* Dala Body with spring dropIn */}
          <p className="animate-drop-in-delay-2 text-[18px] md:text-[21px] font-body-light text-slate-700 dark:text-[#cbd5e1] max-w-xl leading-relaxed transition-colors">
            <span className="font-medium text-slate-900 dark:text-white block mb-1">Prompts listos para vibe coding.</span>
            Una biblioteca curada de prompts para construir apps con IA. Cópialos, úsalos y aporta tu calificación — sin necesidad de crear cuenta.
          </p>

          <div className="animate-drop-in-delay-3 pt-4 flex flex-wrap items-center gap-4">
            <Link 
              to="/prompts" 
              onClick={() => sound.playPop()}
              className="btn-iris"
            >
              <span>Explorar Biblioteca</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToNext}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/95 dark:hover:bg-white/10 text-slate-800 dark:text-[#bdbdbd] hover:text-slate-950 dark:hover:text-white transition-all shadow-[0_2px_8px_rgba(15,23,42,0.04)] font-medium text-sm group"
            >
              <span>Volar por el Cosmos</span>
              <ArrowDown className="w-4 h-4 text-[#d97706] dark:text-[#ffb829] group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scroll helper indicator */}
        <div className="absolute bottom-10 left-6 md:left-16 flex items-center gap-3 text-xs text-slate-500 dark:text-[#9a9a9a] font-light">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] dark:bg-[#8052ff] animate-ping" />
          <span>Haz scroll para volar a través de las constelaciones</span>
        </div>
      </section>

      {/* ---------------- SCENE 1: FEATURED PROMPT 1 (Frontend Lattice) ---------------- */}
      <section className="min-h-screen w-full flex items-center max-w-[1280px] mx-auto px-6 md:px-16 py-24 relative z-10">
        {featuredPrompts[0] && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 space-y-6 p-7 sm:p-9 md:p-10 rounded-[28px] glass-panel-hero">
              <span className="text-xs font-mono uppercase tracking-widest text-[#b45309] dark:text-[#ffb829] font-medium">
                01 // ARQUITECTURA FRONTEND
              </span>
              <h2 className="text-[38px] md:text-[54px] font-display bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                {featuredPrompts[0].title}
              </h2>
              <p className="text-[17px] font-body-light text-slate-700 dark:text-[#cbd5e1] leading-relaxed">
                {featuredPrompts[0].description}
              </p>

              {/* Zero-Pill Metadata */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#9a9a9a] font-mono">
                <span className="text-slate-800 dark:text-white font-medium">Cursor</span>
                <span className="opacity-30">·</span>
                <span className="text-slate-800 dark:text-white font-medium">Claude Code</span>
                <span className="opacity-30">·</span>
                <span className="text-slate-800 dark:text-white font-medium">Windsurf</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={(e) => handleCopyPrompt(e, featuredPrompts[0].id, featuredPrompts[0].body)}
                  className="btn-iris"
                >
                  {copiedId === featuredPrompts[0].id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>¡Prompt Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Directo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => handleDownloadPrompt(e, featuredPrompts[0])}
                  className="btn-ghost flex items-center gap-1.5 py-2.5 px-4 text-xs font-mono rounded-full border border-slate-300/70 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/5"
                  title="Descargar prompt en formato Markdown (.md)"
                >
                  {downloadedId === featuredPrompts[0].id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-500 font-medium">¡Descargado .md!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#7c3aed] dark:text-[#8052ff]" />
                      <span>Descargar .md</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/prompts/${featuredPrompts[0].slug}`}
                  className="btn-ghost px-4 py-2.5 text-xs font-mono rounded-full hover:bg-slate-100/70 dark:hover:bg-white/5"
                >
                  Variables →
                </Link>
              </div>
            </div>

            {/* Prompt preview floating block without heavy cards */}
            <div className="lg:col-span-6 p-6 md:p-8 rounded-[24px] glass-panel-code text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[#b45309] dark:text-[#ffb829] font-medium border-b border-slate-200/80 dark:border-white/10 pb-3">
                <span>// prompt_template.txt</span>
                <span>4 variables dinámicas</span>
              </div>
              <div className="text-slate-800 dark:text-white/80 line-clamp-8 leading-relaxed whitespace-pre-wrap">
                {featuredPrompts[0].body}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- SCENE 2: FEATURED PROMPT 2 (Anti-Slop UI Torus) ---------------- */}
      <section className="min-h-screen w-full flex items-center max-w-[1280px] mx-auto px-6 md:px-16 py-24 relative z-10">
        {featuredPrompts[1] && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Visual preview left */}
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 md:p-8 rounded-[24px] glass-panel-code text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[#7c3aed] dark:text-[#8052ff] font-medium border-b border-slate-200/80 dark:border-white/10 pb-3">
                <span>// anti_slop_constitution.md</span>
                <span>Linear & Dala Aesthetic</span>
              </div>
              <div className="text-slate-800 dark:text-white/80 line-clamp-8 leading-relaxed whitespace-pre-wrap">
                {featuredPrompts[1].body}
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 p-7 sm:p-9 md:p-10 rounded-[28px] glass-panel-hero">
              <span className="text-xs font-mono uppercase tracking-widest text-[#b45309] dark:text-[#ffb829] font-medium">
                02 // DISEÑO UI & ANTI-SLOP
              </span>
              <h2 className="text-[38px] md:text-[54px] font-display bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                {featuredPrompts[1].title}
              </h2>
              <p className="text-[17px] font-body-light text-slate-700 dark:text-[#cbd5e1] leading-relaxed">
                {featuredPrompts[1].description}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#9a9a9a] font-mono">
                <span className="text-[#7c3aed] dark:text-[#8052ff] font-medium">#7c3aed Iris</span>
                <span className="opacity-30">·</span>
                <span className="text-[#d97706] dark:text-[#ffb829] font-medium">#f59e0b Spark</span>
                <span className="opacity-30">·</span>
                <span>Zero-Pills</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={(e) => handleCopyPrompt(e, featuredPrompts[1].id, featuredPrompts[1].body)}
                  className="btn-iris"
                >
                  {copiedId === featuredPrompts[1].id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>¡Prompt Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Directo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => handleDownloadPrompt(e, featuredPrompts[1])}
                  className="btn-ghost flex items-center gap-1.5 py-2.5 px-4 text-xs font-mono rounded-full border border-slate-300/70 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/5"
                  title="Descargar prompt en formato Markdown (.md)"
                >
                  {downloadedId === featuredPrompts[1].id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-500 font-medium">¡Descargado .md!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#7c3aed] dark:text-[#8052ff]" />
                      <span>Descargar .md</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/prompts/${featuredPrompts[1].slug}`}
                  className="btn-ghost px-4 py-2.5 text-xs font-mono rounded-full hover:bg-slate-100/70 dark:hover:bg-white/5"
                >
                  Variables →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- SCENE 3: FEATURED PROMPT 3 (Root-Cause Debugger Helix) ---------------- */}
      <section className="min-h-screen w-full flex items-center max-w-[1280px] mx-auto px-6 md:px-16 py-24 relative z-10">
        {featuredPrompts[2] && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 space-y-6 p-7 sm:p-9 md:p-10 rounded-[28px] glass-panel-hero">
              <span className="text-xs font-mono uppercase tracking-widest text-[#b45309] dark:text-[#ffb829] font-medium">
                03 // DEPÙRACIÓN PROFUNDA
              </span>
              <h2 className="text-[38px] md:text-[54px] font-display bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                {featuredPrompts[2].title}
              </h2>
              <p className="text-[17px] font-body-light text-slate-700 dark:text-[#cbd5e1] leading-relaxed">
                {featuredPrompts[2].description}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#9a9a9a] font-mono">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">First-Principles</span>
                <span className="opacity-30">·</span>
                <span>Concurrency</span>
                <span className="opacity-30">·</span>
                <span>Race Conditions</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={(e) => handleCopyPrompt(e, featuredPrompts[2].id, featuredPrompts[2].body)}
                  className="btn-iris"
                >
                  {copiedId === featuredPrompts[2].id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>¡Prompt Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Directo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => handleDownloadPrompt(e, featuredPrompts[2])}
                  className="btn-ghost flex items-center gap-1.5 py-2.5 px-4 text-xs font-mono rounded-full border border-slate-300/70 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/5"
                  title="Descargar prompt en formato Markdown (.md)"
                >
                  {downloadedId === featuredPrompts[2].id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-500 font-medium">¡Descargado .md!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#7c3aed] dark:text-[#8052ff]" />
                      <span>Descargar .md</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/prompts/${featuredPrompts[2].slug}`}
                  className="btn-ghost px-4 py-2.5 text-xs font-mono rounded-full hover:bg-slate-100/70 dark:hover:bg-white/5"
                >
                  Detalle →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 md:p-8 rounded-[24px] glass-panel-code text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-medium border-b border-slate-200/80 dark:border-white/10 pb-3">
                <span>// root_cause_debugger.sh</span>
                <span>Sin parches temporales</span>
              </div>
              <div className="text-slate-800 dark:text-white/80 line-clamp-8 leading-relaxed whitespace-pre-wrap">
                {featuredPrompts[2].body}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- SCENE 4: FINAL CTA & VORTEX GALAXY ---------------- */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center text-center max-w-[1280px] mx-auto px-6 md:px-16 py-24 relative z-10">
        <div className="max-w-2xl space-y-6 relative p-8 md:p-12 rounded-[32px] glass-panel-hero">
          <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 dark:bg-[#8052ff]/20 border border-[#7c3aed]/30 dark:border-[#8052ff]/30 flex items-center justify-center mx-auto text-[#7c3aed] dark:text-[#8052ff]">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <h2 className="text-[40px] md:text-[62px] font-display bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-slate-300 bg-clip-text text-transparent leading-[1.05] tracking-tight">
            El universo del Vibe Coding a tu alcance
          </h2>

          <p className="text-[17px] md:text-[19px] font-body-light text-slate-700 dark:text-[#cbd5e1] leading-relaxed max-w-lg mx-auto">
            Explora todos los prompts organizados por categoría, herramientas (Cursor, Claude Code, v0, Bolt) 
            y nivel de dificultad. Todo 100% libre y sin inicio de sesión.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/prompts" className="btn-iris text-base py-3 px-8">
              <span>Explorar Todos los Prompts ({prompts.length})</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
