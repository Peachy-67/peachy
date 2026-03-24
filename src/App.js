import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "threat",
  "gaslighting",
  "discard",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [viewDashboard, setViewDashboard] = useState(false);

  // Check for any high risk flags in the latest analysis result
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const detectedHighRiskFlags = analysisResult.signals.filter((flag) =>
      highRiskFlags.has(flag)
    );
    if (detectedHighRiskFlags.length > 0) {
      setAlertFlags(detectedHighRiskFlags);
      setShowAlert(true);
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleAnalyze = (result) => {
    setAnalysisResult(result);
  };

  const toggleDashboard = () => {
    setViewDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        aria-pressed={viewDashboard}
        onClick={toggleDashboard}
        className="peachy-button"
        style={{ marginBottom: "1rem", width: "100%" }}
        type="button"
      >
        {viewDashboard ? "Switch to Paste Analyzer" : "Switch to Real-time Dashboard"}
      </button>

      {viewDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalyze}
          aria-label="Real-time conversation monitoring dashboard"
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisComplete={handleAnalyze}
          aria-label="Conversation text analyzer"
        />
      )}

      {showAlert && alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={() => setShowAlert(false)} />
      )}

      {analysisResult && (
        <>
          <section
            aria-label="Flagged conversation results"
            style={{ marginTop: "1.5rem" }}
          >
            <FlaggedResultVisualization
              verdict={capitalizeVerdict(analysisResult.verdict?.label)}
              flaggedBehaviors={mapFlagsToLabels(analysisResult.signals)}
              overallConfidence={analysisResult.confidence}
            />
          </section>

          <section
            aria-label="Share flagged conversation results"
            style={{ marginTop: "1rem" }}
          >
            <ShareableResult analysisResult={analysisResult} />
          </section>
        </>
      )}
    </main>
  );
};

// Utility to capitalize verdict label to match expected enum
function capitalizeVerdict(verdict) {
  if (!verdict) return "Safe";
  const v = verdict.toLowerCase();
  if (v === "safe" || v === "green") return "Safe";
  if (v === "caution" || v === "yellow") return "Caution";
  if (v === "flagged" || v === "red") return "Flagged";
  return "Caution";
}

/**
 * Map raw signals to objects with type, label, and confidence.
 * Confidence is unknown here so set to 1 by default.
 * Labels capitalize first letter and may refine wording.
 */
function mapFlagsToLabels(signals) {
  if (!Array.isArray(signals)) return [];

  // Map of signal to display label
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

  // Return unique signals with label and full confidence (1)
  return Array.from(new Set(signals)).map((type) => ({
    type,
    label: labelMap[type] || capitalize(type),
    confidence: 1,
  }));
}

// Capitalize first letter helper
function capitalize(str) {
  if (typeof str !== "string" || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default App;