import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "discard",
  "threat",
  "ultimatum",
  "control",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Callback when conversation is analyzed or updated
  const onAnalyze = useCallback((result) => {
    setAnalysisResult(result);

    // Check if high risk flags detected
    if (result && Array.isArray(result.signals)) {
      const foundHighRisk = result.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(foundHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Toggle dashboard
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED
      </h1>

      <section aria-label="Conversation analyzer section">
        <ConversationAnalyzerPolish onAnalyze={onAnalyze} />
      </section>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <section aria-label="Flagged results" style={{ marginTop: "1.5rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              Array.isArray(analysisResult.signals)
                ? analysisResult.signals.map((flag) => ({
                    type: flag,
                    label:
                      flag.charAt(0).toUpperCase() +
                      flag.slice(1).replace("_", " "),
                    confidence: analysisResult.confidence || 0,
                  }))
                : []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      <section
        aria-label="Real-time monitoring dashboard toggle control"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label="Toggle real-time dashboard view"
          className="peachy-button"
          type="button"
        >
          {showDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time dashboard section" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard onAnalyze={onAnalyze} />
        </section>
      )}
    </main>
  );
}

export default App;