import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardMode, setDashboardMode] = useState(false);

  // Callback to receive analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysis = useCallback((result, err = null) => {
    setError(err);
    setAnalysisResult(result);

    if (result && result.signals) {
      // Detect any high-risk signals: insult, gaslighting, discard, threat, ultimatum, control, guilt
      const highRisk = result.signals.filter((signal) =>
        ['insult', 'gaslighting', 'discard', 'threat', 'ultimatum', 'control', 'guilt'].includes(signal)
      );
      setHighRiskFlags(highRisk);
    } else {
      setHighRiskFlags([]);
    }
  }, []);

  // We can toggle between real-time dashboard and paste analyzer modes using a button.
  const toggleDashboardMode = () => {
    setAnalysisResult(null);
    setError(null);
    setHighRiskFlags([]);
    setDashboardMode((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <h1 style={{ textAlign: 'center', color: '#d94a49', userSelect: 'none' }}>FLAGGED</h1>
      <section aria-label="Application mode toggle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={toggleDashboardMode}
          className="peachy-button"
          aria-pressed={dashboardMode}
          aria-label={dashboardMode ? 'Switch to paste conversation analyzer' : 'Switch to real-time dashboard'}
        >
          {dashboardMode ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {!dashboardMode ? (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={onAnalysis}
            loading={loading}
            setLoading={setLoading}
            error={error}
            clearError={() => setError(null)}
          />

          {error && (
            <section
              className="alert-banner"
              role="alert"
              aria-live="polite"
              tabIndex={-1}
              style={{ marginTop: '1rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}
            >
              {error}
            </section>
          )}

          {analysisResult && !error && (
            <section aria-label="Analysis results" style={{ marginTop: '2rem' }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || 'Safe'}
                flaggedBehaviors={analysisResult.signals.map((type) => {
                  // Map signal type to label - consistent with FlagBadge expectations
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
                    type,
                    label: labelMap[type] || type,
                    confidence: analysisResult.confidence || 0,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </section>
          )}
        </>
      ) : (
        <RealTimeDashboard onAnalysis={onAnalysis} />
      )}
    </main>
  );
};

export default App;