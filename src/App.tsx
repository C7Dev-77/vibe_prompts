import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Prompts } from './pages/Prompts';
import { PromptDetail } from './pages/PromptDetail';
import { AdminModal } from './components/admin/AdminModal';
import { VibeTokensRain } from './components/ui/VibeTokensRain';
import { useStore } from './store/useStore';
import { auth } from './lib/firebase';

// Auto scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const theme = useStore((s) => s.theme);
  const setUser = useStore((s) => s.setUser);
  const initSync = useStore((s) => s.initSync);

  // Initialize Firebase Auth listener and Cloud sync
  useEffect(() => {
    initSync();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, initSync]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#8052ff] selection:text-white transition-colors duration-200 relative">
        {/* Ambient Light Mode Atmosphere (Radiant gradients + Architectural Dot Grid) */}
        {theme === 'light' && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700">
            {/* Soft electric iris ambient bloom */}
            <div 
              className="absolute -top-[12%] -right-[8%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full bg-gradient-to-br from-[#7c3aed]/10 via-[#a855f7]/6 to-transparent blur-3xl animate-pulse" 
              style={{ animationDuration: '8s' }} 
            />
            
            {/* Soft azure/sky bloom */}
            <div className="absolute top-[30%] -left-[12%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-tr from-[#0284c7]/8 via-[#38bdf8]/5 to-transparent blur-3xl" />
            
            {/* Soft amber sparkle bloom */}
            <div className="absolute bottom-[8%] right-[12%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-tl from-[#f59e0b]/7 via-[#fbbf24]/4 to-transparent blur-3xl" />
            
            {/* Subtle precision blueprint dot matrix grid */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.22) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                maskImage: 'radial-gradient(ellipse 95% 85% at 50% 45%, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 45%, black 40%, transparent 100%)'
              }}
            />
          </div>
        )}

        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/prompts/:slug" element={<PromptDetail />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        <AdminModal />
        <VibeTokensRain />
      </div>
    </BrowserRouter>
  );
}
