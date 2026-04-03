import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const highRiskFlags = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'control',
  'discard',
]);

const determineVerdictLabel = (band) => {
  if (band === 'green') return 'Safe';
  if (band === 'yellow') return 'Caution';
  if (band === 'red') return 'Flagged';
  return 'Safe';
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [realtimeMode, setRealtimeMode] = useState(false);

  // When new analysis result arrives, check if any high-risk flags triggered
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals?.length) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const foundFlags = analysisResult.signals.filter((flag) => highRiskFlags.has(flag));
    if (foundFlags.length > 0) {
      setAlertFlags(foundFlags);
      setShowAlert(true);
      // Trigger native alert immediately for critical alert
      alert(`⚠️ High-risk behavior detected: ${foundFlags.join(', ')}`);
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <h1 id="appTitle" style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>
        FLAGGED
      </h1>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <label htmlFor="modeToggle" style={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
          <input
            id="modeToggle"
            type="checkbox"
            checked={realtimeMode}
            onChange={(e) => setRealtimeMode(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Enable Real-Time Dashboard
        </label>
      </div>

      {showAlert && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          onDismiss={() => setShowAlert(false)}
          aria-live="assertive"
        />
      )}

      {realtimeMode ? (
        <RealTimeDashboard
          onAnalysis={(result) => {
            setAnalysisResult(result);
            setErrorMsg('');
            setLoading(false);
          }}
          onLoading={(isLoading) => setLoading(isLoading)}
          onError={(msg) => {
            setErrorMsg(msg);
            setLoading(false);
          }}
        />
      ) : (
        <section aria-labelledby="appTitle" style={{ marginTop: '1rem' }}>
          <ConversationAnalyzerPolish
            onAnalysis={(result) => {
              setAnalysisResult(result);
              setErrorMsg('');
              setLoading(false);
            }}
            onLoading={(isLoading) => setLoading(isLoading)}
            onError={(msg) => {
              setErrorMsg(msg);
              setLoading(false);
            }}
          />

          {loading && (
            <p
              role="status"
              aria-live="polite"
              style={{ marginTop: '1rem', fontWeight: '600', color: '#d17e00' }}
            >
              Analyzing conversation...
            </p>
          )}

          {errorMsg && (
            <p
              role="alert"
              aria-live="assertive"
              style={{ marginTop: '1rem', fontWeight: '700', color: '#cc2f2f' }}
            >
              {errorMsg}
            </p>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={determineVerdictLabel(analysisResult.verdict?.band.toLowerCase())}
                flaggedBehaviors={analysisResult.signals.map((signal) => {
                  // Map signals to label and confidence placeholder (confidence as 1 if absent)
                  return {
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysisResult.confidence || 1,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </section>
      )}

      <footer style={{ marginTop: '40px', textAlign: 'center', userSelect: 'none', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} FLAGGED
      </footer>
    </main>
  );
};

export default App;