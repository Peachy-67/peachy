import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'discard', 'threat', 'ultimatum', 'control', 'guilt', 'boundary_push'];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Called by ConversationAnalyzerPolish on new analysis
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    setError(null);

    if (result && Array.isArray(result.signals)) {
      const highRiskFlags = result.signals.filter((flag) => HIGH_RISK_FLAGS.includes(flag));
      setHighRiskFlagsDetected(highRiskFlags);
    } else {
      setHighRiskFlagsDetected([]);
    }
  };

  // Clear alerts when analysis input is cleared
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlagsDetected([]);
    }
  }, [analysisResult]);

  // Error handling callback for ConversationAnalyzerPolish
  const handleError = (message) => {
    setError(message);
    setAnalysisResult(null);
    setHighRiskFlagsDetected([]);
  };

  // Toggle dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setError(null);
    setAnalysisResult(null);
    setHighRiskFlagsDetected([]);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header>
        <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED Conversation Analyzer</h1>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            type="button"
            className="peachy-button"
            onClick={toggleDashboard}
            aria-pressed={showDashboard}
            aria-label={showDashboard ? 'Switch to conversation paste analyzer' : 'Switch to real-time monitoring dashboard'}
          >
            {showDashboard ? 'Paste Conversation Analyzer' : 'Real-time Monitoring Dashboard'}
          </button>
        </div>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          onError={handleError}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} onError={handleError} loading={loading} setLoading={setLoading} />
          {error && (
            <div className="alert-banner" role="alert" aria-live="assertive" tabIndex={-1}>
              {error}
            </div>
          )}
          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => {
                  // Map signals into objects with type, label, confidence (confidence approximated by analysis confidence)
                  const label = sig.charAt(0).toUpperCase() + sig.slice(1);
                  return {
                    type: sig,
                    label,
                    confidence: analysisResult.confidence || 0,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} conversationExcerpt="" />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;