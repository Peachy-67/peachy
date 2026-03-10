import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
  "discard",
]);

/**
 * Main App component integrating:
 * - ConversationAnalyzerPolish for input and analysis
 * - ImmediateAlert for alerting high risk flags immediately
 * - FlaggedResultVisualization for showing verdict and flag badges
 * - ShareableResult for sharing flagged conversation results
 * - RealTimeDashboard for optionally monitoring real-time conversations
 */
function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // When analysisResult changes, determine if alert needed
  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }

    const flaggedBehaviorTypes = analysisResult.signals || [];

    // Check if any high risk flags present
    const detectedHighRiskFlags = flaggedBehaviorTypes.filter((flag) =>
      highRiskFlags.has(flag)
    );

    if (detectedHighRiskFlags.length > 0) {
      setAlertFlags(detectedHighRiskFlags);
      setShowAlert(true);
    } else {
      setAlertFlags([]);
      setShowAlert(false);
    }
  }, [analysisResult]);

  // Helper to toggle real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff7043", userSelect: "none" }}>FLAGGED.RUN</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Hide real-time dashboard"
              : "Show real-time dashboard for live conversation monitoring"
          }
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          analysisResult={analysisResult}
          onAnalysisUpdate={setAnalysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={setAnalysisResult} />

          {showAlert && alertFlags.length > 0 && (
            <ImmediateAlert
              flaggedBehaviors={alertFlags}
              onDismiss={() => setShowAlert(false)}
            />
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={mapVerdictLabel(analysisResult.verdict)}
                flaggedBehaviors={mapFlagsForVisualization(
                  analysisResult.signals,
                  analysisResult.confidence
                )}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
}

/**
 * The backend verdict format is an object, we map it to string labels expected by VerdictDisplay
 */
function mapVerdictLabel(verdictObj) {
  if (!verdictObj || typeof verdictObj !== "object") {
    return "Safe";
  }
  // Map bands to verdict label strings expected by VerdictDisplay
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
}

/**
 * Map raw flagged behavior types from backend to visualization format:
 * Each item: { type, label, confidence }
 * Use backend confidence as confidence score for all.
 */
function mapFlagsForVisualization(flags, confidence) {
  if (!Array.isArray(flags) || flags.length === 0) {
    return [];
  }

  // Label mappings for known flags
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

  // Only pass known flags that FlagBadge expects (per roadmap and existing)
  const acceptedFlags = [
    "insult",
    "manipulation",
    "gaslighting",
    "discard",
    "control",
    "ultimatum",
    "threat",
    "guilt",
    "boundary_push",
    "inconsistency",
  ];

  return flags
    .filter((f) => acceptedFlags.includes(f))
    .map((type) => ({
      type,
      label: labelMap[type] || type,
      confidence: confidence || 0,
    }));
}

export default App;