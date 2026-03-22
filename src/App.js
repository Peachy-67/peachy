import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'discard',
  'control',
  'guilt',
  'boundary_push',
]);

function App() {
  // State for latest analysis result
  const [analysis, setAnalysis] = useState(null);
  // Flag to show/hide the real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  // Immediate alert dismiss control
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Extract flags and verdict info from analysis
  const flaggedBehaviors = analysis
    ? analysis.signals.map((signal) => ({
        type: signal,
        label: signal.charAt(0).toUpperCase() + signal.slice(1),
        confidence: analysis.confidence || 0,
      }))
    : [];

  // Derive verdict label from verdict band
  // We'll map band to 'Safe', 'Caution', or 'Flagged' for verdict label display.
  // For backward compatibility, if analysis.verdict missing, fallback:
  const verdictLabelMap = {
    green: 'Safe',
    yellow: 'Caution',
    red: 'Flagged',
  };

  // Determine verdict object for visualization (label, band)
  const verdict = {
    label: analysis?.verdict?.label || (analysis ? verdictLabelMap[analysis.verdict?.band] || 'Caution' : 'Safe'),
    band: analysis?.verdict?.band || 'green',
  };

  // Check if analysis signals have any high risk flags
  const highRiskFlagsPresent = analysis
    ? analysis.signals.some((s) => HIGH_RISK_FLAGS.has(s))
    : false;

  // Reset alertDismissed flag when analysis changes with high-risk alerts
  useEffect(() => {
    if (highRiskFlagsPresent) {
      setAlertDismissed(false);
    }
  }, [highRiskFlagsPresent]);

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Conversation input section">
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysis={setAnalysis} />
        )}
      </section>

      <section aria-live="polite" aria-atomic="true" aria-label="Immediate alerts" style={{ position: 'relative', zIndex: 1000 }}>
        {highRiskFlagsPresent && !alertDismissed && analysis && (
          <ImmediateAlert
            flaggedBehaviors={flaggedBehaviors.filter((f) => HIGH_RISK_FLAGS.has(f.type.toLowerCase()))}
            onDismiss={() => setAlertDismissed(true)}
          />
        )}
      </section>

      {analysis && !showDashboard && (
        <section aria-label="Analysis results" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={
              verdictLabelMap[verdict.band]
                ? verdictLabelMap[verdict.band]
                : verdict.label
            }
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysis.confidence || 0}
          />
          <ShareableResult
            analysis={analysis}
            verdictLabel={
              verdictLabelMap[verdict.band]
                ? verdictLabelMap[verdict.band]
                : verdict.label
            }
          />
        </section>
      )}

      <section aria-label="Real-time conversation monitoring dashboard">
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={() => setShowDashboard((prev) => !prev)}
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#ff6f61',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(255,111,97,0.6)',
            userSelect: 'none',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: 280,
            width: '100%',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e65b50')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6f61')}
        >
          {showDashboard ? 'Hide Real-Time Dashboard' : 'Show Real-Time Dashboard'}
        </button>

        {showDashboard && (
          <RealTimeDashboard onAnalysis={setAnalysis} initialAnalysis={analysis} />
        )}
      </section>
    </main>
  );
}

export default App;