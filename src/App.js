import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "discard",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Watch analysis result and trigger immediate alert for high-risk flags
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const flags = (analysisResult.signals || []).filter((flag) => HIGH_RISK_FLAGS.has(flag));
    setAlertFlags(flags);
  }, [analysisResult]);

  // Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between paste analyzer and real-time dashboard mode
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear previous analysis and alerts when toggling view
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time monitoring dashboard"}
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Paste Conversation Analyzer" : "Real-time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={mapVerdictLabel(analysisResult.verdict.label)}
            flaggedBehaviors={mapFlagsForVisualization(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

/**
 * Map verdict label string to the three allowed verdicts for FlaggedResultVisualization
 * Safe, Caution, or Flagged
 */
function mapVerdictLabel(label) {
  const normalized = String(label || "").toLowerCase();
  if (normalized === "safe" || normalized === "green") return "Safe";
  if (normalized === "caution" || normalized === "yellow") return "Caution";
  if (normalized === "flagged" || normalized === "red") return "Flagged";
  // Default fallback
  return "Safe";
}

/**
 * Converts signals array to flaggedBehaviors array with label and confidence for FlaggedResultVisualization
 * Since we do not have per-flag confidence in analysisResult.signals, we'll assign overall confidence to each.
 */
function mapFlagsForVisualization(signals, confidence) {
  if (!Array.isArray(signals) || signals.length === 0) return [];
  // Map each known signal type to user-friendly label
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

  return signals.map((signal) => ({
    type: signal,
    label: labelMap[signal] || signal,
    confidence: confidence ?? 0.5,
  }));
}

export default App;