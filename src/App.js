import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  // State for latest analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  // Loading or error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Show real-time dashboard or paste analyzer
  const [dashboardMode, setDashboardMode] = useState(false);
  // Alert dismissed
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Check if any high risk flag present in current signals
  const hasHighRiskFlags = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return false;
    return analysisResult.signals.some((flag) => HIGH_RISK_FLAGS.has(flag));
  }, [analysisResult]);

  // Reset alert dismiss if new high risk flags appear
  useEffect(() => {
    if (hasHighRiskFlags) setAlertDismissed(false);
  }, [hasHighRiskFlags]);

  // Handler for conversation analysis update
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler for errors
  const handleError = (err) => {
    setError(err);
    setLoading(false);
    setAnalysisResult(null);
  };

  // Handler to reset alert dismissal
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Toggle between dashboard and paste analyzer
  const toggleDashboard = () => {
    setDashboardMode((prev) => !prev);
    // Reset analysis and error on mode switch
    setAnalysisResult(null);
    setLoading(false);
    setError(null);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header aria-label="App header">
        <h1 style={{ color: "#cc2f2f", userSelect: "none", textAlign: "center" }}>
          FLAGGED - Conversation Analyzer
        </h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardMode}
          aria-label={dashboardMode ? "Switch to conversation paste analyzer mode" : "Switch to real-time dashboard mode"}
          style={{ margin: "12px auto 18px auto", display: "block" }}
        >
          {dashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {/* Immediate Alert */}
      {hasHighRiskFlags && !alertDismissed && analysisResult && (
        <ImmediateAlert signals={analysisResult.signals} onDismiss={dismissAlert} />
      )}

      {dashboardMode ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          {/* Conversation Analyzer Paste Input */}
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />

          {/* Error Message */}
          {error && (
            <div
              className="alert-banner"
              role="alert"
              aria-live="assertive"
              style={{ marginTop: "12px" }}
            >
              {typeof error === "string" ? error : "An error occurred during analysis."}
            </div>
          )}

          {/* Results Visualization */}
          {analysisResult && (
            <article
              className="flagged-result-container"
              aria-live="polite"
              aria-label="Conversation analysis result"
              tabIndex={-1}
              style={{ marginTop: "20px" }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={(analysisResult.signals || []).map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult analysis={analysisResult} style={{ marginTop: "16px" }} />
            </article>
          )}
        </>
      )}
    </main>
  );
};

export default App;