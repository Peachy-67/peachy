import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [flagsForAlert, setFlagsForAlert] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check for high-risk flags for immediate alert
  useEffect(() => {
    if (!analysisResult) {
      setFlagsForAlert([]);
      return;
    }

    // Extract high-risk flags from signals
    const highRiskDetected = analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    setFlagsForAlert(highRiskDetected);
  }, [analysisResult]);

  // Handler when conversation is analyzed in ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setShowDashboard(false); // switch to analyzer view on manual analyze
  };

  // Handler to reset alert dismissal
  // The ImmediateAlert component handles its own dismissal internally
  // Here, if flagsForAlert updates we show alert again

  // Handlers to switch dashboard mode
  const toggleDashboard = () => {
    setShowDashboard((show) => !show);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header style={{ textAlign: 'center', marginBottom: '1.5rem', userSelect: 'none' }}>
        <h1 style={{ color: '#cc2f2f', fontWeight: '900', fontSize: '2.2rem', margin: 0, letterSpacing: '0.03em' }}>
          FLAGGED
        </h1>
        <p style={{ marginTop: '0.3rem', fontWeight: '600', fontSize: '1rem', color: '#6a3a3a' }}>
          Detect red flags in conversations
        </p>
      </header>

      <section aria-label="Conversation input and analysis controls" style={{ marginBottom: '1rem' }}>
        {!showDashboard ? (
          <ConversationAnalyzerPolish onAnalyze={handleAnalysisUpdate} />
        ) : (
          <RealTimeDashboard onAnalyze={handleAnalysisUpdate} />
        )}

        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          style={{ marginTop: '1.25rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {flagsForAlert.length > 0 && <ImmediateAlert flaggedBehaviors={flagsForAlert} />}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || 'Safe'}
            flaggedBehaviors={
              analysisResult.signals.map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: 1, // Confidence not individually provided here; assume 1 for now
              })) || []
            }
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;