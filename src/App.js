import React, { useState } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const App = () => {
  // Analysis state holds the latest analysis result from conversation input or dashboard
  const [analysisResult, setAnalysisResult] = useState(null);

  // Controls if real-time dashboard mode is active
  const [realTimeMode, setRealTimeMode] = useState(false);

  // ImmediateAlert listens on flagged behaviors to notify user on high-risk flags
  const highRiskFlags = analysisResult?.signals || [];

  // Handlers to receive new analysis results from children components
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between real-time dashboard and simple conversation analyzer
  const toggleRealTimeMode = () => {
    setRealTimeMode((mode) => !mode);
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Toggle Real-Time Monitoring Mode" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={toggleRealTimeMode}
          aria-pressed={realTimeMode}
          aria-label={realTimeMode ? 'Switch to manual conversation analyzer' : 'Switch to real-time dashboard monitoring'}
          className="peachy-button transition-smooth"
          style={{ minWidth: '220px' }}
        >
          {realTimeMode ? 'Use Manual Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </section>

      {realTimeMode ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {/* Show flagged result visualization and shareable result if analysis exists */}
      {analysisResult && (
        <section aria-label="Analysis results and sharing" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((sig) => {
              // Map signal to label with some sensible capitalization for badge labels
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
                confidence: 0.9, // Approximate confidence - real value not in state, default to 0.9
              };
            })}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}
    </div>
  );
};

export default App;