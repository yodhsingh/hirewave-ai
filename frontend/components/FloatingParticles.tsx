'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; delay: number; duration: number }>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set flag to indicate we're on client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Generate particles only on client side after initial mount
    if (isClient && typeof window !== 'undefined') {
      const newParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10,
      }));
      setParticles(newParticles);
    }
  }, [isClient]);

  if (!isClient || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            y: [particle.y, particle.y - 150],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}