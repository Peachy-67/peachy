import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "ultimatum",
  "threat",
  "gaslighting",
  "discard",
]);

const App = () => {
  // State for latest analysis results from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);

  // State for alert flags to show immediate alert
  const [alertFlags, setAlertFlags] = useState([]);

  // Control visibility of real-time dashboard mode
  const [dashboardMode, setDashboardMode] = useState(false);

  // Handle new analysis data from ConversationAnalyzerPolish or RealTimeDashboard manual analysis
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    // Determine if any high-risk flagged behaviors present for immediate alert
    if (result?.signals) {
      const detectedAlerts = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(detectedAlerts);
    } else {
      setAlertFlags([]);
    }
  };

  // Handle manual dismissal of alert banner
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboardMode = () => {
    setDashboardMode((prev) => !prev);
    // Clear previous results & alerts when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED red flag conversation detector application">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1>FLAGGED</h1>
        <p style={{ color: "#cc2f2f", fontWeight: "700" }}>
          Detect red flags in conversations instantly
        </p>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboardMode}
          aria-pressed={dashboardMode}
          aria-label={dashboardMode ? "Switch to conversation analyzer view" : "Switch to real-time dashboard view"}
          style={{ marginTop: "0.5rem" }}
        >
          {dashboardMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={handleDismissAlert} />

      {dashboardMode ? (
        // Real-time conversation monitoring UI
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        // Paste conversation analyzer UI
        <section aria-label="Conversation analyzer">
          <ConversationAnalyzerPolish onAnalysisResult={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={mapVerdictBandToLabel(analysisResult.verdict.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </section>
      )}
    </main>
  );
};

/**
 * Map verdict band from backend ("green", "yellow", "red") to UI verdict label
 * Expected labels: "Safe", "Caution", "Flagged"
 */
function mapVerdictBandToLabel(band) {
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
 * Map raw signal strings to flagged behavior objects expected by FlaggedResultVisualization
 * Each flag object: {type, label, confidence}
 * Use confidence from overall or default to 0.75
 */
function mapSignalsToFlags(signals, confidence) {
  const knownLabels = {
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
    label: knownLabels[sig] || sig.charAt(0).toUpperCase() + sig.slice(1),
    confidence: confidence || 0.75,
  }));
}

export default App;