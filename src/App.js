import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/ImmediateAlert.css";

/**
 * Main app component integrating conversation analyzer, immediate alert,
 * flagged result visualization, shareable results, and real-time dashboard.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Detect high-risk flags to trigger immediate alert
  const highRiskFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum"];
  const hasHighRiskFlags =
    analysisResult?.flags?.some((flag) => highRiskFlags.includes(flag.type.toLowerCase())) ?? false;

  // Reset alert dismissal if analysis changes and new high-risk flags appear
  useEffect(() => {
    if (hasHighRiskFlags) {
      setAlertDismissed(false);
    }
  }, [analysisResult, hasHighRiskFlags]);

  const handleAnalysisUpdate = (result) => {
    // Normalize flagged behaviors for visualization and alert
    const flags =
      Array.isArray(result?.verdict?.flags) && result.verdict.flags.length > 0
        ? result.verdict.flags
        : result?.flags || [];

    // Accept structure from result or fallback
    setAnalysisResult({
      ...result,
      flags,
    });
  };

  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>

      <section aria-label="Conversation analyzer section" style={{ marginBottom: "1rem" }}>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {hasHighRiskFlags && !alertDismissed && analysisResult && (
        <ImmediateAlert
          flaggedBehaviors={analysisResult.flags}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {analysisResult && !showDashboard && (
        <section aria-label="Analysis result section" style={{ marginBottom: "1rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.flags}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      <section aria-label="Toggle real-time dashboard" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <button
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label="Toggle real-time dashboard"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard />
        </section>
      )}
    </main>
  );
};

export default App;