import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolish.css';

const HIGH_RISK_FLAGS = [
  'insult',
  'manipulation',
  'gaslighting',
  'discard',
  'control',
  'ultimatum',
  'threat',
  'guilt',
  'boundary_push',
  'inconsistency',
];

// The main app component combining analyzer, results visualization,
// immediate alert on high-risk flags, sharing capabilities,
// and a toggleable real-time dashboard per product roadmap.
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update high-risk alert flags when analysisResult changes
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setHighRiskFlagsDetected([]);
      return;
    }
    const detectedFlags = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag.toLowerCase())
    );

    setHighRiskFlagsDetected(detectedFlags);
  }, [analysisResult]);

  // Handler passed to ConversationAnalyzerPolish and RealTimeDashboard
  // Called when new analysis is available
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="container" role="main" aria-label="FLAGGED conversation analysis application">
      <header>
        <h1 tabIndex={-1} style={{ userSelect: 'none', textAlign: 'center', color: '#cc2f2f' }}>
          FLAGGED
        </h1>
      </header>

      <section aria-labelledby="analyzer-label" style={{ marginBottom: '2rem' }}>
        <h2 id="analyzer-label" className="ui-section-header">
          Conversation Analyzer
        </h2>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} />

      {analysisResult && (
        <section aria-labelledby="results-label" style={{ marginBottom: '2rem' }}>
          <h2 id="results-label" className="ui-section-header">
            Analysis Results
          </h2>
          {/* Show polished flagged result visualization */}
          <FlaggedResultVisualization
            verdict={mapVerdictLabel(analysisResult.verdict)}
            flaggedBehaviors={mapFlags(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
          />
          {/* Include shareable UI */}
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      <section aria-label="Toggle real-time dashboard" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Hide real-time dashboard' : 'Show real-time dashboard'}
        >
          {showDashboard ? 'Hide Real-Time Dashboard' : 'Show Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard && (
        <section aria-labelledby="dashboard-label">
          <h2 id="dashboard-label" className="ui-section-header">
            Real-Time Conversation Dashboard
          </h2>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
};

// Helper to map verdict object properties to verdict string expected by FlaggedResultVisualization
function mapVerdictLabel(verdictObj) {
  if (!verdictObj || typeof verdictObj !== 'object') return 'Safe';
  // Map backend verdict band to frontend verdict string:
  // backend bands: green, yellow, red
  // frontend verdicts: Safe, Caution, Flagged
  switch ((verdictObj.band || '').toLowerCase()) {
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

// Map signals into flaggedBehaviors array shape expected by visualization: {type, label, confidence}
function mapFlags(signalsArray, confidence) {
  if (!Array.isArray(signalsArray) || signalsArray.length === 0) return [];
  // Use confidence from analysis for all flags as proxy
  return signalsArray.map((flagType) => ({
    type: flagType.toLowerCase(),
    label: capitalize(flagType),
    confidence: confidence || 0,
  }));
}

function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default App;