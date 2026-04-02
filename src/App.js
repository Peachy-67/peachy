import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum'];

const App = () => {
  // State for analysis from pasted input
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // State for current flagged behaviors and verdict, for alert and display
  const [flaggedBehaviors, setFlaggedBehaviors] = useState([]);
  const [verdict, setVerdict] = useState('Safe'); // 'Safe', 'Caution', 'Flagged'
  const [overallConfidence, setOverallConfidence] = useState(0);

  // Control toggle for real-time dashboard mode vs paste-analyzer mode
  const [dashboardMode, setDashboardMode] = useState(false);

  // Handler for new analysis received (from paste input or dashboard manual analyze)
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysisResult(null);
      setFlaggedBehaviors([]);
      setVerdict('Safe');
      setOverallConfidence(0);
      return;
    }

    setAnalysisResult(result);

    // Prepare flagged behaviors data for badges: map signals to labels and confidence
    // We reuse the signals array from result.signals, confidence from result.confidence
    // For label, capitalize first letter
    const signals = result.signals || [];
    const confidence = result.confidence || 0;

    const flagged = signals.map((signal) => ({
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: confidence,
    }));
    setFlaggedBehaviors(flagged);

    // Map verdict band to label
    const bandToVerdict = {
      green: 'Safe',
      yellow: 'Caution',
      red: 'Flagged',
    };
    const newVerdict =
      (result.verdict && result.verdict.band && bandToVerdict[result.verdict.band]) ||
      'Safe';
    setVerdict(newVerdict);

    setOverallConfidence(confidence);
  };

  // Handler to receive analysis from ConversationAnalyzerPolish or RealTimeDashboard
  // This is function passing down to children
  const onAnalysisComplete = (result) => {
    handleAnalysisUpdate(result);
  };

  // Determine any high-risk flags to trigger alert (intersection of flaggedBehaviors and HIGH_RISK_FLAGS)
  const highRiskDetected = flaggedBehaviors.some((fb) =>
    HIGH_RISK_FLAGS.includes(fb.type.toLowerCase())
  );

  return (
    <div className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <header style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
        <h1 style={{ color: '#ff6f61', userSelect: 'none' }}>FLAGGED</h1>
        <button
          type="button"
          aria-pressed={dashboardMode}
          onClick={() => setDashboardMode((active) => !active)}
          style={{
            marginTop: '0.5rem',
            backgroundColor: dashboardMode ? '#ff6f61' : 'transparent',
            color: dashboardMode ? '#fff' : '#ff6f61',
            border: '2px solid #ff6f61',
            borderRadius: 6,
            padding: '0.5rem 1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            fontSize: '1rem',
          }}
        >
          {dashboardMode ? 'Paste Analyzer Mode' : 'Real-Time Dashboard Mode'}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

      {dashboardMode ? (
        <RealTimeDashboard onAnalysisComplete={onAnalysisComplete} />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisComplete={onAnalysisComplete}
            loading={analysisLoading}
            setLoading={setAnalysisLoading}
            error={analysisError}
            setError={setAnalysisError}
          />

          {analysisError && (
            <div
              role="alert"
              aria-atomic="true"
              style={{
                color: '#b00020',
                fontWeight: 700,
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              {analysisError}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;