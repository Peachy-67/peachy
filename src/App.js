import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
]);

function extractHighRiskFlags(flags) {
  return flags.filter((flag) => HIGH_RISK_FLAGS.has(flag.type));
}

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [realTimeResult, setRealTimeResult] = useState(null);

  // Update alerts when analysis result changes
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    // find high-risk flags from detected signals
    // flaggedBehaviors is array of {type, label, confidence}
    const highRisk = extractHighRiskFlags(
      analysisResult.flaggedBehaviors || []
    );
    setAlertFlags(highRisk);
  }, [analysisResult]);

  // Update alerts for real-time dashboard result
  useEffect(() => {
    if (!realTimeResult) {
      setAlertFlags([]);
      return;
    }
    const highRisk = extractHighRiskFlags(
      realTimeResult.flaggedBehaviors || []
    );
    setAlertFlags(highRisk);
  }, [realTimeResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const handleRealTimeUpdate = (result) => {
    setRealTimeResult(result);
  };

  // Determine which result visualization to show:
  // If real-time dashboard active, show its results,
  // else show latest paste analysis results (analysisResult)
  const displayedResult = showDashboard ? realTimeResult : analysisResult;

  // Compose flagged behaviors for visualization
  // The input result should have verdict, flaggedBehaviors, overallConfidence
  // Fallback to empty array and 0 confidence if missing
  const verdict = displayedResult?.verdict || "Safe";
  const flaggedBehaviors = displayedResult?.flaggedBehaviors || [];
  const overallConfidence = displayedResult?.overallConfidence ?? 0;

  // UI toggle text
  const toggleButtonText = showDashboard
    ? "Use Paste Analyzer"
    : "Switch to Real-Time Dashboard";

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED
      </h1>

      <button
        type="button"
        className="peachy-button"
        onClick={() => setShowDashboard((v) => !v)}
        aria-pressed={showDashboard}
        aria-label={toggleButtonText}
      >
        {toggleButtonText}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleRealTimeUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {displayedResult && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult result={displayedResult} />
        </>
      )}
    </main>
  );
}