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
  'ultimatum',
]);

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Whenever analysis updates, check for high-risk flags to trigger alert
  useEffect(() => {
    if (analysis && Array.isArray(analysis.signals)) {
      const flaggedHighRisk = analysis.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      if (flaggedHighRisk.length > 0) {
        if (!alertVisible) {
          setAlertFlags(flaggedHighRisk);
          setAlertVisible(true);
          // Trigger native alert as immediate notification
          window.alert(
            `⚠️ High-risk behaviors detected: ${flaggedHighRisk.join(', ')}. Please review carefully.`
          );
        }
      } else {
        setAlertVisible(false);
        setAlertFlags([]);
      }
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysis, alertVisible]);

  const handleDismissAlert = () => {
    setAlertVisible(false);
    setAlertFlags([]);
  };

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    // "result" is an object with verdict, signals, confidence, etc.
    setAnalysis(result);
  };

  // Extract flagged behaviors array for FlaggedResultVisualization
  // Map raw signals to labeled, typed array with confidence from analysis if available
  // We approximate confidence per flag as the analysis.confidence if no individual confidences known
  const getFlaggedBehaviors = () => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    return analysis.signals.map((type) => {
      // Map type to human label
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
        label: labelMap[type.toLowerCase()] || type,
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.5,
      };
    });
  };

  // Map verdict band to readable string for visualization component
  const mapVerdictBandToLabel = (band) => {
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

  const verdictLabel = analysis && analysis.verdict ? mapVerdictBandToLabel(analysis.verdict.band) : 'Safe';
  const overallConfidence = analysis && typeof analysis.confidence === 'number' ? analysis.confidence : 0;

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: 'center', color: '#ff6f61', userSelect: 'none' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
          className="peachy-button"
          type="button"
        >
          {showDashboard ? 'Use Paste Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </div>

      {alertVisible && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {analysis && (
        <>
          {/* Visualize flagged results */}
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={getFlaggedBehaviors()}
            overallConfidence={overallConfidence}
          />

          {/* Shareable result component accepts result data */}
          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={getFlaggedBehaviors()}
            overallConfidence={overallConfidence}
            conversationText={analysis.meta?.inputText || ''}
          />
        </>
      )}
    </main>
  );
};

export default App;