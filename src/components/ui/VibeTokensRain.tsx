import React, { useEffect, useState } from 'react';
import { sound } from '../../utils/audio';

export interface VibeToken {
  id: number;
  x: number;
  delay: number;
  spin: number;
  tilt: number;
  glyph: string;
  color: string;
}

const GLYPHS = ['✦', '</>', '{ }', '⌘', '⚡', 'λ', '★', '⌥'];
const COLORS = ['#8052ff', '#ffb829', '#00e5ff', '#10b981', '#f43f5e'];

export const triggerVibeTokenBurst = () => {
  window.dispatchEvent(new CustomEvent('vibe-token-burst'));
  sound.playChime();
};

export const VibeTokensRain: React.FC = () => {
  const [tokens, setTokens] = useState<VibeToken[]>([]);

  const spawnBurst = () => {
    const newTokens: VibeToken[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.floor(Math.random() * 85) + 5, // 5% to 90%
      delay: i * 0.08,
      spin: Math.floor(Math.random() * 360),
      tilt: Math.floor(Math.random() * 30) - 15,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    setTokens((prev) => [...prev, ...newTokens]);

    // Cleanup after animation completes
    setTimeout(() => {
      setTokens((prev) => prev.filter((t) => !newTokens.some((nt) => nt.id === t.id)));
    }, 4500);
  };

  useEffect(() => {
    const handler = () => spawnBurst();
    window.addEventListener('vibe-token-burst', handler);
    return () => window.removeEventListener('vibe-token-burst', handler);
  }, []);

  if (tokens.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {tokens.map((token) => (
        <div
          key={token.id}
          className="absolute -top-12 flex items-center justify-center rounded-2xl w-10 h-10 shadow-lg border backdrop-blur-md"
          style={{
            left: `${token.x}%`,
            borderColor: `${token.color}66`,
            backgroundColor: `${token.color}22`,
            color: token.color,
            animation: `tokenFall 3.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${token.delay}s forwards`
          }}
        >
          <span className="font-mono text-sm font-bold select-none drop-shadow-sm">
            {token.glyph}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes tokenFall {
          0% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          75% {
            transform: translateY(85vh) rotateX(720deg) rotateY(360deg) rotateZ(180deg) scale(1.05);
          }
          85% {
            transform: translateY(78vh) rotateX(760deg) rotateY(390deg) rotateZ(190deg) scale(0.95);
          }
          100% {
            transform: translateY(82vh) rotateX(780deg) rotateY(400deg) rotateZ(200deg) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
