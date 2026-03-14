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

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handle immediate alert flags from analysis results
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        aria-label={showDashboard ? "Hide real-time monitoring dashboard" : "Show real-time monitoring dashboard"}
        className="peachy-button"
        style={{ marginBottom: "1rem", width: "100%" }}
      >
        {showDashboard ? "Hide Real-Time Monitoring Dashboard" : "Show Real-Time Monitoring Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label:
                    type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " "),
                  confidence: 0,
                }))}
                overallConfidence={analysisResult.confidence}
              />

              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />
    </main>
  );
};

export default App;