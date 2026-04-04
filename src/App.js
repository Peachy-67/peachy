import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "discard", "ultimatum"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Trigger immediate alert if any high-risk flag is detected
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const foundFlags = analysisResult.signals || [];
    const highRiskFound = foundFlags.filter((flag) => HIGH_RISK_FLAGS.includes(flag));
    setAlertFlags(highRiskFound);
  }, [analysisResult]);

  // Handler for new analysis output from analyzer component
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between dashboard and paste analyzer view
  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear old analysis result when switching modes for clarity
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header aria-label="App header">
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>FLAGGED</h1>
        <p style={{textAlign: "center", fontWeight: "600", color: "#666", marginTop: "-12px", marginBottom:"16px"}}>
          Detect red flags in conversations to identify manipulation and harmful behavior.
        </p>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            aria-pressed={showDashboard}
            onClick={handleToggleDashboard}
            className="peachy-button"
          >
            {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: 0.85, // no direct confidence per flag in latest data, so fixed example
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          flaggedBehaviors={alertFlags}
          analysisResult={analysisResult}
        />
      )}
    </main>
  );
};

export default App;