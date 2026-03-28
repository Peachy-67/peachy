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

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Update alert flags immediately when analysisResult updates
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const foundHighRisk = analysisResult.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );
      setAlertFlags(foundHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysisResult(null);
      return;
    }
    setAnalysisResult(result);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ userSelect: "none", color: "#cc2f2f" }}>FLAGGED</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={`Switch to ${showDashboard ? "Conversation Analyzer" : "Real-time Monitoring Dashboard"}`}
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
      )}

      {analysisResult && (
        <>
          <section aria-label="Flagged conversation result" style={{ marginTop: "2rem" }}>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label ?? "Safe"}
              flaggedBehaviors={analysisResult.signals?.map((flag) => ({
                type: flag,
                label:
                  flag.charAt(0).toUpperCase() + flag.slice(1).replace("_", " "),
                confidence: 1, // confidence from signals unknown here, default to 1
              })) || []}
              overallConfidence={analysisResult.confidence ?? 0}
            />
          </section>

          <ShareableResult analysisResult={analysisResult} />
        </>
      )}
    </main>
  );
}

export default App;