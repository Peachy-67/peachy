import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';
import './styles/UiPolishImprovements.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'manipulation', 'gaslighting', 'discard', 'control', 'ultimatum', 'threat']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); // Holds latest analysis output
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Monitor analysisResult flags for any high-risk flags, trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHighRiskFlagsDetected([]);
      return;
    }
    const detectedFlags = analysisResult.signals.filter(flag => HIGH_RISK_FLAGS.has(flag));
    setHighRiskFlagsDetected(detectedFlags);
  }, [analysisResult]);

  // Handler for new analysis output from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setErrorMessage(null);
  };

  // Handler for errors, mainly from manual analysis
  const handleError = (err) => {
    setErrorMessage(err);
    setAnalysisResult(null);
  };

  // Toggle view between paste analyzer and real-time dashboard
  const toggleDashboardView = () => {
    setShowDashboard(prev => !prev);
    setErrorMessage(null);
    setAnalysisResult(null);
    setHighRiskFlagsDetected([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation Analysis Application">
      <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED</h1>
      <section aria-label="Interface mode toggle">
        <button
          type="button"
          onClick={toggleDashboardView}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time conversation dashboard"}
          style={{ marginBottom: '1rem', width: '100%' }}
        >
          {showDashboard ? "Paste Conversation for Analysis" : "Open Real-Time Conversation Dashboard"}
        </button>
      </section>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} onError={handleError} />
          {errorMessage && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              style={{ marginTop: '1rem' }}
            >
              {errorMessage}
            </div>
          )}

          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map(type => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 1,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          immediateAlerts={true}
        />
      )}
    </main>
  );
};

export default App;