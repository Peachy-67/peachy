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

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

function extractFlagLabels(flags) {
  if (!Array.isArray(flags)) return [];
  return flags.map((f) => (typeof f === "string" ? f : f.type || "")).filter(Boolean);
}

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  // On analysisResult change, detect if any high risk flag and trigger alert
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlagsDetected(false);
      setDismissedAlert(false);
      return;
    }
    const flags = analysisResult.signals || [];
    const hasHighRisk = flags.some((flag) => HIGH_RISK_FLAGS.has(flag));
    setHighRiskFlagsDetected(hasHighRisk);
    if (!hasHighRisk) setDismissedAlert(false); // reset dismiss if no high risk now
  }, [analysisResult]);

  // Handler for new analysis from Analyzer component
  function handleNewAnalysis(result) {
    setAnalysisResult(result);
    setShowDashboard(false);
  }

  // Handler to toggle between paste input analyzer and realtime dashboard
  function toggleDashboard() {
    setShowDashboard((prev) => {
      // Clear analysis and alert on toggle
      if (!prev) {
        setAnalysisResult(null);
        setHighRiskFlagsDetected(false);
        setDismissedAlert(false);
      }
      return !prev;
    });
  }

  // Handler to dismiss alert banner
  function onDismissAlert() {
    setDismissedAlert(true);
  }

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <header>
        <h1 style={{ textAlign: "center", color: "#d94f3d", userSelect: "none", marginBottom: "1rem" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
      </header>

      <section aria-live="polite" aria-atomic="true">
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer mode" : "Switch to real-time dashboard mode"}
          style={{ marginBottom: "1rem", width: "100%" }}
          data-testid="toggle-dashboard-btn"
        >
          {showDashboard ? "Back to Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={setAnalysisResult} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleNewAnalysis} />
      )}

      <ImmediateAlert
        flaggedBehaviors={analysisResult?.signals || []}
        show={!dismissedAlert && highRiskFlagsDetected}
        onDismiss={onDismissAlert}
      />

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={(analysisResult.signals || []).map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: 1,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals || []}
            confidence={analysisResult.confidence || 0}
            conversationText={analysisResult.why?.join("\n") || ""}
          />
        </>
      )}
    </main>
  );
}

export default App;