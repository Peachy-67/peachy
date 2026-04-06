import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';
import './styles/UiPolishImprovements.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum', 'discard', 'control', 'guilt']);

const verdictLabelMap = {
  green: 'Safe',
  yellow: 'Caution',
  red: 'Flagged',
};

const initialAnalysis = {
  verdict: { label: 'Safe', score: 0, band: 'green' },
  reaction: [],
  confidence: 0,
  signals: [],
  why: [],
  watch_next: [],
  usage: {},
  meta: {},
};

const App = () => {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Check and update alert flags on signals change
  useEffect(() => {
    if (!analysis || !analysis.signals) {
      setAlertVisible(false);
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysis.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysis]);

  // Handle analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) return;
    setAnalysis(result);
    setError(null);
  };

  // Handle errors from analysis components
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
  };

  const handleAlertDismiss = () => {
    setAlertVisible(false);
  };

  return (
    <main
      className="ui-container"
      aria-label="FLAGGED red-flag conversation detection main application"
    >
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Conversation input and analysis" style={{ marginTop: '1rem' }}>
        {!showDashboard ? (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : null}
      </section>

      <section aria-label="Alert notifications" aria-live="assertive" role="alert" style={{ position: 'relative', zIndex: 2000 }}>
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          visible={alertVisible}
          onDismiss={handleAlertDismiss}
        />
      </section>

      <section aria-label="Flagged conversation result visualization" style={{ marginTop: '2rem', display: showDashboard ? 'none' : 'block' }}>
        <FlaggedResultVisualization
          verdict={verdictLabelMap[analysis.verdict?.band] || 'Safe'}
          flaggedBehaviors={analysis.signals.map((sig) => ({
            type: sig,
            label: sig.charAt(0).toUpperCase() + sig.slice(1),
            confidence: analysis.confidence || 0,
          }))}
          overallConfidence={analysis.confidence || 0}
        />
      </section>

      <section aria-label="Share flagged result" style={{ marginTop: '1rem', display: showDashboard ? 'none' : 'block', textAlign: 'center' }}>
        <ShareableResult result={analysis} />
      </section>

      <section aria-label="Toggle real-time monitoring dashboard" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer paste input mode" : "Switch to real-time monitoring dashboard mode"}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: '2rem' }}>
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
            alertFlags={alertFlags}
            alertVisible={alertVisible}
            onAlertDismiss={handleAlertDismiss}
          />
        </section>
      )}

      {error && (
        <section aria-label="Error messages" role="alert" className="alert-banner" style={{ marginTop: '1.5rem' }}>
          {error}
        </section>
      )}
    </main>
  );
};

export default App;