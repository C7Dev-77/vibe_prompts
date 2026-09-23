import React, { useState } from 'react';
import { LogIn, LogOut, User as UserIcon, Cloud, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { loginWithGoogle, logoutUser } from '../../lib/firebase';

export const AuthButton: React.FC = () => {
  const user = useStore((s) => s.user);
  const isCloudSynced = useStore((s) => s.isCloudSynced);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-xs active:scale-95"
        title="Iniciar sesión con Google para sincronizar tus favoritos en la nube"
      >
        <LogIn className="w-3.5 h-3.5 text-[#7c3aed] dark:text-[#8052ff]" />
        <span className="hidden sm:inline">
          {loading ? 'Conectando...' : 'Acceder'}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs font-mono"
        title={user.email || 'Usuario'}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Avatar'}
            className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-white/20"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] dark:text-[#8052ff] flex items-center justify-center font-bold text-[10px]">
            {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
          </div>
        )}
        <span className="max-w-[80px] sm:max-w-[110px] truncate text-slate-800 dark:text-slate-200 font-medium text-[11px]">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-code p-4 shadow-xl z-50 animate-drop-in space-y-3"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="border-b border-slate-200/80 dark:border-white/10 pb-2.5">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {user.displayName || 'Usuario'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#9a9a9a] truncate font-mono">
              {user.email}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              <Cloud className="w-3 h-3" />
              <span>{isCloudSynced ? 'Firestore Sincronizado' : 'Conectado a Firebase'}</span>
              <Check className="w-3 h-3" />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <span>Cerrar sesión</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
