import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "discard"];

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // When analysis result updates, detect high-risk flags
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const presentHighRiskFlags = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag)
      );
      setHighRiskFlags(presentHighRiskFlags);
    } else {
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between paste analyzer mode and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setHighRiskFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector app">
      <h1 style={{ color: "#cc2f2f", textAlign: "center", userSelect: "none" }}>FLAGGED</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to paste conversation analyzer mode"
              : "Switch to real-time dashboard mode"
          }
        >
          {showDashboard ? "Paste Analyzer Mode" : "Real-Time Dashboard Mode"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisResult={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisResult={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: 0.9, // Confidence not included in API response, use placeholder
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
}

export default App;