import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, Sparkles } from 'lucide-react';
import { calculateSign, detectContext, getInterpretation, saveReading } from '../utils';
import { THEMES, PREMIUM_PRICE } from '../constants';
import { SignData, ContextType } from '../types';

interface QuestionDivinationProps {
  isPremium: boolean;
  onUnlock: () => void;
}

export const QuestionDivination: React.FC<QuestionDivinationProps> = ({ isPremium, onUnlock }) => {
  const [question, setQuestion] = useState('');
  const [sign, setSign] = useState<SignData | null>(null);
  const [context, setContext] = useState<ContextType>('GENERAL');
  const [submitted, setSubmitted] = useState(false);
  const theme = THEMES.question;

  const handleSubmit = () => {
    if (!question.trim()) return;
    const s = calculateSign();
    const ctx = detectContext(question);
    setSign(s);
    setContext(ctx);
    setSubmitted(true);

    saveReading({
      type: 'QUESTION',
      signName: s.name,
      question: question.trim(),
      shortAnswer: s.oracleInsights.shortAnswer,
    });
  };

  const handleReset = () => {
    setQuestion('');
    setSign(null);
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-6 gap-5">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${theme.primary} mx-auto mt-4 shadow-md`}>
              <Sparkles size={28} className="text-white" />
            </div>
            <p className="text-stone-500 text-center text-sm">
              Ask your question and let the Oracle guide you.
            </p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is your question for the Oracle?"
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-sm"
              rows={4}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!question.trim()}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r ${theme.primary} text-white font-semibold shadow-md disabled:opacity-50`}
            >
              <Send size={16} />
              Consult the Oracle
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
                {/* Question recap */}
                <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                  <p className="text-xs text-stone-400 mb-1">Your question</p>
                  <p className="text-sm text-stone-700 italic">"{question}"</p>
                </div>

                {/* Main sign card */}
                <div className={`p-5 rounded-2xl bg-gradient-to-br ${theme.primary} shadow-md`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                      {context} context
                    </span>
                    <span className="text-xs text-white/70">{sign.element}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{sign.name}</h2>
                  <p className="text-sm text-white/80 mt-0.5">{sign.chineseName}</p>
                  <div className="mt-3 bg-white/20 rounded-xl px-3 py-2">
                    <p className="text-white font-semibold text-sm">
                      {sign.oracleInsights.shortAnswer}
                    </p>
                  </div>
                </div>

                {/* Interpretation */}
                <div className={`bg-white rounded-2xl p-4 shadow-sm border border-stone-100`}>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Interpretation</p>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {getInterpretation(sign, context)}
                  </p>
                </div>

                {/* Premium Oracle insights */}
                {isPremium ? (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-stone-400 mb-0.5">Strategic Move</p>
                      <p className="text-xs text-stone-600">{sign.oracleInsights.strategicMoves}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 mb-0.5">Underlying Force</p>
                      <p className="text-xs text-stone-600">{sign.oracleInsights.underlyingForce}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 mb-0.5">Shadow Aspect</p>
                      <p className="text-xs text-stone-600">{sign.oracleInsights.shadowAspect}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 mb-0.5">Action Guidance</p>
                      <p className="text-xs text-stone-600">{sign.actionGuidance}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onUnlock}
                    className="flex items-center gap-2 justify-center py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 to-teal-400 text-white text-sm font-semibold shadow"
                  >
                    <Lock size={14} />
                    Unlock Oracle Insights · {PREMIUM_PRICE}
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="text-center text-stone-400 text-sm"
                >
                  Ask another question
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionDivination;
