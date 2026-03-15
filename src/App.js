import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolish.css';

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Determine high-risk flags from signals for immediate alerts
  const highRiskFlags = ['insult', 'threat', 'ultimatum', 'gaslighting', 'discard', 'control', 'manipulation'];

  // Handler to receive analysis result from conversation analyzer
  const handleAnalysis = (result) => {
    setAnalysisResult(result);

    if (result && result.signals && result.signals.length > 0) {
      // Filter signals to only high-risk flags for alert
      const detectedHighRisk = result.signals.filter((flag) => highRiskFlags.includes(flag));
      if (detectedHighRisk.length > 0) {
        setAlertFlags(detectedHighRisk);
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertFlags([]);
      }
    } else {
      // No flags, hide alert
      setShowAlert(false);
      setAlertFlags([]);
    }
  };

  // Dismiss the visible alert banner
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Compose flagged behaviors array for visualization and sharing if analysis exists
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    return analysisResult.signals.map((signal) => ({
      type: signal.toLowerCase(),
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysisResult.confidence || 0,
    }));
  }, [analysisResult]);

  // Verdict mapping for visualization using band -> label
  const verdictMap = {
    green: 'Safe',
    yellow: 'Caution',
    red: 'Flagged',
  };

  // Determine verdict label for visualization
  const verdict =
    analysisResult && analysisResult.verdict && analysisResult.verdict.band
      ? verdictMap[analysisResult.verdict.band] || 'Safe'
      : 'Safe';

  // Overall confidence for visualization
  const overallConfidence = analysisResult ? analysisResult.confidence || 0 : 0;

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer main application">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
      </header>

      <section aria-label="Conversation input and analysis section">
        {!showDashboard && (
          <>
            <ConversationAnalyzerPolish onAnalyze={handleAnalysis} />

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
      </section>

      <section aria-label="Real-time dashboard toggle and view" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={showDashboard ? 'Hide real-time dashboard' : 'Show real-time dashboard'}
        >
          {showDashboard ? 'Hide Real-time Dashboard' : 'Show Real-time Dashboard'}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: '1.5rem' }}>
          <RealTimeDashboard />
        </section>
      )}

      {showAlert && alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />
      )}

      <footer style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        <small>© 2024 FLAGGED - Powered by Peachy AI</small>
      </footer>
    </main>
  );
};

export default App;