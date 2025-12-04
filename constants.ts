import { SignData, SignId } from './types';
import { Sparkles, MessageCircleQuestion, TrendingUp, Sun } from 'lucide-react';

export const PREMIUM_PRICE = "$2.99";
export const PREMIUM_PACK_NAME = "Mystic Insight Pack";

export const SIX_SIGNS: Record<number, SignData> = {
  1: {
    id: SignId.GreatPeace,
    name: 'Great Peace',
    chineseName: 'Da An (大安)',
    shortConclusion: 'Stability and solid foundations.',
    description: {
      general: 'Great Peace represents a time of profound stability and immobility. Like a mountain, it stands firm. The energy is calm, secure, and favoring the status quo.',
      career: 'A steady flow of operations. Ideal for consolidating resources and planning long-term. No sudden changes.',
      love: 'Relationships are harmonious and stable. A quiet, reliable connection rather than a passionate storm.'
    },
    actionGuidance: 'Stay put. Trust the slow process.',
    element: 'Wood',
    momentInsights: {
      risks: 'Complacency or missing fast-moving opportunities.',
      opportunities: 'Deepening bonds and securing assets.',
      timing: 'Most auspicious in the early morning.',
      influencingFactor: 'Elders or mentors providing support.'
    },
    oracleInsights: {
      shortAnswer: 'Favorable & Stable',
      strategicMoves: 'Stick to the plan. Do not pivot.',
      underlyingForce: 'Persistence and accumulation.',
      shadowAspect: 'Stubbornness.'
    }
  },
  2: {
    id: SignId.SwiftJoy,
    name: 'Swift Joy',
    chineseName: 'Su Xi (速喜)',
    shortConclusion: 'Immediate breakthrough and good news.',
    description: {
      general: 'Swift Joy is like a sudden burst of sunlight. The energy is fast, bright, and fleeting. Good news arrives quickly.',
      career: 'Opportunities accelerate. Approvals come fast. A good time to launch or present.',
      love: 'Sparks fly. Sudden texts, invitations, or happy surprises in romance.'
    },
    actionGuidance: 'Act now. The window is short.',
    element: 'Fire',
    momentInsights: {
      risks: 'Impulsiveness and lack of detail.',
      opportunities: 'Quick profits or viral attention.',
      timing: 'Noon is the peak time.',
      influencingFactor: 'News from the south.'
    },
    oracleInsights: {
      shortAnswer: 'Yes, Quickly',
      strategicMoves: 'Make the call. Send the email.',
      underlyingForce: 'Acceleration.',
      shadowAspect: 'Superficial results.'
    }
  },
  3: {
    id: SignId.RedConflict,
    name: 'Red Conflict',
    chineseName: 'Chi Kou (赤口)',
    shortConclusion: 'Tension and friction.',
    description: {
      general: 'Red Conflict warns of sharp words and jagged energy. Disagreements and obstacles are likely.',
      career: 'Workplace tension. Arguments with colleagues or demanding clients. Check fine print.',
      love: 'Misunderstandings can escalate. Avoid heavy emotional talks today.'
    },
    actionGuidance: 'Silence is golden. Lay low.',
    element: 'Metal',
    momentInsights: {
      risks: 'Permanent rifts from temporary anger.',
      opportunities: 'Cutting through lies to find truth.',
      timing: 'Avoid midday interactions.',
      influencingFactor: 'Gossip or misinformation.'
    },
    oracleInsights: {
      shortAnswer: 'Difficult / Conflict',
      strategicMoves: 'Delay meetings. Protect yourself.',
      underlyingForce: 'Friction.',
      shadowAspect: 'Aggression.'
    }
  },
  4: {
    id: SignId.SmallFortune,
    name: 'Small Fortune',
    chineseName: 'Xiao Ji (小吉)',
    shortConclusion: 'Gradual improvements and wins.',
    description: {
      general: 'Small Fortune is gentle, nurturing growth. Small wins accumulate into success. A smooth path forward.',
      career: 'Steady profits and good networking. Collaboration goes well.',
      love: 'Sweet, easy-going interactions. Good for dates and social gatherings.'
    },
    actionGuidance: 'Network and negotiate. Celebrate small wins.',
    element: 'Water',
    momentInsights: {
      risks: 'Settling for good instead of great.',
      opportunities: 'Help from friends or peers.',
      timing: 'Morning and evening are best.',
      influencingFactor: 'Social connections.'
    },
    oracleInsights: {
      shortAnswer: 'Positive',
      strategicMoves: 'Collaborate. Negotiate.',
      underlyingForce: 'Flow and harmony.',
      shadowAspect: 'Lack of ambition.'
    }
  },
  5: {
    id: SignId.VoidMisfortune,
    name: 'Empty Void',
    chineseName: 'Kong Wang (空亡)',
    shortConclusion: 'Stagnation and emptiness.',
    description: {
      general: 'Empty Void suggests a drain of energy. Plans may dissolve or turn out to be illusions. A time to retreat.',
      career: 'Projects stall. Promises fall through. Do not sign contracts.',
      love: 'Feeling disconnected or lonely. Emotional unavailability.'
    },
    actionGuidance: 'Retreat and recharge. Do nothing.',
    element: 'Earth',
    momentInsights: {
      risks: 'Loss of resources or energy.',
      opportunities: 'Spiritual insight and introspection.',
      timing: 'Wait for the cycle to shift.',
      influencingFactor: 'Hidden variables.'
    },
    oracleInsights: {
      shortAnswer: 'Unfavorable / Void',
      strategicMoves: 'Wait. Audit resources.',
      underlyingForce: 'Reset.',
      shadowAspect: 'Despair.'
    }
  },
  6: {
    id: SignId.RapidChange,
    name: 'Rapid Change',
    chineseName: 'Ji Su (急速)',
    shortConclusion: 'Movement and travel.',
    description: {
      general: 'Rapid Change signifies movement, transit, or a shift in location. Things are in motion, physically or metaphorically.',
      career: 'Business trips, logistics, or transferring departments. Keep moving to stay ahead.',
      love: 'Long-distance matters or a relationship moving to a new phase quickly.'
    },
    actionGuidance: 'Get moving. Adapt to the shift.',
    element: 'Wind',
    momentInsights: {
      risks: 'Moving too fast and missing details.',
      opportunities: 'Expansion into new territories.',
      timing: 'Afternoon favors movement.',
      influencingFactor: 'Travel or distant news.'
    },
    oracleInsights: {
      shortAnswer: 'Moving / Changing',
      strategicMoves: 'Pivot. Go to the source.',
      underlyingForce: 'Transit.',
      shadowAspect: 'Instability.'
    }
  },
};

export const TREND_WEIGHTS: Record<number, { career: number; wealth: number; love: number }> = {
  1: { career: 2, wealth: 1, love: 1 },   // Great Peace
  2: { career: 2, wealth: 2, love: 1 },   // Swift Joy
  3: { career: -2, wealth: -1, love: -2 },// Red Conflict
  4: { career: 1, wealth: 1, love: 1 },   // Small Fortune
  5: { career: -2, wealth: -2, love: -1 },// Empty Void
  6: { career: 1, wealth: 0, love: 0 }    // Rapid Change
};

export const THEMES = {
  moment: {
    primary: 'from-amber-200 to-orange-400',
    secondary: 'bg-orange-50',
    text: 'text-orange-900',
    icon: Sun,
    accent: 'orange'
  },
  question: {
    primary: 'from-sky-300 to-teal-400',
    secondary: 'bg-sky-50',
    text: 'text-sky-900',
    icon: MessageCircleQuestion,
    accent: 'sky'
  },
  trend: {
    primary: 'from-emerald-300 to-teal-400',
    secondary: 'bg-emerald-50',
    text: 'text-emerald-900',
    icon: TrendingUp,
    accent: 'emerald'
  }
};