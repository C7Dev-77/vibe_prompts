import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Key, Plus, Trash2, Edit3, Download, Upload, 
  BarChart3, RefreshCw, Check, AlertCircle, MessageSquare, 
  Terminal, ShieldCheck, Search, Sparkles, AlertTriangle,
  Layers, CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Prompt, Category, Difficulty } from '../../types';

export const AdminModal: React.FC = () => {
  const { 
    isAdminOpen, 
    isAdminAuthed, 
    closeAdmin, 
    authenticateAdmin, 
    logoutAdmin,
    prompts,
    comments,
    addPrompt,
    updatePrompt,
    deletePrompt,
    deleteComment,
    exportPrompts,
    importPrompts,
    resetToDefaults
  } = useStore();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompts' | 'comments' | 'json' | 'stats'>('prompts');
  
  // Prompt edit/create modal state
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Prompt delete confirmation state
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Comment delete confirmation state
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Search & Filter in admin prompts tab
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Feedback notifications
  const [actionFeedback, setActionFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  // JSON import/export
  const [jsonInput, setJsonInput] = useState('');
  const [jsonMessage, setJsonMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Global keybind listener: Ctrl+Shift+L or Cmd+Shift+L
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        if (isAdminOpen) {
          closeAdmin();
        } else {
          useStore.getState().openAdmin();
        }
      } else if (e.key === 'Escape' && isAdminOpen) {
        if (promptToDelete) {
          setPromptToDelete(null);
        } else if (isEditing) {
          setIsEditing(false);
        } else {
          closeAdmin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen, closeAdmin, promptToDelete, isEditing]);

  if (!isAdminOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim() || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const ok = await authenticateAdmin(pinInput.trim());
      if (!ok) {
        setPinError(true);
        setTimeout(() => setPinError(false), 3000);
      } else {
        setPinInput('');
        setPinError(false);
      }
    } catch (err) {
      console.error('Error during admin auth:', err);
      setPinError(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt?.title?.trim() || !editingPrompt?.body?.trim() || !editingPrompt?.category) {
      setActionFeedback({ text: 'El título, categoría y cuerpo son obligatorios', error: true });
      return;
    }

    try {
      setIsSaving(true);
      const title = editingPrompt.title.trim();
      const slug = (editingPrompt.slug?.trim() || title)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      if (editingPrompt.id) {
        // Update existing prompt
        await updatePrompt(editingPrompt.id, {
          ...editingPrompt,
          title,
          slug,
          description: (editingPrompt.description || '').trim(),
          body: editingPrompt.body.trim(),
          category: editingPrompt.category as Category,
          difficulty: (editingPrompt.difficulty as Difficulty) || 'intermediate',
          tools: editingPrompt.tools && editingPrompt.tools.length > 0 ? editingPrompt.tools : ['cursor'],
          tags: editingPrompt.tags && editingPrompt.tags.length > 0 ? editingPrompt.tags : ['vibe-coding'],
          featured: !!editingPrompt.featured,
          createdAt: editingPrompt.createdAt || new Date().toISOString()
        });
        setActionFeedback({ text: `Prompt "${title}" actualizado y sincronizado en Firestore.` });
      } else {
        // Create new prompt
        await addPrompt({
          slug,
          title,
          description: (editingPrompt.description || '').trim(),
          body: editingPrompt.body.trim(),
          category: (editingPrompt.category as Category) || 'frontend',
          tools: editingPrompt.tools && editingPrompt.tools.length > 0 ? editingPrompt.tools : ['cursor', 'claude-code'],
          tags: editingPrompt.tags && editingPrompt.tags.length > 0 ? editingPrompt.tags : ['vibe-coding'],
          difficulty: (editingPrompt.difficulty as Difficulty) || 'intermediate',
          featured: !!editingPrompt.featured
        });
        setActionFeedback({ text: `Nuevo prompt "${title}" guardado en Firestore.` });
      }

      setEditingPrompt(null);
      setIsEditing(false);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error('Error saving prompt:', err);
      setActionFeedback({ text: 'Error al guardar el prompt en Firestore.', error: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeletePrompt = async () => {
    if (!promptToDelete) return;
    try {
      setIsDeleting(true);
      const title = promptToDelete.title;
      await deletePrompt(promptToDelete.id);
      setActionFeedback({ text: `Prompt "${title}" eliminado de Firestore.` });
      setPromptToDelete(null);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setActionFeedback({ text: 'Error al eliminar prompt de Firestore.', error: true });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setCommentToDelete(null);
      setActionFeedback({ text: 'Comentario eliminado de Firestore.' });
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleInsertVariable = (varName: string) => {
    if (!editingPrompt) return;
    const currentBody = editingPrompt.body || '';
    const insertion = `{{${varName}}}`;
    setEditingPrompt({
      ...editingPrompt,
      body: currentBody ? `${currentBody} ${insertion}` : insertion
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportPrompts());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vibeprompts-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    if (!jsonInput.trim()) return;
    const res = importPrompts(jsonInput);
    if (res.success) {
      setJsonMessage({ text: `Se importaron ${res.count} prompts con éxito.`, error: false });
      setJsonInput('');
    } else {
      setJsonMessage({ text: res.error || 'Error al importar', error: true });
    }
  };

  // Filtered prompts list for search
  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch = 
      !searchFilter.trim() || 
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.body.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-fade-in font-mono">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#050508] border border-white/10 rounded-[28px] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9a9a9a]">
              <Terminal className="w-3.5 h-3.5 text-[#8052ff]" />
              <span className="font-semibold text-white/90">vibeprompts://admin-console</span>
              <span className="text-emerald-400 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 font-mono">🔒 Cifrado SHA-256</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdminAuthed && (
              <button
                onClick={logoutAdmin}
                className="text-xs text-[#9a9a9a] hover:text-white transition-colors"
              >
                Cerrar Sesión
              </button>
            )}
            <button
              onClick={closeAdmin}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#9a9a9a] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Feedback Toast */}
        {actionFeedback && (
          <div className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b transition-all ${
            actionFeedback.error 
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}>
            {actionFeedback.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="flex-1 font-mono">{actionFeedback.text}</span>
            <button onClick={() => setActionFeedback(null)} className="text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content area: PIN lock screen OR Dashboard */}
        {!isAdminAuthed ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-[#8052ff]">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-normal text-white mb-2">Panel de Administrador</h2>
            <p className="text-xs text-[#9a9a9a] max-w-sm mb-6 font-light">
              Espacio exclusivo para crear, editar y eliminar prompts en Firestore, backups y moderación. Ingresa la clave autorizada.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Introduce la clave de administrador..."
                  autoFocus
                  disabled={isLoggingIn}
                  className={`w-full px-4 py-3 rounded-xl bg-black/60 border text-center text-sm tracking-normal text-white placeholder:text-[#9a9a9a] placeholder:text-xs focus:outline-none transition-colors ${
                    pinError ? 'border-rose-500' : 'border-white/15 focus:border-[#8052ff]'
                  }`}
                />
                <Key className="w-4 h-4 text-[#9a9a9a] absolute right-3 top-3.5" />
              </div>

              {pinError && (
                <div className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Clave no autorizada en la base de datos</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full btn-iris py-3 justify-center text-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoggingIn ? 'Verificando en Firestore...' : 'Desbloquear Consola'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 text-xs overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('prompts')}
                className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'prompts'
                    ? 'border-[#8052ff] text-white font-semibold'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Prompts ({prompts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'comments'
                    ? 'border-[#8052ff] text-white font-semibold'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Comunidad ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'json'
                    ? 'border-[#8052ff] text-white font-semibold'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Importar / Exportar
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'stats'
                    ? 'border-[#8052ff] text-white font-semibold'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Estadísticas
              </button>
            </div>

            {/* Tab 1: Prompts Management */}
            {activeTab === 'prompts' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">Gestión de Prompts</h3>
                    <p className="text-xs text-[#9a9a9a]">Edita cualquier parámetro, elimina o añade nuevos prompts a Firestore.</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingPrompt({
                        title: '',
                        slug: '',
                        description: '',
                        body: '',
                        category: 'frontend',
                        tools: ['cursor', 'claude-code'],
                        tags: ['vibe-coding'],
                        difficulty: 'intermediate',
                        featured: false
                      });
                      setIsEditing(true);
                    }}
                    className="btn-iris text-xs py-2 px-3 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Prompt</span>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-[#9a9a9a] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Buscar por título, contenido o tags..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#8052ff]"
                    />
                    {searchFilter && (
                      <button
                        onClick={() => setSearchFilter('')}
                        className="absolute right-3 top-2.5 text-xs text-[#9a9a9a] hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8052ff]"
                  >
                    <option value="all">Todas las categorías ({prompts.length})</option>
                    <option value="skills">Skills</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="debug">Debug</option>
                    <option value="refactor">Refactor</option>
                    <option value="testing">Testing</option>
                    <option value="ui">UI</option>
                    <option value="db">DB</option>
                    <option value="deploy">Deploy</option>
                  </select>
                </div>

                {/* Prompt List */}
                <div className="grid gap-3 pt-1">
                  {filteredPrompts.length === 0 ? (
                    <div className="text-center py-12 text-[#9a9a9a] text-xs">
                      No se encontraron prompts con los criterios de búsqueda.
                    </div>
                  ) : (
                    filteredPrompts.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#ffb829] mb-1">
                            <span className="uppercase font-semibold px-2 py-0.5 rounded bg-white/5 text-[#ffb829]">
                              {p.category}
                            </span>
                            <span className="text-white/20">·</span>
                            <span className="text-[#9a9a9a] capitalize">{p.difficulty}</span>
                            {p.featured && (
                              <>
                                <span className="text-white/20">·</span>
                                <span className="text-[#8052ff] bg-[#8052ff]/10 px-1.5 py-0.5 rounded text-[10px]">
                                  ★ Destacado
                                </span>
                              </>
                            )}
                            <span className="text-white/20">·</span>
                            <span className="text-[10px] text-[#9a9a9a] font-mono truncate max-w-[120px]">
                              /{p.slug}
                            </span>
                          </div>

                          <h4 className="text-sm font-medium text-white truncate">{p.title}</h4>
                          <p className="text-xs text-[#9a9a9a] truncate font-light mt-0.5">
                            {p.description || p.body.slice(0, 100)}
                          </p>

                          {/* Tools chips */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.tools?.slice(0, 4).map((tool) => (
                              <span key={tool} className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons: Edit and Delete */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => {
                              setEditingPrompt({ ...p });
                              setIsEditing(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#8052ff]/20 text-[#9a9a9a] hover:text-white text-xs transition-colors border border-white/10 hover:border-[#8052ff]/40"
                            title="Editar Prompt"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#8052ff]" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => setPromptToDelete(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#9a9a9a] hover:text-rose-300 text-xs transition-colors border border-white/10 hover:border-rose-500/40"
                            title="Eliminar Prompt"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Comments Moderation */}
            {activeTab === 'comments' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-white">Comentarios de la Comunidad</h3>
                    <p className="text-xs text-[#9a9a9a]">Modera o elimina reseñas y sugerencias enviadas a Firestore.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-xs text-[#9a9a9a] py-8 text-center">No hay comentarios aún en Firestore.</p>
                  ) : (
                    comments.map((c) => {
                      const relatedPrompt = prompts.find((p) => p.id === c.promptId);
                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs mb-1">
                              <span className="font-semibold text-white">{c.name || 'Anónimo'}</span>
                              <span className="text-[#ffb829]">★ {c.rating}/5</span>
                              <span className="text-[#9a9a9a] text-[11px] truncate">
                                en prompt: {relatedPrompt?.title || c.promptId}
                              </span>
                            </div>
                            <p className="text-xs text-[#bdbdbd] font-light leading-relaxed break-words">{c.message}</p>
                          </div>

                          {commentToDelete === c.id ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleConfirmDeleteComment(c.id)}
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium"
                              >
                                Sí, borrar
                              </button>
                              <button
                                onClick={() => setCommentToDelete(null)}
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-white/10 hover:bg-white/20 text-[#9a9a9a]"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCommentToDelete(c.id)}
                              className="p-2 rounded-lg hover:bg-rose-500/20 text-[#9a9a9a] hover:text-rose-400 transition-colors shrink-0"
                              title="Borrar comentario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: JSON Import & Export */}
            {activeTab === 'json' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-white">Importar y Exportar</h3>
                  <p className="text-xs text-[#9a9a9a]">Haz copias de seguridad de tus prompts personales o transfiere datos.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExport}
                    className="btn-iris text-xs py-2 px-4"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Backup JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas restaurar la colección a los prompts originales predeterminados?')) {
                        resetToDefaults();
                        setActionFeedback({ text: 'Se han restaurado los prompts predeterminados.' });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs border border-white/10 hover:border-amber-500/40 text-[#9a9a9a] hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#ffb829]" />
                    <span>Restaurar Predeterminados</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <label className="text-xs font-semibold text-white block">Pegar JSON para Importar:</label>
                  <textarea
                    rows={6}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[ { "title": "...", "body": "...", "category": "frontend", ... } ]'
                    className="w-full p-3 rounded-xl bg-black border border-white/15 text-xs text-white focus:outline-none focus:border-[#8052ff] resize-none font-mono"
                  />
                  
                  {jsonMessage && (
                    <div className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                      jsonMessage.error ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'
                    }`}>
                      {jsonMessage.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      <span>{jsonMessage.text}</span>
                    </div>
                  )}

                  <button
                    onClick={handleImport}
                    disabled={!jsonInput.trim()}
                    className="btn-iris text-xs py-2 px-4 disabled:opacity-40"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Procesar e Importar a Firestore</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Statistics */}
            {activeTab === 'stats' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-white">Métricas de la Biblioteca</h3>
                  <p className="text-xs text-[#9a9a9a]">Resumen de contenido y participación activa.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                    <span className="text-[11px] text-[#9a9a9a] uppercase block mb-1">Total Prompts</span>
                    <span className="text-3xl font-normal text-white">{prompts.length}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                    <span className="text-[11px] text-[#9a9a9a] uppercase block mb-1">Destacados</span>
                    <span className="text-3xl font-normal text-[#8052ff]">
                      {prompts.filter((p) => p.featured).length}
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                    <span className="text-[11px] text-[#9a9a9a] uppercase block mb-1">Comentarios</span>
                    <span className="text-3xl font-normal text-[#ffb829]">{comments.length}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                    <span className="text-[11px] text-[#9a9a9a] uppercase block mb-1">Rating Promedio</span>
                    <span className="text-3xl font-normal text-emerald-400">
                      {comments.length > 0 
                        ? (comments.reduce((a, b) => a + b.rating, 0) / comments.length).toFixed(1)
                        : '5.0'}
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <h4 className="text-xs uppercase text-[#9a9a9a] mb-3">Distribución por Categoría</h4>
                  <div className="space-y-2">
                    {['skills', 'frontend', 'backend', 'debug', 'refactor', 'testing', 'ui', 'db', 'deploy'].map((cat) => {
                      const count = prompts.filter((p) => p.category === cat).length;
                      const percent = prompts.length > 0 ? (count / prompts.length) * 100 : 0;
                      return (
                        <div key={cat} className="flex items-center gap-3 text-xs">
                          <span className="w-24 uppercase text-[#9a9a9a]">{cat}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full bg-[#8052ff] rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-white/80">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* In-App Delete Prompt Confirmation Dialog */}
      {promptToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0e0f17] border border-rose-500/30 rounded-2xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">¿Eliminar este prompt?</h4>
                <p className="text-xs text-[#9a9a9a]">Esta acción borrará el registro de Firestore.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              <p className="font-semibold text-white truncate">{promptToDelete.title}</p>
              <p className="text-[#9a9a9a] text-[11px] truncate mt-0.5">ID: {promptToDelete.id}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPromptToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#9a9a9a] hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeletePrompt}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar prompt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Prompt Editor Modal */}
      {isEditing && editingPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSavePrompt}
            className="w-full max-w-2xl max-h-[92vh] bg-[#0c0c12] border border-white/20 rounded-[24px] p-5 sm:p-6 flex flex-col space-y-4 overflow-y-auto text-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8052ff]/20 text-[#8052ff] flex items-center justify-center text-xs">
                  {editingPrompt.id ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-medium">
                  {editingPrompt.id ? 'Editar Prompt' : 'Nuevo Prompt'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#9a9a9a] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#9a9a9a] mb-1 font-medium">Título del Prompt *</label>
                <input
                  required
                  type="text"
                  value={editingPrompt.title || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                  placeholder="Ej: Single-Turn Feature Prototype"
                  className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9a9a9a] mb-1 font-medium">Slug URL (identificador)</label>
                  <input
                    type="text"
                    value={editingPrompt.slug || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, slug: e.target.value })}
                    placeholder="auto-generado si se deja vacío"
                    className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[#9a9a9a] mb-1 font-medium">Categoría *</label>
                  <select
                    value={editingPrompt.category || 'frontend'}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, category: e.target.value as Category })}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff]"
                  >
                    <option value="skills">Skills (Superpoderes para IA)</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="debug">Debug</option>
                    <option value="refactor">Refactor</option>
                    <option value="testing">Testing</option>
                    <option value="ui">UI</option>
                    <option value="db">DB</option>
                    <option value="deploy">Deploy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9a9a9a] mb-1 font-medium">Descripción Breve *</label>
                <input
                  required
                  type="text"
                  value={editingPrompt.description || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                  placeholder="Qué problema resuelve este prompt y qué ventaja ofrece"
                  className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9a9a9a] mb-1 font-medium">Dificultad</label>
                  <select
                    value={editingPrompt.difficulty || 'intermediate'}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, difficulty: e.target.value as Difficulty })}
                    className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff]"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9a9a9a] mb-1 font-medium">Herramientas (separadas por coma)</label>
                  <input
                    type="text"
                    value={editingPrompt.tools ? editingPrompt.tools.join(', ') : 'cursor, claude-code'}
                    onChange={(e) =>
                      setEditingPrompt({
                        ...editingPrompt,
                        tools: e.target.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
                      })
                    }
                    placeholder="cursor, claude-code, v0, bolt, copilot"
                    className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#9a9a9a] font-medium">
                    Cuerpo del Prompt *
                  </label>
                  <span className="text-[10px] text-[#ffb829]">Variables dinámicas: &#123;&#123;nombre&#125;&#125;</span>
                </div>

                {/* Variable quick inserter chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-[10px] text-[#9a9a9a]">Insertar variable:</span>
                  {['framework', 'componente', 'requisito', 'estilo', 'archivo', 'lenguaje'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#8052ff]/20 text-[#8052ff] text-[10px] border border-white/10 hover:border-[#8052ff]/40 transition-colors"
                    >
                      + &#123;&#123;{v}&#125;&#125;
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={8}
                  value={editingPrompt.body || ''}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, body: e.target.value })}
                  placeholder="Escribe el prompt completo aquí. Puedes incluir {{variable}} para que los usuarios las personalicen..."
                  className="w-full p-3 rounded-xl bg-black border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#8052ff] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#9a9a9a] mb-1 font-medium">Tags (separados por coma)</label>
                <input
                  type="text"
                  value={editingPrompt.tags ? editingPrompt.tags.join(', ') : 'vibe-coding'}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      tags: e.target.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
                    })
                  }
                  placeholder="vibe-coding, react, tailwind, typescript"
                  className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-[#8052ff]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={!!editingPrompt.featured}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, featured: e.target.checked })}
                  className="rounded border-white/20 bg-black text-[#8052ff] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="featured" className="text-white cursor-pointer select-none text-xs">
                  Marcar como prompt destacado (aparece destacado en el scroll 3D)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#9a9a9a] hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-iris text-xs py-2 px-5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando en Firestore...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingPrompt.id ? 'Guardar Cambios' : 'Crear Prompt'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
