import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main application component integrating conversation analyzer,
 * immediate alert system, flagged result visualization with sharing,
 * and a toggle-able real-time monitoring dashboard.
 */
const App = () => {
  // State holding the latest analysis result from conversation input or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);

  // State controlling the visibility of the real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // State for ImmediateAlert dismiss control
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Extract flags from current analysis result (if any)
  const flaggedBehaviors = analysisResult?.signals?.map((signal) => {
    // Map signals to structured objects with label and confidence fallback
    // Confidence is a number between 0 and 1, fallback to a default if missing
    const confidence = 0.9; // Assume high confidence for flags from analysis signals
    // Map label capitalized for display
    return {
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence,
    };
  }) || [];

  // Determine overall verdict string fallback from analysisResult.verdict.band
  // Map internal band to user-facing label expected by FlaggedResultVisualization
  const verdictLabelMap = { green: "Safe", yellow: "Caution", red: "Flagged" };
  const verdict = verdictLabelMap[analysisResult?.verdict?.band] || "Safe";

  // Overall confidence from analysis, fallback to 0
  const overallConfidence = analysisResult?.confidence ?? 0;

  // Detect if any high-risk flags are present to trigger ImmediateAlert
  const highRiskFlags = new Set(["insult", "gaslighting", "threat", "discard", "control"]);

  // Filter current high risk flags present in results
  const activeHighRiskFlags = flaggedBehaviors.filter((fb) => highRiskFlags.has(fb.type.toLowerCase()));

  // Handler for new analysis results emitted by ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setAlertDismissed(false);
  };

  // Handler to toggle real-time dashboard visibility
  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  // Handler for dismissing the immediate alert banner
  const handleDismissAlert = () => {
    setAlertDismissed(true);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>FLAGGED</h1>
      </header>

      <section aria-label="Conversation input and analysis" tabIndex={-1}>
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} />
        )}
      </section>

      <section aria-label="Immediate alert notification">
        {activeHighRiskFlags.length > 0 && !alertDismissed && (
          <ImmediateAlert
            flaggedBehaviors={activeHighRiskFlags}
            onDismiss={handleDismissAlert}
          />
        )}
      </section>

      <section aria-label="Flagged conversation result visualization" tabIndex={-1}>
        {analysisResult && !showDashboard && (
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
        )}
      </section>

      <section aria-label="Share flagged conversation result" tabIndex={-1}>
        {analysisResult && !showDashboard && (
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            analysisResult={analysisResult}
          />
        )}
      </section>

      <section style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={handleToggleDashboard}
          className="peachy-button"
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      <section aria-label="Real-time conversation monitoring dashboard">
        {showDashboard && (
          <RealTimeDashboard onAnalysis={onAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;