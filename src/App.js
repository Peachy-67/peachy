import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "ultimatum",
  "gaslighting",
  "discard",
  "control",
  "guilt",
  "boundary_push",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [hasHighRiskAlert, setHasHighRiskAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardActive, setDashboardActive] = useState(false);

  // Watch for high-risk flags to trigger ImmediateAlert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHasHighRiskAlert(false);
      setAlertFlags([]);
      return;
    }
    const flaggedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    if (flaggedHighRisk.length > 0) {
      setHasHighRiskAlert(true);
      setAlertFlags(flaggedHighRisk);
    } else {
      setHasHighRiskAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Handler to toggle between real-time dashboard and conversation analyzer
  const toggleDashboard = () => {
    setDashboardActive((active) => !active);
    // Clear previous analysis on mode switch
    setAnalysisResult(null);
    setHasHighRiskAlert(false);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1.5rem", userSelect:"none" }}>
        <h1 style={{ color: "#cc2f2f", fontWeight: "900" }}>FLAGGED</h1>
        <p style={{ fontWeight: "600", fontStyle: "italic", color: "#6b2b2b" }}>
          Conversation red flag detection for manipulation, gaslighting, and harm
        </p>
      </header>

      <section aria-label="Mode selection" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={dashboardActive}
          aria-describedby="mode-description"
        >
          {dashboardActive ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
        <div
          id="mode-description"
          style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#555" }}
          aria-live="polite"
        >
          {dashboardActive
            ? "Real-time conversations monitored live."
            : "Paste a conversation for red flag analysis."}
        </div>
      </section>

      {dashboardActive ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
      )}

      <ImmediateAlert active={hasHighRiskAlert} flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={
              analysisResult.verdict?.label || "Safe"
            }
            flaggedBehaviors={
              analysisResult.signals.map((signal) => ({
                type: signal,
                label:
                  signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              })) || []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;