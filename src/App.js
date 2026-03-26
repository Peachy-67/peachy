import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "ultimatum",
  "threat",
  "discard",
  "control",
]);

function App() {
  // State for conversation analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  // List of detected flags from analysisResult
  const [flaggedBehaviors, setFlaggedBehaviors] = useState([]);
  // Overall verdict label string ('Safe', 'Caution', 'Flagged')
  const [verdict, setVerdict] = useState("Safe");
  // Overall confidence number (0-1)
  const [overallConfidence, setOverallConfidence] = useState(0);
  // Alert visibility state
  const [showAlertBanner, setShowAlertBanner] = useState(false);
  // High risk flags detected (subset of flaggedBehaviors)
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState([]);
  // Real-time dashboard mode on/off
  const [realTimeMode, setRealTimeMode] = useState(false);

  // When new analysis result arrives, update state and alert if needed
  useEffect(() => {
    if (!analysisResult) {
      setFlaggedBehaviors([]);
      setVerdict("Safe");
      setOverallConfidence(0);
      setShowAlertBanner(false);
      setHighRiskFlagsDetected([]);
      return;
    }

    const signals = analysisResult.signals ?? [];
    // Compose flagged behaviors array of objects: {type, label, confidence}
    // We map signals to labels and set confidence if available
    const signalLabels = {
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

    // For confidence per signal: ideally analysisResult.confidence is overall, no per-signal data.
    // So we use uniform confidence from analysisResult.confidence or 0.5 fallback.
    const confidenceScore = typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0.5;

    const newFlagged = signals.map((s) => ({
      type: s,
      label: signalLabels[s] || s.charAt(0).toUpperCase() + s.slice(1),
      confidence: confidenceScore,
    }));

    setFlaggedBehaviors(newFlagged);

    // Verdict mapping: based on analysisResult.verdict.band if available, else fallback.
    const band = analysisResult.verdict?.band;
    let mappedVerdict = "Safe";
    if (band === "green") mappedVerdict = "Safe";
    else if (band === "yellow") mappedVerdict = "Caution";
    else if (band === "red") mappedVerdict = "Flagged";

    setVerdict(mappedVerdict);
    setOverallConfidence(confidenceScore);

    // Determine if any high risk flags detected
    const highRiskSet = new Set();
    signals.forEach((flag) => {
      if (HIGH_RISK_FLAGS.has(flag)) highRiskSet.add(flag);
    });
    const highs = Array.from(highRiskSet);
    setHighRiskFlagsDetected(highs);
    setShowAlertBanner(highs.length > 0);
  }, [analysisResult]);

  // Handle dismiss alert banner
  function handleDismissAlert() {
    setShowAlertBanner(false);
  }

  // Handle toggle real-time dashboard
  function toggleRealTimeMode() {
    setRealTimeMode((prev) => !prev);
    // Clear previous analysis results when switching modes
    setAnalysisResult(null);
    setShowAlertBanner(false);
    setHighRiskFlagsDetected([]);
  }

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED.RUN</h1>

      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleRealTimeMode}
          aria-pressed={realTimeMode}
          aria-label={realTimeMode ? "Switch to conversation analyzer mode" : "Switch to real-time monitoring dashboard mode"}
        >
          {realTimeMode ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {showAlertBanner && (
        <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} onDismiss={handleDismissAlert} />
      )}

      {!realTimeMode && (
        <>
          <ConversationAnalyzerPolish onAnalysis={setAnalysisResult} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
                conversationText={analysisResult.originalText || ""}
              />
            </>
          )}
        </>
      )}

      {realTimeMode && (
        <RealTimeDashboard
          onAnalysis={(result) => {
            setAnalysisResult(result);
            // Real-time alert handled inside ImmediateAlert as normal
          }}
          flaggedBehaviors={flaggedBehaviors}
          verdict={verdict}
          overallConfidence={overallConfidence}
        />
      )}
    </main>
  );
}

export default App;