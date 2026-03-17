import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum', 'discard']);

const App = () => {
  // State for analysis result from conversation analyzer
  const [analysis, setAnalysis] = useState(null);
  // State for errors from analysis process
  const [error, setError] = useState(null);
  // State for loading status during analysis
  const [loading, setLoading] = useState(false);
  // State to control dashboard view toggle
  const [useDashboard, setUseDashboard] = useState(false);
  // State to control ImmediateAlert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Effect: reset alert dismissal if analysis changes and high risk flags appear
  useEffect(() => {
    if (!analysis) {
      setAlertDismissed(false);
      return;
    }
    const detectedFlags = new Set(analysis.signals || []);
    const hasHighRisk = [...detectedFlags].some(flag => HIGH_RISK_FLAGS.has(flag));
    if (hasHighRisk) {
      setAlertDismissed(false);
    }
  }, [analysis]);

  // Handler for successful analysis from ConversationAnalyzerPolish or dashboard fallback
  const handleAnalysis = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);
  };

  // Handler for analysis errors
  const handleError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
    setAnalysis(null);
  };

  // Handle loading state updates from analyzer components
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Handler to dismiss immediate alert banner
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  const flaggedBehaviors = (analysis && analysis.signals && Array.isArray(analysis.signals))
    ? analysis.signals.map((type) => {
        // Map to label and confidence from analysis details if present
        // Fallback with capitalized label and confidence 1
        const label = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
        // Confidence (dummy 1 if no detailed confidence)
        // In this app state, detailed confidence is not stored per signal; we only have overall confidence
        return { type, label, confidence: analysis.confidence || 1 };
      })
    : [];

  // Determine overall verdict label for visualization from analysis verdict label string
  // Map backend "green", "yellow", "red" to "Safe", "Caution", "Flagged" for verdict prop
  let verdictLabel = 'Safe';
  if (analysis?.verdict?.band === 'yellow') {
    verdictLabel = 'Caution';
  } else if (analysis?.verdict?.band === 'red') {
    verdictLabel = 'Flagged';
  }

  // Compose share text summary for shareable result component
  const shareText = analysis
    ? `FLAGGED Analysis Result:\nVerdict: ${verdictLabel}\nDetected Flags: ${
        flaggedBehaviors.length > 0 ? flaggedBehaviors.map((f) => f.label).join(', ') : 'None'
      }\nConfidence: ${(analysis.confidence * 100).toFixed(0)}%\n\nPaste your conversation into FLAGGED to check for red flags.\nhttps://flagged.run`
    : '';

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <h1 tabIndex={-1} className="app-title" style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Toggle between paste analyzer and real-time dashboard" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => setUseDashboard(!useDashboard)}
          aria-pressed={useDashboard}
          aria-label={`Switch to ${useDashboard ? 'Paste analyzer' : 'Real-time dashboard'}`}
          className="peachy-button"
          type="button"
        >
          {useDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      {useDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysis} onError={handleError} onLoading={handleLoading} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysis} onError={handleError} onLoading={handleLoading} />
      )}

      {loading && (
        <p role="status" aria-live="polite" style={{ textAlign: 'center', marginTop: '1rem', color: '#ff6f61' }}>
          Analyzing conversation...
        </p>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: '1rem', fontWeight: '700', color: '#b71c1c' }}
          tabIndex={-1}
        >
          {error}
        </div>
      )}

      {analysis && !loading && (
        <>
          <ImmediateAlert
            flaggedBehaviors={flaggedBehaviors}
            dismissed={alertDismissed}
            onDismiss={dismissAlert}
            highRiskFlags={HIGH_RISK_FLAGS}
          />

          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysis.confidence || 0}
          />

          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysis.confidence || 0}
            shareText={shareText}
          />
        </>
      )}
    </main>
  );
};

export default App;