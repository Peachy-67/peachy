import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

/**
 * The main application component integrates the conversation analyzer,
 * immediate alert notification on high-risk flags,
 * polished flagged result visualization with confidence and share options,
 * and supports toggling between paste-input analyzer and real-time dashboard monitoring view.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler when new analysis data is available from ConversationAnalyzerPolish
  const handleAnalysis = (result, errorMessage) => {
    setLoading(false);
    if (errorMessage) {
      setError(errorMessage);
      setAnalysisResult(null);
      return;
    }
    setError('');
    setAnalysisResult(result);
  };

  // Loading state handler from ConversationAnalyzerPolish
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setError('');
      setAnalysisResult(null);
    }
  };

  // Determine if any high-risk flags exist for triggering alerts
  // High risk flags: 'insult', 'discard', 'threat', 'gaslighting', 'control', 'ultimatum'
  const highRiskFlags = ['insult', 'discard', 'threat', 'gaslighting', 'control', 'ultimatum'];

  const detectedHighRiskFlags =
    analysisResult?.signals?.filter((flag) => highRiskFlags.includes(flag.toLowerCase())) || [];

  // Toggle between paste analyzer and real-time dashboard modes
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setError('');
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <header style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none' }}>
        <h1>FLAGGED</h1>
        <small>
          Detect red flags in conversations - manipulation, gaslighting, insults, and control patterns
        </small>
      </header>

      <section aria-label="Application mode toggle" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to conversation paste analyzer' : 'Switch to real-time dashboard'}
        >
          {showDashboard ? 'Analyze Pasted Conversation' : 'Open Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalysis} onLoading={handleLoading} />

          {/* Display loading indicator */}
          {loading && (
            <p
              role="status"
              aria-live="polite"
              style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '1rem' }}
            >
              Analyzing conversation...
            </p>
          )}

          {/* Display error message */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginTop: '1rem',
                padding: '1rem 1.5rem',
                backgroundColor: '#ffe6e6',
                color: '#a63636',
                borderRadius: '6px',
                fontWeight: '600',
                maxWidth: '440px',
                marginLeft: 'auto',
                marginRight: 'auto',
                userSelect: 'text',
              }}
            >
              {error}
            </div>
          )}

          {/* Display flagged results and share options when available */}
          {analysisResult && !loading && !error && (
            <>
              <ImmediateAlert flaggedBehaviors={detectedHighRiskFlags} />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || 'Safe'}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;