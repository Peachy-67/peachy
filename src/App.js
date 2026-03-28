import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum', 'control']);

const App = () => {
  // State for analysis result from paste analyzer or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for alert dismiss banner
  const [alertDismissed, setAlertDismissed] = useState(false);
  // State toggle for showing real-time dashboard or paste analyzer
  const [showDashboard, setShowDashboard] = useState(false);

  // Effect resets alert dismissal if analysis result changes
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysisResult]);

  // Handler when conversation analyzer produces a new result
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Handler when real-time dashboard produces a new result
  const handleDashboardAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Check if analysis result contains any high-risk flag(s)
  const hasHighRiskFlags = () => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return false;
    return analysisResult.signals.some((flag) => HIGH_RISK_FLAGS.has(flag));
  };

  // Dismiss alert banner
  const handleDismissAlert = () => {
    setAlertDismissed(true);
  };

  // Toggle between paste analyzer and real-time dashboard views
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear previous analysis on toggle
    setAnalysisResult(null);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header>
        <h1 style={{ userSelect: 'none', textAlign: 'center', color: '#ff6f61', marginBottom: '1rem' }}>FLAGGED</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time monitoring dashboard"}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </header>

      <section aria-live="polite" aria-relevant="additions removals" style={{ marginTop: '1rem' }}>
        {showDashboard ? (
          <RealTimeDashboard onAnalysisUpdate={handleDashboardAnalysisUpdate} />
        ) : (
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        )}
      </section>

      {analysisResult && (
        <>
          <ImmediateAlert
            flaggedBehaviors={analysisResult.signals || []}
            onDismiss={handleDismissAlert}
            dismissed={alertDismissed}
          />
          <section
            aria-label="Flagged conversation results"
            style={{ marginTop: '1.5rem' }}
          >
            <FlaggedResultVisualization
              verdict={analyseVerdictLabel(analysisResult?.verdict)}
              flaggedBehaviors={mapFlagsForVisualization(analysisResult.signals, analysisResult.confidence)}
              overallConfidence={analysisResult.confidence || 0}
            />
          </section>
          <section aria-label="Share flagged results" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <ShareableResult
              result={analysisResult}
            />
          </section>
        </>
      )}
    </main>
  );
};

// Helper: Map verdict object or string to short label string for VerdictDisplay
const analyseVerdictLabel = (verdict) => {
  if (!verdict) return 'Safe';
  if (typeof verdict === 'string') return capitalizeFirst(verdict);
  if (verdict.band) {
    switch (verdict.band) {
      case 'green': return 'Safe';
      case 'yellow': return 'Caution';
      case 'red': return 'Flagged';
      default: return 'Safe';
    }
  }
  return 'Safe';
};

const capitalizeFirst = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// Helper: Map array of signals to flagged badge objects
// Here we assign labels and confidence from overall confidence for display
const mapFlagsForVisualization = (signals = [], confidence = 0) => {
  if (!Array.isArray(signals)) return [];

  // Define label mapping for signals
  const LABELS = {
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

  return signals.map((type) => ({
    type,
    label: LABELS[type.toLowerCase()] || type,
    confidence: confidence,
  }));
};

export default App;