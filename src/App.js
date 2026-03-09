import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const highRiskFlagsSet = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [isDashboardActive, setIsDashboardActive] = useState(false);

  // Handle new analysis result and check for high-risk flags
  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }

    const flaggedTypes = (analysisResult.signals || []).map((s) => s.toLowerCase());

    // Detect if any high-risk flag exists
    const foundHighRisk = flaggedTypes.filter((flag) => highRiskFlagsSet.has(flag));

    if (foundHighRisk.length > 0) {
      setAlertFlags(foundHighRisk);
      setShowAlert(true);
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for dismissal of alert banner
  const onDismissAlert = () => {
    setShowAlert(false);
  };

  // Handler callback for analysis from ConversationAnalyzerPolish or RealTimeDashboard manual analyze
  const handleAnalyze = (result, error) => {
    if (error) {
      setError(error);
      setAnalysisResult(null);
    } else {
      setError(null);
      setAnalysisResult(result);
    }
  };

  return (
    <main className="ui-container" aria-label="FLAGGED main application interface">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#cc2f2f" }}>FLAGGED</h1>
        <p>Detect red flags in conversations</p>
      </header>

      {/* Real-time monitoring toggle */}
      <section aria-label="Real-time monitoring toggle" style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setIsDashboardActive((prev) => !prev)}
          aria-pressed={isDashboardActive}
          aria-live="polite"
          aria-label={isDashboardActive ? "Disable real-time monitoring dashboard" : "Enable real-time monitoring dashboard"}
        >
          {isDashboardActive ? "Disable Real-Time Dashboard" : "Enable Real-Time Dashboard"}
        </button>
      </section>

      {/* Show RealTimeDashboard only if enabled */}
      {isDashboardActive ? (
        <RealTimeDashboard onAnalyze={handleAnalyze} />
      ) : (
        <>
          {/* Conversation input and analysis */}
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} error={error} />

          {/* Show alert if high risk flags detected */}
          {showAlert && <ImmediateAlert flaggedTypes={alertFlags} onDismiss={onDismissAlert} />}

          {/* Show flagged result visualization and sharing if analysis result exists */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={mapVerdictLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapFlagsWithLabelsAndConfidence(analysisResult.signals, analysisResult.confidence)}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

// Helper to map verdict band to label string for VerdictDisplay accepted prop
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

// Helper to map flagged signals strings to objects for FlaggedResultVisualization with label/confidence
function mapFlagsWithLabelsAndConfidence(signals = [], confidence = 0) {
  // Map signal to human-readable label
  const labelsLookup = {
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

  // Use same confidence for all signals from backend confidence for MVP
  const confidenceNum = Number(confidence) || 0;

  return signals.map((signal) => ({
    type: signal.toLowerCase(),
    label: labelsLookup[signal.toLowerCase()] || signal,
    confidence: confidenceNum,
  }));
}

export default App;