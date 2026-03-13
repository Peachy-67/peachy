import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'manipulation',
  'gaslighting',
  'discard',
  'control',
  'ultimatum',
  'threat',
  'boundary_push',
  'inconsistency',
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // When analysisResult updates, check for high-risk flags and trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setShowAlert(false);
      setHighRiskFlags([]);
      return;
    }
    const detectedHighRiskFlags = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    if (detectedHighRiskFlags.length > 0) {
      setShowAlert(true);
      setHighRiskFlags(detectedHighRiskFlags);
    } else {
      setShowAlert(false);
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis from conversation analyzer component
  const handleAnalyze = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between real-time dashboard and standard analyzer
  const toggleDashboard = () => {
    setUseRealTimeDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED &mdash; Conversation Red Flag Detector
        </h1>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            type="button"
            onClick={toggleDashboard}
            className="peachy-button"
            aria-pressed={useRealTimeDashboard}
            aria-label={`Switch to ${useRealTimeDashboard ? 'standard conversation analyzer' : 'real-time dashboard'}`}
          >
            {useRealTimeDashboard ? 'Use Conversation Analyzer' : 'Use Real-Time Dashboard'}
          </button>
        </div>
      </header>

      {showAlert && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlags.map((flag) => ({
            type: flag,
            label: flag.charAt(0).toUpperCase() + flag.slice(1),
            confidence: 1,
          }))}
          onDismiss={() => setShowAlert(false)}
        />
      )}

      {useRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalyze={handleAnalyze}
          initialResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} />

          {analysisResult && (
            <section aria-label="Analysis Result Visualization" tabIndex={-1}>
              <FlaggedResultVisualization
                verdict={convertBandToLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult result={analysisResult} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

// Helper to convert verdict band color code to label for FlaggedResultVisualization
const convertBandToLabel = (band) => {
  switch (band) {
    case 'green':
      return 'Safe';
    case 'yellow':
      return 'Caution';
    case 'red':
      return 'Flagged';
    default:
      return 'Safe';
  }
};

// Helper to map signals strings to objects for FlaggedResultVisualization
const mapSignalsToFlags = (signals) => {
  if (!Array.isArray(signals)) return [];
  return signals.map((signal) => {
    let label = signal.charAt(0).toUpperCase() + signal.slice(1);
    // Adjust some labels for clarity
    switch (signal) {
      case 'discard':
        label = 'Discard';
        break;
      case 'gaslighting':
        label = 'Gaslighting';
        break;
      case 'control':
        label = 'Control';
        break;
      case 'manipulation':
        label = 'Manipulation';
        break;
      case 'insult':
        label = 'Insult';
        break;
      case 'ultimatum':
        label = 'Ultimatum';
        break;
      case 'threat':
        label = 'Threat';
        break;
      case 'guilt':
        label = 'Guilt';
        break;
      case 'boundary_push':
        label = 'Boundary Push';
        break;
      case 'inconsistency':
        label = 'Inconsistency';
        break;
      default:
        label = signal.charAt(0).toUpperCase() + signal.slice(1);
    }
    return {
      type: signal,
      label,
      confidence: 1,
    };
  });
};

export default App;