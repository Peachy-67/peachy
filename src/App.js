import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Check if any high-risk flags are present in current analysis
  useEffect(() => {
    if (!analysis?.signals) {
      setAlertVisible(false);
      return;
    }
    const hasHighRisk = analysis.signals.some((signal) =>
      HIGH_RISK_FLAGS.has(signal)
    );
    setAlertVisible(hasHighRisk);
  }, [analysis]);

  // Handler for new conversation analysis result
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Handler for dismissing alert banner
  const handleDismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <main
      className="container"
      aria-label="FLAGGED conversation red-flag detection application"
    >
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED
      </h1>

      <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />

      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={analysis.signals}
          onDismiss={handleDismissAlert}
        />
      )}

      {analysis && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={analysis.verdict?.label || "Safe"}
            flaggedBehaviors={analysis.signals.map((sig) => ({
              type: sig,
              label: sig.charAt(0).toUpperCase() + sig.slice(1),
              confidence: analysis.confidence ?? 0,
            }))}
            overallConfidence={analysis.confidence ?? 0}
          />
          <ShareableResult
            verdict={analysis.verdict?.label || "Safe"}
            signals={analysis.signals}
            confidence={analysis.confidence ?? 0}
            why={analysis.why || []}
            watchNext={analysis.watch_next || []}
            conversationExcerpt={analysis.meta?.conversationExcerpt || ""}
          />
        </>
      )}

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Hide real-time monitoring dashboard"
              : "Show real-time monitoring dashboard"
          }
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard && (
        <RealTimeDashboard
          onNewAnalysis={handleAnalysisUpdate}
          initialData={analysis}
        />
      )}
    </main>
  );
};

export default App;