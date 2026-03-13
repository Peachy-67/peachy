import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css"; // core polish styles for app layout and elements

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // When analysisResult updates, detect high-risk flags to trigger alerts
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const foundHighRiskFlags = analysisResult.signals.filter((f) =>
      highRiskFlags.has(f)
    );
    setAlertFlags(foundHighRiskFlags);
  }, [analysisResult]);

  // Handler for new analysis from conversation input or real-time dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle for showing/hiding real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="container" aria-label="FLAGGED conversation red-flag detector">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#d14242" }}>
        FLAGGED
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: 1, // Default confidence 1 here, as backend confidence per type not provided
            }))}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;