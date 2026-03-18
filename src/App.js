import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum'];

function App() {
  // State for conversation analysis result
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for immediate alert flags (subset of detected flags)
  const [alertFlags, setAlertFlags] = useState([]);

  // Toggle between paste analyzer and real-time dashboard
  const [dashboardMode, setDashboardMode] = useState(false);

  // Handler for analysis result update from conversation analyzer
  const onAnalyze = (result) => {
    setAnalysis(result);
    setError(null);

    // Determine if any high-risk flags are present to trigger alert
    if (result && result.flags && result.flags.length > 0) {
      const highRiskDetected = result.flags.filter((f) =>
        HIGH_RISK_FLAGS.includes(f.type.toLowerCase())
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  };

  // Handler for errors from conversation analyzer
  const onError = (errMsg) => {
    setError(errMsg);
    setAnalysis(null);
    setAlertFlags([]);
  };

  // Clear alert dismissal - allow ImmediateAlert to clear its own dismissal internally
  // but here we clear alert flags if user dismisses alert on UI level
  const handleAlertDismiss = () => {
    setAlertFlags([]);
  };

  // Toggle mode handler
  const toggleMode = () => {
    setDashboardMode((prev) => !prev);
    setAnalysis(null);
    setError(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged red flags conversation detector">
      <header style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none' }}>
        <h1>FLAGGED</h1>
        <p>Detect red flags in conversations</p>
        <button
          aria-pressed={dashboardMode}
          onClick={toggleMode}
          className="peachy-button"
          type="button"
          aria-label={`Switch to ${dashboardMode ? 'paste analyzer' : 'real-time dashboard'} mode`}
        >
          {dashboardMode ? 'Use Paste Analyzer' : 'Use Real-time Dashboard'}
        </button>
      </header>

      {dashboardMode ? (
        <RealTimeDashboard
          onAnalysisUpdated={onAnalyze}
          error={error}
          setError={setError}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onResult={onAnalyze}
            onError={onError}
            loading={loading}
            setLoading={setLoading}
          />

          {error && (
            <div className="alert-banner" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || 'Safe'}
                flaggedBehaviors={analysis.flags || []}
                overallConfidence={analysis.confidence || 0}
              />

              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={handleAlertDismiss}
      />
    </main>
  );
}

export default App;