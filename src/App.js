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
  'guilt',
  'boundary_push',
]);

const convertSignalsToFlags = (signals) => {
  // Map signals to flagged behaviors structure for visualization components
  // Use consistent labels and confidence placeholder (assumes 0.8 if unknown)
  return signals.map((sig) => {
    // Label variant for some common flags
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
      type: sig,
      label: labelMap[sig] || sig.charAt(0).toUpperCase() + sig.slice(1),
      confidence: 0.8, // default confidence, real confidence not exposed from backend currently
    };
  });
};

function App() {
  // State for conversation input analysis
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // State for immediate alert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);

  // State toggle for real-time dashboard mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Effect to reset alert dismissal if analysis changes
  useEffect(() => {
    setAlertDismissed(false);
  }, [currentAnalysis]);

  // Check if any high-risk flags present in current analysis
  const highRiskFlagsDetected =
    currentAnalysis?.signals?.some((signal) => HIGH_RISK_FLAGS.has(signal)) && !alertDismissed;

  // Convert signals to flagged behaviors for visualization components
  const flaggedBehaviors = currentAnalysis?.signals
    ? convertSignalsToFlags(currentAnalysis.signals)
    : [];

  // Determine verdict label: map backend band to Safe|Caution|Flagged as per VerdictDisplay expectations
  const mapBandToVerdict = (band) => {
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
  const verdict =
    currentAnalysis && currentAnalysis.verdict
      ? mapBandToVerdict(currentAnalysis.verdict.band)
      : 'Safe';

  // Overall confidence from backend analysis or fallback 0
  const overallConfidence = currentAnalysis?.confidence ?? 0;

  // Handle analysis result from ConversationAnalyzerPolish component
  const handleAnalysis = (result) => {
    setCurrentAnalysis(result);
    setAnalysisError(null);
  };

  // Handle analysis error from ConversationAnalyzerPolish component
  const handleError = (error) => {
    setAnalysisError(error);
    setCurrentAnalysis(null);
  };

  return (
    <main className="ui-container" aria-live="polite" aria-label="FLAGGED conversation analyzer application">
      <h1 tabIndex={-1} style={{ userSelect: 'none', textAlign: 'center', color: '#cc2f2f', marginBottom: '1rem' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Real-time conversation dashboard toggle" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={showDashboard ? "Switch to manual conversation analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          onError={handleError}
          initialResult={currentAnalysis}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysis}
            onError={handleError}
            loading={isLoading}
            setLoading={setIsLoading}
          />

          {analysisError && (
            <div
              role="alert"
              className="alert-banner"
              style={{ marginTop: '1rem' }}
            >
              {analysisError}
            </div>
          )}

          {currentAnalysis && (
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          )}

          {currentAnalysis && (
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          )}
        </>
      )}

      <ImmediateAlert
        flaggedBehaviors={currentAnalysis?.signals || []}
        onDismiss={() => setAlertDismissed(true)}
      />
    </main>
  );
}

export default App;