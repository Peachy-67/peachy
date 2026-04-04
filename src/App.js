import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertsFlags, setAlertsFlags] = useState([]);
  const [lastAlertDismissed, setLastAlertDismissed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handler to execute on new analysis
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);

    // Identify high-risk flags for alerting
    const flags = result?.signals?.filter((sig) => HIGH_RISK_FLAGS.has(sig)) || [];

    // Show alert only if flags are present and alert not dismissed recently
    if (flags.length > 0 && !lastAlertDismissed) {
      setAlertsFlags(flags);
    } else {
      setAlertsFlags([]);
    }
  }, [lastAlertDismissed]);

  // Dismiss alert handler
  const dismissAlert = () => {
    setAlertsFlags([]);
    setLastAlertDismissed(true);
    // Reset dismissal after 30 seconds to allow new alerts again
    setTimeout(() => setLastAlertDismissed(false), 30000);
  };

  // Toggle view between real-time dashboard and conversation analyzer
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear data and alerts to reset state when switching modes
    setAlertsFlags([]);
    setLastAlertDismissed(false);
    setError(null);
    setLoading(false);
    setAnalysisResult(null);
  };

  return (
    <main
      className="ui-container"
      aria-label="FLAGGED conversation red flags detector application"
      tabIndex={-1}
    >
      <header style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none' }}>
        <h1 style={{ color: '#ff6f61', fontWeight: '900' }}>FLAGGED.RUN</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to conversation analyzer' : 'Switch to real-time dashboard'}
          className="peachy-button"
          style={{ marginTop: 10 }}
        >
          {showDashboard ? 'Use Conversation Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </header>

      {alertsFlags.length > 0 && (
        <ImmediateAlert flags={alertsFlags} onDismiss={dismissAlert} />
      )}

      {showDashboard ? (
        <RealTimeDashboard
          initialResult={analysisResult}
          onAnalysis={handleAnalysis}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisStart={() => {
              setLoading(true);
              setError(null);
            }}
            onAnalysis={handleAnalysis}
            onError={(errMsg) => {
              setError(errMsg);
              setLoading(false);
              setAlertsFlags([]);
            }}
            disabled={loading}
          />

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: '1rem' }}
            >
              {error}
            </div>
          )}

          {analysisResult && !loading && !error && (
            <>
              <FlaggedResultVisualization
                verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
                flaggedBehaviors={mapSignalsToFlagBehaviors(analysisResult.signals, analysisResult.confidence)}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                result={analysisResult}
                conversationText={analysisResult.meta?.text || ""}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

// Mapping backend verdict band to verdict label for FlaggedResultVisualization component
function mapBandToVerdictLabel(band) {
  if (!band) return 'Safe';
  if (band === 'green') return 'Safe';
  if (band === 'yellow') return 'Caution';
  if (band === 'red') return 'Flagged';
  return 'Safe';
}

// Converts signals to objects expected by FlaggedResultVisualization flaggedBehaviors prop
function mapSignalsToFlagBehaviors(signals = [], confidence = 0) {
  // Map each unique signal to label and confidence (using overall confidence here as approximation)
  const labelsByType = {
    insult: 'Insult',
    manipulation: 'Manipulation',
    guilt: 'Guilt',
    discard: 'Discard',
    gaslighting: 'Gaslighting',
    control: 'Control',
    ultimatum: 'Ultimatum',
    threat: 'Threat',
    boundary_push: 'Boundary Push',
    inconsistency: 'Inconsistency',
  };

  // We include only signals present (no duplicates) mapped to label and confidence
  return Array.from(new Set(signals)).map((type) => ({
    type,
    label: labelsByType[type] || type,
    confidence,
  }));
}

export default App;