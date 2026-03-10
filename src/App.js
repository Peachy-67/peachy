import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardActive, setDashboardActive] = useState(false);

  // Watch flagged behaviors for high-risk flags to trigger immediate alert
  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }

    if (!analysisResult.signals || analysisResult.signals.length === 0) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }

    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    if (detectedHighRisk.length > 0) {
      setAlertFlags(detectedHighRisk);
      setShowAlert(true);
      if (typeof window !== "undefined" && window.alert) {
        window.alert(
          `High-risk behavior detected: ${detectedHighRisk
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}. Please be cautious.`
        );
      }
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler when new analysis data is available
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Dismiss alert banner handler for visible alert
  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setDashboardActive((active) => !active);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

      {showAlert && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          onDismiss={handleDismissAlert}
        />
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              analysisResult.signals
                ? analysisResult.signals.map((flag) => ({
                    type: flag,
                    label: flag.charAt(0).toUpperCase() + flag.slice(1),
                    confidence: analysisResult.confidence || 0,
                  }))
                : []
            }
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult analysisResult={analysisResult} />
        </>
      )}

      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardActive}
          aria-expanded={dashboardActive}
          aria-controls="realtime-dashboard"
          style={{ marginBottom: "1rem" }}
        >
          {dashboardActive ? "Hide" : "Show"} Real-time Dashboard
        </button>
        {dashboardActive && (
          <RealTimeDashboard id="realtime-dashboard" onAnalysis={handleAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;