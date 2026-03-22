import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Update alert flags on new analysis results
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      // Define high-risk flags that cause immediate alerts
      const highRiskFlags = ['threat', 'ultimatum', 'insult', 'gaslighting', 'discard'];
      const foundHighRisk = analysisResult.signals.filter((signal) =>
        highRiskFlags.includes(signal)
      );
      setAlertFlags(foundHighRisk);
      if (foundHighRisk.length > 0) {
        // Trigger native alert too
        alert(`High-risk flag(s) detected: ${foundHighRisk.join(', ')}`);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleAnalysisUpdate = (result, err) => {
    if (err) {
      setError(err);
      setAnalysisResult(null);
    } else {
      setError(null);
      setAnalysisResult(result);
    }
  };

  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear analysis and errors when switching views
    setError(null);
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <h1 style={{ textAlign: 'center', color: '#ff6138', userSelect: 'none' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        className="peachy-button"
        aria-pressed={showDashboard}
        aria-label={showDashboard ? 'Switch to Paste Analyzer mode' : 'Switch to Real Time Dashboard mode'}
        style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
      >
        {showDashboard ? 'Switch to Paste Analyzer' : 'Switch to Real Time Dashboard'}
      </button>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: '1rem' }}
            >
              {error}
            </div>
          )}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label:
                    signal.charAt(0).toUpperCase() + signal.slice(1).replace('_', ' '),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;