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
]);

const App = () => {
  // Analysis result state from conversation analyzer
  const [analysis, setAnalysis] = useState(null);
  // Loading and error states for analysis
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Whether to show the real-time monitoring dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Handle a new analysis result (from ConversationAnalyzerPolish or RealTimeDashboard)
  const handleAnalysisUpdate = (newAnalysis) => {
    setAnalysis(newAnalysis);
    setError(null);
    setLoading(false);
  };

  // Handle error from conversation analyzer
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
    setAnalysis(null);
  };

  // Handle loading state toggling for analyzer
  const handleLoading = () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
  };

  // Extract flagged behaviors for visualization and alerts
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysis) return [];
    // Map signals (string) to labeled flagged behaviors with confidence fallback 0.7
    // Use friendly labels capitalized
    const uniqueSignals = Array.from(new Set(analysis.signals || []));

    // We can add mapping to label and confidence if available; fallback confidence to analysis.confidence or 0.7
    // For now, label is signal capitalized, confidence from analysis.confidence
    return uniqueSignals.map((signal) => ({
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysis.confidence ?? 0.7,
    }));
  }, [analysis]);

  // Determine verdict label for visualization
  const verdictLabel = analysis?.verdict?.label || 'Safe';

  // Confidence for visualization progress bar
  const overallConfidence = typeof analysis?.confidence === 'number' ? analysis.confidence : 0;

  // Determine if any high-risk flag is detected to trigger immediate alert
  const highRiskFlagsDetected = flaggedBehaviors.some(({ type }) => HIGH_RISK_FLAGS.has(type.toLowerCase()));

  // Toggle paste analyzer vs real-time dashboard
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" aria-live="polite">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to Paste Analyzer' : 'Switch to Real-Time Dashboard'}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Open Real-Time Dashboard'}
        </button>
      </header>

      <section aria-label="Conversation analysis section" tabIndex={-1}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={handleLoading}
            // Pass current loaded analysis so it can render results
            currentAnalysis={analysis}
            loading={loading}
            error={error}
          />
        )}

        {showDashboard && <RealTimeDashboard onAnalyze={handleAnalysisUpdate} />}
      </section>

      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} showAlert={highRiskFlagsDetected} />

      {analysis && !showDashboard && (
        <section aria-label="Analysis results" className="flagged-result-container" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult analysis={analysis} />
        </section>
      )}
    </main>
  );
};

export default App;