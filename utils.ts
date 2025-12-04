import { SIX_SIGNS, TREND_WEIGHTS } from './constants';
import { SignData, ContextType, TrendDataPoint, SignId, Reading } from './types';
import { EffectRarity } from './components/RarityEffects';

const STORAGE_INTENTION_KEY = 'ethereal_intention_v1';
const INTENTION_LOCK_MS = 3 * 60 * 1000; // 3 minutes

interface IntentionData {
  timestamp: number;
  signId: number;
}

/**
 * STRICT SIX-SIGN ENGINE (Deterministic)
 * Returns the sign based on the current minute.
 */
export const calculateMomentSign = (date: Date = new Date()): SignData => {
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const H = date.getHours();
  const Min = date.getMinutes();

  const sum = Y + M + D + H + Min;
  
  let index = sum % 6;
  if (index === 0) index = 6;

  return SIX_SIGNS[index];
};

/**
 * Get or Compute Intention (3-minute lock)
 * Returns the active sign for the current intention window.
 */
export const getOrComputeMomentSign = (): { sign: SignData; isNew: boolean } => {
  const now = Date.now();
  let stored: IntentionData | null = null;
  
  try {
    const raw = localStorage.getItem(STORAGE_INTENTION_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch(e) {}

  // Check if lock is active
  if (stored && (now - stored.timestamp < INTENTION_LOCK_MS)) {
    return { sign: SIX_SIGNS[stored.signId], isNew: false };
  }

  // Generate new intention
  const newSign = calculateMomentSign(new Date());
  const newData: IntentionData = { timestamp: now, signId: newSign.id };
  localStorage.setItem(STORAGE_INTENTION_KEY, JSON.stringify(newData));
  
  return { sign: newSign, isNew: true };
};

/**
 * VISUAL RARITY PICKER (Purely Cosmetic)
 * Target Weights: Green 55%, Blue 30%, Purple 12%, Gold 3%
 */
export const pickVisualRarity = (): EffectRarity => {
  const roll = Math.random() * 100;
  if (roll < 3) return 'legendary';
  if (roll < 15) return 'rare';
  if (roll < 45) return 'uncommon';
  return 'common';
};

// Legacy support
export const calculateSign = calculateMomentSign;

export const detectContext = (question: string): ContextType => {
  const q = question.toLowerCase();
  if (q.includes('job') || q.includes('work') || q.includes('career') || q.includes('business') || q.includes('money') || q.includes('contract') || q.includes('sell') || q.includes('buy')) {
    return 'CAREER';
  }
  if (q.includes('love') || q.includes('relationship') || q.includes('marriage') || q.includes('date') || q.includes('crush') || q.includes('ex') || q.includes('feeling')) {
    return 'LOVE';
  }
  return 'GENERAL';
};

export const getInterpretation = (sign: SignData, context: ContextType): string => {
  if (context === 'CAREER') return sign.description.career;
  if (context === 'LOVE') return sign.description.love;
  return sign.description.general;
};

export const generateTrendData = (days: number, historySeed: SignId[] = []): TrendDataPoint[] => {
  const data: TrendDataPoint[] = [];
  const now = new Date();
  
  let currentCareer = 50;
  let currentWealth = 50;
  let currentLove = 50;

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    
    const signId = historySeed[i] || (Math.floor(Math.random() * 6) + 1);
    const weights = TREND_WEIGHTS[signId] || { career: 0, wealth: 0, love: 0 };
    
    currentCareer = Math.max(20, Math.min(95, currentCareer + (weights.career * 5) + (Math.random() * 4 - 2)));
    currentWealth = Math.max(20, Math.min(95, currentWealth + (weights.wealth * 5) + (Math.random() * 4 - 2)));
    currentLove = Math.max(20, Math.min(95, currentLove + (weights.love * 5) + (Math.random() * 4 - 2)));

    data.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      career: Math.floor(currentCareer),
      wealth: Math.floor(currentWealth),
      love: Math.floor(currentLove),
    });
  }
  return data;
};

// --- History Storage Helpers ---

const STORAGE_KEY = 'ethereal_readings_v1';

export const saveReading = (reading: Omit<Reading, 'id' | 'timestamp'>) => {
  const history = getReadings();
  const newReading: Reading = {
    ...reading,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  
  const updated = [newReading, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newReading;
};

export const getReadings = (): Reading[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

// --- Analytics Helpers ---

const ANALYTICS_KEY = 'ethereal_cookie_analytics';

export interface CookieRevealEvent {
  timestamp: number;
  variant: string;
  rarity: string;
}

export const logCookieReveal = (variant: string, rarity: string) => {
  try {
    const history = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    const event: CookieRevealEvent = {
      timestamp: Date.now(),
      variant,
      rarity
    };
    history.push(event);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Analytics error", e);
  }
};
