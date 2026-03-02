import React from 'react';
import { motion } from 'framer-motion';
import { Sun, MessageCircleQuestion, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

const cards = [
  {
    view: AppView.MOMENT,
    label: 'Moment Reading',
    sub: 'What does this moment hold?',
    icon: Sun,
    gradient: 'from-amber-200 to-orange-300',
    text: 'text-orange-900',
  },
  {
    view: AppView.QUESTION,
    label: 'Oracle',
    sub: 'Ask your burning question',
    icon: MessageCircleQuestion,
    gradient: 'from-sky-200 to-teal-300',
    text: 'text-sky-900',
  },
  {
    view: AppView.TREND,
    label: 'Destiny Trends',
    sub: '7-day energy forecast',
    icon: TrendingUp,
    gradient: 'from-emerald-200 to-teal-300',
    text: 'text-emerald-900',
  },
  {
    view: AppView.HISTORY,
    label: 'My History',
    sub: 'Review past readings',
    icon: Clock,
    gradient: 'from-violet-200 to-purple-300',
    text: 'text-violet-900',
  },
];

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col px-4 pt-8 pb-6 gap-6">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles size={22} className="text-amber-500" />
          <h1 className="text-2xl font-bold text-stone-800 tracking-wide">Mystic Path</h1>
          <Sparkles size={22} className="text-amber-500" />
        </div>
        <p className="text-sm text-stone-500">Six-Sign Oracle · Ancient Wisdom</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              onClick={() => onNavigate(card.view)}
              className={`flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-sm active:scale-95 transition-transform text-left`}
            >
              <Icon size={24} className={`${card.text} mb-3`} />
              <span className={`text-sm font-semibold ${card.text}`}>{card.label}</span>
              <span className={`text-xs mt-0.5 opacity-70 ${card.text}`}>{card.sub}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-stone-400 mt-2">
        For entertainment purposes only
      </p>
    </div>
  );
};

export default Home;
