import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolishImprovements.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'control',
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags immediately when new analysis arrives
  useEffect(() => {
    if (analysisResult?.signals?.length) {
      const detectedHighRiskFlags = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(detectedHighRiskFlags);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Extract verdict band and label for visualization
  const verdictLabel = (() => {
    if (!analysisResult?.verdict) return 'Safe';
    const band = analysisResult.verdict.band || 'green';
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
  })();

  // Prepare flagged behavior objects for FlaggedResultVisualization and ShareableResult
  // Map signals from strings to {type, label, confidence}
  // Use label capitalization by default
  const flaggedBehaviors = (analysisResult?.signals || []).map((type) => {
    // Find label for known types, fallback to capitalized type
    // Confidence extracted from analysisResult.confidence if available, else 0.5
    let label = '';
    switch (type) {
      case 'insult':
        label = 'Insult';
        break;
      case 'manipulation':
        label = 'Manipulation';
        break;
      case 'gaslighting':
        label = 'Gaslighting';
        break;
      case 'discard':
        label = 'Discard';
        break;
      case 'control':
        label = 'Control';
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
        label = type.charAt(0).toUpperCase() + type.slice(1);
    }
    return {
      type,
      label,
      confidence: analysisResult?.confidence || 0.5,
    };
  });

  // Handler for analysis updates from input component
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analysis Application">
      <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Conversation input and analysis section" tabIndex={-1}>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      <ImmediateAlert flags={alertFlags} />

      {analysisResult && (
        <section aria-label="Analysis results" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            confidence={analysisResult.confidence || 0}
            reasons={analysisResult.why || []}
            watchNext={analysisResult.watch_next || []}
          />
        </section>
      )}

      <section aria-label="Real-time conversation monitoring dashboard toggle" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-controls="real-time-dashboard"
        >
          {showDashboard ? 'Hide Real-Time Dashboard' : 'Show Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard && (
        <section id="real-time-dashboard" aria-live="polite" style={{ marginTop: '2rem' }}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} alertFlags={alertFlags} />
        </section>
      )}
    </main>
  );
}

export default App;