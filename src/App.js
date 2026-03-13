import React, { useState, useEffect } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum']);

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags immediately after each analysis
  useEffect(() => {
    if (!analysis) {
      setAlertFlags([]);
      return;
    }
    const currentFlags = analysis.signals || [];
    const highRiskDetected = currentFlags.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    setAlertFlags(highRiskDetected);
  }, [analysis]);

  // Handler for new analysis result from analyzer component
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Toggle between main analyzer UI and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear analysis and alerts when switching views for clarity
    setAnalysis(null);
    setAlertFlags([]);
  };

  const containerStyle = {
    maxWidth: '720px',
    margin: '2rem auto 4rem auto',
    padding: '0 1rem',
  };

  return (
    <main style={containerStyle} aria-label="FLAGGED conversation red flag detection app">
      <header style={{ textAlign: 'center', marginBottom: '2rem', userSelect: 'none' }}>
        <h1 style={{ color: '#ff6f61', fontWeight: '900', fontSize: '2.25rem' }}>FLAGGED</h1>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          Detect red flags in conversations and identify manipulation, gaslighting, and harmful behavior.
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.25rem',
            fontWeight: '700',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#ff6f61',
            color: 'white',
            boxShadow: '0 3px 8px rgba(255,111,97,0.7)',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65b50')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6f61')}
        >
          {showDashboard ? 'Back to Analyzer' : 'Open Real-Time Dashboard'}
        </button>
      </header>

      {alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || 'Safe'}
                flaggedBehaviors={(analysis.signals || []).map((flag) => {
                  // Create a user-friendly label for each signal, reuse consistent casing
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
                    type: flag,
                    label: labelMap[flag] || flag,
                    confidence: analysis.confidence || 0,
                  };
                })}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult result={analysis} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard />
      )}
    </main>
  );
};

export default App;