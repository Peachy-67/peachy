import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "discard",
  "threat",
  "ultimatum",
  "control",
  "guilt",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Whenever analysisResult updates, update alertFlags if high-risk flags present
  useEffect(() => {
    if (analysisResult?.signals && Array.isArray(analysisResult.signals)) {
      const detectedHighRisk = analysisResult.signals.filter((sig) =>
        HIGH_RISK_FLAGS.has(sig)
      );
      setAlertFlags(detectedHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for when ConversationAnalyzerPolish completes analysis
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Dashboard toggle handler
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>
        FLAGGED
      </h1>

      <button
        type="button"
        aria-pressed={showDashboard}
        onClick={toggleDashboard}
        className="peachy-button"
        style={{ marginBottom: "1.5rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {showDashboard ? "Hide Real-time Dashboard" : "Show Real-time Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalysisUpdate} />

          {alertFlags.length > 0 && (
            <ImmediateAlert flaggedBehaviors={alertFlags} />
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;