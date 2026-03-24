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
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Callback to receive new analysis from analyzer or dashboard fallback
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);

    if (result && result.signals) {
      const highRiskDetected = result.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.toLowerCase())
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Clear alerts when dashboard or input changes or user dismisses alert
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ color: "#cc2f2f", userSelect: "none", textAlign: "center" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", userSelect: "none", marginBottom: "1rem" }}>
          Detect red flags in conversations to help spot manipulation and harmful behavior.
        </p>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginBottom: "1.75rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={mapBandToVerdictLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapSignalsToFlaggedBehaviors(analysisResult.signals)}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                result={analysisResult}
              />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          initialResult={analysisResult}
        />
      )}
    </main>
  );
};

// Helper to map verdict band to verdict display label
function mapBandToVerdictLabel(band) {
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

// Map raw signals to objects with type, label, and confidence for FlaggedResultVisualization
function mapSignalsToFlaggedBehaviors(signals = []) {
  // For MVP, use default confidence 0.75 for all flags
  // Map known signal types to labels matching FlagBadge component expectations
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

  // Filter only known flags in label map for display
  return signals
    .filter((s) => flagLabelMap[s])
    .map((s) => ({
      type: s,
      label: flagLabelMap[s],
      confidence: 0.75,
    }));
}

export default App;