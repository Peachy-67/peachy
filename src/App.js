import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "threat", "gaslighting", "discard", "control", "ultimatum"];

const App = () => {
  // State for last analyzed result from ConversationAnalyzerPolish or RealTimeDashboard fallback
  const [analysis, setAnalysis] = useState(null);
  // State for error from analysis
  const [error, setError] = useState(null);
  // State for loading while analyzing
  const [loading, setLoading] = useState(false);
  // State for whether the ImmediateAlert banner is visible
  const [alertVisible, setAlertVisible] = useState(false);
  // State for current alert flags triggering the alert banner
  const [alertFlags, setAlertFlags] = useState([]);
  // State to toggle between conversation paste analyzer and real-time dashboard
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // Effect to watch analysis flaggedBehaviors/signals and show alert if any high-risk flags present
  useEffect(() => {
    if (analysis && analysis.signals && Array.isArray(analysis.signals)) {
      const intersectingFlags = analysis.signals.filter((flag) => HIGH_RISK_FLAGS.includes(flag));
      if (intersectingFlags.length > 0) {
        setAlertFlags(intersectingFlags);
        // Show alert banner
        setAlertVisible(true);
        // Also show native alert dialog immediately
        alert(
          `⚠️ High-risk behavior detected: ${intersectingFlags.join(", ")}. Please be cautious.`
        );
      } else {
        // No high-risk flags, hide alert banner
        setAlertVisible(false);
        setAlertFlags([]);
      }
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysis]);

  // Handler for when ConversationAnalyzerPolish or RealTimeDashboard produces a new analysis result
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);
  };

  // Handler for analysis error
  const handleAnalysisError = (err) => {
    setError(err?.message || "Error during analysis.");
    setAnalysis(null);
    setLoading(false);
  };

  // Handler to set loading state on analysis start
  const handleAnalysisStart = () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
  };

  // Handler to dismiss the alert banner
  const handleDismissAlert = () => {
    setAlertVisible(false);
  };

  // Handler for toggle button to switch between paste-analyze and real-time dashboard modes
  const handleToggleDashboard = () => {
    setUseRealTimeDashboard(!useRealTimeDashboard);
    setError(null);
    setAnalysis(null);
    setAlertVisible(false);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
          Detect behavioral red flags in conversations.
        </p>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button
            type="button"
            className="peachy-button"
            onClick={handleToggleDashboard}
            aria-pressed={useRealTimeDashboard}
            aria-label={
              useRealTimeDashboard ? "Switch to paste conversation analyzer view" : "Switch to real-time monitoring dashboard"
            }
          >
            {useRealTimeDashboard ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {alertVisible && alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />
      )}

      <section aria-live="polite" aria-atomic="true" aria-relevant="additions removals" style={{ marginBottom: "2rem" }}>
        {useRealTimeDashboard ? (
          <RealTimeDashboard
            onAnalysisStart={handleAnalysisStart}
            onAnalysisUpdate={handleAnalysisUpdate}
            onAnalysisError={handleAnalysisError}
          />
        ) : (
          <ConversationAnalyzerPolish
            onAnalysisStart={handleAnalysisStart}
            onAnalysisUpdate={handleAnalysisUpdate}
            onAnalysisError={handleAnalysisError}
          />
        )}
      </section>

      {loading && (
        <p role="status" aria-live="polite" style={{ color: "#cc2f2f", fontWeight: "600", textAlign: "center" }}>
          Analyzing conversation...
        </p>
      )}

      {error && (
        <div role="alert" className="alert-banner" style={{ maxWidth: "400px", margin: "1rem auto" }}>
          {error}
        </div>
      )}

      {analysis && (
        <>
          <FlaggedResultVisualization
            verdict={analysis.verdict ? analysis.verdict.label : "Safe"}
            flaggedBehaviors={analysis.signals.map((sig) => ({
              type: sig,
              label: sig.charAt(0).toUpperCase() + sig.slice(1),
              confidence: analysis.confidence || 0,
            }))}
            overallConfidence={analysis.confidence || 0}
          />
          <ShareableResult
            verdict={analysis.verdict ? analysis.verdict.label : "Safe"}
            flags={analysis.signals}
            confidence={analysis.confidence}
            conversationExcerpt=""
          />
        </>
      )}
    </main>
  );
};

export default App;