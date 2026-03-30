import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'manipulation', 'gaslighting', 'discard', 'threat', 'ultimatum']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // When analysis result changes, check for high-risk flags
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }
    const flagged = analysisResult.signals || [];
    const highRiskDetected = flagged.filter((flag) => HIGH_RISK_FLAGS.has(flag));

    if (highRiskDetected.length > 0 && !alertDismissed) {
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult, alertDismissed]);

  const handleAnalyze = (result) => {
    setAnalysisResult(result);
    setAlertDismissed(false);
  };

  const handleDismissAlert = () => {
    setAlertDismissed(true);
    setAlertFlags([]);
  };

  const toggleDashboard = () => {
    setShowDashboard((show) => !show);
    // Reset analysis and alerts when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED Conversation Analyzer
        </h1>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button type="button" onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard}>
            {showDashboard ? 'Switch to Paste Analyzer' : 'Switch to Real-Time Dashboard'}
          </button>
        </div>
      </header>

      <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} />
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
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      ) : (
        <RealTimeDashboard />
      )}
    </main>
  );
};

export default App;