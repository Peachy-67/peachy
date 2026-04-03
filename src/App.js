import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Helper to detect if any high-risk flags in signals
 */
function hasHighRiskFlags(signals = []) {
  // Consider high risk any of insult, gaslighting, control, threat, ultimatum, discard
  const highRiskFlags = new Set([
    "insult",
    "gaslighting",
    "control",
    "threat",
    "ultimatum",
    "discard",
  ]);
  return signals.some((flag) => highRiskFlags.has(flag));
}

/**
 * Main App Component
 * Integrates:
 * - ConversationAnalyzerPolish for text paste and analyze
 * - ImmediateAlert for high-risk alerting
 * - FlaggedResultVisualization for polished result display
 * - ShareableResult for sharing flagged results
 * - RealTimeDashboard for live monitoring toggle
 */
const App = () => {
  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);
  // Loading and error states for analysis
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Alert visibility state
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Real-time dashboard mode toggle
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // Handle analysis from ConversationAnalyzerPolish
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
    setAlertDismissed(false);
  };

  // Handle analysis loading and error from ConversationAnalyzerPolish
  const handleLoading = (loadingState) => {
    setLoading(loadingState);
    if (loadingState) {
      setError(null);
      setAlertDismissed(false);
    }
  };
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setAnalysisResult(null);
    setLoading(false);
    setAlertDismissed(false);
  };

  // When new analysis result comes with high risk flags, we reset alertDismissed to false
  useEffect(() => {
    if (analysisResult && hasHighRiskFlags(analysisResult.signals)) {
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  // Handle alert dismissal
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Toggle dashboard view manually
  const toggleDashboard = () => {
    setUseRealTimeDashboard((v) => !v);
    // Reset results and alert on mode switch
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
    setAlertDismissed(false);
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ color: "#ff6f61", userSelect: "none", textAlign: "center" }}>
          FLAGGED
        </h1>
        <p style={{ maxWidth: 480, margin: "0.25rem auto 1rem auto", textAlign: "center", color: "#555" }}>
          Detects red flags in conversations and helps identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      <section aria-label="Toggle interface mode" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={useRealTimeDashboard}
          aria-label={`Switch to ${useRealTimeDashboard ? "paste analyzer" : "real-time dashboard"} mode`}
        >
          {useRealTimeDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {useRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysis}
          onError={handleError}
          onLoading={handleLoading}
          currentResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysis}
            onError={handleError}
            onLoading={handleLoading}
          />
          {loading && (
            <p role="status" aria-live="polite" style={{ textAlign: "center", marginTop: "1rem", color: "#cc2f2f" }}>
              Analyzing conversation, please wait...
            </p>
          )}

          {error && (
            <div role="alert" className="alert-banner" style={{ marginTop: "1rem", color: "#b00020" }}>
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <ImmediateAlert
                flaggedBehaviors={analysisResult.signals}
                alertDismissed={alertDismissed}
                onDismiss={dismissAlert}
              />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      <footer style={{ fontSize: "0.8rem", color: "#999", marginTop: "3rem", userSelect: "none", textAlign: "center" }}>
        &copy; 2024 FLAGGED. All rights reserved.
      </footer>
    </div>
  );
};

export default App;