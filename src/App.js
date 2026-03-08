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

function hasHighRiskFlags(flags) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.type.toLowerCase()));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [realTimeView, setRealTimeView] = useState(false);

  // Handler when conversation analysis completes/updates
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    // Re-show alert banner when new high risk flags appear
    if (result && hasHighRiskFlags(result.flaggedBehaviors)) {
      setAlertsVisible(true);
    }
  }, []);

  // Handler to dismiss alert banner
  const dismissAlert = useCallback(() => {
    setAlertsVisible(false);
  }, []);

  // Toggle between real-time monitoring dashboard and analyzer view
  const toggleRealTimeView = useCallback(() => {
    setRealTimeView((v) => !v);
  }, []);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1>FLAGGED: Conversation Red Flag Detector</h1>
      </header>

      {alertsVisible && analysisResult && hasHighRiskFlags(analysisResult.flaggedBehaviors) && (
        <ImmediateAlert
          flaggedBehaviors={analysisResult.flaggedBehaviors}
          onDismiss={dismissAlert}
        />
      )}

      <section aria-label="Conversation analyzer section" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {analysisResult && (
        <section aria-label="Analysis result visualization with sharing">
          <FlaggedResultVisualization
            verdict={analysisResult.verdictLabel}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}

      <hr aria-hidden="true" style={{ margin: "2rem 0" }} />

      <section aria-label="Real-time conversation monitoring dashboard">
        <button
          type="button"
          onClick={toggleRealTimeView}
          aria-pressed={realTimeView}
          className="peachy-button"
          style={{ marginBottom: "1rem" }}
        >
          {realTimeView ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
        {realTimeView && <RealTimeDashboard />}
      </section>
    </main>
  );
};

export default App;