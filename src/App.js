import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

/**
 * Main App component integrating conversation analyzer, immediate alert,
 * flagged results visualization, shareable results, and real-time dashboard.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Update alert flags based on analysis result's high risk flags
  useEffect(() => {
    setAlertDismissed(false);
    if (analysisResult && analysisResult.signals && analysisResult.signals.length > 0) {
      // According to past records, high-risk flags include insult, gaslighting, discard, manipulation, control.
      // We'll consider insult, gaslighting, discard, manipulation, control as high risk.
      const highRiskFlags = ['insult', 'gaslighting', 'discard', 'manipulation', 'control', 'threat', 'ultimatum'];
      const foundHighRiskFlags = analysisResult.signals.filter((flag) =>
        highRiskFlags.includes(flag.toLowerCase())
      );
      setAlertFlags(foundHighRiskFlags);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to update analysis result from ConversationAnalyzerPolish or RealTimeDashboard manual update
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Dismiss immediate alert banner
  const handleDismissAlert = () => {
    setAlertDismissed(true);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis tool">
      <header>
        <h1 style={{ textAlign: 'center', userSelect: 'none', color: '#cc2f2f', marginBottom: '1rem' }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Main conversation analysis input and results">
        {/* Conversation Analyzer */}
        <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />

        {/* Immediate alert for high risk flags */}
        {!alertDismissed && alertFlags.length > 0 && (
          <ImmediateAlert alertFlags={alertFlags} onDismiss={handleDismissAlert} />
        )}

        {/* Show flagged results and share */}
        {analysisResult && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || 'Safe'}
              flaggedBehaviors={
                analysisResult.signals
                  ? analysisResult.signals.map((type) => ({
                      type,
                      label: type.charAt(0).toUpperCase() + type.slice(1),
                      confidence: analysisResult.confidence || 1.0,
                    }))
                  : []
              }
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult analysis={analysisResult} />
          </>
        )}
      </section>

      {/* Toggle real-time dashboard */}
      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: '2rem' }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          style={{ display: 'block', margin: '0 auto' }}
        >
          {showDashboard ? 'Hide Real-Time Dashboard' : 'Show Real-Time Dashboard'}
        </button>
        {showDashboard && <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />}
      </section>
    </main>
  );
};

export default App;