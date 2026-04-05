import React, { useState, useCallback, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set([
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'discard',
  'control',
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Update alertFlags whenever analysisResult changes
  useEffect(() => {
    if (
      analysisResult &&
      Array.isArray(analysisResult.signals) &&
      analysisResult.signals.some((flag) => HIGH_RISK_FLAGS.has(flag))
    ) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleAnalyze = useCallback(async (text) => {
    setError(null);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Analysis error');
        setLoading(false);
        return;
      }

      const result = await response.json();
      setAnalysisResult(result);
      setLoading(false);
    } catch (e) {
      setError('Network or server error. Please try again.');
      setLoading(false);
    }
  }, []);

  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation Analyzer">
      <h1 style={{ userSelect: 'none', textAlign: 'center', color: '#ff6f61' }}>
        FLAGGED.RUN
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        aria-label={showDashboard ? 'Switch to paste analyzer view' : 'Switch to real-time dashboard view'}
        className="peachy-button"
        style={{ marginBottom: '1rem' }}
      >
        {showDashboard ? 'Back to Paste Analyzer' : 'Open Real-Time Dashboard'}
      </button>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={setAnalysisResult}
          errorMessage={error}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />

          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={alertFlags} />

              <section aria-label="Analysis results">
                {/* FlaggedResultVisualization uses verdict, flaggedBehaviors, overallConfidence */}
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict.label}
                  flaggedBehaviors={analysisResult.signals.map((type) => ({
                    type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    confidence: analysisResult.confidence,
                  }))}
                  overallConfidence={analysisResult.confidence}
                />

                <ShareableResult
                  result={analysisResult}
                />
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;