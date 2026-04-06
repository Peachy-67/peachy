import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'manipulation',
  'gaslighting',
  'discard',
  'control',
]);

const App = () => {
  // State to hold analysis result data
  const [analysis, setAnalysis] = useState(null);
  // Track load/error state from analyzer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Immediate alert dismissal management
  const [alertDismissed, setAlertDismissed] = useState(false);
  // Toggle between conversation analyzer and real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (newAnalysis) => {
    setAnalysis(newAnalysis);
    setError(null);
    setAlertDismissed(false);
  };

  // Handler for error from analyzer components
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
    setAnalysis(null);
    setAlertDismissed(false);
  };

  // Check if any high risk flags appear in current signals
  const hasHighRiskFlags = () => {
    if (!analysis || !Array.isArray(analysis.signals)) return false;
    return analysis.signals.some((signal) => HIGH_RISK_FLAGS.has(signal));
  };

  // Alert dismiss handler
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Compose flagged behaviors array for visualization, mapping signals into objects with type, label, confidence
  // We use confidence from analysis.confidence for all flags as best approximation (per existing data)
  const composeFlaggedBehaviors = () => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    // Labels consistent with FlagBadge expectations. Map some signal names to labels.
    const labelMap = {
      insult: 'Insult',
      manipulation: 'Manipulation',
      gaslighting: 'Gaslighting',
      discard: 'Discard',
      control: 'Control',
      ultimatum: 'Ultimatum',
      threat: 'Threat',
      guilt: 'Guilt',
      boundary_push: 'Boundary Push',
      inconsistency: 'Inconsistency',
    };
    return analysis.signals
      .filter((signal) => labelMap[signal])
      .map((signal) => ({
        type: signal,
        label: labelMap[signal],
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0,
      }));
  };

  // Determine overall verdict label from analysis verdict label (green/yellow/red to Safe/Caution/Flagged)
  const verdictLabelMap = {
    green: 'Safe',
    yellow: 'Caution',
    red: 'Flagged',
  };

  const verdict = analysis?.verdict?.band ? verdictLabelMap[analysis.verdict.band] || 'Safe' : 'Safe';

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED Conversation Analyzer</h1>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => {
              setShowDashboard((prev) => !prev);
              // Reset state on toggle to clear prior data/alerts
              setAnalysis(null);
              setError(null);
              setAlertDismissed(false);
            }}
            className="peachy-button"
            aria-pressed={showDashboard}
            aria-label={showDashboard ? 'Switch to paste analyzer mode' : 'Switch to real-time dashboard mode'}
          >
            {showDashboard ? 'Use Conversation Analyzer' : 'Use Real-time Dashboard'}
          </button>
        </div>
      </header>

      {/* Show alert banner when high-risk flags present and alert not dismissed */}
      {analysis && hasHighRiskFlags() && !alertDismissed && (
        <ImmediateAlert flaggedBehaviors={composeFlaggedBehaviors()} onDismiss={dismissAlert} />
      )}

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {/* Display error from analysis */}
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

      {/* Show results only when valid analysis and no errors */}
      {!error && analysis && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={composeFlaggedBehaviors()}
            overallConfidence={analysis.confidence || 0}
          />
          <ShareableResult analysis={analysis} />
        </>
      )}
    </main>
  );
};

export default App;