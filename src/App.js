import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';
import './styles/FlaggedResultVisualization.css';
import './styles/ImmediateAlert.css';

const HIGH_RISK_FLAGS = ['insult', 'threat', 'gaslighting', 'ultimatum'];

const App = () => {
  // State for current analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for alerts shown (list of flag types currently alerted)
  const [alertFlags, setAlertFlags] = useState([]);
  // State for errors from analysis component
  const [error, setError] = useState(null);
  // State to toggle between paste conversation analyzer and real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Callback when analysis updates (from ConversationAnalyzerPolish or RealTimeDashboard)
  const onAnalysisUpdate = useCallback((resultOrError) => {
    if (resultOrError?.error) {
      setError(resultOrError.error);
      setAnalysisResult(null);
      setAlertFlags([]);
      return;
    }
    setError(null);
    setAnalysisResult(resultOrError);

    // Detect high risk flags in latest signals (analysisResult signals)
    const flags = Array.isArray(resultOrError?.signals) ? resultOrError.signals : [];
    const detectedHighRiskFlags = flags.filter((f) => HIGH_RISK_FLAGS.includes(f));

    setAlertFlags(detectedHighRiskFlags);
  }, []);

  // Handler to dismiss alert banner for immediate alerts
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis application">
      <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED Conversation Analyzer</h1>

      <section aria-label="Toggle between conversation analyzer and real-time monitoring dashboard" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => {
            setShowDashboard((prev) => !prev);
            // Clear current results and alerts on toggle to reduce confusion
            setAnalysisResult(null);
            setAlertFlags([]);
            setError(null);
          }}
          aria-pressed={showDashboard}
          aria-live="polite"
          aria-label={`Switch to ${showDashboard ? 'Conversation Analyzer' : 'Real-Time Dashboard'}`}
        >
          {showDashboard ? 'Switch to Conversation Analyzer' : 'Switch to Real-Time Dashboard'}
        </button>
      </section>

      {alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      <section aria-label={showDashboard ? 'Real-time conversation monitoring dashboard' : 'Conversation analysis input form'}>
        {showDashboard ? (
          <RealTimeDashboard onAnalysis={onAnalysisUpdate} />
        ) : (
          <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} />
        )}
      </section>

      {(analysisResult && !showDashboard) && (
        <section
          aria-label="Conversation analysis result visualization with verdict, flagged behaviors and confidence score"
          style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}
        >
          <FlaggedResultVisualization
            verdict={
              // Map verdict band to standard VerdictDisplay accepted labels
              analysisResult.verdict && analysisResult.verdict.band
                ? {
                    green: 'Safe',
                    yellow: 'Caution',
                    red: 'Flagged',
                  }[analysisResult.verdict.band] || 'Safe'
                : 'Safe'
            }
            flaggedBehaviors={(analysisResult.signals || []).map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: 1, // Confidence not available per signal here, use 1 as default
            }))}
            overallConfidence={typeof analysisResult.confidence === 'number' ? analysisResult.confidence : 0}
          />
        </section>
      )}

      {(analysisResult && !showDashboard) && (
        <section aria-label="Share conversation analysis result" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      {error && (
        <section role="alert" aria-live="assertive" style={{ marginTop: '1rem', color: '#cc2f2f', fontWeight: '700', textAlign: 'center' }}>
          {error}
        </section>
      )}
    </main>
  );
};

export default App;