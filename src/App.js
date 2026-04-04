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
  'guilt',
  'boundary_push',
  'inconsistency',
]);

const extractFlags = (signals) => {
  // Return unique array of normalized flags
  return Array.isArray(signals)
    ? Array.from(new Set(signals.map((s) => String(s).toLowerCase()).filter(Boolean)))
    : [];
};

const hasHighRiskFlag = (flags) => {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag));
};

const App = () => {
  // State for analysis result from paste/analyze mode
  const [analysisResult, setAnalysisResult] = useState(null);

  // State for error notification on analysis failure
  const [analysisError, setAnalysisError] = useState(null);

  // State for loading indication
  const [isLoading, setIsLoading] = useState(false);

  // State for immediate alert visibility/dismiss
  const [alertFlags, setAlertFlags] = useState([]);

  // State to toggle RealTimeDashboard or ConversationAnalyzerPolish (paste analyze)
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Handler called by ConversationAnalyzerPolish on new analysis or error
  const handleAnalysisUpdate = useCallback(({ result, error }) => {
    if (error) {
      setAnalysisError(error);
      setAnalysisResult(null);
      setIsLoading(false);
      setAlertFlags([]);
      return;
    }
    if (result) {
      setAnalysisResult(result);
      setAnalysisError(null);
      setIsLoading(false);

      const flags = extractFlags(result.signals);
      if (hasHighRiskFlag(flags)) {
        setAlertFlags(flags);
      } else {
        setAlertFlags([]);
      }
    }
  }, []);

  // Handler for starting analysis in paste mode (triggered in ConversationAnalyzerPolish)
  const handleAnalysisStart = useCallback(() => {
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setAlertFlags([]);
  }, []);

  // Handler to clear immediate alert banner
  const dismissAlert = useCallback(() => {
    setAlertFlags([]);
  }, []);

  // Handler for share action, we'll pass result data to ShareableResult
  // ShareableResult includes its own share button(s)

  // Toggle between RealTimeDashboard and paste-analyze view
  const toggleRealTimeMode = () => {
    // Clear previous analysis and alerts on mode switch
    setAnalysisResult(null);
    setAnalysisError(null);
    setAlertFlags([]);
    setIsLoading(false);
    setRealTimeMode((prev) => !prev);
  };

  // Derived verdict for visualization from analysisResult
  const verdictLabel = analysisResult?.verdict?.label || 'Safe';
  const flags = extractFlags(analysisResult?.signals);
  const flaggedBehaviors = flags.map((flag) => ({
    type: flag,
    label: flag.charAt(0).toUpperCase() + flag.slice(1),
    confidence: analysisResult?.confidence ?? 0,
  }));
  const overallConfidence = analysisResult?.confidence ?? 0;

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: 'center', userSelect: 'none', color: '#ff6f3c' }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
        <button
          type="button"
          aria-pressed={realTimeMode}
          onClick={toggleRealTimeMode}
          className="peachy-button"
          style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {realTimeMode ? 'Switch to Paste Analyzer' : 'Switch to Real-Time Dashboard'}
        </button>
      </header>

      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />

      {!realTimeMode && (
        <>
          <ConversationAnalyzerPolish
            onAnalysisStart={handleAnalysisStart}
            onAnalysisUpdate={handleAnalysisUpdate}
            loading={isLoading}
            error={analysisError}
          />

          {analysisResult && !isLoading && !analysisError && (
            <section aria-live="polite" aria-atomic="true" style={{ marginTop: '1.5rem' }}>
              <FlaggedResultVisualization
                verdict={
                  verdictLabel === 'Safe'
                    ? 'Safe'
                    : verdictLabel === 'Caution'
                    ? 'Caution'
                    : 'Flagged'
                }
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult analysis={analysisResult} />
            </section>
          )}

          {analysisError && (
            <div
              role="alert"
              className="alert-banner"
              style={{ marginTop: '1rem', color: '#b71c1c', backgroundColor: '#ffccbc' }}
            >
              {analysisError}
            </div>
          )}
        </>
      )}

      {realTimeMode && (
        <section style={{ marginTop: '1rem' }}>
          <RealTimeDashboard
            onAlert={(flags) => {
              setAlertFlags(flags);
            }}
          />
        </section>
      )}
    </main>
  );
};

export default App;