import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const highRiskFlags = new Set([
  'insult',
  'manipulation',
  'gaslighting',
  'discard',
  'threat',
  'ultimatum',
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);

  // Handler for new analysis updates
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);

    // Determine if any high-risk flag exists in result.signals
    if (result?.signals) {
      const foundFlags = result.signals.filter((flag) => highRiskFlags.has(flag));
      if (foundFlags.length > 0) {
        setAlertFlags(foundFlags);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Dismiss alert banner
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  return (
    <div className="app-container" style={{ padding: '1rem', maxWidth: 720, margin: 'auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '1.5rem', userSelect: 'none' }}>
        <h1 style={{ color: '#ff6f61', fontWeight: '700' }}>FLAGGED</h1>
        <p style={{ maxWidth: 480, margin: '0 auto', fontSize: '1rem', color: '#555' }}>
          Detect red flags in your conversations. Identify manipulation, gaslighting, insults, and more.
        </p>
      </header>

      <main>
        {/* Conversation Analyzer input - updates analysisResult on new analysis */}
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

        {/* Immediate alert banner for high-risk flags */}
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />

        {/* Visualize the most recent result (if any) */}
        {analysisResult && (
          <>
            <section aria-labelledby="result-header" style={{ marginTop: '2rem' }}>
              <h2 id="result-header" className="ui-section-header">
                Analysis Result
              </h2>
              <FlaggedResultVisualization
                verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
                overallConfidence={analysisResult.confidence}
              />
              {/* Shareable result UI */}
              <ShareableResult
                text={analysisResult.meta?.inputText || ''}
                verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
                confidence={analysisResult.confidence}
              />
            </section>
          </>
        )}

        {/* Real-time monitoring dashboard toggle */}
        <section style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button
            type="button"
            className="peachy-button"
            onClick={() => setDashboardEnabled((enabled) => !enabled)}
            aria-pressed={dashboardEnabled}
            aria-label={`${dashboardEnabled ? 'Hide' : 'Show'} real-time monitoring dashboard`}
          >
            {dashboardEnabled ? 'Hide' : 'Show'} Real-Time Dashboard
          </button>
        </section>

        {/* Real-time dashboard view */}
        {dashboardEnabled && (
          <section aria-label="Real-time monitoring dashboard" style={{ marginTop: '2rem' }}>
            <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
          </section>
        )}
      </main>
    </div>
  );
}

// Utility to map band to short verdict string consistent with VerdictDisplay
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

// Convert signals array to flagged behaviors array with label and confidence.
// Confidence is unknown here (backend response might not contain per-flag confidence), so default 1.0.
// Labels capitalized for display. Some signal labels map to different display labels.
function mapSignalsToFlags(signals) {
  if (!Array.isArray(signals)) return [];

  return signals.map((type) => {
    const lowerType = type.toLowerCase();
    let label = type.charAt(0).toUpperCase() + type.slice(1);

    // Map signal types that differ from labels:
    if (lowerType === 'gaslighting') label = 'Gaslighting';
    if (lowerType === 'discard') label = 'Discard';
    if (lowerType === 'insult') label = 'Insult';
    if (lowerType === 'manipulation') label = 'Manipulation';
    if (lowerType === 'control') label = 'Control';
    if (lowerType === 'ultimatum') label = 'Ultimatum';
    if (lowerType === 'threat') label = 'Threat';
    if (lowerType === 'guilt') label = 'Guilt';
    if (lowerType === 'boundary_push') label = 'Boundary Push';
    if (lowerType === 'inconsistency') label = 'Inconsistency';

    return {
      type: lowerType,
      label,
      confidence: 1, // Unknown confidence; apps can extend this if available
    };
  });
}

export default App;