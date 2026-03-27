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
  "discard",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handle detection of high-risk flags for ImmediateAlert
  useEffect(() => {
    if (!analysisResult || !analysisResult.flags) {
      setAlertFlags([]);
      return;
    }

    const highRiskDetected = analysisResult.flags.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.type.toLowerCase())
    );

    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    // result expected shape: { verdict, flaggedBehaviors, overallConfidence, rawResult }
    setAnalysisResult(result);
  };

  // Toggle view between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear previous analysis when toggling to dashboard for fresh state
    if (!showDashboard) {
      setAnalysisResult(null);
      setAlertFlags([]);
    }
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
          Detect red flags in conversations for manipulation, gaslighting, and harmful behavior.
        </p>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={toggleDashboard}
            className="peachy-button"
            aria-pressed={showDashboard}
            aria-label={
              showDashboard
                ? "Switch to Paste Conversation Analyzer"
                : "Switch to Real-Time Monitoring Dashboard"
            }
          >
            {showDashboard ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
          </button>
        </div>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && analysisResult.flaggedBehaviors && (
            <section aria-label="Analysis results" style={{ marginTop: "1rem" }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
                rawResult={analysisResult.rawResult}
              />
            </section>
          )}
        </>
      )}

      {showDashboard && <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />}
    </main>
  );
};

export default App;