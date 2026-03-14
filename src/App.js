import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "ultimatum",
  "control",
]);

const App = () => {
  // State: conversation analysis result from analyzer
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);

  // Handle new analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalyzeUpdate = (result) => {
    setAnalysisResult(result);

    // Check and trigger alert if any high-risk flags found
    if (result?.signals?.some((flag) => highRiskFlags.has(flag))) {
      setAlertFlags(
        result.signals.filter((flag) => highRiskFlags.has(flag))
      );
      setAlertVisible(true);
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  };

  // Dismiss alert callback for ImmediateAlert
  const onDismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle dashboard view
  const toggleDashboard = () => {
    setDashboardEnabled((enabled) => !enabled);
  };

  return (
    <main className="container" role="main" aria-label="FLAGGED conversation analyzer app">
      <h1 className="ui-section-header" tabIndex={-1}>
        FLAGGED Conversation Analyzer
      </h1>

      {alertVisible && (
        <ImmediateAlert flags={alertFlags} onDismiss={onDismissAlert} />
      )}

      {!dashboardEnabled && (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalyzeUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence:
                    typeof analysisResult.confidence === "number"
                      ? analysisResult.confidence
                      : 0,
                }))}
                overallConfidence={
                  typeof analysisResult.confidence === "number"
                    ? analysisResult.confidence
                    : 0
                }
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardEnabled}
          aria-label={dashboardEnabled ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {dashboardEnabled ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {dashboardEnabled && (
        <RealTimeDashboard onAnalyze={handleAnalyzeUpdate} />
      )}
    </main>
  );
};

export default App;