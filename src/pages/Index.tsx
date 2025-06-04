
import React, { useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import ProjectUpload from '@/components/ProjectUpload';
import MainInterface from '@/components/MainInterface';

const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'upload' | 'main'>('welcome');
  const [projectData, setProjectData] = useState<any>(null);

  const handleGetStarted = () => {
    setCurrentView('upload');
  };

  const handleProjectLoaded = (projectStructure: any) => {
    setProjectData(projectStructure);
    setCurrentView('main');
  };

  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setProjectData(null);
  };

  return (
    <div className="min-h-screen">
      {currentView === 'welcome' && (
        <WelcomeScreen onGetStarted={handleGetStarted} />
      )}
      {currentView === 'upload' && (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <ProjectUpload onProjectLoaded={handleProjectLoaded} />
          </div>
        </div>
      )}
      {currentView === 'main' && (
        <MainInterface 
          onBackToWelcome={handleBackToWelcome}
          projectData={projectData}
        />
      )}
    </div>
  );
};

export default Index;
