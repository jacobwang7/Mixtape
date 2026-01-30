'use client';

import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  startX: number;
  driftX: number;
  size: number;
  duration: number;
}

interface Props {
  active: boolean;
}

export default function FallingHearts({ active }: Props) {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (!active) {
      setHearts([]);
      return;
    }

    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          startX: Math.random() * 100,
          driftX: -50 + Math.random() * 100,
          size: 16 + Math.random() * 16,
          duration: 5 + Math.random() * 3,
        },
      ]);
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  // Keep only the latest ~30 hearts to prevent memory leak
  useEffect(() => {
    if (!active) return;
    const cleanup = setInterval(() => {
      setHearts(prev => prev.slice(-30));
    }, 1000);
    return () => clearInterval(cleanup);
  }, [active]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {hearts.map(h => (
        <img
          key={h.id}
          src="/pixel/heartpix.png"
          className="absolute animate-heart-float"
          style={{
            left: `${h.startX}%`,
            top: '-10%',
            width: h.size,
            animationDuration: `${h.duration}s`,
            ['--drift-x' as any]: `${h.driftX}px`,
          }}
        />
      ))}
    </div>
  );
}
