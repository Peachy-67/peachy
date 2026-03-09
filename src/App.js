import React, { useState, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

/**
 * Main App component integrating:
 * - Conversation analyzer with polished UI
 * - Immediate alert on high-risk flagged behaviors
 * - Polished flagged result visualization with share options
 * - Toggleable real-time dashboard for live monitoring
 */
const App = () => {
  // Analysis result state, initially null (no analysis done)
  const [analysis, setAnalysis] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [dashboardActive, setDashboardActive] = useState(false);

  // Handle new analysis result from analyzer
  const handleAnalysisUpdate = useCallback(
    (newAnalysis) => {
      setAnalysis(newAnalysis);
      // Detect any high risk flags to trigger alert
      if (newAnalysis && newAnalysis.signals) {
        const highRiskFlags = newAnalysis.signals.some((flag) =>
          ["insult", "manipulation", "gaslighting", "discard", "control"].includes(flag.toLowerCase())
        );
        setAlertVisible(highRiskFlags);
      } else {
        setAlertVisible(false);
      }
    },
    [setAnalysis, setAlertVisible]
  );

  // Dismiss alert banner manually
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setDashboardActive((active) => !active);
  };

  // Prepare props for visualization and sharing
  const verdictLabel =
    analysis && analysis.verdict && analysis.verdict.label
      ? analysis.verdict.label
      : "Safe";

  // Map flagged behaviors to label and confidence for badges
  const flaggedBehaviors = (analysis?.signals || []).map((flag) => {
    // Map signals to labels (capitalize first letter, replace _ with space)
    const label =
      flag.charAt(0).toUpperCase() +
      flag.slice(1).replace(/_/g, " ");
    // Use confidence from analysis or default 0.7 for visual clarity
    const confidence =
      typeof analysis?.confidence === "number" ? analysis.confidence : 0.7;

    return {
      type: flag.toLowerCase(),
      label,
      confidence,
    };
  });

  const overallConfidence =
    typeof analysis?.confidence === "number" ? analysis.confidence : 0;

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Red Flag Conversation Detector">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Red Flag Conversation Detector
      </h1>

      <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={flaggedBehaviors}
          onDismiss={dismissAlert}
        />
      )}

      {analysis && (
        <section aria-label="Analysis results and sharing" style={{ marginTop: "1.25rem", textAlign: "center" }}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            conversation={analysis?.usage?.lastInput || ""}
          />
        </section>
      )}

      <section style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardActive}
          aria-label={dashboardActive ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        >
          {dashboardActive ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {dashboardActive && (
        <section aria-label="Real-time dashboard section" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
};

export default App;