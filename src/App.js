import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum", "discard"]);

const App = () => {
  // State for conversation analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Callback to receive analysis updates from ConversationAnalyzerPolish & RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    // Determine high-risk flags detected for immediate alert
    if (result && Array.isArray(result.signals)) {
      const highRiskDetected = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  };

  // Toggle between ConversationAnalyzer and RealTimeDashboard modes
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear previous results and alerts on mode change
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
          style={{ display: "block", margin: "10px auto 24px auto" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} initialResult={analysisResult} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <section
              aria-live="polite"
              aria-label="Flagged conversation analysis result"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} conversationExcerpt={analysisResult.why.join(" ").slice(0, 280)} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;