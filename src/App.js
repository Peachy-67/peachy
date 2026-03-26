import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "discard",
  "ultimatum",
  "control",
]);

const initialAnalysisState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawOutput: null,
};

function App() {
  // State managed from conversation analyzer (for pasted input)
  const [analysis, setAnalysis] = useState(initialAnalysisState);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // When analysis updates, determine flags requiring immediate alert
  useEffect(() => {
    if (!analysis.flaggedBehaviors || analysis.flaggedBehaviors.length === 0) {
      setAlertFlags([]);
      return;
    }
    // Find high-risk flagged behaviors from analysis
    const highRiskFlags = analysis.flaggedBehaviors
      .filter((flag) => HIGH_RISK_FLAGS.has(flag.type))
      .map((flag) => flag.label);

    setAlertFlags(highRiskFlags);
  }, [analysis]);

  // Handler callback passed to ConversationAnalyzerPolish to update analysis state
  const onAnalysisResult = useCallback((result) => {
    if (!result) return;
    // Map input result signals into flaggedBehaviors array with type, label and confidence
    // For compatibility with FlaggedResultVisualization expects flaggedBehaviors as array of {type, label, confidence}
    const flaggedBehaviors = (result.signals || []).map((signal) => {
      // Derive label (capitalized signal)
      const label =
        signal.charAt(0).toUpperCase() + signal.slice(1).toLowerCase();
      // Use confidence if provided in result (0..1), fallback 0.7 for detected signal
      const confidence =
        typeof result.confidence === "number" ? result.confidence : 0.7;
      return { type: signal, label, confidence };
    });

    // Determine verdict: convert v1 verdict band to MVP verdict label used in visualization: Safe, Caution, Flagged
    let verdictLabel = "Safe";
    const band = result.verdict?.band || "green";
    if (band === "green") verdictLabel = "Safe";
    else if (band === "yellow") verdictLabel = "Caution";
    else if (band === "red") verdictLabel = "Flagged";

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence:
        typeof result.confidence === "number" ? result.confidence : 0,
      rawOutput: result,
    });
  }, []);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", userSelect: "none", color:"#cc2f2f" }}>
        FLAGGED Conversation Red Flag Detector
      </h1>

      <section aria-label="Main input area for conversation analysis">
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysisComplete={onAnalysisResult} />
        )}

        {alertFlags.length > 0 && (
          <ImmediateAlert flaggedBehaviorLabels={alertFlags} />
        )}
      </section>

      <section aria-label="Analysis results and sharing" style={{marginTop: "2rem"}}>
        {!showDashboard && analysis && analysis.rawOutput && (
          <>
            <FlaggedResultVisualization
              verdict={analysis.verdict}
              flaggedBehaviors={analysis.flaggedBehaviors}
              overallConfidence={analysis.overallConfidence}
            />

            <ShareableResult
              verdict={analysis.verdict}
              flaggedBehaviors={analysis.flaggedBehaviors}
              overallConfidence={analysis.overallConfidence}
              conversationText={
                analysis.rawOutput?.usage?.originalText || ""
              }
            />
          </>
        )}
      </section>

      <section
        aria-label="Real-time monitoring dashboard toggle"
        style={{ marginTop: "3rem", textAlign: "center" }}
      >
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-live="polite"
          className="peachy-button"
        >
          {showDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>
      </section>

      {showDashboard && (
        <section
          aria-label="Real-time conversation monitoring dashboard"
          style={{ marginTop: "2rem" }}
        >
          <RealTimeDashboard
            onAnalysisComplete={onAnalysisResult}
            showImmediateAlerts={true}
          />
        </section>
      )}
    </main>
  );
}

export default App;