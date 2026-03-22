import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = new Set(['insult', 'gaslighting', 'threat', 'ultimatum']);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update alert flags when analysisResult changes
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

  // Handle new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  const handleError = (err) => {
    setError(err || 'Failed to analyze conversation.');
    setLoading(false);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      // Clear previous results and alerts when loading new input
      setAnalysisResult(null);
      setAlertFlags([]);
      setError(null);
    }
  };

  // Toggle between paste input analyzer and real-time dashboard monitoring
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset analysis and alerts when toggling view to avoid confusion
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#cc2f2f', userSelect: 'none' }}>FLAGGED</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to Paste Conversation Analyzer' : 'Switch to Real-Time Dashboard'}
          style={{ marginBottom: '1rem' }}
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Open Real-Time Dashboard'}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
          loading={loading}
        />
      )}

      {error && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ marginTop: '1rem' }}
        >
          {error}
        </div>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              let label = type.charAt(0).toUpperCase() + type.slice(1);
              // Map known flags to friendly labels
              switch (type) {
                case 'insult':
                  label = 'Insult';
                  break;
                case 'manipulation':
                  label = 'Manipulation';
                  break;
                case 'gaslighting':
                  label = 'Gaslighting';
                  break;
                case 'discard':
                  label = 'Discard';
                  break;
                case 'control':
                  label = 'Control';
                  break;
                case 'ultimatum':
                  label = 'Ultimatum';
                  break;
                case 'threat':
                  label = 'Threat';
                  break;
                case 'guilt':
                  label = 'Guilt';
                  break;
                case 'boundary_push':
                  label = 'Boundary Push';
                  break;
                case 'inconsistency':
                  label = 'Inconsistency';
                  break;
                default:
                  label = label;
              }
              // Confidence is unknown here, so pass 1 (100%)
              return { type, label, confidence: 1 };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;