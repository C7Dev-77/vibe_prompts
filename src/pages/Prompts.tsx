import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, X, Filter, Bookmark } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PromptCard } from '../components/prompts/PromptCard';
import { Category, Difficulty } from '../types';
import { sound } from '../utils/audio';
import { SpeechBubble } from '../components/ui/SpeechBubble';

export const Prompts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const {
    prompts,
    favorites,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTool,
    setSelectedTool,
    selectedDifficulty,
    setSelectedDifficulty
  } = useStore();

  const [onlyFeatured, setOnlyFeatured] = useState(filterParam === 'featured');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Categories list
  const categories: { id: Category | 'all'; label: string }[] = [
    { id: 'all', label: 'Todas las Categorías' },
    { id: 'skills', label: 'Skills' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'ui', label: 'Diseño UI' },
    { id: 'debug', label: 'Depuración' },
    { id: 'refactor', label: 'Refactor' },
    { id: 'backend', label: 'Backend' },
    { id: 'testing', label: 'Testing' },
    { id: 'deploy', label: 'Deploy' },
    { id: 'db', label: 'Base de Datos' }
  ];

  // Tools list
  const tools = ['all', 'cursor', 'claude-code', 'v0', 'bolt', 'windsurf', 'copilot'];

  // Difficulties
  const difficulties: { id: Difficulty | 'all'; label: string }[] = [
    { id: 'all', label: 'Cualquier Dificultad' },
    { id: 'beginner', label: 'Inicial' },
    { id: 'intermediate', label: 'Intermedio' },
    { id: 'advanced', label: 'Avanzado' }
  ];

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      // Favorites filter
      if (onlyFavorites && !favorites.includes(p.id)) return false;

      // Featured filter
      if (onlyFeatured && !p.featured) return false;

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Tool filter
      if (selectedTool !== 'all' && !p.tools.includes(selectedTool)) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesBody = p.body.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesTools = p.tools.some((tl) => tl.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesBody && !matchesTags && !matchesTools) {
          return false;
        }
      }

      return true;
    });
  }, [prompts, favorites, onlyFavorites, searchQuery, selectedCategory, selectedTool, selectedDifficulty, onlyFeatured]);

  const resetFilters = () => {
    sound.playPop();
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTool('all');
    setSelectedDifficulty('all');
    setOnlyFeatured(false);
    setOnlyFavorites(false);
    setSearchParams({});
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedCategory !== 'all' || 
    selectedTool !== 'all' || 
    selectedDifficulty !== 'all' || 
    onlyFeatured ||
    onlyFavorites;

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-[1280px] mx-auto relative z-10 animate-fade-up">
      
      {/* Header section (Dala Style: Monolithic heading + ultra-light body) */}
      <div className="space-y-4 mb-12">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#d97706] dark:text-[#ffb829]">
            <span>Explorador de Prompts</span>
            <span className="opacity-30">/</span>
            <span className="text-[#7c3aed] dark:text-[#8052ff] font-semibold">{filteredPrompts.length} disponibles</span>
          </div>
          <SpeechBubble icon={<Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />}>
            Filtra en tiempo real y copia con un click
          </SpeechBubble>
        </div>

        <h1 className="text-[48px] md:text-[78px] font-display text-slate-900 dark:text-white tracking-[-0.04em] leading-[1.05] transition-colors">
          Biblioteca de Prompts
        </h1>

        <p className="text-[18px] font-body-light text-slate-600 dark:text-[#cbd5e1] max-w-2xl leading-relaxed transition-colors">
          Prompts probados en batalla para Cursor, Claude Code, v0 y Bolt. Sin fricción, listos para copiar y con variables parametrizables.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-10 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 dark:text-[#9a9a9a] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por funcionalidad, framework, tag, herramienta (ej: 'react', 'cursor', 'api')..."
            className="w-full pl-12 pr-10 py-3.5 rounded-[20px] bg-white/75 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9a9a9a] text-sm focus:outline-none focus:border-[#7c3aed] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-none transition-all backdrop-blur-xl"
          />
          {searchQuery && (
            <button
              onClick={() => {
                sound.playPop();
                setSearchQuery('');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter bar: Functional segmented buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          
          {/* Category Chips / Segmented tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 backdrop-blur-md shadow-xs">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playPop();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-nav rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#7c3aed] dark:bg-[#8052ff] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white dark:text-[#9a9a9a] dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Secondary Filters Dropdowns & Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tool Filter */}
            <select
              value={selectedTool}
              onChange={(e) => {
                sound.playPop();
                setSelectedTool(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#7c3aed] font-mono cursor-pointer shadow-sm dark:shadow-none"
            >
              <option value="all">Cualquier Herramienta</option>
              {tools.filter((t) => t !== 'all').map((t) => (
                <option key={t} value={t} className="bg-white text-slate-900 dark:bg-[#0a0a0f] dark:text-white">
                  {t}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                sound.playPop();
                setSelectedDifficulty(e.target.value as Difficulty | 'all');
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#7c3aed] font-mono cursor-pointer shadow-sm dark:shadow-none"
            >
              {difficulties.map((d) => (
                <option key={d.id} value={d.id} className="bg-white text-slate-900 dark:bg-[#0a0a0f] dark:text-white">
                  {d.label}
                </option>
              ))}
            </select>

            {/* Featured toggle */}
            <button
              onClick={() => {
                sound.playPop();
                setOnlyFeatured(!onlyFeatured);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nav transition-colors border ${
                onlyFeatured
                  ? 'border-[#d97706] dark:border-[#ffb829] text-[#d97706] dark:text-[#ffb829] bg-[#ffb829]/10'
                  : 'border-slate-200/90 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white bg-white dark:bg-transparent shadow-sm dark:shadow-none'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Solo Destacados</span>
            </button>

            {/* Favorites toggle with cloud sync counter */}
            <button
              onClick={() => {
                sound.playPop();
                setOnlyFavorites(!onlyFavorites);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nav transition-colors border ${
                onlyFavorites
                  ? 'border-[#7c3aed] dark:border-[#8052ff] text-[#7c3aed] dark:text-[#8052ff] bg-[#7c3aed]/10'
                  : 'border-slate-200/90 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white bg-white dark:bg-transparent shadow-sm dark:shadow-none'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span>Favoritos {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
            </button>

            {/* Reset filters if any active */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-[#9a9a9a] dark:hover:text-white underline decoration-slate-300 dark:decoration-white/20 underline-offset-4"
              >
                Limpiar filtros
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Results Header Counter with tabular numbers */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9a9a9a] mb-6 pb-4 border-b border-slate-200/80 dark:border-white/5 font-mono">
        <div className="flex items-center gap-2">
          <span>Mostrando</span>
          <span className="text-slate-900 dark:text-white font-semibold tabular-nums text-sm">
            {filteredPrompts.length}
          </span>
          <span>de</span>
          <span className="text-slate-900 dark:text-white tabular-nums font-semibold">{prompts.length}</span>
          <span>prompts</span>
        </div>

        {selectedCategory !== 'all' && (
          <span className="text-[#d97706] dark:text-[#ffb829] font-medium uppercase">
            Filtro activo: {selectedCategory}
          </span>
        )}
      </div>

      {/* Prompts Grid with spring drop-in */}
      {filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-drop-in">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-4 rounded-[28px] bg-white dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-none">
          <Filter className="w-10 h-10 mx-auto text-slate-300 dark:text-white/20" />
          <h3 className="text-xl font-medium text-slate-900 dark:text-white">No se encontraron prompts</h3>
          <p className="text-sm font-light text-slate-500 dark:text-[#9a9a9a] max-w-md mx-auto">
            Ningún prompt coincide con tus criterios de búsqueda o filtros seleccionados.
          </p>
          <button
            onClick={resetFilters}
            className="btn-iris mt-2"
          >
            Restablecer Filtros
          </button>
        </div>
      )}
    </div>
  );
};
