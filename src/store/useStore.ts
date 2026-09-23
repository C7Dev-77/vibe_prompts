import { create } from 'zustand';
import { Prompt, Comment, Category, Difficulty } from '../types';
import initialPrompts from '../data/prompts.json';
import initialComments from '../data/comments.json';
import {
  initPromptsSync,
  initCommentsSync,
  savePromptToCloud,
  deletePromptFromCloud,
  saveCommentToCloud,
  deleteCommentFromCloud,
  subscribeToUserFavorites,
  toggleFavoriteInCloud,
  verifyAdminKeyInFirestore
} from '../services/firestoreSync';
import { safeObjectSanitizer, sanitizeInput } from '../utils/security';

const PROMPTS_KEY = 'vp_prompts';
const COMMUNITY_KEY = 'vp_community';
const THEME_KEY = 'vp_theme';
const FAVORITES_KEY = 'vp_favorites';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface StoreState {
  prompts: Prompt[];
  comments: Comment[];
  favorites: string[];
  theme: 'dark' | 'light';
  searchQuery: string;
  selectedCategory: Category | 'all';
  selectedTool: string | 'all';
  selectedDifficulty: Difficulty | 'all';
  
  // Auth & Cloud Sync
  user: AuthUserProfile | null;
  isCloudSynced: boolean;
  
  // Admin panel
  isAdminOpen: boolean;
  isAdminAuthed: boolean;
  
  // Actions
  setUser: (user: AuthUserProfile | null) => void;
  toggleFavorite: (promptId: string) => Promise<void>;
  isFavorite: (promptId: string) => boolean;
  initSync: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: Category | 'all') => void;
  setSelectedTool: (tool: string | 'all') => void;
  setSelectedDifficulty: (difficulty: Difficulty | 'all') => void;
  toggleTheme: () => void;
  
  // Prompt CRUD
  addPrompt: (promptData: Omit<Prompt, 'id' | 'createdAt'>) => Promise<Prompt>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  getPromptBySlug: (slug: string) => Prompt | undefined;
  
  // Community Comments
  addComment: (commentData: Omit<Comment, 'id' | 'createdAt'>) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  getCommentsForPrompt: (promptId: string) => Comment[];
  getPromptRating: (promptId: string) => { average: number; count: number };
  
  // Admin
  openAdmin: () => void;
  closeAdmin: () => void;
  authenticateAdmin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
  importPrompts: (jsonString: string) => { success: boolean; count?: number; error?: string };
  exportPrompts: () => string;
  resetToDefaults: () => void;
}

const loadStoredPrompts = (): Prompt[] => {
  try {
    const raw = localStorage.getItem(PROMPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: Prompt) => p.id));
        const missing = (initialPrompts as Prompt[]).filter((p) => !existingIds.has(p.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(PROMPTS_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading prompts from localStorage', e);
  }
  return initialPrompts as Prompt[];
};

const loadStoredComments = (): Comment[] => {
  try {
    const raw = localStorage.getItem(COMMUNITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading comments from localStorage', e);
  }
  return initialComments as Comment[];
};

const loadStoredFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading favorites from localStorage', e);
  }
  return [];
};

const loadStoredTheme = (): 'dark' | 'light' => {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch (e) {
    console.error('Error loading theme', e);
  }
  return 'dark';
};

let favUnsubscribe: (() => void) | null = null;

