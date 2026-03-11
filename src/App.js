import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolishImprovements.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum', 'discard']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors in a structured way for visualization and alerts
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    // Map signals to flag objects
    // Map some signals to readable labels; confidence from top level confidence applied uniformly for MVP
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

    // For confidence, we use the analysis confidence as a base fallback
    return analysisResult.signals.map((signal) => ({
      type: signal,
      label: labelMap[signal] || signal,
      confidence: analysisResult.confidence || 0,
    }));
  }, [analysisResult]);

  // Choose verdict label suitable for visualization
  const verdictLabelMap = {
    green: 'Safe',
    yellow: 'Caution',
    red: 'Flagged',
  };
  const verdict = analysisResult?.verdict?.band
    ? verdictLabelMap[analysisResult.verdict.band] || 'Safe'
    : 'Safe';

  // Alert triggers when any high risk flags present
  useEffect(() => {
    if (!analysisResult?.signals) {
      setAlertFlags([]);
      return;
    }
    const highRiskPresent = analysisResult.signals.filter((s) => HIGH_RISK_FLAGS.has(s));
    setAlertFlags(highRiskPresent);
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analysis Application">
      <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none', marginBottom: '1rem' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Hide realtime dashboard' : 'Show realtime dashboard'}
          style={{ marginBottom: '1rem', width: '100%' }}
        >
          {showDashboard ? 'Hide' : 'Show'} Real-Time Dashboard
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={(result) => setAnalysisResult(result)}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            key="analyzer"
            onAnalyze={(result) => setAnalysisResult(result)}
          />
          {alertFlags.length > 0 && <ImmediateAlert flaggedBehaviors={alertFlags} />}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                confidence={analysisResult.confidence || 0}
                conversationExcerpt=""
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;