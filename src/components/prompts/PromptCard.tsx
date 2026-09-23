import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ArrowUpRight, Star, Download, Bookmark } from 'lucide-react';
import { Prompt } from '../../types';
import { useStore } from '../../store/useStore';
import { sound } from '../../utils/audio';
import { triggerVibeTokenBurst } from '../ui/VibeTokensRain';
import { SpeechBubble } from '../ui/SpeechBubble';
import { downloadPromptAsMarkdown } from '../../utils/downloadMarkdown';
import confetti from 'canvas-confetti';

interface PromptCardProps {
  prompt: Prompt;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const getPromptRating = useStore((s) => s.getPromptRating);
  const isFavorite = useStore((s) => s.isFavorite(prompt.id));
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const ratingInfo = getPromptRating(prompt.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playPop();
    toggleFavorite(prompt.id);
  };

  // 3D Tilt calculation with elastic response (like interactive cards in dontlookup)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.body);
    setCopied(true);

    // Audio chime & physical 3D tokens
    sound.playChime();
    triggerVibeTokenBurst();

    // Micro confetti spark
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 18,
      spread: 45,
      origin: { x, y },
      colors: ['#8052ff', '#ffb829', '#00e5ff'],
      disableForReducedMotion: true,
      scalar: 0.7
    });

    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playPop();
    triggerVibeTokenBurst();
    downloadPromptAsMarkdown(prompt);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2200);
  };

  // Category labels in Spanish
  const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    debug: 'Depuración',
    refactor: 'Refactorización',
    testing: 'Testing',
    ui: 'Diseño UI',
    db: 'Base de Datos',
    deploy: 'Despliegue',
    skills: 'Skills'
  };

  // Difficulty badge text
  const difficultyLabels: Record<string, string> = {
    beginner: 'Inicial',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(${isHovered ? -5 : 0}px)`,
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.2, 1.5, 0.32, 1)'
      }}
      className="group relative flex flex-col justify-between p-7 rounded-[24px] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white/90 dark:hover:bg-white/[0.04] transition-all duration-200 border border-slate-200/70 dark:border-white/5 hover:border-[#7c3aed]/40 dark:hover:border-white/15 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)] dark:shadow-none active:scale-[0.985] active:translate-y-0.5"
    >
      {/* Dynamic Pop-in Speech Bubble when copied */}
      {copied && (
        <div className="absolute -top-10 right-6 z-20 pointer-events-none">
          <SpeechBubble icon={<Check className="w-3.5 h-3.5 text-emerald-500" />}>
            ¡Copiado al portapapeles!
          </SpeechBubble>
        </div>
      )}

      {/* Glow highlight subtle anchor */}
      <div 
        className="absolute inset-0 rounded-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.08), transparent 70%)'
        }}
      />

      <div>
        {/* Zero-Pill Metadata Line: Category · Difficulty · Tools */}
        <div className="flex items-center justify-between gap-2 text-xs font-medium mb-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#9a9a9a] uppercase tracking-wider text-[11px]">
            <span className="text-[#d97706] dark:text-[#ffb829] font-semibold">
              {categoryLabels[prompt.category] || prompt.category}
            </span>
            <span aria-hidden="true" className="opacity-30">·</span>
            <span>{difficultyLabels[prompt.difficulty] || prompt.difficulty}</span>
            {prompt.featured && (
              <>
                <span aria-hidden="true" className="opacity-30">·</span>
                <span className="text-[#7c3aed] dark:text-[#8052ff] font-semibold">Destacado</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ratingInfo.count > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-[#d97706] dark:text-[#ffb829]">
                <Star className="w-3 h-3 fill-[#d97706] dark:fill-[#ffb829]" />
                <span className="tabular-nums font-mono font-medium">{ratingInfo.average}</span>
              </div>
            )}

            {/* Favorite / Bookmark Button with Cloud sync */}
            <button
              onClick={handleFavorite}
              title={isFavorite ? 'Quitar de favoritos' : 'Guardar en mis favoritos (Firebase)'}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en mis favoritos'}
              className={`p-1.5 rounded-full transition-all duration-200 border ${
                isFavorite
                  ? 'border-[#7c3aed]/40 text-[#7c3aed] dark:text-[#8052ff] bg-[#7c3aed]/10'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link to={`/prompts/${prompt.slug}`} className="block">
          <h3 className="text-[21px] font-normal tracking-tight text-slate-900 dark:text-white group-hover:text-[#7c3aed] dark:group-hover:text-[#8052ff] transition-colors leading-snug mb-3">
            {prompt.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-[15px] font-light text-slate-600 dark:text-[#cbd5e1] line-clamp-3 leading-relaxed mb-5">
          {prompt.description}
        </p>

        {/* Tools and Tags Metadata (Unboxed text) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-[#9a9a9a] font-mono">
          <span className="opacity-60">herramientas:</span>
          {prompt.tools.map((tool, i) => (
            <span key={tool} className="text-slate-800 dark:text-white/80 font-medium">
              {tool}{i < prompt.tools.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <Link
          to={`/prompts/${prompt.slug}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#7c3aed] dark:text-[#8052ff] hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>Abrir & Personalizar</span>
          <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-1.5">
          {/* Quick Download .md Button */}
          <button
            onClick={handleDownload}
            title="Descargar como .md"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border border-slate-200 dark:border-white/10 hover:border-[#7c3aed] text-slate-600 dark:text-[#9a9a9a] hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/[0.02] hover:bg-[#7c3aed]/10"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">.md</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#7c3aed] dark:text-[#8052ff]" />
                <span className="text-[11px]">.md</span>
              </>
            )}
          </button>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            title="Copiar prompt completo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border border-slate-200 dark:border-white/10 hover:border-[#7c3aed] text-slate-600 dark:text-[#9a9a9a] hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/[0.02] hover:bg-[#7c3aed]/10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
