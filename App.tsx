import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { Home } from './views/Home';
import { DailyDivination } from './views/DailyDivination';
import { QuestionDivination } from './views/QuestionDivination';
import { TrendForecast } from './views/TrendForecast';
import { History } from './views/History';
import { AppView } from './types';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [isPremium, setIsPremium] = useState(false);

  const handleUnlock = () => {
    // Simulate purchase
    setIsPremium(true);
  };

  const getTitle = () => {
    switch (view) {
      case AppView.MOMENT: return 'Moment Reading';
      case AppView.QUESTION: return 'Oracle';
      case AppView.TREND: return 'Destiny Trends';
      case AppView.HISTORY: return 'My History';
      default: return '';
    }
  };

  const renderView = () => {
    switch (view) {
      case AppView.HOME:
        return <Home onNavigate={setView} />;
      case AppView.MOMENT:
        return <DailyDivination isPremium={isPremium} onUnlock={handleUnlock} />;
      case AppView.QUESTION:
        return <QuestionDivination isPremium={isPremium} onUnlock={handleUnlock} />;
      case AppView.TREND:
        return <TrendForecast isPremium={isPremium} onUnlock={handleUnlock} />;
      case AppView.HISTORY:
        return <History isPremium={isPremium} onUnlock={handleUnlock} />;
      default:
        return <Home onNavigate={setView} />;
    }
  };

  return (
    <Layout>
      <Navigation 
        currentView={view} 
        onBack={() => setView(AppView.HOME)} 
        title={getTitle()}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
