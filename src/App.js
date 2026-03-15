import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * The main app component integrates:
 * - ConversationAnalyzerPolish for input and analysis
 * - ImmediateAlert for instant notification on high-risk flags
 * - FlaggedResultVisualization for showing analysis results
 * - ShareableResult for share-friendly output and sharing features
 * - RealTimeDashboard for live monitoring with toggle control
 */

const highRiskFlagsSet = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
  "discard",
]);

const initialAnalysisState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  reaction: [],
  watchNext: [],
  analysisError: null,
  loading: false,
  analysisCount: 0,
};

/**
 * Extract flagged behaviors info for visualization from raw signals.
 * Returns array of {type, label, confidence} items.
 * Confidence defaults to 1 if not provided.
 */
function mapSignalsToFlags(signals) {
  if (!Array.isArray(signals)) return [];
  // Map known signals to display labels and dummy confidence 1
  const signalLabelMap = {
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
  return signals
    .filter((type) => type && typeof type === "string")
    .map((type) => ({
      type,
      label: signalLabelMap[type.toLowerCase()] || type,
      confidence: 1,
    }));
}

function App() {
  const [textInput, setTextInput] = useState("");
  const [verdict, setVerdict] = useState("Safe");
  const [flaggedBehaviors, setFlaggedBehaviors] = useState([]);
  const [overallConfidence, setOverallConfidence] = useState(0);
  const [reaction, setReaction] = useState([]);
  const [watchNext, setWatchNext] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Update flagged badges from signals
  const updateFlagsFromSignals = useCallback((signals) => {
    const flags = mapSignalsToFlags(signals);
    setFlaggedBehaviors(flags);
  }, []);

  // Detect if there are any high-risk flags for alert triggering
  const hasHighRiskFlags = useCallback(
    (flags) => flags.some((flag) => highRiskFlagsSet.has(flag.type)),
    []
  );

  // Handler invoked on conversation analysis update from ConversationAnalyzerPolish
  // Expected normalized output with verdict.band {green,yellow,red} mapped to verdict label {Safe,Caution,Flagged}
  const onAnalysisUpdate = useCallback((result) => {
    if (!result) return;
    const {
      verdict: verdictObj,
      reaction: newReaction,
      confidence,
      signals,
      why,
      watch_next,
    } = result;

    let updatedVerdict = "Safe";

    // Map band to label for UI
    if (verdictObj && typeof verdictObj === "object") {
      const band = verdictObj.band || "green";
      if (band === "green") updatedVerdict = "Safe";
      else if (band === "yellow") updatedVerdict = "Caution";
      else if (band === "red") updatedVerdict = "Flagged";
    }

    setVerdict(updatedVerdict);
    setReaction(Array.isArray(newReaction) ? newReaction : []);
    setOverallConfidence(typeof confidence === "number" ? confidence : 0);
    updateFlagsFromSignals(signals);
    setWatchNext(Array.isArray(watch_next) ? watch_next : []);
    setAnalysisError(null);
  }, [updateFlagsFromSignals]);

  // Handler for errors reported by analyzer
  const onAnalysisError = (errorMsg) => {
    setAnalysisError(errorMsg || "Unknown error");
    setVerdict("Safe");
    setFlaggedBehaviors([]);
    setOverallConfidence(0);
    setReaction([]);
    setWatchNext([]);
  };

  // Handler for loading state during analysis
  const onLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Reset all outputs and input
  const resetApp = () => {
    setTextInput("");
    setVerdict("Safe");
    setFlaggedBehaviors([]);
    setOverallConfidence(0);
    setReaction([]);
    setWatchNext([]);
    setAnalysisError(null);
    setLoading(false);
  };

  // Toggle real-time dashboard view on/off
  const toggleRealTimeDashboard = () => {
    setShowRealTimeDashboard((show) => !show);
    // Clear analysis state when switching dashboards for clarity
    resetApp();
  };

  // Compose share text for ShareableResult component - concise summary and snippet for viral sharing
  const generateShareText = () => {
    const flagsText =
      flaggedBehaviors.length > 0
        ? flaggedBehaviors.map((f) => f.label).join(", ")
        : "No red flags";
    const confidencePercent = Math.round(overallConfidence * 100);
    // Truncate conversation input to first 320 chars for sharing
    const snippet =
      textInput.trim().length > 320
        ? textInput.trim().slice(0, 317) + "..."
        : textInput.trim();
    return `FLAGGED\nVerdict: ${verdict}\nFlags: ${flagsText}\nConfidence: ${confidencePercent}%\n\nConversation excerpt:\n${snippet}`;
  };

  return (
    <main
      className="ui-container"
      role="main"
      aria-label="FLAGGED conversation red flag detection"
    >
      <h1
        tabIndex={-1}
        style={{
          textAlign: "center",
          color: "#ff6f3c",
          marginBottom: "1rem",
          userSelect: "none",
        }}
      >
        FLAGGED: Conversation Red Flag Detector
      </h1>

      <button
        onClick={toggleRealTimeDashboard}
        type="button"
        aria-pressed={showRealTimeDashboard}
        aria-label={
          showRealTimeDashboard
            ? "Switch to Paste Analyzer mode"
            : "Switch to Real-Time Dashboard mode"
        }
        style={{
          marginBottom: "1.25rem",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0.6rem 1.4rem",
          fontWeight: "700",
          fontSize: "1rem",
          backgroundColor: "#ff6f3c",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 3px 12px rgba(255, 111, 60, 0.5)",
          transition: "background-color 0.25s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e65b2a")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff6f3c")}
      >
        {showRealTimeDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {showRealTimeDashboard ? (
        <section aria-label="Real time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
        </section>
      ) : (
        <>
          <section aria-label="Conversation paste analyzer">
            <ConversationAnalyzerPolish
              text={textInput}
              onTextChange={setTextInput}
              onAnalysisUpdate={onAnalysisUpdate}
              onError={onAnalysisError}
              onLoading={onLoading}
            />
          </section>

          {/* Immediate alerts */}
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

          {/* Show error message if any */}
          {analysisError && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: "1rem" }}
            >
              {analysisError}
            </div>
          )}

          {/* Result visualization */}
          {(flaggedBehaviors.length > 0 || loading === false) && (
            <section aria-label="Analysis results" tabIndex={-1}>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
            </section>
          )}

          {/* Sharing */}
          {flaggedBehaviors.length > 0 && (
            <section aria-label="Share result" style={{ marginTop: "1rem" }}>
              <ShareableResult shareText={generateShareText()} />
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;