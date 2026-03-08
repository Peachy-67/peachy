import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // State for conversation text and analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for real-time dashboard toggle
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // When a new analysis is done, update state and reset error/loading
  const onAnalyze = (result, loading, err) => {
    setError(err || null);
    setIsLoading(loading);
    if (result) {
      setAnalysisResult(result);
    }
  };

  // Detect if any flagged behaviors are "high risk" for alert
  // High risk flags can be insult, gaslighting, manipulation, discard, threat, ultimatum, control, etc.
  const highRiskFlags = [
    "insult",
    "gaslighting",
    "manipulation",
    "discard",
    "threat",
    "ultimatum",
    "control",
  ];

  // Extract flagged behavior types from latest analysis
  const flaggedTypes = analysisResult?.signals || [];

  // Determine if immediate alert needed based on flag types
  const alertFlags = flaggedTypes.filter((flag) => highRiskFlags.includes(flag));

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Real-time dashboard toggle */}
      <section
        aria-label="Real-time monitoring toggle"
        style={{ textAlign: "center", marginBottom: "1rem" }}
      >
        <button
          type="button"
          onClick={() => setShowRealTimeDashboard((v) => !v)}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
        >
          {showRealTimeDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {/* Show real-time dashboard if toggled on */}
      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={(result) => {
            setAnalysisResult(result);
          }}
        />
      ) : (
        <>
          {/* Conversation input and analysis controls */}
          <ConversationAnalyzerPolish onAnalysis={onAnalyze} disabled={isLoading} />

          {/* Immediate alert on high risk flags */}
          <ImmediateAlert flaggedBehaviors={alertFlags} />

          {/* Error display if any */}
          {error && (
            <div
              role="alert"
              className="alert-banner"
              style={{ marginTop: "1rem", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}
            >
              {error}
            </div>
          )}

          {/* Show results visualization if available and not loading */}
          {analysisResult && !isLoading && (
            <div style={{ marginTop: "1.5rem" }}>
              <FlaggedResultVisualization
                verdict={convertBandToLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapFlagsToLabels(analysisResult.signals)}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult analysis={analysisResult} conversationExcerpt={analysisResult?.meta?.excerpt || ""} />
            </div>
          )}
        </>
      )}
    </main>
  );
};

// Utility: Map verdict band to "Safe", "Caution", or "Flagged"
function convertBandToLabel(band) {
  if (band === "green") return "Safe";
  if (band === "yellow") return "Caution";
  if (band === "red") return "Flagged";
  return "Safe";
}

// Utility: Map flags to array of objects with type, label, and dummy confidence 1.0
// Ideally confidence would come from backend data per flag, but fallback 1.0 for visualization
function mapFlagsToLabels(flags) {
  if (!Array.isArray(flags)) return [];
  // Map flag keywords to labels and types for badges
  const flagLabelMap = {
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
  return flags.map((f) => ({
    type: f,
    label: flagLabelMap[f] || f,
    confidence: 1.0,
  }));
}

export default App;