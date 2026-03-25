import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer, immediate alert,
 * flagged result visualization with sharing, and real-time dashboard toggle.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isRealTimeDashboard, setIsRealTimeDashboard] = useState(false);

  // Determines if any high-risk flags are present for alerts (red band or critical flags)
  const hasHighRiskFlags =
    analysisResult &&
    analysisResult.verdict &&
    analysisResult.verdict.band === "red";

  // Handler to receive new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const onNewAnalysisResult = (result) => {
    setAnalysisResult(result);
    setAnalysisError(null);
  };

  // Handler to receive errors from analysis components
  const onAnalysisError = (error) => {
    setAnalysisResult(null);
    setAnalysisError(error);
  };

  // Toggle between paste input analyzer mode and real-time dashboard mode
  const toggleRealtimeDashboard = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsRealTimeDashboard((enabled) => !enabled);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 tabIndex="-1" style={{ userSelect: "none", color: "#cc2f2f" }}>
          FLAGGED
        </h1>
        <p style={{ marginTop: "0.2rem", fontWeight: "600" }}>
          Detect red flags in conversations and identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      <section aria-label="Toggle real-time monitoring dashboard">
        <button
          type="button"
          onClick={toggleRealtimeDashboard}
          className="peachy-button"
          aria-pressed={isRealTimeDashboard}
          aria-live="polite"
        >
          {isRealTimeDashboard ? "Use Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </section>

      <section aria-live="polite" aria-atomic="true" style={{ marginTop: "1.5rem" }}>
        {isRealTimeDashboard ? (
          <RealTimeDashboard onAnalysis={onNewAnalysisResult} onError={onAnalysisError} />
        ) : (
          <ConversationAnalyzerPolish onAnalysis={onNewAnalysisResult} onError={onAnalysisError} />
        )}
      </section>

      {analysisError && (
        <section role="alert" aria-live="assertive" className="alert-banner" style={{ marginTop: "1rem" }}>
          Error: {analysisError}
        </section>
      )}

      {hasHighRiskFlags && analysisResult && (
        <ImmediateAlert flaggedBehaviors={analysisResult.signals} />
      )}

      {analysisResult && !isRealTimeDashboard && (
        <section aria-label="Conversation analysis results" style={{ marginTop: "2rem" }}>
          <FlaggedResultVisualization
            verdict={mapBandToLabel(analysisResult.verdict.band)}
            flaggedBehaviors={mapSignalsToBehaviorObjects(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}
    </main>
  );
};

// Map verdict band to readable label matching FlaggedResultVisualization expected values
function mapBandToLabel(band) {
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

// Map signals array + confidence number to array of flagged behavior objects for FlaggedResultVisualization
function mapSignalsToBehaviorObjects(signals, confidence) {
  // Mapping of canonical flags to labels used by FlagBadge
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

  // For each known flag, produce an object with type, label, and confidence (use same overall for now)
  return signals.map((flag) => ({
    type: flag,
    label: flagLabelMap[flag] || flag.charAt(0).toUpperCase() + flag.slice(1),
    confidence: confidence || 0,
  }));
}

export default App;