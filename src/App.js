import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function App() {
  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real-time dashboard toggle
  const [showDashboard, setShowDashboard] = useState(false);

  // Immediate alert dismissal state
  const [alertVisible, setAlertVisible] = useState(false);

  // Handler to run after a new analysis
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);

    // Check if any high-risk flags detected
    const flags = (result?.flaggedBehaviors ?? []).map(({ type }) => type.toLowerCase());
    const hasHighRisk = flags.some((flag) => HIGH_RISK_FLAGS.has(flag));

    if (hasHighRisk) {
      setAlertVisible(true);
      // Immediate native alert as well
      if (typeof window !== "undefined" && window.alert) {
        window.alert(
          "High-risk behavior detected in the conversation! Please review the flagged behaviors carefully."
        );
      }
    } else {
      setAlertVisible(false);
    }
  }, []);

  // Handler for analysis start
  const handleStart = () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
  };

  // Handler for analysis error
  const handleError = (msg) => {
    setError(msg);
    setLoading(false);
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Immediate alert for high-risk flags */}
      <ImmediateAlert visible={alertVisible} flaggedBehaviors={analysisResult?.flaggedBehaviors || []} onDismiss={dismissAlert} />

      {/* Conversation analyzer input */}
      {!showDashboard && (
        <>
          <section aria-labelledby="analyzer-section-label" style={{ marginBottom: "2rem" }}>
            <h2 id="analyzer-section-label" className="ui-section-header">
              Paste and Analyze Conversation
            </h2>

            <ConversationAnalyzerPolish
              onStart={handleStart}
              onResult={handleAnalysis}
              onError={handleError}
              loading={loading}
              initialText={""}
            />

            {error && (
              <div role="alert" aria-live="assertive" className="alert-banner" style={{ marginTop: "1rem" }}>
                {error}
              </div>
            )}

            {/* Show results once available */}
            {analysisResult && !loading && !error && (
              <>
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict.label}
                  flaggedBehaviors={analysisResult.flaggedBehaviors}
                  overallConfidence={analysisResult.confidence}
                />
                <ShareableResult analysis={analysisResult} />
              </>
            )}
          </section>
        </>
      )}

      {/* Real-time monitoring dashboard toggle */}
      <section aria-label="Real-time monitoring toggle" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {/* Real-time dashboard view */}
      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          onError={handleError}
          alertFlags={Array.from(HIGH_RISK_FLAGS)}
        />
      )}
    </main>
  );
}

export default App;