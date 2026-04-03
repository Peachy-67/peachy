import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Helper to detect if signals include high-risk flags to trigger alert.
 * High-risk = insult, gaslighting, control, discard
 */
const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "control", "discard"]);

function hasHighRiskFlags(flags) {
  if (!Array.isArray(flags)) return false;
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase()));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handler for new analysis results:
  // Sets analysisResult state,
  // updates alertFlags if high-risk detected,
  // clears error and loading
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
    if (result && hasHighRiskFlags(result.signals)) {
      setAlertFlags(result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase())));
    } else {
      setAlertFlags([]);
    }
  };

  // Handler for alert dismissal clears alert flags
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Handler for errors (e.g., API errors)
  const handleError = (err) => {
    setError(err?.message || "Unknown error");
    setLoading(false);
    setAlertFlags([]);
  };

  // Handler for loading state from analyzer
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />

      {/* Mode toggle button */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <button
          type="button"
          aria-pressed={realTimeMode}
          onClick={() => setRealTimeMode((prev) => !prev)}
          className="peachy-button"
          aria-label={`Switch to ${realTimeMode ? "paste input analyzer" : "real-time dashboard"} mode`}
        >
          {realTimeMode ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
        </button>
      </div>

      {/* Conditionally render either paste input mode or real-time dashboard */}
      {realTimeMode ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysis}
          onError={handleError}
          loading={loading}
          setLoading={handleLoading}
          initialResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysis}
            onError={handleError}
            loading={loading}
            setLoading={handleLoading}
          />

          {/* Display error message if any */}
          {error && (
            <div
              role="alert"
              className="alert-banner"
              style={{ marginTop: "1rem" }}
              aria-live="assertive"
              tabIndex="-1"
            >
              {error}
            </div>
          )}

          {/* Show flagged result visualization if analysis available */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={
                  analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysisResult.confidence,
                  })) || []
                }
                overallConfidence={analysisResult.confidence}
              />

              {/* Shareable result with share/copy buttons */}
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;