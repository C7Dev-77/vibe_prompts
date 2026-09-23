import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Copy, Check, Sparkles, Sliders, RotateCcw, 
  ExternalLink, Share2, Star, ShieldCheck, Tag, Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CommunitySection } from '../components/community/CommunitySection';
import { sound } from '../utils/audio';
import { triggerVibeTokenBurst } from '../components/ui/VibeTokensRain';
import { SpeechBubble } from '../components/ui/SpeechBubble';
import { downloadPromptAsMarkdown } from '../utils/downloadMarkdown';
import confetti from 'canvas-confetti';

export const PromptDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const getPromptBySlug = useStore((s) => s.getPromptBySlug);
  const getPromptRating = useStore((s) => s.getPromptRating);

  const prompt = useMemo(() => {
    return slug ? getPromptBySlug(slug) : undefined;
  }, [slug, getPromptBySlug]);

  const ratingInfo = prompt ? getPromptRating(prompt.id) : { average: 5, count: 0 };

  // Parse {{variables}} from the prompt body
  const parsedVariables = useMemo(() => {
    if (!prompt) return [];
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(prompt.body)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  }, [prompt]);

  // Form state for variables
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Initialize variable defaults with human friendly samples
  useEffect(() => {
    if (parsedVariables.length > 0) {
      const defaults: Record<string, string> = {};
      parsedVariables.forEach((v) => {
        // Helpful contextual default guesses
        if (v.includes('framework')) defaults[v] = 'Next.js 15 App Router & React 19';
        else if (v.includes('state')) defaults[v] = 'Zustand';
        else if (v.includes('feature')) defaults[v] = 'Filtro de productos en tiempo real con URL sync';
        else if (v.includes('font')) defaults[v] = 'Inter & PPNeueMontreal';
        else if (v.includes('canvas')) defaults[v] = '#000000 (Pure Black Void)';
        else if (v.includes('accent')) defaults[v] = '#8052ff (Electric Iris)';
        else if (v.includes('environment')) defaults[v] = 'React 19 + Vite + TypeScript';
        else if (v.includes('symptom')) defaults[v] = 'Componente entra en un loop de re-renders infinito';
        else if (v.includes('tool')) defaults[v] = 'Cursor & Claude 3.7 Sonnet';
        else if (v.includes('pattern')) defaults[v] = 'Compound Component & Custom Hook';
        else defaults[v] = '';
      });
      setVariableValues(defaults);
    }
  }, [parsedVariables]);

  // Computed compiled prompt with replaced variables
  const compiledPrompt = useMemo(() => {
    if (!prompt) return '';
    let text = prompt.body;
    for (const [key, val] of Object.entries(variableValues)) {
      if (val.trim()) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        text = text.replace(regex, val.trim());
      }
    }
    return text;
  }, [prompt, variableValues]);

  if (!prompt) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-[1280px] mx-auto text-center">
        <h2 className="text-3xl font-display text-white mb-4">Prompt no encontrado</h2>
        <p className="text-[#9a9a9a] mb-6">El prompt que buscas no existe o ha sido movido.</p>
        <Link to="/prompts" className="btn-iris">
          Volver a la Biblioteca
        </Link>
      </div>
    );
  }

  const handleCopyCompiled = (e: React.MouseEvent) => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);

    // Audio chime & physical 3D tokens
    sound.playChime();
    triggerVibeTokenBurst();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 55,
      origin: { x, y },
      colors: ['#8052ff', '#ffb829', '#00e5ff', '#ffffff']
    });

    setTimeout(() => setCopied(false), 2400);
  };

  const handleShare = () => {
    sound.playPop();
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: prompt.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const handleResetVariables = () => {
    sound.playPop();
    const empty: Record<string, string> = {};
    parsedVariables.forEach((v) => {
      empty[v] = '';
    });
    setVariableValues(empty);
  };

  const handleDownloadMd = () => {
    if (!prompt) return;
    sound.playChime();
    triggerVibeTokenBurst();
    downloadPromptAsMarkdown(prompt, compiledPrompt);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2400);
  };

  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    debug: 'Depuración',
    refactor: 'Refactor',
    testing: 'Testing',
    ui: 'Diseño UI',
    db: 'Base de Datos',
    deploy: 'Despliegue',
    skills: 'Skills'
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-[1280px] mx-auto relative z-10">
      
      {/* Back button */}
      <div className="mb-8">
        <Link
          to="/prompts"
          className="inline-flex items-center gap-2 text-xs font-nav text-slate-500 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Main Prompt Header */}
      <div className="space-y-4 mb-10">
        {/* Zero-Pill Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-[#9a9a9a]">
          <span className="text-[#d97706] dark:text-[#ffb829] font-semibold">
            {categoryLabels[prompt.category] || prompt.category}
          </span>
          <span className="opacity-30">·</span>
          <span>Dificultad: {prompt.difficulty}</span>
          <span className="opacity-30">·</span>
          <span className="text-slate-800 dark:text-white">{prompt.tools.join(', ')}</span>
          {ratingInfo.count > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span className="text-[#d97706] dark:text-[#ffb829] flex items-center gap-1 font-sans">
                <Star className="w-3.5 h-3.5 fill-[#d97706] dark:fill-[#ffb829]" />
                {ratingInfo.average} ({ratingInfo.count})
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-[40px] md:text-[64px] font-display text-slate-900 dark:text-white tracking-[-0.04em] leading-[1.08] text-balance transition-colors">
          {prompt.title}
        </h1>

        {/* Description */}
        <p className="text-[18px] md:text-[20px] font-body-light text-slate-600 dark:text-[#cbd5e1] max-w-3xl leading-relaxed transition-colors">
          {prompt.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {prompt.tags.map((t) => (
            <span key={t} className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white transition-colors">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: Variable Customizer (if any) + Code Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Dynamic Variables Form */}
        {parsedVariables.length > 0 && (
          <div className="lg:col-span-5 p-6 md:p-8 rounded-[24px] bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#7c3aed] dark:text-[#8052ff]" />
                <h3 className="text-sm font-semibold uppercase font-nav text-slate-900 dark:text-white">
                  Variables Dinámicas
                </h3>
              </div>
              <button
                onClick={handleResetVariables}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white flex items-center gap-1"
                title="Vaciar campos"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>

            <p className="text-xs font-light text-slate-500 dark:text-[#9a9a9a]">
              Rellena o ajusta los valores para compilar el prompt adaptado a tu proyecto en tiempo real:
            </p>

            <div className="space-y-4">
              {parsedVariables.map((v) => (
                <div key={v} className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-800 dark:text-white flex items-center justify-between">
                    <span className="text-[#d97706] dark:text-[#ffb829]">{"{{"}{v}{"}}"}</span>
                    {variableValues[v] && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">Listo</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={variableValues[v] || ''}
                    onChange={(e) =>
                      setVariableValues({ ...variableValues, [v]: e.target.value })
                    }
                    placeholder={`Ingresa ${v.replace(/_/g, ' ')}...`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200/90 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#7c3aed] transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-[#9a9a9a] font-light">
              Tip: Los campos que dejes vacíos mantendrán la etiqueta <code className="text-[#d97706] dark:text-[#ffb829] font-medium">{"{{variable}}"}</code> original para que el LLM te pregunte por ella.
            </div>
          </div>
        )}

        {/* Right Column: Compiled Prompt Code Preview */}
        <div className={`${parsedVariables.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[20px] bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#9a9a9a]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span>Prompt Listo para Producción</span>
            </div>

            <div className="flex items-center gap-2 relative">
              {copied && (
                <div className="absolute -top-12 right-0 z-30 pointer-events-none">
                  <SpeechBubble icon={<Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />}>
                    ¡Variables compiladas y copiadas!
                  </SpeechBubble>
                </div>
              )}

              {/* Download Markdown (.md) */}
              <button
                onClick={handleDownloadMd}
                className="btn-ghost text-xs py-2 px-3.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#cbd5e1] hover:text-slate-900 dark:hover:text-white rounded-full flex items-center gap-1.5 transition-colors"
                title="Descargar prompt en formato Markdown (.md)"
              >
                {downloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">¡Descargado .md!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#7c3aed] dark:text-[#8052ff]" />
                    <span>Descargar .md</span>
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="btn-ghost p-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#9a9a9a] hover:text-slate-900 dark:hover:text-white rounded-full"
                title="Compartir enlace"
              >
                {shareFeedback ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Main Primary Button: Filled Violet Pill */}
              <button
                onClick={handleCopyCompiled}
                className="btn-iris text-xs py-2 px-5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Prompt Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Prompt Final</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Body Container */}
          <div className="relative rounded-[24px] bg-slate-50/80 dark:bg-[#030305] border border-slate-200/90 dark:border-white/10 p-6 md:p-8 font-mono text-xs md:text-sm text-slate-800 dark:text-[#e0e0e0] leading-relaxed overflow-x-auto selection:bg-[#7c3aed] selection:text-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-none">
            <pre className="whitespace-pre-wrap font-mono">
              {compiledPrompt}
            </pre>
          </div>

          {/* Quick instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-light text-slate-600 dark:text-[#9a9a9a]">
            <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.01] border border-slate-200/70 dark:border-white/5 shadow-sm dark:shadow-none">
              <span className="text-slate-900 dark:text-white font-medium block mb-1">1. Copia el Prompt</span>
              Pégalo directamente en la consola de Cursor, Claude Code o Windsurf.
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.01] border border-slate-200/70 dark:border-white/5 shadow-sm dark:shadow-none">
              <span className="text-slate-900 dark:text-white font-medium block mb-1">2. Adjunta Contexto</span>
              Usa @Files o @Codebase para que el modelo lea tus modelos de datos actuales.
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.01] border border-slate-200/70 dark:border-white/5 shadow-sm dark:shadow-none">
              <span className="text-slate-900 dark:text-white font-medium block mb-1">3. Vibe y Disfruta</span>
              Revisa el diff limpio y ejecuta los tests sin fricción.
            </div>
          </div>
        </div>

      </div>

      {/* Anonymous Community Section */}
      <CommunitySection promptId={prompt.id} />

    </div>
  );
};
