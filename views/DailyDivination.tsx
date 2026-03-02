import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, RefreshCw } from 'lucide-react';
import { getOrComputeMomentSign, pickVisualRarity, saveReading } from '../utils';
import { RarityEffects } from '../components/RarityEffects';
import { THEMES, PREMIUM_PRICE } from '../constants';
import { SignData } from '../types';

interface DailyDivinationProps {
  isPremium: boolean;
  onUnlock: () => void;
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary ✦',
};

export const DailyDivination: React.FC<DailyDivinationProps> = ({ isPremium, onUnlock }) => {
  const [revealed, setRevealed] = useState(false);
  const [sign, setSign] = useState<SignData | null>(null);
  const [rarity, setRarity] = useState<ReturnType<typeof pickVisualRarity>>('common');
  const theme = THEMES.moment;

  const handleReveal = () => {
    const { sign: s } = getOrComputeMomentSign();
    const r = pickVisualRarity();
    setSign(s);
    setRarity(r);
    setRevealed(true);

    saveReading({
      type: 'MOMENT',
      signName: s.name,
    });
  };

  const handleReset = () => {
    setRevealed(false);
    setSign(null);
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-6 gap-5">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6 mt-8"
          >
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center shadow-lg`}>
              <Sparkles size={36} className="text-white" />
            </div>
            <p className="text-stone-600 text-center text-sm px-6">
              Center yourself and tap to reveal the energy of this moment.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReveal}
              className={`px-8 py-3 rounded-full bg-gradient-to-r ${theme.primary} text-white font-semibold shadow-md`}
            >
              Reveal My Sign
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {sign && (
              <>
                <RarityEffects rarity={rarity}>
                  <div className={`p-5 rounded-2xl ${theme.secondary}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                        {RARITY_LABELS[rarity]}
                      </span>
                      <span className="text-xs text-stone-400">{sign.element}</span>
                    </div>
                    <h2 className={`text-2xl font-bold ${theme.text}`}>{sign.name}</h2>
                    <p className="text-sm text-stone-500 mt-0.5">{sign.chineseName}</p>
                    <p className={`mt-3 text-sm font-medium ${theme.text}`}>{sign.shortConclusion}</p>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{sign.description.general}</p>
                  </div>
                </RarityEffects>

                {/* Guidance */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Action Guidance</p>
                  <p className="text-sm text-stone-700">{sign.actionGuidance}</p>
                </div>

                {/* Premium insights */}
                {isPremium ? (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 grid grid-cols-2 gap-3">
                    {Object.entries(sign.momentInsights).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs font-semibold text-stone-400 capitalize mb-0.5">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-xs text-stone-600">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={onUnlock}
                    className="flex items-center gap-2 justify-center py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-semibold shadow"
                  >
                    <Lock size={14} />
                    Unlock Deep Insights · {PREMIUM_PRICE}
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 justify-center text-stone-400 text-sm mt-1"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyDivination;
