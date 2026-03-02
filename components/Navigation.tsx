import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onBack: () => void;
  title: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onBack, title }) => {
  if (currentView === AppView.HOME) return null;

  return (
    <div className="flex items-center px-4 pt-5 pb-2">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/70 shadow-sm border border-stone-200 hover:bg-white transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={18} className="text-stone-600" />
      </button>
      {title && (
        <h1 className="ml-3 text-base font-semibold text-stone-700 tracking-wide">
          {title}
        </h1>
      )}
    </div>
  );
};

export default Navigation;
