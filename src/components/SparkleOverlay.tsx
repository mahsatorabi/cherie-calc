import React, { useEffect, useState } from 'react';

export interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
  size: number;
  rotation: number;
  vx: number;
  vy: number;
}

const SYMBOLS = ['✨', '💖', '🎀', '🌸', '⭐', '🍓', '💫', '🧁'];

export function useSparkles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnSparkle = (x?: number, y?: number, count = 3) => {
    // If no coordinates passed, spawn around center of screen
    const clientX = x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const clientY = y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 200);

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 3.5;
      newParticles.push({
        id: Date.now() + Math.random(),
        x: clientX + (Math.random() - 0.5) * 30,
        y: clientY + (Math.random() - 0.5) * 20,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        size: 14 + Math.floor(Math.random() * 10),
        rotation: (Math.random() - 0.5) * 45,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.5,
      });
    }

    setParticles((prev) => [...prev.slice(-16), ...newParticles]);
  };

  useEffect(() => {
    if (particles.length === 0) return;

    const timer = setTimeout(() => {
      setParticles([]);
    }, 700);

    return () => clearTimeout(timer);
  }, [particles]);

  return { particles, spawnSparkle };
}

export const SparkleOverlay: React.FC<{ particles: Particle[] }> = ({ particles }) => {
  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-sparkle-float select-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            fontSize: `${p.size}px`,
            transform: `translate(${p.vx * 15}px, ${p.vy * 18}px) rotate(${p.rotation}deg)`,
            transition: 'all 0.65s cubic-bezier(0.1, 0.8, 0.3, 1)',
            opacity: 0,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};
