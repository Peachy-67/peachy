import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

/**
 * Main app component integrating all best existing core UI components into a cohesive product interface.
 * Manages analysis state, triggers immediate alerts on high-risk flags, displays flagged results with sharing,
 * and supports real-time monitoring dashboard toggle, per product roadmap.
 */
const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track if any high-risk flags are present
  const [highRiskFlags, setHighRiskFlags] = useState([]);

  // Toggle to show real-time dashboard or paste input analyzer
  const [showDashboard, setShowDashboard] = useState(false);

  // Handle new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleNewAnalysis = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);

    // Determine high-risk flags to trigger immediate alert
    if (result && Array.isArray(result.signals)) {
      const highRiskSignalSet = new Set(['insult', 'gaslighting', 'discard', 'control', 'threat', 'ultimatum']);
      const presentHighRiskFlags = result.signals.filter((signal) => highRiskSignalSet.has(signal));
      setHighRiskFlags(presentHighRiskFlags);
    } else {
      setHighRiskFlags([]);
    }
  };

  // Handle errors from ConversationAnalyzerPolish or RealTimeDashboard
  const handleError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
    setAnalysis(null);
    setHighRiskFlags([]);
  };

  // Handle loading state for analysis calls
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Clear the immediate alert banner when dismissed
  const handleDismissAlert = () => {
    setHighRiskFlags([]);
  };

  // Extract verdict label from analysis for visualization and sharing
  const verdictLabel = analysis?.verdict?.label
    ? capitalizeFirstLetter(analysis.verdict.label)
    : 'Safe';

  // Compose detailed flags with labels and confidence for visualization and sharing
  // Map signals array to flaggedBehaviors prop structure for FlaggedResultVisualization
  const flaggedBehaviors =
    analysis?.signals?.map((signal) => {
      // Map known signals to labels that match FlagBadge labels if any specific mapping needed
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
      return {
        type: signal,
        label: labelMap[signal] || capitalizeFirstLetter(signal),
        confidence: analysis.confidence || 0.5,
      };
    }) || [];

  // Overall confidence score for visualization
  const overallConfidence = analysis?.confidence || 0;

  // Compose concise share text for ShareableResult
  const shareText = generateShareText(analysis);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ userSelect: 'none', textAlign: 'center', color: '#cc2f2f', marginBottom: '1rem' }}>
        FLAGGED Conversation Red Flags Detector
      </h1>

      <button
        className="peachy-button"
        onClick={() => setShowDashboard((v) => !v)}
        aria-pressed={showDashboard}
        aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
        style={{ marginBottom: '1rem' }}
      >
        {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
      </button>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} onDismiss={handleDismissAlert} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleNewAnalysis}
          onError={handleError}
          onLoading={handleLoading}
          initialAnalysis={analysis}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleNewAnalysis}
          onError={handleError}
          onLoading={handleLoading}
        />
      )}

      {loading && !showDashboard && (
        <p role="status" aria-live="polite" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Analyzing conversation, please wait...
        </p>
      )}

      {error && !showDashboard && (
        <p
          role="alert"
          aria-live="assertive"
          style={{
            color: '#cc2f2f',
            fontWeight: '700',
            backgroundColor: '#fff0f0',
            padding: '8px 12px',
            borderRadius: '6px',
            textAlign: 'center',
            marginTop: '1rem',
          }}
        >
          {error}
        </p>
      )}

      {analysis && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            analysis={analysis}
            shareText={shareText}
            containerStyle={{ marginTop: '1.5rem', marginBottom: '2rem' }}
          />
        </>
      )}
    </main>
  );
};

// Utility to capitalize first letter for strings
function capitalizeFirstLetter(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate share summary text for the conversation analysis, concise and viral-friendly
function generateShareText(analysis) {
  if (!analysis) return 'FLAGGED analysis results';

  const verdictMap = {
    green: 'Safe',
    yellow: 'Caution',
    red: 'Flagged',
  };

  const verdictBand = analysis.verdict?.band || 'green';
  const verdictLabel = verdictMap[verdictBand] || 'Safe';

  const flags = (analysis.signals || []).join(', ') || 'none';

  const confidencePercent = Math.round((analysis.confidence ?? 0) * 100);

  const excerpt = (analysis.watch_next && analysis.watch_next.length > 0)
    ? `Note: ${analysis.watch_next[0]}`
    : '';

  return [
    `FLAGGED Conversation Analysis: ${verdictLabel}`,
    `Flags: ${flags}`,
    `Confidence: ${confidencePercent}%`,
    excerpt,
    'Try at https://flagged.run',
  ]
    .filter(Boolean)
    .join('\n');
}

export default App;