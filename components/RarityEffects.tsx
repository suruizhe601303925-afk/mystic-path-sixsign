import React from 'react';
import { motion } from 'framer-motion';

export type EffectRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

interface RarityEffectsProps {
  rarity: EffectRarity;
  children: React.ReactNode;
}

const rarityConfig: Record<EffectRarity, { glow: string; border: string; particles: boolean }> = {
  common: {
    glow: '',
    border: 'border-stone-300',
    particles: false,
  },
  uncommon: {
    glow: 'shadow-lg shadow-emerald-200',
    border: 'border-emerald-400',
    particles: false,
  },
  rare: {
    glow: 'shadow-xl shadow-sky-300',
    border: 'border-sky-400',
    particles: true,
  },
  legendary: {
    glow: 'shadow-2xl shadow-amber-400',
    border: 'border-amber-400',
    particles: true,
  },
};

const Particle: React.FC<{ index: number; color: string; top: number; left: number }> = ({ index, color, top, left }) => (
  <motion.div
    className={`absolute w-1.5 h-1.5 rounded-full ${color} opacity-0`}
    style={{
      top: `${top}%`,
      left: `${left}%`,
    }}
    animate={{
      opacity: [0, 1, 0],
      y: [0, -20 - index * 5],
      x: [0, (index % 2 === 0 ? 1 : -1) * (5 + index * 3)],
    }}
    transition={{
      duration: 1.5 + index * 0.2,
      repeat: Infinity,
      delay: index * 0.3,
      ease: 'easeOut',
    }}
  />
);

export const RarityEffects: React.FC<RarityEffectsProps> = ({ rarity, children }) => {
  const config = rarityConfig[rarity];
  const particleColor =
    rarity === 'legendary' ? 'bg-amber-400' : 'bg-sky-400';

  const particlePositions = React.useMemo(
    () => Array.from({ length: 8 }, () => ({ top: Math.random() * 100, left: Math.random() * 100 })),
    []
  );

  return (
    <div className={`relative rounded-2xl border-2 ${config.border} ${config.glow} overflow-hidden`}>
      {config.particles && (
        <div className="absolute inset-0 pointer-events-none">
          {particlePositions.map((pos, i) => (
            <Particle key={i} index={i} color={particleColor} top={pos.top} left={pos.left} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

export default RarityEffects;
