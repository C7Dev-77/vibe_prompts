import React, { useState } from 'react';
import { Star, MessageSquare, Send, Check, User } from 'lucide-react';
import { Comment } from '../../types';
import { useStore } from '../../store/useStore';
import confetti from 'canvas-confetti';

interface CommunitySectionProps {
  promptId: string;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ promptId }) => {
  const { getCommentsForPrompt, addComment, user } = useStore();
  const comments = getCommentsForPrompt(promptId);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Friendly avatar emojis for anonymous community
  const anonymousEmojis = ['⚡', '✨', '🪐', '🔮', '🚀', '👾', '🌟', '💻'];

  // Relative timestamp helper
  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'hace unos instantes';
    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    // Anti-spam flood rate limit: 15s cooldown per browser
    const lastPost = localStorage.getItem('vp_last_comment_time');
    const now = Date.now();
    if (lastPost && now - parseInt(lastPost, 10) < 15000) {
      const waitSec = Math.ceil((15000 - (now - parseInt(lastPost, 10))) / 1000);
      setRateLimitError(`Protección anti-spam: Espera ${waitSec}s antes de enviar otro comentario.`);
      setTimeout(() => setRateLimitError(null), 4000);
      return;
    }

    try {
      setIsSubmitting(true);
      setRateLimitError(null);
      await addComment({
        promptId,
        name: name.trim() ? name.trim() : null,
        message: message.trim(),
        rating
      });

      localStorage.setItem('vp_last_comment_time', String(now));
      setSubmitted(true);
      setMessage('');
      if (!user) setName('');

      // Trigger visual confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8052ff', '#ffb829', '#15846e', '#ffffff']
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    } catch (err) {
      console.error('Error al guardar comentario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Average rating
  const avgRating = comments.length > 0
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
    : '5.0';

  return (
    <div className="mt-16 pt-12 border-t border-slate-200/80 dark:border-white/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#d97706] dark:text-[#ffb829]">
            Feedback & Experiencias
          </span>
          <h2 className="text-[32px] font-normal tracking-tight text-slate-900 dark:text-white mt-1">
            Comunidad Anónima
          </h2>
          <p className="text-sm font-light text-slate-600 dark:text-[#9a9a9a] mt-1">
            Comparte cómo se comportó tu modelo de IA con este prompt o tus ajustes recomendados.
          </p>
        </div>

        {/* Global score */}
        <div className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl px-5 py-3 self-start md:self-auto shadow-sm dark:shadow-none">
          <div className="flex items-center gap-1 text-[#d97706] dark:text-[#ffb829]">
            <Star className="w-5 h-5 fill-[#d97706] dark:fill-[#ffb829]" />
            <span className="text-xl font-mono tabular-nums text-slate-900 dark:text-white font-medium">{avgRating}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#9a9a9a] font-light">
            ({comments.length} {comments.length === 1 ? 'opinión' : 'opiniones'})
          </span>
        </div>
      </div>

      {/* Submission Form */}
      <form 
        onSubmit={handleSubmit}
        className="mb-12 p-6 md:p-8 rounded-[24px] bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-600 dark:text-[#9a9a9a] font-nav">Tu Calificación:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-slate-300 dark:text-white/20 hover:text-[#d97706] dark:hover:text-[#ffb829] transition-colors"
                >
                  <Star
                    className={`w-5 h-5 transition-transform ${
                      (hoverRating !== null ? hoverRating >= star : rating >= star)
                        ? 'fill-[#d97706] dark:fill-[#ffb829] text-[#d97706] dark:text-[#ffb829] scale-110'
                        : 'text-slate-300 dark:text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-64">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre o alias (opcional: Anónimo)"
              maxLength={40}
              className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>
        </div>

        <div className="mb-4">
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿Qué modelo usaste (Cursor, Claude, GPT-4o)? ¿Qué tal fue el resultado o qué variación recomiendas?"
            className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#7c3aed] resize-none"
          />
        </div>

        {rateLimitError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono">
            ⚠️ {rateLimitError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-[#9a9a9a] font-light">
            100% anónimo. No se guardan cookies ni cuentas.
          </span>

          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="btn-iris disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Send className="w-3.5 h-3.5 animate-pulse" />
                <span>Publicando en Firestore...</span>
              </>
            ) : submitted ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Publicado con éxito!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Comentario</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-[#9a9a9a] font-light">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-white/20" />
            <p>Sé el primero en calificar o dejar una sugerencia para este prompt.</p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const isAnon = !comment.name;
            const emojiAvatar = anonymousEmojis[index % anonymousEmojis.length];

            return (
              <div
                key={comment.id}
                className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex gap-4 items-start shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-sm">
                  {isAnon || !comment.name ? (
                    <span>{emojiAvatar}</span>
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-white/80">
                      {comment.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {comment.name || 'Vibe Coder Anónimo'}
                      </span>
                      <span className="opacity-30 text-xs">·</span>
                      <span className="text-xs text-slate-500 dark:text-[#9a9a9a] font-light">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < comment.rating
                              ? 'fill-[#d97706] dark:fill-[#ffb829] text-[#d97706] dark:text-[#ffb829]'
                              : 'text-slate-200 dark:text-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-[#bdbdbd] font-light leading-relaxed mt-1">
                    {comment.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
