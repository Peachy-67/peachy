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
  "discard",
  "control",
  "threat",
  "ultimatum",
  "guilt",
  "boundary_push",
]);

function extractFlagDetails(signals = []) {
  // Map signals to detailed objects for badges and UI
  const detailsMap = {
    insult: { type: "insult", label: "Insult" },
    manipulation: { type: "manipulation", label: "Manipulation" },
    gaslighting: { type: "gaslighting", label: "Gaslighting" },
    discard: { type: "discard", label: "Discard" },
    control: { type: "control", label: "Control" },
    ultimatum: { type: "manipulation", label: "Ultimatum" },
    threat: { type: "manipulation", label: "Threat" },
    guilt: { type: "manipulation", label: "Guilt" },
    boundary_push: { type: "manipulation", label: "Boundary Push" },
    inconsistency: { type: "manipulation", label: "Inconsistency" },
  };

  // Use a default moderate confidence if no confidence available
  // Here confidence will be overridden when available, simplified to 1 currently
  return signals.map((signal) => ({
    type: detailsMap[signal]?.type || signal,
    label: detailsMap[signal]?.label || signal,
    confidence: 1,
  }));
}

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);

    // Determine if any high-risk flags exist for immediate alert
    const flaggedSignals = result?.signals || [];
    const alerts = flaggedSignals.filter((flag) => highRiskFlags.has(flag));
    setAlertFlags(alerts);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

      {analysis && (
        <>
          <FlaggedResultVisualization
            verdict={analysis.verdict?.label || "Safe"}
            flaggedBehaviors={extractFlagDetails(analysis.signals)}
            overallConfidence={analysis.confidence || 0}
          />
          <ShareableResult analysis={analysis} />
        </>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: 36 }}>
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="peachy-button"
          aria-expanded={showDashboard}
          aria-controls="real-time-dashboard-section"
          style={{ display: "block", margin: "16px auto" }}
        >
          {showDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>
        {showDashboard && (
          <div id="real-time-dashboard-section" tabIndex={-1}>
            <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
          </div>
        )}
      </section>
    </main>
  );
};

export default App;