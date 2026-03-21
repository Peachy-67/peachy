import React, { useState, useEffect } from 'react';

// Import best existing components per roadmap and polish
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css'; // Main polish CSS for consistent look

const App = () => {
  // State for analysis result from conversation analyzer component
  const [analysisResult, setAnalysisResult] = useState(null);
  // Error state if analysis fails or input invalid
  const [error, setError] = useState(null);
  // Loading state for analysis action
  const [loading, setLoading] = useState(false);

  // State to control if real time dashboard mode is active
  const [dashboardMode, setDashboardMode] = useState(false);

  // Show alert banner on high risk flags, pass to ImmediateAlert
  // High risk flags definition - trigger alert if insult, gaslighting, discard control, threat, ultimatum etc present
  const highRiskFlags = ['insult', 'gaslighting', 'discard', 'control', 'threat', 'ultimatum'];

  // Compute if any high risk flag is detected in current analysisResult
  const highRiskDetected = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return false;
    return analysisResult.signals.some((signal) => highRiskFlags.includes(signal));
  }, [analysisResult]);

  // Handler passed to ConversationAnalyzerPolish to update analysis result
  const onAnalyze = async (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  // Handler for errors from analyzer
  const onError = (err) => {
    setError(err);
    setAnalysisResult(null);
  };

  // Handler for loading state change
  const onLoadingChange = (isLoading) => {
    setLoading(isLoading);
  };

  // Toggle between conversation paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setDashboardMode((prev) => !prev);
    // Clear previous results/errors on mode toggle
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none' }}>
        <h1>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardMode}
          aria-label={dashboardMode ? 'Switch to paste conversation analyzer' : 'Switch to real-time dashboard monitoring'}
          style={{ marginTop: '0.5rem' }}
        >
          {dashboardMode ? 'Paste Analyzer Mode' : 'Real-time Dashboard Mode'}
        </button>
      </header>

      {/* Immediate alert overlays on top if high risk behavior detected */}
      <ImmediateAlert flaggedBehaviors={analysisResult?.signals || []} />

      {!dashboardMode ? (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={onAnalyze}
            onError={onError}
            onLoadingChange={onLoadingChange}
          />

          {loading && (
            <p role="status" aria-live="polite" style={{ textAlign: 'center', marginTop: '1rem', fontWeight: '600' }}>
              Analyzing conversation...
            </p>
          )}

          {error && (
            <div className="alert-banner" role="alert">
              {error}
            </div>
          )}

          {analysisResult && (
            <section aria-label="Analysis results" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: 0.8, // Confidence is not detailed in signals; assume 0.8 for display purpose
                }))}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </section>
          )}
        </>
      ) : (
        <RealTimeDashboard
          onAnalysisUpdate={onAnalyze}
          onError={onError}
          onLoadingChange={onLoadingChange}
        />
      )}
    </main>
  );
};

export default App;