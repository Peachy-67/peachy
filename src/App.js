import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css"; // consistent common polish styles

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // On new analysis result, check if any high risk flags exist to trigger alert
    if (analysisResult && analysisResult.signals) {
      const newAlerts = analysisResult.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );
      setAlertFlags(newAlerts);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler receives analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
  }

  // Toggle real-time dashboard view
  function toggleDashboard() {
    setShowDashboard((v) => !v);
  }

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none", marginBottom:"1rem" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        type="button"
        aria-pressed={showDashboard}
        onClick={toggleDashboard}
        className="peachy-button"
        style={{
          marginBottom: "1rem",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "240px",
        }}
      >
        {showDashboard ? "Close Real-Time Dashboard" : "Open Real-Time Dashboard"}
      </button>

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {analysisResult && (
            <section
              aria-label="Analysis results and share options"
              tabIndex={-1}
              style={{ marginTop: "1.5rem" }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult analysis={analysisResult} />
            </section>
          )}
        </>
      ) : (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />
    </main>
  );
}

export default App;