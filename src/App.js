import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'discard',
  'control',
  'manipulation',
]);

const App = () => {
  // Analysis result state:
  // shape: { verdict: string, signals: [], confidence: number, ... }
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [showRealtimeDashboard, setShowRealtimeDashboard] = useState(false);

  // On new analysis result, check for high-risk flags and trigger alert
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      setAlertVisible(false);
      return;
    }
    const detectedFlags = analysisResult.signals || [];
    const highRiskDetected = detectedFlags.filter((f) => HIGH_RISK_FLAGS.has(f));
    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      setAlertVisible(true);
      // Also show native alert immediately
      alert(
        `⚠️ High-risk behavior detected: ${highRiskDetected
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(', ')}`
      );
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Handler to dismiss visible alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle realtime dashboard on/off
  const toggleRealtimeDashboard = () => {
    setShowRealtimeDashboard((v) => !v);
    // Clear alert and analysis on dashboard toggle for clean state
    setAlertVisible(false);
    setAlertFlags([]);
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <header>
        <h1 style={{ userSelect: 'none', color: '#ff6f61', textAlign: 'center' }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Toggle between paste analyzer and real-time dashboard" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={toggleRealtimeDashboard}
          aria-pressed={showRealtimeDashboard}
          aria-label={showRealtimeDashboard ? 'Switch to Paste Analyzer View' : 'Switch to Real-Time Dashboard View'}
          className="peachy-button"
          style={{ maxWidth: '280px' }}
        >
          {showRealtimeDashboard ? 'Switch to Paste Analyzer' : 'Switch to Real-Time Dashboard'}
        </button>
      </section>

      {alertVisible && alertFlags.length > 0 && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags.map((flag) => ({
            type: flag,
            label: flag.charAt(0).toUpperCase() + flag.slice(1),
            confidence: 1,
          }))}
          onDismiss={dismissAlert}
        />
      )}

      {!showRealtimeDashboard && (
        <>
          <ConversationAnalyzerPolish onResult={(result) => setAnalysisResult(result)} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={mapVerdictLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                verdict={mapVerdictLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
                overallConfidence={analysisResult.confidence}
              />
            </>
          )}
        </>
      )}

      {showRealtimeDashboard && (
        <RealTimeDashboard
          show
          onAnalysisUpdate={(result) => setAnalysisResult(result)}
        />
      )}
    </main>
  );
};

/**
 * Map backend verdict band to readable label for UI
 * @param {string} band - 'green' | 'yellow' | 'red'
 * @returns {string} 'Safe' | 'Caution' | 'Flagged'
 */
function mapVerdictLabel(band) {
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
}

/**
 * Map signals array to flagged behavior objects for visualization and sharing
 * Assign label and confidence (use overallConfidence estimate)
 * @param {string[]} signals
 * @param {number} confidence
 * @returns {Array<{type: string, label: string, confidence: number}>}
 */
function mapSignalsToFlags(signals, confidence) {
  if (!Array.isArray(signals) || signals.length === 0) {
    return [];
  }
  // Map known flags to labels, fallback to capitalized type
  const labelMap = {
    insult: 'Insult',
    manipulation: 'Manipulation',
    gaslighting: 'Gaslighting',
    discard: 'Discard',
    control: 'Control',
    ultimatum: 'Ultimatum',
    threat: 'Threat',
    guilt: 'Guilt',
    boundary_push: 'Boundary Push',
    inconsistency: 'Inconsistency',
  };

  // For simplicity assign overall confidence to each flag
  return signals.map((s) => ({
    type: s,
    label: labelMap[s] || s.charAt(0).toUpperCase() + s.slice(1),
    confidence: confidence || 0.7,
  }));
}

export default App;