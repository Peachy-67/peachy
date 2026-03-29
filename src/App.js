import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main app component integrating conversation analyzer, alert, results visualization,
 * shareable result, and real-time dashboard with toggle.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Helper to detect if any high-risk flags are present
  const hasHighRiskFlags = (flags) => {
    if (!Array.isArray(flags)) return false;
    // Consider "insult", "gaslighting", "threat", "discard" as high-risk
    const highRiskTypes = new Set(["insult", "gaslighting", "threat", "discard"]);
    return flags.some((flag) => highRiskTypes.has(flag.type.toLowerCase()));
  };

  // Handles new analysis results from conversation analyzer or dashboard manual analyze
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    setErrorMessage("");
    setLoading(false);

    // Detect if we need to show alert
    if (hasHighRiskFlags(result?.flaggedBehaviors)) {
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
    }
  };

  // Handles analysis start loading state
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setErrorMessage("");
      setAlertVisible(false);
    }
  };

  // Handles error from Analyzer or Dashboard
  const handleError = (err) => {
    setErrorMessage(err?.message || "Unknown error.");
    setAnalysisResult(null);
    setLoading(false);
    setAlertVisible(false);
  };

  // Dismiss alert when user clicks dismiss button
  const handleAlertDismiss = () => {
    setAlertVisible(false);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset alert and error when switching views
    setAlertVisible(false);
    setErrorMessage("");
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analysis Application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED.run - Red Flag Conversation Detector
      </h1>

      <div style={{ margin: "1rem 0 2rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Go to Paste Input Analyzer" : "Go to Real-Time Dashboard"}
        </button>
      </div>

      <ImmediateAlert
        flaggedBehaviors={analysisResult?.flaggedBehaviors || []}
        visible={alertVisible}
        onDismiss={handleAlertDismiss}
      />

      {errorMessage && (
        <div role="alert" className="alert-banner" style={{ marginBottom: "1rem" }}>
          {errorMessage}
        </div>
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysis}
            onLoading={handleLoading}
            onError={handleError}
          />

          {loading && (
            <p role="status" aria-live="polite" style={{ textAlign: "center" }}>
              Analyzing conversation...
            </p>
          )}

          {analysisResult && !loading && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult result={analysisResult} conversationText={analysisResult.conversationText} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          onLoading={handleLoading}
          onError={handleError}
        />
      )}
    </main>
  );
};

export default App;