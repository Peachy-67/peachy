import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "discard", "control"];

const extractFlaggedBehaviors = (signals) => {
  // Map signal to label and type for badges
  if (!signals || signals.length === 0) return [];
  const labelsMap = {
    insult: { label: "Insult", type: "insult" },
    manipulation: { label: "Manipulation", type: "manipulation" },
    gaslighting: { label: "Gaslighting", type: "gaslighting" },
    discard: { label: "Discard", type: "discard" },
    control: { label: "Control", type: "control" },
    ultimatum: { label: "Ultimatum", type: "control" },  // Control style
    threat: { label: "Threat", type: "control" },        // Control style
    guilt: { label: "Guilt", type: "manipulation" },
    boundary_push: { label: "Boundary Push", type: "control" },
    inconsistency: { label: "Inconsistency", type: "manipulation" },
  };

  const flagged = signals
    .filter((sig) => typeof sig === "string" && labelsMap[sig])
    .map((sig) => ({
      type: labelsMap[sig].type,
      label: labelsMap[sig].label,
      confidence: 1, // default confidence for now; real app may have data
    }));

  // Remove duplicates by label/type
  return flagged.filter((flag, index, arr) => arr.findIndex((f) => f.label === flag.label) === index);
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for conversation analysis results from ConversationAnalyzerPolish
  const onAnalyze = (result) => {
    // result shape from ConversationAnalyzerPolish expected to match analyzeResponse format
    if (!result) {
      setAnalysisResult(null);
      setHighRiskFlags([]);
      return;
    }

    setAnalysisResult(result);

    // Extract high-risk flags present in signals for ImmediateAlert
    const signals = Array.isArray(result.signals) ? result.signals : [];
    const highRisks = signals.filter((sig) => HIGH_RISK_FLAGS.includes(sig));
    setHighRiskFlags(highRisks);
  };

  // Handler to dismiss alert: clears high risk flags
  const dismissAlert = () => {
    setHighRiskFlags([]);
  };

  // Extract flagged behaviors for visualization
  const flaggedBehaviors = extractFlaggedBehaviors(analysisResult?.signals);

  // Determine verdict string for visualization, fallback to 'Safe'
  const verdictLabelMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdictBand = analysisResult?.verdict?.band || "green";
  const verdict = verdictLabelMap[verdictBand] || "Safe";

  // Overall confidence from analysis result or default 0
  const overallConfidence = typeof analysisResult?.confidence === "number" ? analysisResult.confidence : 0;

  return (
    <div className="container" role="main" aria-label="Flagged conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>
      </header>

      <ConversationAnalyzerPolish onAnalyze={onAnalyze} />

      <ImmediateAlert flaggedBehaviors={highRiskFlags} onDismiss={dismissAlert} />

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
            conversationText={analysisResult.meta?.originalText || ""}
          />
        </>
      )}

      {/* Toggle for RealTimeDashboard */}
      <section style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((show) => !show)}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "1rem" }}>
          <RealTimeDashboard />
        </section>
      )}
    </div>
  );
};

export default App;