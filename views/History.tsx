import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock, MessageCircleQuestion, Sun } from 'lucide-react';
import { getReadings } from '../utils';
import { Reading } from '../types';
import { PREMIUM_PRICE } from '../constants';

interface HistoryProps {
  isPremium: boolean;
  onUnlock: () => void;
}

const FREE_HISTORY_LIMIT = 3;

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const History: React.FC<HistoryProps> = ({ isPremium, onUnlock }) => {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    setReadings(getReadings());
  }, []);

  const visibleReadings = isPremium ? readings : readings.slice(0, FREE_HISTORY_LIMIT);
  const lockedCount = readings.length - visibleReadings.length;

  return (
    <div className="flex flex-col px-4 pt-4 pb-6 gap-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-200 to-purple-300 rounded-2xl p-4 shadow-md"
      >
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-violet-900" />
          <span className="text-xs font-semibold text-violet-900 uppercase tracking-widest">
            Past Readings
          </span>
        </div>
        <p className="text-sm text-violet-800 mt-1">
          {readings.length === 0
            ? 'No readings yet. Start a session to build your history.'
            : `${readings.length} reading${readings.length === 1 ? '' : 's'} recorded`}
        </p>
      </motion.div>

      {/* Reading list */}
      {visibleReadings.length === 0 && (
        <p className="text-center text-stone-400 text-sm mt-6">
          Your history will appear here after your first reading.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {visibleReadings.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-start gap-3"
          >
            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${r.type === 'MOMENT' ? 'bg-orange-100' : 'bg-sky-100'}`}>
              {r.type === 'MOMENT' ? (
                <Sun size={16} className="text-orange-500" />
              ) : (
                <MessageCircleQuestion size={16} className="text-sky-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400 uppercase">
                  {r.type === 'MOMENT' ? 'Moment' : 'Oracle'}
                </span>
                <span className="text-xs text-stone-300">{formatDate(r.timestamp)}</span>
              </div>
              <p className="text-sm font-semibold text-stone-700 mt-0.5">{r.signName}</p>
              {r.question && (
                <p className="text-xs text-stone-400 mt-0.5 truncate italic">"{r.question}"</p>
              )}
              {r.shortAnswer && (
                <p className="text-xs text-sky-600 mt-0.5">{r.shortAnswer}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Locked older readings */}
      {!isPremium && lockedCount > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={14} className="text-stone-300" />
            <p className="text-sm text-stone-400">
              {lockedCount} older reading{lockedCount > 1 ? 's' : ''} hidden
            </p>
          </div>
          <button
            onClick={onUnlock}
            className="w-full flex items-center gap-2 justify-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-400 to-purple-400 text-white text-sm font-semibold shadow"
          >
            <Lock size={13} />
            Unlock Full History · {PREMIUM_PRICE}
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
