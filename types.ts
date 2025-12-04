export enum SignId {
  GreatPeace = 1,
  SwiftJoy = 2,
  RedConflict = 3,
  SmallFortune = 4,
  VoidMisfortune = 5,
  RapidChange = 6,
}

export type ContextType = 'GENERAL' | 'CAREER' | 'LOVE';

export interface SignInterpretation {
  general: string;
  career: string;
  love: string;
}

export interface MomentInsights {
  risks: string;
  opportunities: string;
  timing: string;
  influencingFactor: string;
}

export interface OracleInsights {
  shortAnswer: string;
  strategicMoves: string;
  underlyingForce: string;
  shadowAspect: string;
}

export interface SignData {
  id: SignId;
  name: string;
  chineseName: string;
  shortConclusion: string;
  description: SignInterpretation; 
  actionGuidance: string;
  element: string;
  momentInsights: MomentInsights;
  oracleInsights: OracleInsights;
}

export interface Reading {
  id: string;
  timestamp: number;
  type: 'MOMENT' | 'QUESTION';
  signName: string;
  question?: string;
  shortAnswer?: string; // For history display
}

export enum AppView {
  HOME = 'HOME',
  MOMENT = 'MOMENT', 
  QUESTION = 'QUESTION',
  TREND = 'TREND',
  HISTORY = 'HISTORY',
}

export interface TrendDataPoint {
  day: string;
  career: number;
  wealth: number;
  love: number;
}