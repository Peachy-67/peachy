import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "discard",
  "threat",
  "ultimatum",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDashboard, setShowDashboard] = useState(false);

  // Immediate alert flags to trigger
  const [alertFlags, setAlertFlags] = useState([]);

  // Handler for when a new analysis is done (from ConversationAnalyzerPolish)
  const handleAnalysisUpdate = (result, err = null) => {
    setError(err);
    setAnalysisResult(result);
    setLoading(false);

    if (result && Array.isArray(result.signals)) {
      const highRiskDetected = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  };

  // Clear alerts on dismiss from ImmediateAlert component
  const handleAlertDismiss = () => {
    setAlertFlags([]);
  };

  // Toggle real-time dashboard and clear existing result/alerts when switching
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation Red Flag Detection App">
      <header>
        <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED</h1>
        <p style={{ textAlign: 'center', marginTop: 0, marginBottom: '1.5rem', color: '#666' }}>
          Detect red flags in conversations. Paste text below to analyze, or monitor conversations live.
        </p>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard} aria-label="Toggle real-time dashboard">
            {showDashboard ? 'Switch to Paste Analyzer' : 'Switch to Real-Time Dashboard'}
          </button>
        </div>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          alertFlags={alertFlags}
          loading={loading}
          error={error}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish 
            onResult={handleAnalysisUpdate}
            loading={loading}
            setLoading={setLoading}
            error={error}
          />

          {alertFlags.length > 0 && (
            <ImmediateAlert flags={alertFlags} onDismiss={handleAlertDismiss} />
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label || 'Safe'}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult
                verdict={analysisResult.verdict.label || 'Safe'}
                signals={analysisResult.signals}
                confidence={analysisResult.confidence || 0}
                why={analysisResult.why}
                watch_next={analysisResult.watch_next}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;