import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { generateTrendData } from '../utils';
import { PREMIUM_PRICE } from '../constants';

interface TrendForecastProps {
  isPremium: boolean;
  onUnlock: () => void;
}

export const TrendForecast: React.FC<TrendForecastProps> = ({ isPremium, onUnlock }) => {
  const data = useMemo(() => generateTrendData(7), []);

  return (
    <div className="flex flex-col px-4 pt-4 pb-6 gap-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        {/* Header card */}
        <div className="bg-gradient-to-br from-emerald-200 to-teal-300 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-emerald-900" />
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-widest">7-Day Forecast</span>
          </div>
          <p className="text-sm text-emerald-800">
            Your destiny currents across career, wealth, and love.
          </p>
        </div>

        {/* Chart */}
        {isPremium ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="career" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="wealth" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="love" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 relative overflow-hidden">
            {/* Blurred preview */}
            <div className="blur-sm pointer-events-none">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Line type="monotone" dataKey="career" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="wealth" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="love" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
              <Lock size={24} className="text-stone-400 mb-2" />
              <p className="text-sm font-semibold text-stone-600 mb-3">Premium Feature</p>
              <button
                onClick={onUnlock}
                className="flex items-center gap-2 py-2 px-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-sm font-semibold shadow"
              >
                Unlock for {PREMIUM_PRICE}
              </button>
            </div>
          </div>
        )}

        {/* Legend summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Career', color: 'bg-sky-400', key: 'career' },
            { label: 'Wealth', color: 'bg-emerald-400', key: 'wealth' },
            { label: 'Love', color: 'bg-rose-400', key: 'love' },
          ].map(({ label, color, key }) => {
            const latest = data[data.length - 1]?.[key as keyof typeof data[0]] as number;
            return (
              <div key={key} className="bg-white rounded-xl p-3 shadow-sm border border-stone-100 text-center">
                <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-1`} />
                <p className="text-xs font-semibold text-stone-500">{label}</p>
                {isPremium ? (
                  <p className="text-lg font-bold text-stone-800">{latest}</p>
                ) : (
                  <Lock size={14} className="mx-auto text-stone-300 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default TrendForecast;
