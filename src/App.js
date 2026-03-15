import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css'; // Core UI polish styles

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'discard',
  'threat',
  'ultimatum',
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // When analysis result changes, determine if we have any high-risk flags to alert user immediately
  useEffect(() => {
    if (analysisResult) {
      const flaggedTypes = analysisResult.signals || [];
      // Filter flags to those high-risk and present in current signals
      const relevantHighRisk = flaggedTypes.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      if (relevantHighRisk.length > 0 && !alertDismissed) {
        setAlertFlags(relevantHighRisk);
        // Also immediate native alert for visibility
        window.alert(
          `High-risk behavior detected: ${relevantHighRisk.join(', ')}.\nPlease proceed with caution.`
        );
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult, alertDismissed]);

  // Handle dismissal of alert banner
  const onDismissAlert = () => {
    setAlertDismissed(true);
  };

  // Reset alert dismissed on new analysis to allow show again if needed
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysisResult]);

  // Toggle dashboard vs paste analyzer view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none' }}>
        <h1 style={{ color: '#cc2f2f', fontWeight: 700, fontSize: '2rem' }}>FLAGGED</h1>
        <p style={{ maxWidth: 480, margin: '0.25rem auto', fontSize: '1rem', color: '#666' }}>
          Detect red flags in conversations to identify manipulation, gaslighting, and harmful behavior.
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginTop: '0.5rem' }}
        >
          {showDashboard ? 'Switch to Paste Analyzer' : 'Switch to Real-Time Dashboard'}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard onAnalyze={setAnalysisResult} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={setAnalysisResult} />
          {alertFlags.length > 0 && (
            <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
          )}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={mapVerdictLabel(analysisResult.verdict)}
                flaggedBehaviors={mapFlaggedBehaviors(analysisResult.signals, analysisResult.confidence)}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                analysis={analysisResult}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}

/**
 * Helper to normalize verdict label for visualization component.
 * The backend verdict has label and band, but visualization expects label keys 'Safe', 'Caution', 'Flagged'.
 * Mapping:
 *  band green -> Safe
 *  band yellow -> Caution
 *  band red -> Flagged
 */
function mapVerdictLabel(verdict) {
  if (!verdict || !verdict.band) return 'Safe';
  switch (verdict.band) {
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
 * Helper to map signals array into array of flagged behaviors with labels and confidence.
 * We provide label as capitalized signal type.
 * Confidence is from analysis confidence.
 * We assign label capitalization variants with spaces if needed.
 */
function mapFlaggedBehaviors(signals, confidence) {
  if (!Array.isArray(signals)) return [];
  const labelOverrides = {
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

  // Provide each flagged behavior with type, label, and confidence (same overall here)
  return signals.map((type) => ({
    type,
    label: labelOverrides[type] || capitalize(type),
    confidence: confidence || 0,
  }));
}

function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default App;