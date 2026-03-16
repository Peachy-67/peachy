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

  // Callback when new analysis is done from paste analyzer or dashboard manual analyze
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    if (result && Array.isArray(result.signals)) {
      const highRisks = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(highRisks);
    } else {
      setAlertFlags([]);
    }
  };

  // Reset alert flags when user dismisses alert banner
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          Flagged Conversation Analyzer
        </h1>
        <div
          style={{
            margin: "1rem auto",
            textAlign: "center",
          }}
        >
          <button onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard}>
            {showDashboard ? "Use Conversation Paste Analyzer" : "Go to Real-Time Monitoring Dashboard"}
          </button>
        </div>
      </header>

      {/* Immediate alert for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={handleDismissAlert} />

      {/* Conditional rendering of main interface */}
      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={
                  (analysisResult.signals || []).map((type) => ({
                    type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    confidence: analysisResult.confidence || 0,
                  }))
                }
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult
                result={analysisResult}
                conversationExcerpt=""
              />
            </>
          )}
        </>
      )}

      {/* Real-time dashboard view */}
      {showDashboard && <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />}
    </main>
  );
};

export default App;