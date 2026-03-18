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
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRealTime, setShowRealTime] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Effect to update alerts for high-risk flags
  useEffect(() => {
    if (!analysisResult?.signals) {
      setAlertFlags([]);
      return;
    }
    const flagsTriggered = analysisResult.signals.filter((s) =>
      highRiskFlags.has(s.toLowerCase())
    );
    setAlertFlags(flagsTriggered);
  }, [analysisResult]);

  // Handler for new analysis output from ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (
      result &&
      typeof result === "object" &&
      Array.isArray(result.signals) &&
      typeof result.confidence === "number" &&
      result.verdict &&
      typeof result.verdict === "string"
    ) {
      // Structure result to unify format for visualization
      // Map signals to flaggedBehaviors with label and confidence
      const flaggedBehaviors = result.signals.map((signal) => {
        // Make labels human readable based on signal
        const labelMap = {
          insult: "Insult",
          manipulation: "Manipulation",
          gaslighting: "Gaslighting",
          discard: "Discard Behavior",
          control: "Control Pattern",
          ultimatum: "Ultimatum",
          threat: "Threat",
          guilt: "Guilt-tripping",
          boundary_push: "Boundary Push",
          inconsistency: "Inconsistency",
        };
        return {
          type: signal.toLowerCase(),
          label: labelMap[signal.toLowerCase()] || signal,
          confidence: result.confidence ?? 0,
        };
      });

      setAnalysisResult({
        verdict: capitalizeVerdictLabel(result.verdict),
        flaggedBehaviors,
        overallConfidence: result.confidence,
        raw: result,
      });
    } else {
      // Reset result if invalid
      setAnalysisResult(null);
    }
  };

  // Helper to capitalize verdict label properly for display
  function capitalizeVerdictLabel(verdict) {
    if (typeof verdict !== "string") return "Safe";
    const low = verdict.toLowerCase();
    if (low === "green" || low === "safe") return "Safe";
    if (low === "yellow" || low === "caution") return "Caution";
    if (low === "red" || low === "flagged") return "Flagged";
    return "Safe";
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <section aria-label="Conversation analyzer section" style={{ marginBottom: "2rem" }}>
        {!showRealTime && (
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        )}
        {analysisResult && !showRealTime && (
          <div style={{ marginTop: "24px" }}>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
            />
            <ShareableResult result={analysisResult.raw} />
          </div>
        )}
      </section>

      <section aria-label="Immediate alert notifications">
        <ImmediateAlert flaggedBehaviors={alertFlags} />
      </section>

      <section
        aria-label="Real-time conversation monitoring dashboard toggle"
        style={{ textAlign: "center", margin: "1rem 0" }}
      >
        <button
          type="button"
          onClick={() => setShowRealTime((v) => !v)}
          className="peachy-button"
          aria-pressed={showRealTime}
          aria-label={showRealTime ? "Switch to paste analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {showRealTime ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showRealTime && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
};

export default App;