import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const initialAnalysis = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawOutput: null,
};

function bandFromVerdictLabel(label) {
  switch (label) {
    case "Safe":
      return "green";
    case "Caution":
      return "yellow";
    case "Flagged":
      return "red";
    default:
      return "green";
  }
}

function App() {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [showRealtimeDashboard, setShowRealtimeDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Update alert flags immediately when analysis flagged behaviors include high risk signals
  useEffect(() => {
    if (!analysis.flaggedBehaviors || analysis.flaggedBehaviors.length === 0) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }
    const highRiskDetected = analysis.flaggedBehaviors.filter(({ type }) =>
      HIGH_RISK_FLAGS.has(type.toLowerCase())
    );
    if (highRiskDetected.length > 0) {
      // If alert was dismissed but new important flags appear, reset dismissal
      if (
        alertDismissed &&
        highRiskDetected.some(
          (f) => !alertFlags.find((af) => af.type === f.type)
        )
      ) {
        setAlertDismissed(false);
      }
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [analysis.flaggedBehaviors, alertDismissed, alertFlags]);

  // Handler for new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysisUpdate(newOutput) {
    if (
      !newOutput ||
      typeof newOutput !== "object" ||
      !newOutput.verdict ||
      !newOutput.signals
    ) {
      setAnalysis(initialAnalysis);
      return;
    }

    // Determine verdict label consistent with FlaggedResultVisualization's expectations
    let verdictLabel;
    if (newOutput.verdict.band === "green") verdictLabel = "Safe";
    else if (newOutput.verdict.band === "yellow") verdictLabel = "Caution";
    else if (newOutput.verdict.band === "red") verdictLabel = "Flagged";
    else verdictLabel = "Safe";

    // Map signals to flaggedBehaviors array with {type, label, confidence}
    // For label, capitalize the type; confidence from confidence or 0.5 default
    // Use existing confidence number or fallback to 0.5
    const defaultLabelMap = {
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

    const flaggedBehaviors = Array.isArray(newOutput.signals)
      ? newOutput.signals.map((type) => ({
          type,
          label: defaultLabelMap[type.toLowerCase()] || type,
          confidence:
            typeof newOutput.confidence === "number"
              ? newOutput.confidence
              : 0.5,
        }))
      : [];

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence:
        typeof newOutput.confidence === "number" ? newOutput.confidence : 0,
      rawOutput: newOutput,
    });
  }

  function dismissAlert() {
    setAlertDismissed(true);
  }

  // Toggle between paste analyzer and real-time dashboard views
  function toggleDashboard() {
    setShowRealtimeDashboard((v) => !v);
    // Reset alerts and analysis on toggle to keep clean state
    setAlertDismissed(false);
    setAlertFlags([]);
    setAnalysis(initialAnalysis);
  }

  return (
    <main
      className="ui-container"
      aria-label="FLAGGED conversation red flag analysis app"
    >
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
          FLAGGED.RUN
        </h1>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <button
            aria-pressed={showRealtimeDashboard}
            onClick={toggleDashboard}
            className="peachy-button"
            type="button"
          >
            {showRealtimeDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        visible={!alertDismissed && alertFlags.length > 0}
        onDismiss={dismissAlert}
      />

      {showRealtimeDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          <section aria-label="Flagged conversation result" style={{ marginTop: "1.5rem" }}>
            <FlaggedResultVisualization
              verdict={analysis.verdict}
              flaggedBehaviors={analysis.flaggedBehaviors}
              overallConfidence={analysis.overallConfidence}
            />
          </section>
          <ShareableResult
            flaggedResult={analysis.rawOutput}
            verdict={analysis.verdict}
            flaggedBehaviors={analysis.flaggedBehaviors}
          />
        </>
      )}
    </main>
  );
}

export default App;