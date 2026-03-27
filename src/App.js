import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/uiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'threat',
  'discard',
  'ultimatum',
  'control',
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Update alert flags when analysis result changes and contains high-risk flags
  useEffect(() => {
    if (analysisResult?.flaggedBehaviors?.length > 0) {
      const highRiskDetected = analysisResult.flaggedBehaviors.filter(f =>
        HIGH_RISK_FLAGS.has(f.type)
      );
      if (highRiskDetected.length > 0) {
        setAlertFlags(highRiskDetected);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to clear the alert banner
  const handleDismissAlert = useCallback(() => {
    setAlertFlags([]);
  }, []);

  // Callback passed to ConversationAnalyzerPolish for new analysis results
  const handleAnalysisComplete = useCallback(
    (result, err) => {
      if (err) {
        setError(err.message || 'Analysis failed.');
        setAnalysisResult(null);
        setAlertFlags([]);
      } else {
        setError(null);
        if (result) {
          // Transform data shape for FlaggedResultVisualization and ShareableResult
          // expected props: verdict, flaggedBehaviors, overallConfidence
          const verdictMapping = {
            green: 'Safe',
            yellow: 'Caution',
            red: 'Flagged',
          };
          const verdictLabel =
            result.verdict?.band && verdictMapping[result.verdict.band]
              ? verdictMapping[result.verdict.band]
              : 'Safe';

          // Map signals to flaggedBehaviors array with label and confidence
          const flaggedBehaviors =
            Array.isArray(result.signals) && result.signals.length > 0
              ? result.signals.map((signal) => {
                  const label =
                    signal.charAt(0).toUpperCase() + signal.slice(1).replace('_', ' ');
                  return {
                    type: signal,
                    label,
                    confidence: result.confidence || 0,
                  };
                })
              : [];

          const overallConfidence = result.confidence || 0;

          setAnalysisResult({
            verdict: verdictLabel,
            flaggedBehaviors,
            overallConfidence,
            raw: result,
          });
        } else {
          setAnalysisResult(null);
          setAlertFlags([]);
        }
      }
    },
    []
  );

  // Handler toggle between paste input analysis and real-time dashboard
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analysis Application">
      <header>
        <h1 style={{ textAlign: 'center', userSelect: 'none', color: '#cc2f2f' }}>
          FLAGGED Conversation Analyzer
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ margin: '1rem auto 2rem auto', display: 'block', maxWidth: '280px' }}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Open Real-Time Dashboard'}
        </button>
      </header>

      {alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onComplete={handleAnalysisComplete} />
          {error && (
            <div className="alert-banner" role="alert" aria-live="assertive" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
                rawResult={analysisResult.raw}
              />
            </>
          )}
        </>
      )}

      {showDashboard && <RealTimeDashboard />}
    </main>
  );
}

export default App;