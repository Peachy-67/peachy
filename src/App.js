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
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
  "boundary_push",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alertFlags when analysisResult changes
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const flaggedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.toLowerCase())
    );
    setAlertFlags(flaggedHighRisk);
  }, [analysisResult]);

  // Handler to receive analysis from analyzer or dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between Paste Analyzer and RealTime Dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset analysis and alerts when switching modes for clarity
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analyzer">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61", fontWeight: "900", fontSize: "2.25rem", margin: 0 }}>
          FLAGGED
        </h1>
        <p style={{ fontWeight: "600", color: "#cc4a3d" }}>
          Detect red flags in conversations & identify manipulation
        </p>
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
          className="peachy-button"
          style={{ marginTop: "1rem", display: "inline-block" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;