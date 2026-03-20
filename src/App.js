import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolishImprovements.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum', 'discard'];

export default function App() {
  // State for analysis result from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);
  // State to control real-time dashboard visibility
  const [showDashboard, setShowDashboard] = useState(false);
  // State for immediate alert visibility and flagged high-risk behaviors
  const [alertFlags, setAlertFlags] = useState([]);

  // Called when conversation analyzer provides new result
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    // Find high risk flags in the result
    if (result && Array.isArray(result.signals)) {
      const foundAlerts = result.signals.filter(flag => HIGH_RISK_FLAGS.includes(flag));
      setAlertFlags(foundAlerts);
    } else {
      setAlertFlags([]);
    }
  };

  // Handler to dismiss alert banner
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggles between paste analyzer view and real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset analysis and alerts when toggling views for clarity
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  // Compose flagged behavior details for visualization and sharing
  // Map signals to flag objects with label and confidence (confidence from result or default 0.7)
  // We'll define user-friendly labels matching signals:
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

  const flaggedBehaviors = (analysisResult?.signals || []).map((sig) => ({
    type: sig,
    label: signalLabels[sig] || sig,
    confidence:
      typeof analysisResult.confidence === 'number'
        ? analysisResult.confidence
        : 0.7,
  }));

  // Verdict string mapped to standard labels used in visualization component
  // We accept verdict as object with band, or fallback
  // Map band to label for FlaggedResultVisualization ('Safe', 'Caution', 'Flagged')
  // Green = Safe, Yellow = Caution, Red = Flagged

  function verdictBandToLabel(band) {
    if (band === 'green') return 'Safe';
    if (band === 'yellow') return 'Caution';
    if (band === 'red') return 'Flagged';
    return 'Safe';
  }

  const verdictLabel = analysisResult?.verdict
    ? verdictBandToLabel(analysisResult.verdict.band)
    : 'Safe';

  // Overall confidence score number from 0 to 1
  const overallConfidence = analysisResult?.confidence || 0;

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 1.5rem auto' }}>
          Detect red flags in conversations and identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      <section aria-label="Toggle between paste analyzer and real-time dashboard" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
          aria-label={showDashboard ? 'Switch to paste conversation analysis' : 'Switch to real-time monitoring dashboard'}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          aria-label="Real-time conversation monitoring dashboard"
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          aria-label="Conversation analyzer input and result"
        />
      )}

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={handleDismissAlert}
      />

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            analysisResult={analysisResult}
            flaggedBehaviors={flaggedBehaviors}
            verdict={verdictLabel}
          />
        </>
      )}
    </div>
  );
}