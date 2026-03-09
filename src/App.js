import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "discard",
  "threat",
  "gaslighting",
  "manipulation",
  "control",
]);

const deriveVerdictLabel = (verdictObj) => {
  if (!verdictObj || !verdictObj.band) return "Safe";
  switch (verdictObj.band) {
    case "green":
      return "Safe";
    case "yellow":
      return "Caution";
    case "red":
      return "Flagged";
    default:
      return "Safe";
  }
};

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Effect to trigger immediate alert when high risk flags detected
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Prepare flaggedBehaviors array for visualization based on signals
  // Map signals to label and confidence; confidence not given in result signals array, so assume 1 for now
  const flaggedBehaviors =
    analysisResult?.signals?.map((signal) => {
      // Map known signals to labels
      const labelMap = {
        insult: "Insult",
        manipulation: "Manipulation",
        gaslighting: "Gaslighting",
        discard: "Discard",
        control: "Control",
        ultimatum: "Ultimatum",
        threat: "Threat",
        guilt: "Guilt",
        boundary_push: "Boundary Push",
        inconsistency: "Inconsistency",
      };
      return {
        type: signal,
        label: labelMap[signal] || signal,
        confidence: 1, // No explicit confidence; default to 1
      };
    }) || [];

  // OverallConfidence fallback (use analysisResult.confidence or 0)
  const overallConfidence = analysisResult?.confidence || 0;

  const verdictLabel = deriveVerdictLabel(analysisResult?.verdict);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      {/* Conversation Analyzer Input */}
      {!realTimeMode && (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {/* Immediate alert for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Show results visualization and share if analysis present and not in real time mode */}
      {!realTimeMode && analysisResult && (
        <section
          aria-label="Analysis results and sharing"
          style={{ marginTop: 20 }}
        >
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />

          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            conversationText={analysisResult.inputText || ""}
          />
        </section>
      )}

      {/* Real-time dashboard toggle and view */}
      <section style={{ marginTop: 30, textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={realTimeMode}
          aria-label={
            realTimeMode
              ? "Disable real-time dashboard"
              : "Enable real-time dashboard"
          }
          onClick={() => setRealTimeMode((mode) => !mode)}
        >
          {realTimeMode ? "Exit Real-Time Dashboard" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {realTimeMode && (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}
    </main>
  );
}