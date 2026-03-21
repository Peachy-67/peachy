import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum', 'discard'];

// App root component integrating conversation analysis, alerting,
// result visualization, sharing, and real-time dashboard toggle.
const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  // Update alert flags whenever analysis changes
  useEffect(() => {
    if (analysis?.flags && Array.isArray(analysis.flags)) {
      // Determine if any high risk flags present
      const highRiskDetected = analysis.flags.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag.type.toLowerCase())
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysis]);

  // Handler to receive analysis results from ConversationAnalyzerPolish and RealTimeDashboard
  const onAnalysis = (result) => {
    setError(null);
    if (!result) {
      setAnalysis(null);
      return;
    }
    // Result shape expected:
    // {
    //   verdict: 'Safe' | 'Caution' | 'Flagged',
    //   flags: [{ type, label, confidence }],
    //   confidence: number
    // }
    setAnalysis(result);
  };

  // Handler to capture error from analyzer components
  const onError = (err) => {
    setAnalysis(null);
    setError(err);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Conversation analysis input area" style={{ marginBottom: '1.25rem' }}>
        {!showDashboard ? (
          <ConversationAnalyzerPolish onAnalysis={onAnalysis} onError={onError} />
        ) : (
          <RealTimeDashboard onAnalysis={onAnalysis} onError={onError} />
        )}

        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          style={{
            marginTop: '1rem',
            width: '100%',
            backgroundColor: '#ff6f61',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.75rem 0',
            fontWeight: '600',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(255,111,97,0.6)',
            transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          {showDashboard ? 'Use Paste Analyzer Instead' : 'Switch to Real-Time Dashboard'}
        </button>
      </section>

      {error && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ marginBottom: '1.5rem' }}
        >
          {error.message || error.toString()}
        </div>
      )}

      {alertFlags.length > 0 && <ImmediateAlert flaggedBehaviors={alertFlags} />}

      {analysis && !showDashboard && (
        <section aria-label="Flagged conversation result visualization and sharing" style={{ marginTop: '1rem' }}>
          <FlaggedResultVisualization
            verdict={analysis.verdict}
            flaggedBehaviors={analysis.flags}
            overallConfidence={analysis.confidence}
          />
          <ShareableResult analysis={analysis} />
        </section>
      )}
    </main>
  );
};

export default App;