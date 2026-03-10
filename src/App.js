import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'discard',
  'control',
]);

const initialAnalysisState = {
  verdict: 'Safe',
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawResult: null,
};

function App() {
  const [analysis, setAnalysis] = useState(initialAnalysisState);
  const [showImmediateAlert, setShowImmediateAlert] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Update analysis and trigger alert if high-risk flags detected
  const handleAnalysisUpdate = (result) => {
    if (
      result &&
      result.verdict &&
      Array.isArray(result.signals)
    ) {
      const flaggedBehaviors = result.signals.map((signal) => {
        // Use capitalized label for display, fallback to signal text
        const label = signal.charAt(0).toUpperCase() + signal.slice(1);
        return { type: signal, label, confidence: 1 };
      });

      // Determine verdict label for compatibility (Safe, Caution, Flagged)
      // We assume verdict is "Safe" | "Caution" | "Flagged" string or map accordingly
      let verdictLabel = 'Safe';
      // Try to map verdict band to label
      if (result.verdict.label) {
        verdictLabel = result.verdict.label;
      } else if (result.verdict.band) {
        const bandStr = result.verdict.band.toLowerCase();
        if (bandStr === 'red') verdictLabel = 'Flagged';
        else if (bandStr === 'yellow') verdictLabel = 'Caution';
        else verdictLabel = 'Safe';
      }

      const overallConfidence = typeof result.confidence === 'number' ? result.confidence : 0;

      setAnalysis({
        verdict: verdictLabel,
        flaggedBehaviors,
        overallConfidence,
        rawResult: result,
      });

      // Extract any high-risk flags present
      const highRiskDetected = flaggedBehaviors.filter(({ type }) => HIGH_RISK_FLAGS.has(type.toLowerCase()));
      setHighRiskFlags(highRiskDetected);

      setShowImmediateAlert(highRiskDetected.length > 0);
    } else {
      // Reset to safe state
      setAnalysis(initialAnalysisState);
      setHighRiskFlags([]);
      setShowImmediateAlert(false);
    }
  };

  // Dismiss immediate alert
  const dismissAlert = () => {
    setShowImmediateAlert(false);
  };

  // Toggle dashboard view
  const toggleDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
      </header>

      <section aria-label="Conversation analysis section">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

        {showImmediateAlert && (
          <ImmediateAlert flags={highRiskFlags} onDismiss={dismissAlert} />
        )}

        {analysis.rawResult && !showRealTimeDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={analysis.verdict}
              flaggedBehaviors={analysis.flaggedBehaviors}
              overallConfidence={analysis.overallConfidence}
            />
            <ShareableResult result={analysis.rawResult} />
          </>
        )}
      </section>

      <section aria-label="Real-time dashboard toggle control" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showRealTimeDashboard}
          aria-label={showRealTimeDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showRealTimeDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showRealTimeDashboard && (
        <section aria-label="Real-time dashboard section" style={{ marginTop: '2rem' }}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
}

export default App;