import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum', 'discard'];

/**
 * Main App component integrates the core conversation analyzer, immediate alerts,
 * result visualization, sharing, and real-time dashboard per product roadmap.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);
  const [lastTextAnalyzed, setLastTextAnalyzed] = useState('');

  // Check high risk flags to trigger immediate alert
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const detectedHighRisk = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag)
      );
      setImmediateAlertFlags(detectedHighRisk);
    } else {
      setImmediateAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis from analyzer component
  const handleAnalysis = (result, text) => {
    setAnalysisResult(result);
    setLastTextAnalyzed(text);
  };

  // Toggle between paste analyzer and real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear results and alerts when switching to dashboard to avoid confusion
    setAnalysisResult(null);
    setImmediateAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: '600' }}>
          Detect red flags in conversations: insults, manipulation, gaslighting, and more.
        </p>
      </header>

      <section aria-label="App main controls and results">
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? 'Switch to conversation paste analyzer'
              : 'Switch to real-time monitoring dashboard'
          }
          style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {showDashboard ? 'Paste Analyzer' : 'Real-time Dashboard'}
        </button>

        {showDashboard ? (
          <RealTimeDashboard
            onAnalysisUpdate={handleAnalysis}
          />
        ) : (
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />
        )}

        <ImmediateAlert flaggedBehaviors={immediateAlertFlags} />

        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={mapVerdictLabel(analysisResult.verdict?.label)}
              flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult
              verdict={mapVerdictLabel(analysisResult.verdict?.label)}
              flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
              overallConfidence={analysisResult.confidence || 0}
              conversationText={lastTextAnalyzed}
            />
          </>
        )}
      </section>
    </main>
  );
};

/**
 * Map verdict label string from backend format to UI format.
 * Backend returns label like "Safe", "Caution", "Flagged" or similar.
 * Here we normalize it strictly.
 */
function mapVerdictLabel(label) {
  if (!label) return 'Safe';

  const normalized = label.toLowerCase();
  if (normalized === 'safe' || normalized === 'green') return 'Safe';
  if (normalized === 'caution' || normalized === 'yellow') return 'Caution';
  if (normalized === 'flagged' || normalized === 'red') return 'Flagged';
  return 'Safe';
}

/**
 * Map backend signals array of strings to flaggedBehaviors objects for visualization
 * Each flagged behavior object: {type, label, confidence}
 * Confidence defaults to 1 if unknown (as backend signals do not carry confidence individually here).
 */
function mapSignalsToFlags(signals) {
  if (!Array.isArray(signals) || signals.length === 0) return [];

  // Map signal type to label for badges
  const signalLabels = {
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

  return signals.map((type) => ({
    type,
    label: signalLabels[type] || type.charAt(0).toUpperCase() + type.slice(1),
    confidence: 1,
  }));
}

export default App;