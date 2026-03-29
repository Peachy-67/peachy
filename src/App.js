import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum', 'discard', 'control', 'guilt']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  const onAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    if (result && Array.isArray(result.signals)) {
      // Determine if any high-risk flags are present
      const highRiskDetected = result.signals.filter((f) => HIGH_RISK_FLAGS.has(f));
      if (highRiskDetected.length > 0) {
        setAlertFlags(highRiskDetected);
        setAlertVisible(true);
      } else {
        setAlertFlags([]);
        setAlertVisible(false);
      }
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  };

  const dismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>FLAGGED Conversation Analyzer</h1>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          className="peachy-button"
          type="button"
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Open Real-Time Dashboard'}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={onAnalysisUpdate} />
      )}

      {alertVisible && alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisData={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;