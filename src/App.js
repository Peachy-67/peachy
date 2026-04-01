import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/uiPolish.css';

const highRiskFlags = new Set([
  'insult',
  'ultimatum',
  'discard',
  'threat',
  'gaslighting',
  'control',
  'guilt',
  'boundary_push',
]);

function App() {
  // App mode: "paste" for user paste + analyze, "dashboard" for real-time monitoring
  const [mode, setMode] = useState('paste');

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);

  // Loading and error states for analysis
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Called by ConversationAnalyzerPolish on new analysis or by RealTimeDashboard updates
  const handleNewAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  }, []);

  // Called on manual analysis request from ConversationAnalyzerPolish
  const handleAnalysisRequest = useCallback(async (text) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson?.message || 'Analysis error');
      }
      const data = await response.json();
      handleNewAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze conversation');
      setAnalysisResult(null);
      setLoading(false);
    }
  }, [handleNewAnalysis]);

  // Determine if any high-risk flags present for alert
  const highRiskDetected = !!(
    analysisResult &&
    Array.isArray(analysisResult.signals) &&
    analysisResult.signals.some((signal) => highRiskFlags.has(signal.toLowerCase()))
  );

  // Toggle between paste analyze mode and real-time dashboard mode
  const toggleMode = () => {
    setMode((prev) => (prev === 'paste' ? 'dashboard' : 'paste'));
    // Clear results and errors on mode switch for clarity
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ color: '#ff6f61', userSelect: 'none', textAlign: 'center' }}>
          FLAGGED Conversation Red Flag Detector
        </h1>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            type="button"
            className="peachy-button"
            onClick={toggleMode}
            aria-pressed={mode === 'dashboard'}
            aria-label={
              mode === 'paste'
                ? 'Switch to real-time conversation dashboard'
                : 'Switch to conversation paste analyzer'
            }
          >
            {mode === 'paste' ? 'Switch to Real-Time Dashboard' : 'Switch to Paste Analyzer'}
          </button>
        </div>
      </header>

      <ImmediateAlert flaggedBehaviors={analysisResult?.signals || []} />

      {mode === 'paste' && (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalysisRequest}
            loading={loading}
            error={error}
            results={analysisResult}
          />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || 'Safe'}
                flaggedBehaviors={(
                  analysisResult.signals || []
                ).map((type) => {
                  // Map each signal to a label and confidence
                  const label = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
                  return {
                    type,
                    label,
                    confidence: analysisResult.confidence || 0,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      {mode === 'dashboard' && (
        <RealTimeDashboard
          onAnalysisUpdate={handleNewAnalysis}
          latestAnalysis={analysisResult}
          highRiskFlags={highRiskFlags}
        />
      )}
    </main>
  );
}

export default App;