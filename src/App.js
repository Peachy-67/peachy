import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'discard', 'threat', 'ultimatum']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  // Handle analysis updates from analyzer or realtime dashboard
  const onAnalysisUpdate = (result) => {
    setError(null);
    setAnalysisResult(result);

    // Determine if any high-risk flags are present
    const flaggedTypes = (result?.signals || []).filter((flag) => HIGH_RISK_FLAGS.has(flag));
    setAlertFlags(flaggedTypes);

    // Show alert if there are high-risk flags
    if (flaggedTypes.length > 0) {
      if (typeof window !== 'undefined' && window.alert) {
        // Native alert dialog
        window.alert(`Warning: High-risk flags detected: ${flaggedTypes.join(', ')}`);
      }
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
    }
  };

  // Handle errors from analyzer or dashboard
  const onError = (err) => {
    setAnalysisResult(null);
    setAlertVisible(false);
    setAlertFlags([]);
    setError(err);
  };

  // Dismiss alert banner handler
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle view between paste analyzer and realtime dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    setAlertVisible(false);
    setAlertFlags([]);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <header style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none' }}>
        <h1 style={{ color: '#cc2f2f' }}>FLAGGED</h1>
        <p style={{ fontWeight: '600', marginTop: '-0.5rem', fontSize: '1.1rem' }}>
          Detect red flags in conversations
        </p>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to paste analyzer view' : 'Switch to real-time dashboard view'}
          className="peachy-button"
          style={{ marginTop: '10px' }}
          type="button"
        >
          {showDashboard ? 'Use Paste Conversation Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </header>

      {alertVisible && alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={onAnalysisUpdate} onError={onError} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} onError={onError} />

          {error && (
            <div
              className="alert-banner"
              role="alert"
              aria-live="assertive"
              style={{ marginTop: '1rem' }}
            >
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence,
                }))}
                overallConfidence={analysisResult.confidence}
              />

              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;