import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Determine high-risk flags for alert triggering
  const highRiskFlags = ["insult", "gaslighting", "threat", "ultimatum", "control"];

  // Monitor analysisResult for high risk flags to show alert
  useEffect(() => {
    if (
      analysisResult &&
      Array.isArray(analysisResult.signals) &&
      analysisResult.signals.some((signal) => highRiskFlags.includes(signal))
    ) {
      setAlertFlags(
        analysisResult.signals.filter((signal) => highRiskFlags.includes(signal))
      );
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to receive new analysis results from conversation analyzer or dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle to show/hide the RealTimeDashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="container" role="main" aria-label="FLAGGED conversation red flag detector">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED
      </h1>

      {alertVisible && <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />}

      <section aria-label="Conversation analyzer and results" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {analysisResult && (
        <section aria-label="Analysis result visualization" style={{ marginBottom: "2rem" }}>
          <FlaggedResultVisualization
            verdict={convertBandToLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapSignalsToLabels(analysisResult.signals)}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginBottom: "3rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1.1rem",
            fontWeight: "700",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "2px solid #ff6f61",
            backgroundColor: showDashboard ? "#ff6f61" : "transparent",
            color: showDashboard ? "white" : "#ff6f61",
            cursor: "pointer",
            userSelect: "none",
            transition: "all 0.3s ease",
          }}
        >
          {showDashboard ? "Hide Real-time Dashboard" : "Show Real-time Dashboard"}
        </button>
        {showDashboard && <RealTimeDashboard onAnalysis={handleAnalysisUpdate} highRiskFlags={highRiskFlags} />}
      </section>
    </main>
  );
};

// Helper to convert backend band to verdict label expected by visualization
function convertBandToLabel(band) {
  switch (band) {
    case "green":
      return "Safe";
    case "yellow":
      return "Caution";
    case "red":
      return "Flagged";
    default:
      return "Safe";
  }
}

// Helper to map signals array to flagged behaviors array with labels & confidences for visualization
// Confidence defaults to 1 because actual per-flag confidences aren't returned by current API.
function mapSignalsToLabels(signals) {
  if (!Array.isArray(signals)) return [];
  
  const signalMap = {
    insult: { label: "Insult", confidence: 1 },
    manipulation: { label: "Manipulation", confidence: 1 },
    gaslighting: { label: "Gaslighting", confidence: 1 },
    discard: { label: "Discard", confidence: 1 },
    control: { label: "Control", confidence: 1 },
    ultimatum: { label: "Ultimatum", confidence: 1 },
    threat: { label: "Threat", confidence: 1 },
    guilt: { label: "Guilt", confidence: 1 },
    boundary_push: { label: "Boundary Push", confidence: 1 },
    inconsistency: { label: "Inconsistency", confidence: 1 },
  };

  return signals
    .filter((signal) => Object.hasOwn(signalMap, signal))
    .map((signal) => ({ type: signal, ...signalMap[signal] }));
}

export default App;