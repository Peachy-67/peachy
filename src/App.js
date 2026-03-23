import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  // Managing overall current analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for updates from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (newResult) => {
    setAnalysisResult(newResult);

    if (newResult?.flaggedBehaviors?.length > 0) {
      const highRiskDetected = newResult.flaggedBehaviors.some((flag) =>
        HIGH_RISK_FLAGS.has(flag.type.toLowerCase())
      );
      if (highRiskDetected) {
        // Collect unique high-risk flags from newResult for alert
        const highRiskFlags = newResult.flaggedBehaviors.filter((flag) =>
          HIGH_RISK_FLAGS.has(flag.type.toLowerCase())
        );
        setAlertFlags(highRiskFlags);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  };

  // Clear alert flags on dismiss
  const dismissAlert = () => setAlertFlags([]);

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => setShowDashboard((prev) => !prev);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation Analyzer">
      <header style={{ textAlign: "center", marginBottom: "1.5rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61", fontWeight: 900, fontSize: "2rem" }}>FLAGGED</h1>
        <p style={{ fontStyle: "italic", color: "#666" }}>
          Detect red flags in conversations to identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {showDashboard ? "Use Paste Analyzer" : "Real-Time Monitoring Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={onAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />

      {analysisResult ? (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysisResult={analysisResult} />
        </>
      ) : (
        <p style={{ textAlign: "center", marginTop: "2rem", color: "#999" }}>
          Paste a conversation or use the real-time dashboard to see red flags here.
        </p>
      )}
    </main>
  );
};

export default App;