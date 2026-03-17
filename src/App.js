import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check high-risk flags to trigger alerts
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlags([]);
      return;
    }
    // Define high-risk signals that trigger immediate alert
    const highRiskSignalSet = new Set(["insult", "gaslighting", "threat", "discard", "ultimatum", "control", "manipulation"]);

    const flaggedSignals = analysisResult?.flags || analysisResult?.signals || [];
    const highRiskDetected = flaggedSignals.filter((signal) => highRiskSignalSet.has(signal.toLowerCase()));
    setHighRiskFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler to receive analysis update from analyzer component
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between paste analyzer and real-time dashboard views
  const handleToggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector application">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        type="button"
        onClick={handleToggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        style={{ display: "block", margin: "1rem auto" }}
      >
        {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      <ImmediateAlert flaggedFlags={highRiskFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              (analysisResult.flags || // fallback legacy
                (analysisResult.signals || [])
              ).map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0,
              }))
            }
            overallConfidence={typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;