import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum', 'discard', 'control'];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Show alert banner and native alert for any high-risk flags detected
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertVisible(false);
      return;
    }
    const hasHighRisk = analysisResult.signals.some((s) =>
      HIGH_RISK_FLAGS.includes(s.toLowerCase())
    );
    if (hasHighRisk) {
      setAlertVisible(true);
      alert(
        'Warning: High-risk behaviors detected in conversation!\nPlease review carefully.'
      );
    } else {
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler for error during analysis
  const handleError = (err) => {
    setAnalysisResult(null);
    setError(err);
    setLoading(false);
  };

  // Handler for loading state during analysis
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Dismiss alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle between paste-analyzer and real-time dashboard mode
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear current data and errors on mode switch
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation red flags detection app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>
          FLAGGED Conversation Red Flags Detector
        </h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer view" : "Switch to real-time dashboard view"}
          style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {showDashboard ? 'Paste Conversation Analyzer' : 'Real-Time Dashboard'}
        </button>
      </header>

      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={analysisResult?.signals || []}
          onDismiss={dismissAlert}
        />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onResult={handleAnalysisUpdate}
            onError={handleError}
            onLoading={handleLoading}
          />

          {loading && (
            <div role="status" aria-live="polite" style={{ textAlign: 'center', marginTop: '1rem' }}>
              Analyzing conversation...
            </div>
          )}

          {error && (
            <div role="alert" className="alert-banner" style={{ marginTop: '1rem' }}>
              {error.toString()}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
          initialAnalysis={analysisResult}
        />
      )}
    </main>
  );
};

export default App;