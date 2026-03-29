import React, { useState, useEffect } from "react";

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

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);

  // Whenever analysis updates, check for high-risk flags and show alert
  useEffect(() => {
    if (analysis && analysis.signals) {
      const highRiskDetected = analysis.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );
      setHighRiskFlags(highRiskDetected);
      setAlertVisible(highRiskDetected.length > 0);
      if (highRiskDetected.length > 0) {
        // Also native alert for immediate screen reader/user feedback on detection
        alert(
          `Warning: High-risk behavior detected: ${highRiskDetected
            .map((flag) => flag.charAt(0).toUpperCase() + flag.slice(1))
            .join(", ")}`
        );
      }
    } else {
      setHighRiskFlags([]);
      setAlertVisible(false);
    }
  }, [analysis]);

  // Handler to dismiss the visible alert banner
  const dismissAlert = () => setAlertVisible(false);

  // Handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Toggle between paste analyzer interface and real-time dashboard
  const toggleDashboard = () => setShowDashboard((x) => !x);

  return (
    <main className="ui-container" aria-label="Flagged Conversation Analyzer Application">
      <header>
        <h1 style={{ color: "#ff6f61", textAlign: "center", userSelect: "none" }}>
          FLAGGED: Behavioral Red Flag Detector
        </h1>
      </header>

      {/* Immediate alert banner on detected high-risk flags */}
      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlags}
          onDismiss={dismissAlert}
        />
      )}

      {/* Toggle Button for Dashboard mode */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard ? "Switch to Conversation Analyzer" : "Switch to Real Time Dashboard"
          }
          className="peachy-button"
          type="button"
        >
          {showDashboard ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={mapBandToVerdict(analysis.verdict.band)}
                flaggedBehaviors={buildFlaggedBehaviors(analysis.signals)}
                overallConfidence={analysis.confidence}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}
    </main>
  );
}

// Helpers to map backend "band" to expected verdict strings for visualization
function mapBandToVerdict(band) {
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

// Map signals array to flagged behavior objects with labels and confidence (dummy 0.85)
// We cannot know exact confidence per flag here from current API, so we set a reasonable default
function buildFlaggedBehaviors(signals) {
  if (!Array.isArray(signals) || signals.length === 0) return [];
  const labelsMap = {
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
  return signals.map((sig) => ({
    type: sig,
    label: labelsMap[sig] || sig.charAt(0).toUpperCase() + sig.slice(1),
    confidence: 0.85,
  }));
}

export default App;