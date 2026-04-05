import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); // { verdict, flaggedBehaviors, overallConfidence }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors and overall confidence in format for visualization
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.flaggedBehaviors) return [];
    return analysisResult.flaggedBehaviors;
  }, [analysisResult]);

  const overallConfidence = analysisResult?.overallConfidence ?? 0;

  // Check for high-risk flags: insult, gaslighting, discard, threat, ultimatum, manipulation, control
  // These trigger both native alert and visible banner
  const highRiskFlags = ['insult', 'gaslighting', 'discard', 'threat', 'ultimatum', 'manipulation', 'control'];

  // Collect high-risk detected flags from latest analysis for alert
  useEffect(() => {
    if (!flaggedBehaviors || flaggedBehaviors.length === 0) {
      setAlertFlags([]); // Clear alerts if none
      return;
    }
    const foundHighRisk = flaggedBehaviors.filter((flag) =>
      highRiskFlags.includes(flag.type.toLowerCase())
    );
    if (foundHighRisk.length > 0) {
      setAlertFlags(foundHighRisk);
      // Trigger native alert once per batch
      alert(
        `High-risk behavior detected: ${foundHighRisk
          .map((f) => f.label)
          .join(', ')}`
      );
    } else {
      setAlertFlags([]);
    }
  }, [flaggedBehaviors]);

  // Handle new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalyzeUpdate = (result) => {
    if (!result) {
      setAnalysisResult(null);
      setAlertFlags([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(false);
    setError(null);

    // Normalize result for visualization usage:
    // Expect result shape: { verdict: { label, band, score }, flaggedBehaviors: [], overallConfidence }
    // If incomplete, fallback or ignore
    if (
      result.verdict &&
      result.flaggedBehaviors &&
      typeof result.overallConfidence === 'number'
    ) {
      setAnalysisResult(result);
    }
  };

  // Handle loading and error state from analyzer inputs
  const onLoading = () => {
    setLoading(true);
    setError(null);
  };

  const onError = (msg) => {
    setLoading(false);
    setError(msg);
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detector app">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: '#cc2f2f', userSelect: 'none' }}>
        FLAGGED: Conversation Red Flag Detector
      </h1>

      <section aria-label="Conversation input and analysis" tabIndex={-1}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalyzeUpdate={handleAnalyzeUpdate}
            onLoading={onLoading}
            onError={onError}
          />
        )}
      </section>

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

      {loading && (
        <p
          role="status"
          aria-live="polite"
          aria-busy="true"
          style={{ fontWeight: '600', marginTop: '1rem', textAlign: 'center' }}
        >
          Analyzing conversation...
        </p>
      )}

      {analysisResult && !loading && (
        <section aria-label="Flagged conversation analysis results" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
          />
          <ShareableResult
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
          />
        </section>
      )}

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
      />

      <section style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          className="peachy-button"
          type="button"
          aria-pressed={showDashboard}
          onClick={() => setShowDashboard((prev) => !prev)}
        >
          {showDashboard ? 'Return to Paste Analyzer' : 'Open Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: '2rem' }}>
          <RealTimeDashboard
            onAnalyseUpdate={handleAnalyzeUpdate}
            onError={onError}
            onLoading={onLoading}
          />
        </section>
      )}
    </main>
  );
};

export default App;