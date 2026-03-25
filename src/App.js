import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'threat', 'gaslighting', 'discard', 'control'];

/**
 * Main App component integrating:
 * - Conversation paste analyzer
 * - Immediate alerts on high-risk flags
 * - Polished flagged result visualization
 * - Shareable results with share/copy options
 * - Toggleable real-time dashboard for live monitoring
 */
function App() {
  // Analysis result state from conversation analyzer or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // Show immediate alert banner based on presence of high-risk flags in analysis
  const [showAlert, setShowAlert] = useState(false);
  // Currently active real-time dashboard mode toggle
  const [useRealtimeDashboard, setUseRealtimeDashboard] = useState(false);

  // Check for any high-risk flags in current analysis and trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setShowAlert(false);
      return;
    }
    const detectedFlags = analysisResult.signals.map((s) => s.toLowerCase());
    const hasHighRisk = HIGH_RISK_FLAGS.some((flag) => detectedFlags.includes(flag));
    setShowAlert(hasHighRisk);
  }, [analysisResult]);

  // Handler to dismiss alert banner manually
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Handler passed to ConversationAnalyzerPolish and RealTimeDashboard to update analysisResult
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between conversation paste analyzer and real-time dashboard mode
  const toggleDashboard = () => {
    setAnalysisResult(null);
    setShowAlert(false);
    setUseRealtimeDashboard(!useRealtimeDashboard);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation red flag detector app">
      <header>
        <h1 style={{ userSelect: 'none', textAlign: 'center', color: '#ff6f61', marginBottom: '1rem' }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
      </header>

      <section aria-label="Mode toggle controls" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={useRealtimeDashboard}
          aria-label={
            useRealtimeDashboard
              ? 'Switch to conversation paste analyzer mode'
              : 'Switch to real-time monitoring dashboard mode'
          }
        >
          {useRealtimeDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      {/* Immediate alert banner for high-risk flags */}
      {showAlert && analysisResult && (
        <ImmediateAlert flaggedBehaviors={analysisResult.signals} onDismiss={dismissAlert} />
      )}

      {/* Show Real-Time Dashboard or Paste Analyzer accordingly */}
      {useRealtimeDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysis} currentAnalysis={analysisResult} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />

          {/* Visualize flagged result with verdict and badges */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || 'Safe'}
              flaggedBehaviors={analysisResult.signals.map((flag) => ({
                type: flag,
                label: flag.charAt(0).toUpperCase() + flag.slice(1),
                confidence: 1, // Assuming confidence 1 for signals array as default (no exact confidences previously passed)
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
          )}

          {/* Shareable result UI with sharing and copying options */}
          {analysisResult && <ShareableResult analysis={analysisResult} />}
        </>
      )}
    </main>
  );
}

export default App;