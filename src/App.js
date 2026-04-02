import React, { useState, useEffect } from 'react';

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
  'discard',
  'ultimatum',
  'control',
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRealTime, setShowRealTime] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Trigger alert flags whenever analysisResult changes
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  const handleAnalyze = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody.message || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || 'Unexpected error');
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleView = () => {
    setShowRealTime((prev) => !prev);
    // Clear results and alerts when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer">
      <header>
        <h1 style={{ textAlign: 'center', userSelect: 'none', color: '#cc2f2f' }}>
          FLAGGED Conversation Analyzer
        </h1>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleToggleView}
            aria-pressed={showRealTime}
            className="peachy-button"
          >
            {showRealTime ? 'Switch to Paste Analyzer' : 'Switch to Real-time Dashboard'}
          </button>
        </div>
      </header>

      {showRealTime ? (
        <RealTimeDashboard
          onAnalysis={setAnalysisResult}
          error={error}
          loading={loading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalyze={handleAnalyze}
          result={analysisResult}
          error={error}
          loading={loading}
        />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult
            verdict={mapBandToVerdictLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
            conversationExcerpt={""}
          />
        </>
      )}
    </main>
  );
};

// Helper to map band to verdict string expected by FlaggedResultVisualization
const mapBandToVerdictLabel = (band) => {
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

// Convert raw signals array (strings) to flaggedBehavior objects for visualization
// Use confidence as the same for all flags because detailed per-flag confidence is unavailable here
const mapSignalsToFlags = (signals, overallConfidence) => {
  // Map known signals to user-friendly label and type for badges
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

  // Include only recognized flags for visual badges
  return signals
    .filter((s) => Object.keys(signalLabels).includes(s))
    .map((s) => ({
      type: s,
      label: signalLabels[s],
      confidence: overallConfidence,
    }));
};

export default App;