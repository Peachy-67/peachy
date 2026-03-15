import React, { useState, useEffect, useCallback } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';
import './styles/UiPolishImprovements.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum'];

const App = () => {
  // State for current analyzed result
  const [analysisResult, setAnalysisResult] = useState(null); 
  // Chat input mode: "paste" or "realtime"
  const [activeMode, setActiveMode] = useState('paste');
  // Alert banner visibility
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Callback when new analysis result arrives (from ConversationAnalyzer or dashboard)
  const onNewAnalysis = useCallback((result) => {
    setAnalysisResult(result);

    // Check for high risk flag
    if (
      result?.flaggedBehaviors &&
      result.flaggedBehaviors.some((f) => HIGH_RISK_FLAGS.includes(f.type.toLowerCase()))
    ) {
      const highRiskDetected = result.flaggedBehaviors.filter((f) =>
        HIGH_RISK_FLAGS.includes(f.type.toLowerCase())
      );
      setAlertFlags(highRiskDetected);
      setShowAlert(true);
      // Also use native alert for immediate attention
      if (highRiskDetected.length > 0) {
        alert(
          `Warning: High-risk behaviors detected: ${highRiskDetected
            .map((f) => f.label)
            .join(', ')}`
        );
      }
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, []);

  // Handler to dismiss alert banner
  const onDismissAlert = () => {
    setShowAlert(false);
  };

  // Mode toggle for user choice
  const toggleMode = () => {
    setActiveMode((prev) => (prev === 'paste' ? 'realtime' : 'paste'));
    setAnalysisResult(null);
    setShowAlert(false);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED application main interface">
      <header>
        <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>
          FLAGGED: Conversation Red Flags Detector
        </h1>
        <button
          onClick={toggleMode}
          aria-pressed={activeMode === 'realtime'}
          className="peachy-button"
          style={{ marginBottom: '1.5rem', display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '300px' }}
          title={`Switch to ${activeMode === 'paste' ? 'Real-Time Dashboard' : 'Paste Analyzer'} mode`}
        >
          Switch to {activeMode === 'paste' ? 'Real-Time Dashboard' : 'Paste Analyzer'}
        </button>
      </header>

      {showAlert && alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
      )}

      {activeMode === 'paste' && (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={onNewAnalysis} />

          {analysisResult && (
            <section
              aria-live="polite"
              aria-label="Analysis results and sharing options"
              style={{ marginTop: '1.5rem', textAlign: 'center' }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult result={analysisResult} />
            </section>
          )}
        </>
      )}

      {activeMode === 'realtime' && (
        <RealTimeDashboard onAnalysis={onNewAnalysis} />
      )}
    </main>
  );
};

export default App;