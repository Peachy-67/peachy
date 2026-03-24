import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/uiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'threat', 'ultimatum', 'gaslighting', 'discard']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); // Holds the latest analysis output
  const [error, setError] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);

  // Extract flagged behaviors from result for components usage
  const flaggedBehaviors = (analysisResult?.signals || []).map((signal) => {
    // Map known signals to labels, confidence is assumed from overall confidence for demo
    let label = signal.charAt(0).toUpperCase() + signal.slice(1);
    return {
      type: signal,
      label,
      confidence: analysisResult?.confidence ?? 0,
    };
  });

  // Determine Verdict label used in visualization components, mapping backend bands to UI labels
  const verdictMap = {
    green: 'Safe',
    yellow: 'Caution',
    red: 'Flagged',
  };
  const verdict = verdictMap[analysisResult?.verdict?.band] || 'Safe';
  const overallConfidence = analysisResult?.confidence ?? 0;

  // Determine if any flagged behavior is high risk for alert
  const highRiskFlagsDetected = flaggedBehaviors.some((flag) => HIGH_RISK_FLAGS.has(flag.type));

  // Handler triggered on new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result, errorMsg) => {
    if (errorMsg) {
      setError(errorMsg);
      setAnalysisResult(null);
    } else {
      setError(null);
      setAnalysisResult(result);
    }
  };

  // Dismiss alert clears flagged behaviors if needed (ImmediateAlert handles internal dismiss)
  // Here just kept to support alert banner dismiss behavior internally

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: 'center', color: '#ff6f3c', userSelect: 'none', marginBottom: '1rem' }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Toggle between paste analyzer mode and real-time dashboard */}
      <section style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <button
          type="button"
          onClick={() => setIsRealtime((prev) => !prev)}
          className="peachy-button"
          aria-pressed={isRealtime}
          aria-label={`Switch to ${isRealtime ? 'Paste Analyzer' : 'Real-Time Dashboard'} mode`}
        >
          Switch to {isRealtime ? 'Paste Analyzer' : 'Real-Time Dashboard'}
        </button>
      </section>

      {!isRealtime && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {error && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              style={{ marginTop: '1rem' }}
              tabIndex={-1}
            >
              {error}
            </div>
          )}
          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                confidence={overallConfidence}
                conversation={analysisResult.meta?.conversationExcerpt || ''}
              />
            </>
          )}
        </>
      )}

      {isRealtime && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          initialResult={analysisResult}
          initialError={error}
          alertHighRiskFlags={highRiskFlagsDetected}
        />
      )}
    </main>
  );
};

export default App;