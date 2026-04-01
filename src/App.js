import React, { useState, useEffect, useCallback } from 'react';

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
  'threat',
  'ultimatum',
  'control',
]);

const verdictMapping = {
  green: 'Safe',
  yellow: 'Caution',
  red: 'Flagged',
};

function App() {
  // conversation text submitted for analysis
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // real-time dashboard mode toggle
  const [dashboardMode, setDashboardMode] = useState(false);

  // Gather flagged behaviors as array of {type, label, confidence}
  // We map signals to labels and provide confidence from analysisResult.confidence (approximate)
  // For demonstration, we use confidence from the overall for each, or 1 if no confidence available
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    const signals = analysisResult.signals;
    // Map signal to a label (capitalize first letter + spaces for underscore if any)
    const SIGNAL_LABELS = {
      insult: 'Insult',
      manipulation: 'Manipulation',
      gaslighting: 'Gaslighting',
      discard: 'Discard',
      ultimatum: 'Ultimatum',
      threat: 'Threat',
      control: 'Control',
      guilt: 'Guilt',
      boundary_push: 'Boundary Push',
      inconsistency: 'Inconsistency',
    };
    return signals.map((signal) => ({
      type: signal,
      label: SIGNAL_LABELS[signal] || signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence:
        typeof analysisResult.confidence === 'number'
          ? analysisResult.confidence
          : 0.8,
    }));
  }, [analysisResult]);

  // verdict string for visualization component
  const verdict = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return 'Safe';
    const band = analysisResult.verdict.band || 'green';
    return verdictMapping[band] || 'Safe';
  }, [analysisResult]);

  // overall confidence number 0-1
  const overallConfidence = React.useMemo(() => {
    if (!analysisResult) return 0;
    return analysisResult.confidence ?? 0;
  }, [analysisResult]);

  // Checks if any flagged behavior is high risk and returns boolean
  const hasHighRisk = React.useMemo(() => {
    if (!flaggedBehaviors || flaggedBehaviors.length === 0) return false;
    return flaggedBehaviors.some((f) => HIGH_RISK_FLAGS.has(f.type));
  }, [flaggedBehaviors]);

  // Handler to receive analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = useCallback(
    (result) => {
      setAnalysisResult(result);
      setError(null);
      setLoading(false);
    },
    [setAnalysisResult, setError, setLoading]
  );

  // Handler for errors from child components
  const handleError = useCallback(
    (errorMsg) => {
      setError(errorMsg);
      setLoading(false);
      setAnalysisResult(null);
    },
    [setError, setLoading, setAnalysisResult]
  );

  // Handler for loading state from analyzer components
  const handleLoading = useCallback(
    (isLoading) => {
      setLoading(isLoading);
    },
    [setLoading]
  );

  // Toggle between paste input analyzer and real-time dashboard
  const toggleDashboardMode = useCallback(() => {
    setDashboardMode((v) => !v);
    // Clear previous analysis and errors on mode toggle
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red-flag detector app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED</h1>
      </header>

      <section aria-label="Mode toggle for conversation analysis and real-time monitoring">
        <button
          type="button"
          onClick={toggleDashboardMode}
          aria-pressed={dashboardMode}
          className="peachy-button"
          style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {dashboardMode ? 'Switch to Conversation Analyzer' : 'Switch to Real-Time Dashboard'}
        </button>
      </section>

      {dashboardMode ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
        />
      )}

      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

      {error && (
        <section
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: '1rem' }}
        >
          {error}
        </section>
      )}

      {loading && (
        <section aria-live="polite" style={{ marginTop: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
          Analyzing conversation...
        </section>
      )}

      {!loading && analysisResult && (
        <section aria-label="Analysis results" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
        </section>
      )}

      <footer style={{ textAlign: 'center', fontSize: '0.9rem', color: '#999', userSelect: 'none', marginBottom: '1rem' }}>
        &copy; {new Date().getFullYear()} FLAGGED.RUN
      </footer>
    </main>
  );
}

export default App;