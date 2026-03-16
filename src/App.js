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
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // When analysisResult changes, determine whether any high risk flags present and set alert flags
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const detectedHighRiskFlags = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(detectedHighRiskFlags);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler when analysis updates from analyzer or dashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Toggle between paste input analyzer and real-time dashboard view
  const toggleView = () => {
    setShowDashboard((prev) => !prev);
    // Reset any existing analysis and alerts on toggle
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <div className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <header style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 tabIndex="0" style={{ color: "#ff6f61" }}>
          FLAGGED
        </h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleView}
          aria-pressed={showDashboard}
          aria-label={`Switch to ${showDashboard ? "paste analyzer" : "real-time dashboard"} view`}
        >
          {showDashboard ? "Go to Paste Analyzer" : "Go to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
      )}

      {analysisResult && !showDashboard && (
        <section
          aria-live="polite"
          aria-label="Analysis results with flag badges and verdict"
          style={{ marginTop: "1.5rem", marginBottom: "2rem" }}
        >
          <FlaggedResultVisualization
            verdict={mapVerdictLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapFlagsWithConfidence(analysisResult.signals)}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}
    </div>
  );
};

/**
 * Map backend verdict band to VerdictDisplay accepted values:
 * backend bands: "green" | "yellow" | "red"
 * VerdictDisplay expects: "Safe" | "Caution" | "Flagged"
 */
function mapVerdictLabel(band) {
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

/**
 * Map signal strings to flaggedBehaviors with label & confidence
 * In this app, confidence score per behavior unavailable, so assign default 1.0
 * Label capitalizes first letter and replaces underscores hyphens nicely
 */
function mapFlagsWithConfidence(signals) {
  if (!Array.isArray(signals) || signals.length === 0) return [];

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
    confidence: 1.0, // default full confidence; no per-flag confidence available from backend now
  }));
}

export default App;