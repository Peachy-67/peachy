import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolish.css';

const highRiskFlags = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'discard',
]);

function App() {
  // State for conversation analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for immediately alerting on high-risk flags
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  // Toggle for showing real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }

    // Check if analysis has any high risk flags to alert immediately
    const flaggedTypes = analysisResult.signals || [];
    const riskyFlagsFound = flaggedTypes.filter((flag) => highRiskFlags.has(flag));

    if (riskyFlagsFound.length > 0) {
      setAlertFlags(riskyFlagsFound);
      setShowAlert(true);

      // Trigger native alert as immediate notification
      alert(
        `⚠️ High-risk behaviors detected: ${riskyFlagsFound
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(', ')}`
      );
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  return (
    <main className="container" aria-label="Flagged conversation red flag detection app">
      <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
        FLAGGED: Conversation Red Flag Detector
      </h1>

      <section aria-label="Conversation analysis input and results" style={{ marginBottom: '2rem' }}>
        <ConversationAnalyzerPolish onAnalysis={setAnalysisResult} />
        {showAlert && (
          <ImmediateAlert
            flaggedBehaviors={alertFlags}
            onDismiss={() => setShowAlert(false)}
          />
        )}
        {analysisResult && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || 'Safe'}
              flaggedBehaviors={analysisResult.signals.map((sig) => ({
                type: sig,
                label: sig.charAt(0).toUpperCase() + sig.slice(1),
                confidence: 0.85, // Use a placeholder confidence or actual if available
              }))}
              overallConfidence={analysisResult.confidence}
            />
            <ShareableResult analysisResult={analysisResult} />
          </>
        )}
      </section>

      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setShowDashboard(!showDashboard)}
          aria-pressed={showDashboard}
          style={{
            marginBottom: '1rem',
            cursor: 'pointer',
            backgroundColor: '#cc2f2f',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#9f2727')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#cc2f2f')}
        >
          {showDashboard ? 'Hide' : 'Show'} Real-Time Dashboard
        </button>
        {showDashboard && <RealTimeDashboard />}
      </section>
    </main>
  );
}

export default App;