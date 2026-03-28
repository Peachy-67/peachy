import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating best existing product components:
 * - Conversation analyzer (paste-input analysis)
 * - Immediate alert system on high-risk flags
 * - Flagged results visualization with confidence and badges
 * - Shareable results for viral sharing
 * - Real-time dashboard with toggle
 *
 * Manages main analysis state and alert triggers.
 */
const App = () => {
  // Store analysis result (verdict, flags, confidence, etc)
  const [analysisResult, setAnalysisResult] = useState(null);

  // Error message from analysis or system errors
  const [error, setError] = useState(null);

  // Loading state during analysis request
  const [loading, setLoading] = useState(false);

  // Control showing the real-time dashboard or the paste analyzer
  const [showDashboard, setShowDashboard] = useState(false);

  // Trigger alert banner for high risk flags detected
  // Store flagged high-risk signals for alert banner and native alert
  const [alertFlags, setAlertFlags] = useState([]);

  // High-risk signals we consider for immediate alert
  // Mapped to signals used by analysis, can be adjusted as needed
  const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

  /**
   * Handle new analysis data updates from ConversationAnalyzerPolish or RealTimeDashboard
   * Also clear previous errors on new analysis
   */
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);

    // Detect if any high-risk flags exist in the signals to trigger alert
    if (result?.signals?.some((signal) => HIGH_RISK_FLAGS.includes(signal))) {
      // Filter detected high risk flags (unique)
      const detectedFlags = Array.from(new Set(result.signals.filter((s) => HIGH_RISK_FLAGS.includes(s))));
      setAlertFlags(detectedFlags);
    } else {
      setAlertFlags([]);
    }
  };

  /**
   * Handle errors from ConversationAnalyzerPolish or RealTimeDashboard
   */
  const handleAnalysisError = (message) => {
    setError(message);
    setLoading(false);
  };

  /**
   * Handle loading state change from conversation input components
   */
  const handleLoadingState = (state) => {
    setLoading(state);
  };

  /**
   * Allow dismissing the alert banner
   */
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  /**
   * Toggle between paste analyzer view and real-time dashboard view
   */
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset analysis and alert flags when switching views
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <header>
        <h1 style={{ color: "#ff6f61", userSelect: "none", textAlign: "center", marginBottom: "1rem" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ display: "block", margin: "0 auto 1rem auto" }}
          type="button"
        >
          {showDashboard ? "Use Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoadingState}
        />
      ) : (
        <section aria-label="Conversation input and analysis">
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={handleLoadingState}
          />
        </section>
      )}

      {error && (
        <div role="alert" className="alert-banner" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      {analysisResult && !error && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              // Map to label and confidence for badges:
              const labelMap = {
                insult: "Insult",
                manipulation: "Manipulation",
                gaslighting: "Gaslighting",
                discard: "Discard",
                control: "Control",
                ultimatum: "Ultimatum",
                threat: "Threat",
                guilt: "Guilt",
                boundary_push: "Boundary Push",
                inconsistency: "Inconsistency",
              };
              const label = labelMap[type] || type;
              const confidence = analysisResult.confidence || 0;
              return { type, label, confidence };
            })}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;