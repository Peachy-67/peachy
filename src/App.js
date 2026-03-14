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
]);

const initialAnalysisState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  raw: null,
  error: null,
};

const App = () => {
  const [analysis, setAnalysis] = useState(initialAnalysisState);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors in structure expected by FlaggedResultVisualization
  const parseBehaviors = (signals = [], confidence = 0) => {
    return signals.map((signal) => {
      // Map signal to label for clarity in badges
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
      // Confidence per behavior is overall confidence currently, could improve if data available
      return {
        type: signal,
        label: labelMap[signal] || signal,
        confidence,
      };
    });
  };

  // Handle analysis result update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result || result.error) {
      setAnalysis({
        ...initialAnalysisState,
        error: result ? result.error : "Analysis failed",
      });
      return;
    }

    // Normalize verdict label: map "green","yellow","red" band to Safe, Caution, Flagged
    const bandToVerdictLabel = {
      green: "Safe",
      yellow: "Caution",
      red: "Flagged",
    };

    const verdictLabel = bandToVerdictLabel[result.verdict?.band] || "Safe";

    const flaggedBehaviors = parseBehaviors(result.signals, result.confidence || 0);

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence: result.confidence || 0,
      raw: result,
      error: null,
    });
  };

  // Compute if there is any high risk flag to trigger alert
  const highRiskFlagsInResult = () => {
    if (!analysis.flaggedBehaviors) return [];
    return analysis.flaggedBehaviors
      .filter((flag) => HIGH_RISK_FLAGS.has(flag.type))
      .map((flag) => flag.label);
  };

  // Toggle dashboard view visibility
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      <ConversationAnalyzerPolish onAnalyze={handleAnalysisUpdate} />

      <ImmediateAlert flaggedBehaviors={analysis.flaggedBehaviors.map((f) => f.type)} />

      {/* Show flagged result visualization and share interface only if have result and no error */}
      {analysis.error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            color: "#cc2f2f",
            fontWeight: "700",
            marginTop: "1rem",
            textAlign: "center",
            userSelect: "text",
          }}
        >
          {analysis.error}
        </div>
      )}

      {!analysis.error && analysis.raw && (
        <>
          <FlaggedResultVisualization
            verdict={analysis.verdict}
            flaggedBehaviors={analysis.flaggedBehaviors}
            overallConfidence={analysis.overallConfidence}
          />

          <ShareableResult analysis={analysis.raw} />
        </>
      )}

      <hr style={{ margin: "2rem 0", borderColor: "#ffb3a2" }} />

      <button
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        type="button"
        style={{ display: "block", margin: "0 auto" }}
      >
        {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
      </button>

      {showDashboard && <RealTimeDashboard onAnalyze={handleAnalysisUpdate} />}
    </main>
  );
};

export default App;