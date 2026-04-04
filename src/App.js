import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "discard", "threat", "ultimatum", "control"];

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null); // Full analysis JSON output
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRealTime, setShowRealTime] = useState(false);

  // Detect if any high-risk flags are present to trigger immediate alert
  const highRiskFlagsDetected =
    analysisResult?.signals?.some((flag) => HIGH_RISK_FLAGS.includes(flag)) || false;

  // The flagged behaviors array for visualization, mapping signals to label/confidence
  // For confidence, we use analysisResult.confidence as overall proxy for all flags since per-flag confidences not detailed
  const flaggedBehaviors = (analysisResult?.signals || []).map((type) => {
    // Map known signals to user-friendly labels
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
      type,
      label: labelMap[type] ?? type,
      confidence: analysisResult?.confidence ?? 0,
    };
  });

  // The verdict label from analysis, with safety fallback
  const verdict = (() => {
    if (!analysisResult) return "Safe";
    // Map backend verdict.band to ["Safe", "Caution", "Flagged"]
    // backend band values: green, yellow, red
    if (analysisResult.verdict?.band === "green") return "Safe";
    if (analysisResult.verdict?.band === "yellow") return "Caution";
    if (analysisResult.verdict?.band === "red") return "Flagged";
    return "Safe";
  })();

  // Handler to receive analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  // The components will pass new analysis data here
  function handleAnalysisUpdate(newResult) {
    setAnalysisResult(newResult);
    setError(null);
    setLoading(false);
  }

  // Handler for analysis loading & error states
  function handleLoading(isLoading) {
    setLoading(isLoading);
  }
  function handleError(errMsg) {
    setError(errMsg);
    setLoading(false);
  }

  // Toggle between real-time dashboard and paste analyzer
  function toggleRealTime() {
    setShowRealTime((v) => !v);
    setAnalysisResult(null);
    setError(null);
  }

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", margin: "0 0 1em 0", color: "#ff6f3c", userSelect: "none" }}>
        FLAGGED: Conversation Red Flag Detector
      </h1>

      <button
        onClick={toggleRealTime}
        aria-pressed={showRealTime}
        aria-label={`Switch to ${showRealTime ? "paste analyzer" : "real-time dashboard"}`}
        className="peachy-button"
        type="button"
      >
        {showRealTime ? "Go to Paste Analyzer" : "Open Real-Time Dashboard"}
      </button>

      {!showRealTime && (
        <section aria-label="Conversation paste analyzer section" style={{ marginTop: "1.5rem" }}>
          <ConversationAnalyzerPolish
            onAnalysisResult={handleAnalysisUpdate}
            onLoading={handleLoading}
            onError={handleError}
          />
        </section>
      )}

      {loading && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            marginTop: "1rem",
            color: "#ff6f61",
            fontWeight: "700",
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          Analyzing conversation...
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            color: "#b00020",
            fontWeight: "700",
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          Error: {error}
        </div>
      )}

      {analysisResult && !loading && !error && !showRealTime && (
        <section aria-label="Analysis results" style={{ marginTop: "1.5rem" }}>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence ?? 0}
          />

          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            confidence={analysisResult.confidence ?? 0}
            conversationExcerpt={
              analysisResult.meta?.conversationExcerpt ||
              (analysisResult.usage?.originalText?.slice(0, 250) ?? "")
            }
          />
        </section>
      )}

      {showRealTime && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "1.5rem" }}>
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} onError={handleError} />
        </section>
      )}

      <ImmediateAlert
        flaggedBehaviors={analysisResult?.signals ?? []}
        visible={highRiskFlagsDetected}
      />
    </main>
  );
}