export const useStore = create<StoreState>((set, get) => ({
  prompts: loadStoredPrompts(),
  comments: loadStoredComments(),
  favorites: loadStoredFavorites(),
  theme: loadStoredTheme(),
  searchQuery: '',
  selectedCategory: 'all',
  selectedTool: 'all',
  selectedDifficulty: 'all',
  
  user: null,
  isCloudSynced: false,
  isAdminOpen: false,
  isAdminAuthed: false,

  setUser: (user) => {
    set({ user });
    if (favUnsubscribe) {
      favUnsubscribe();
      favUnsubscribe = null;
    }
    if (user) {
      favUnsubscribe = subscribeToUserFavorites(user.uid, (cloudFavs) => {
        set({ favorites: cloudFavs });
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(cloudFavs));
      });
    }
  },

  initSync: () => {
    initPromptsSync((cloudPrompts) => {
      set({ prompts: cloudPrompts, isCloudSynced: true });
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(cloudPrompts));
    });

    initCommentsSync((cloudComments) => {
      set({ comments: cloudComments });
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(cloudComments));
    });
  },

  toggleFavorite: async (promptId: string) => {
    const current = get().favorites;
    const isFav = current.includes(promptId);
    const updated = isFav ? current.filter((id) => id !== promptId) : [...current, promptId];
    set({ favorites: updated });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

    const user = get().user;
    if (user) {
      try {
        await toggleFavoriteInCloud(user.uid, promptId, isFav);
      } catch (err) {
        console.error('Error updating favorite in cloud:', err);
      }
    }
  },

  isFavorite: (promptId: string) => {
    return get().favorites.includes(promptId);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch (e) {
      console.error('Error saving theme', e);
    }
    set({ theme: newTheme });
  },

  addPrompt: async (promptData) => {
    const newPrompt: Prompt = {
      ...promptData,
      id: `vp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newPrompt, ...get().prompts];
    try {
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving prompts', e);
    }
    set({ prompts: updated });
    await savePromptToCloud(newPrompt);
    return newPrompt;
  },

  updatePrompt: async (id, updates) => {
    const updated = get().prompts.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const target = updated.find((p) => p.id === id);
    try {
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving prompts', e);
    }
    set({ prompts: updated });
    if (target) {
      try {
        await savePromptToCloud(target);
      } catch (err) {
        console.error('Error updating prompt in Firestore:', err);
      }
    }
  },

  deletePrompt: async (id) => {
    const updated = get().prompts.filter((p) => p.id !== id);
    try {
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving prompts', e);
    }
    set({ prompts: updated });
    try {
      await deletePromptFromCloud(id);
    } catch (err) {
      console.error('Error deleting prompt from Firestore:', err);
    }
  },

  getPromptBySlug: (slug) => {
    return get().prompts.find((p) => p.slug === slug || p.id === slug);
  },

  addComment: async (commentData) => {
    const cleanName = commentData.name ? sanitizeInput(commentData.name, 60) : null;
    const cleanMessage = sanitizeInput(commentData.message, 1500);

    const newComment: Comment = {
      promptId: commentData.promptId,
      name: cleanName || null,
      message: cleanMessage,
      rating: Math.min(5, Math.max(1, Math.round(commentData.rating || 5))),
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newComment, ...get().comments];
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving comments', e);
    }
    set({ comments: updated });
    try {
      await saveCommentToCloud(newComment);
    } catch (err) {
      console.error('Error syncing comment to Firestore:', err);
    }
    return newComment;
  },

  deleteComment: async (id) => {
    const updated = get().comments.filter((c) => c.id !== id);
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving comments', e);
    }
    set({ comments: updated });
    await deleteCommentFromCloud(id);
  },

  getCommentsForPrompt: (promptId) => {
    return get().comments.filter((c) => c.promptId === promptId);
  },

  getPromptRating: (promptId) => {
    const promptComments = get().comments.filter((c) => c.promptId === promptId && c.rating > 0);
    if (promptComments.length === 0) return { average: 5.0, count: 0 };
    const sum = promptComments.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Number((sum / promptComments.length).toFixed(1));
    return { average: avg, count: promptComments.length };
  },

  openAdmin: () => set({ isAdminOpen: true }),
  closeAdmin: () => set({ isAdminOpen: false }),
  
  authenticateAdmin: async (pin) => {
    const isValid = await verifyAdminKeyInFirestore(pin);
    if (isValid) {
      set({ isAdminAuthed: true });
      return true;
    }
    return false;
  },
  
  logoutAdmin: () => set({ isAdminAuthed: false }),

  importPrompts: (jsonString) => {
    try {
      const rawParsed = JSON.parse(jsonString);
      if (!Array.isArray(rawParsed)) {
        return { success: false, error: 'El archivo JSON debe contener un arreglo de prompts.' };
      }
      const safePrompts: Prompt[] = [];
      for (const rawItem of rawParsed) {
        const item = safeObjectSanitizer(rawItem);
        if (!item.title || !item.body || !item.category) {
          return { success: false, error: 'Cada prompt debe tener al menos title, body y category.' };
        }
        safePrompts.push({
          id: String(item.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
          slug: String(item.slug || item.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')),
          title: sanitizeInput(String(item.title), 150),
          description: sanitizeInput(String(item.description || ''), 500),
          body: String(item.body),
          category: item.category,
          tools: Array.isArray(item.tools) ? item.tools.map((t: any) => String(t)) : ['cursor'],
          tags: Array.isArray(item.tags) ? item.tags.map((tg: any) => String(tg)) : ['vibe-coding'],
          difficulty: item.difficulty || 'intermediate',
          featured: Boolean(item.featured),
          createdAt: String(item.createdAt || new Date().toISOString())
        });
      }
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(safePrompts));
      set({ prompts: safePrompts });
      // Bulk sync to Firestore
      for (const p of safePrompts) {
        savePromptToCloud(p).catch(console.error);
      }
      return { success: true, count: safePrompts.length };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al procesar JSON';
      return { success: false, error: message };
    }
  },

  exportPrompts: () => {
    return JSON.stringify(get().prompts, null, 2);
  },

  resetToDefaults: () => {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(initialPrompts));
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(initialComments));
    set({
      prompts: initialPrompts as Prompt[],
      comments: initialComments as Comment[]
    });
    for (const p of initialPrompts as Prompt[]) {
      savePromptToCloud(p).catch(console.error);
    }
  }
}));
