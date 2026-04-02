import React, { useState, useEffect, useCallback } from 'react';

import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum', 'discard'];

/**
 * App component integrates existing best components:
 * - ConversationAnalyzerPolish for text paste analysis and API integration
 * - ImmediateAlert to notify users immediately on high-risk flags
 * - FlaggedResultVisualization to show verdict, flagged badges, and confidence
 * - ShareableResult to enable sharing results
 * - RealTimeDashboard to toggle real-time conversation monitoring
 */
export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Called when ConversationAnalyzerPolish or RealTimeDashboard returns a new analyis result
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);

    if (result && result.signals) {
      // Determine if there are any high-risk flags that are not dismissed
      const foundHighRiskFlags = HIGH_RISK_FLAGS.filter((flag) => result.signals.includes(flag));
      if (foundHighRiskFlags.length) {
        if (!alertDismissed) {
          setAlertFlags(foundHighRiskFlags);
        }
      } else {
        setAlertFlags([]);
        setAlertDismissed(false);
      }
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [alertDismissed]);

  // User can dismiss alert banner; remember to not show it again until next analysis change
  function dismissAlert() {
    setAlertFlags([]);
    setAlertDismissed(true);
  }

  // Toggle view between paste analyzer and real-time dashboard
  function toggleDashboard() {
    setShowDashboard((v) => !v);
    // Clear alert and analysis when switching modes
    setAlertFlags([]);
    setAlertDismissed(false);
    setAnalysisResult(null);
  }

  return (
    <main className="ui-container" aria-label="Flagged - Conversation analysis tool">
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1>FLAGGED</h1>
        <p style={{ color: '#cc4c4c', userSelect: 'none' }}>
          Detect red flags and manipulation in your conversations
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? 'Switch to paste analyzer view' : 'Switch to real-time dashboard view'}
          style={{ marginTop: '0.5rem' }}
        >
          {showDashboard ? 'Paste Analyzer Mode' : 'Real-Time Monitoring Mode'}
        </button>
      </header>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={dismissAlert}
      />

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || 'Safe'}
                flaggedBehaviors={analysisResult.signals?.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: 1.0, // Confidence details not provided here, assume full for UI
                })) || []}
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult
                verdict={analysisResult.verdict?.label || 'Safe'}
                flaggedBehaviors={analysisResult.signals?.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: 1.0,
                })) || []}
                confidence={analysisResult.confidence || 0}
                originalText={analysisResult.usage?.text || ''}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}