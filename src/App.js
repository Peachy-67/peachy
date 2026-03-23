import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'threat', 'gaslighting', 'discard', 'ultimatum']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Watch for high risk flags to trigger ImmediateAlert
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const detectedFlags = analysisResult?.signals || [];
    const highRiskDetected = detectedFlags.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler when analysis finishes from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (result && typeof result === 'object') {
      setAnalysisResult(result);
      setErrorMessage('');
    } else {
      setAnalysisResult(null);
    }
  };

  // Handler for errors from analysis components
  const handleError = (error) => {
    setErrorMessage(error || 'Failed to analyze conversation.');
    setAnalysisResult(null);
  };

  // Toggle the real-time dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear results and alerts when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
    setErrorMessage('');
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red-flag detection app">
      <header>
        <h1 tabIndex={-1}>FLAGGED</h1>
        <p>A web app detecting manipulation, insults, gaslighting, and harmful conversation patterns.</p>
      </header>

      <section>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to conversation analyzer paste mode' : 'Switch to real-time dashboard mode'}
        >
          {showDashboard ? 'Switch to Conversation Analyzer' : 'Switch to Real-Time Dashboard'}
        </button>
      </section>

      <section aria-live="polite" aria-atomic="true" style={{ minHeight: '4rem' }}>
        {errorMessage && (
          <div className="alert-banner" role="alert" aria-live="assertive">
            {errorMessage}
          </div>
        )}
      </section>

      {!showDashboard && (
        <section aria-label="Conversation analyzer input and results" tabIndex={-1}>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} onError={handleError} />
        </section>
      )}

      {showDashboard && (
        <section aria-label="Real-time monitoring dashboard" tabIndex={-1}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} onError={handleError} />
        </section>
      )}

      {analysisResult && (
        <>
          <ImmediateAlert flaggedBehaviors={alertFlags} />
          <FlaggedResultVisualization
            verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapSignalsToFlaggedBehaviors(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
          />

          <ShareableResult
            verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapSignalsToFlaggedBehaviors(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
            conversationExcerpt={buildConversationExcerpt(analysisResult?.meta?.excerpt)}
          />
        </>
      )}
    </main>
  );
};

/**
 * Map backend verdict band to standardized verdict label.
 * Matches FlaggedResultVisualization. Verdict Display uses
 * labels: 'Safe', 'Caution', 'Flagged'.
 */
function mapBandToVerdictLabel(band) {
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
 * Map raw signals array to structured flagged behaviors objects
 * expected by FlaggedResultVisualization and ShareableResult.
 * Each flagged behavior includes type, label, and confidence.
 * Confidence here is approximated from overall confidence for simplicity.
 */
function mapSignalsToFlaggedBehaviors(signals = [], overallConfidence = 0) {
  // Map signal keys to labels. Use simple capitalized labels.
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

  // We assign the overall confidence to each flag for now.
  return signals.map((signal) => ({
    type: signal,
    label: labelMap[signal] || signal,
    confidence: overallConfidence,
  }));
}

/**
 * Build a concise conversation excerpt for sharing if available.
 * Falls back to empty string.
 */
function buildConversationExcerpt(excerpt) {
  if (typeof excerpt === 'string' && excerpt.trim().length > 0) {
    // Truncate if too long for sharing
    const maxLength = 280;
    return excerpt.length <= maxLength ? excerpt : excerpt.slice(0, maxLength) + '...';
  }
  return '';
}

export default App;