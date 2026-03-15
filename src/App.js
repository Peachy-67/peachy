import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const highRiskFlags = new Set(['insult', 'gaslighting', 'threat', 'ultimatum', 'discard', 'control']);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Extract flagged behaviors array for visualization
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    // Map signals to labeled behavior objects with confidence placeholders (use confidence 1 as default)
    return analysisResult.signals.map((signal) => ({
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: 1,
    }));
  }, [analysisResult]);

  // Determine the verdict string based on analysis result verdict.band
  const verdict = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return 'Safe';
    switch (analysisResult.verdict.band) {
      case 'green':
        return 'Safe';
      case 'yellow':
        return 'Caution';
      case 'red':
        return 'Flagged';
      default:
        return 'Safe';
    }
  }, [analysisResult]);

  // Overall confidence score from analysis
  const overallConfidence = analysisResult?.confidence ?? 0;

  // Watch for high risk flags to trigger alerts
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const detectedHighRiskFlags = analysisResult.signals.filter((flag) => highRiskFlags.has(flag));
    if (detectedHighRiskFlags.length > 0) {
      setAlertFlags(detectedHighRiskFlags);
      // Immediate native alert
      alert(`Warning! High-risk behavior(s) detected: ${detectedHighRiskFlags.join(', ')}`);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
  }

  function toggleDashboard() {
    setShowDashboard((prev) => !prev);
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection application">
      <h1 tabIndex={-1}>FLAGGED Conversation Analyzer</h1>

      <button
        type="button"
        className="peachy-button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        aria-label={showDashboard ? 'Switch to Paste Analyzer View' : 'Switch to Real-Time Dashboard View'}
      >
        {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
      </button>

      <ImmediateAlert highRiskFlags={alertFlags} />

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && <RealTimeDashboard onAnalysisComplete={handleAnalysisUpdate} />}
    </main>
  );
}

export default App;