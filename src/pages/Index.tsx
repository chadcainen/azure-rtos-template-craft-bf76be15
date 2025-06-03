
import React, { useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import MainInterface from '@/components/MainInterface';

const Index: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleBackToWelcome = () => {
    setShowWelcome(true);
  };

  return (
    <div className="min-h-screen">
      {showWelcome ? (
        <WelcomeScreen onGetStarted={handleGetStarted} />
      ) : (
        <MainInterface onBackToWelcome={handleBackToWelcome} />
      )}
    </div>
  );
};

export default Index;
