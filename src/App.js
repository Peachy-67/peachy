import React, { useState, useEffect, useCallback } from 'react';

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
]);

function App() {
  // State for analysis results from paste input
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // State to toggle real-time monitoring dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // State for immediate alert flags
  const [alertFlags, setAlertFlags] = useState([]);

  // Trigger alert when high risk flags detected
  const handleNewFlags = useCallback((flags) => {
    // Extract high-risk flags present in flags
    const highRiskDetected = flags.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.type.toLowerCase())
    );

    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      // Native alert to notify user immediately
      const flagNames = highRiskDetected.map((f) => f.label).join(', ');
      window.alert(`High Risk Behavior Detected: ${flagNames}`);
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Handler for new analysis from conversation analyzer
  const onAnalysisComplete = useCallback((result) => {
    setAnalysisResult(result);
    setAnalysisError(null);
    setAnalysisLoading(false);

    // Notify immediate alert if high risk flags present
    if (result && Array.isArray(result.signals)) {
      // Map signals to detailed flags for alert
      const flaggedBehaviors = (result.flags || []).length
        ? result.flags
        : (result.signals || []).map((signal) => {
            return { type: signal, label: signal.charAt(0).toUpperCase() + signal.slice(1), confidence: 1 };
          });

      handleNewFlags(flaggedBehaviors);
    }
  }, [handleNewFlags]);

  // Handler for analysis start (loading)
  const onAnalysisStart = useCallback(() => {
    setAnalysisLoading(true);
    setAnalysisError(null);
  }, []);

  // Handler for analysis error/failure
  const onAnalysisError = useCallback((error) => {
    setAnalysisError(error);
    setAnalysisLoading(false);
    setAnalysisResult(null);
    setAlertFlags([]);
  }, []);

  // Handler to dismiss alert banner
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  // Detect if current analysisResult has flaggedBehaviors array; else map signals
  const flaggedBehaviors =
    analysisResult && Array.isArray(analysisResult.flags)
      ? analysisResult.flags
      : analysisResult && Array.isArray(analysisResult.signals)
      ? analysisResult.signals.map((signal) => ({
          type: signal,
          label: signal.charAt(0).toUpperCase() + signal.slice(1),
          confidence: 1,
        }))
      : [];

  // Extract verdict label and overall confidence for visualization
  const verdict =
    analysisResult && analysisResult.verdict && analysisResult.verdict.label
      ? analysisResult.verdict.label
      : 'Safe';

  const overallConfidence =
    analysisResult && typeof analysisResult.confidence === 'number'
      ? analysisResult.confidence
      : 0;

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none', color: '#ff6f61' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        type="button"
        onClick={() => setShowDashboard((v) => !v)}
        aria-pressed={showDashboard}
        aria-label="Toggle real-time monitoring dashboard"
        className="peachy-button"
        style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
      >
        {showDashboard ? 'Back to Paste Analyzer' : 'Switch to Real-Time Monitoring'}
      </button>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onStart={onAnalysisStart}
            onComplete={onAnalysisComplete}
            onError={onAnalysisError}
            loading={analysisLoading}
            error={analysisError}
          />

          {(analysisResult || analysisError) && (
            <>
              {analysisResult && (
                <section
                  aria-label="Analysis results"
                  role="region"
                  style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <FlaggedResultVisualization
                    verdict={verdict}
                    flaggedBehaviors={flaggedBehaviors}
                    overallConfidence={overallConfidence}
                  />
                  <ShareableResult analysis={analysisResult} />
                </section>
              )}

              {analysisError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  style={{
                    marginTop: '1rem',
                    color: '#cc2f2f',
                    fontWeight: '700',
                    textAlign: 'center',
                    userSelect: 'none',
                  }}
                >
                  {analysisError}
                </div>
              )}
            </>
          )}
        </>
      )}

      {showDashboard && <RealTimeDashboard onAlertFlags={handleNewFlags} />}

      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
    </main>
  );
}

export default App;