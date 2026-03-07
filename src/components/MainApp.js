import React from 'react';
import ConversationAnalyzerPolish from './ConversationAnalyzerPolish';
import ImmediateAlert from './ImmediateAlert';
import RealTimeDashboard from './RealTimeDashboard';
import './MainApp.css';

const MainApp = () => {
  return (
    <main className="main-app-container">
      <h1 className="app-title">FLAGGED Conversation Analyzer</h1>
      <section className="analyzer-section" aria-label="Conversation Analyzer section">
        <ConversationAnalyzerPolish />
      </section>
      <ImmediateAlert />
      <section className="dashboard-section" aria-label="Real-time Monitoring Dashboard section">
        <RealTimeDashboard />
      </section>
    </main>
  );
};

export default MainApp;