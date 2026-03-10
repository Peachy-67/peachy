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
  "control",
]);

const App = () => {
  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);
  // Alert flags state derived from analysisResult
  const [alertFlags, setAlertFlags] = useState([]);
  // Whether to show RealTimeDashboard view (toggle)
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler when new analysis is completed
  const onAnalysisComplete = (result) => {
    setAnalysisResult(result || null);
  };

  // Update alert flags whenever analysisResult changes
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setAlertFlags([]);
      return;
    }
    // Find intersection of high risk flags present in latest analysis signals
    const detectedHighRisk = analysisResult.signals.filter((signal) =>
      HIGH_RISK_FLAGS.has(signal)
    );
    setAlertFlags(detectedHighRisk);
  }, [analysisResult]);

  // Toggle between dashboard and analyzer view
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ userSelect: "none", color: "#cc2f2f", textAlign: "center" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", marginTop: "-12px", fontWeight: "600" }}>
          Detect red flags in conversations
        </p>
      </header>

      <section aria-label="Conversation analyzer section" style={{ marginTop: "1rem" }}>
        {!showDashboard ? (
          <ConversationAnalyzerPolish onResult={onAnalysisComplete} />
        ) : (
          <RealTimeDashboard />
        )}

        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to conversation analyzer view"
              : "Switch to real-time dashboard view"
          }
          className="peachy-button"
          style={{ marginTop: "16px", display: "block", width: "100%" }}
          type="button"
        >
          {showDashboard ? "Back to Analyzer" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} />
      )}

      {analysisResult && (
        <section
          aria-label="Analysis results and sharing options"
          style={{ marginTop: "2rem", textAlign: "center" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label === "Safe" ? "Safe" : analysisResult.verdict.label === "Caution" ? "Caution" : "Flagged"}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: 1, // No confidence breakdown per flag, using 100%
            }))}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}
    </main>
  );
};

export default App;