import React, { useState, useEffect } from 'react';
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
  'ultimatum',
  'control',
]);

const App = () => {
  // State for last analyzed result from conversation input or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // State to track if an alert should be shown (based on high-risk flags)
  const [showAlert, setShowAlert] = useState(false);
  // Which high-risk flags triggered the alert
  const [alertFlags, setAlertFlags] = useState([]);
  // Whether real-time dashboard mode is enabled
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Helper to update alert state based on flagged behaviors
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    if (highRiskDetected.length > 0) {
      setShowAlert(true);
      setAlertFlags(highRiskDetected);
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to receive analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle real-time dashboard mode
  const toggleRealTimeMode = () => {
    setRealTimeMode((prev) => !prev);
    // Reset analysis result when toggling modes
    setAnalysisResult(null);
    setShowAlert(false);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED – Conversation Red Flags Detector
        </h1>
        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            userSelect: 'none',
            fontSize: '0.95rem',
            color: '#555',
          }}
        >
          <button
            type="button"
            onClick={toggleRealTimeMode}
            aria-pressed={realTimeMode}
            className="peachy-button"
            style={{ minWidth: '240px' }}
          >
            {realTimeMode ? 'Switch to Manual Analyzer' : 'Switch to Real-time Dashboard'}
          </button>
        </div>
      </header>

      {showAlert && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={() => setShowAlert(false)} />
      )}

      <section aria-live="polite" aria-label="Conversation analysis input and results" tabIndex={-1}>
        {!realTimeMode && (
          <>
            <ConversationAnalyzerPolish onAnalyze={onAnalysisUpdate} />
            {analysisResult && (
              <>
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict.label || 'Safe'}
                  flaggedBehaviors={analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysisResult.confidence ?? 0,
                  }))}
                  overallConfidence={analysisResult.confidence ?? 0}
                />
                <ShareableResult analysis={analysisResult} />
              </>
            )}
          </>
        )}
        {realTimeMode && (
          <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;