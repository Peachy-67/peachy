import React, { useState } from 'react';
import ConversationAnalyzerPolish from './ConversationAnalyzerPolish';
import ImmediateAlert from './ImmediateAlert';
import RealTimeDashboard from './RealTimeDashboard';
import './MainApp.css';

const MainApp = () => {
  const [flaggedBehaviors, setFlaggedBehaviors] = useState([]);

  // Callback to update flagged behaviors from ConversationAnalyzerPolish or RealTimeDashboard
  const handleFlagsUpdate = (flags) => {
    setFlaggedBehaviors(flags || []);
  };

  return (
    <div className="app-container" role="main" aria-label="FLAGGED Conversation Analysis Application">
      <header className="app-header">
        <h1 tabIndex={0}>FLAGGED: Conversation Red Flag Detector</h1>
        <p className="app-tagline">
          Paste conversations to detect insults, manipulation, gaslighting, discard, and control behaviors.
        </p>
      </header>

      <main className="app-main">
        <section aria-label="Conversation Analyzer Section" className="section-analyzer">
          <ConversationAnalyzerPolish onFlagsUpdate={handleFlagsUpdate} />
        </section>

        <section aria-label="Immediate Alert Notifications" className="section-alerts">
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />
        </section>

        <section aria-label="Real-Time Monitoring Dashboard" className="section-dashboard">
          <RealTimeDashboard onFlagsUpdate={handleFlagsUpdate} />
        </section>
      </main>

      <footer className="app-footer" aria-label="Footer">
        <small>
          &copy; 2024 FLAGGED.run - Helping you spot red flags in conversations.
        </small>
      </footer>
    </div>
  );
};

export default MainApp;