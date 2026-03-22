import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);

  // When new analysis arrives, check for immediate alert flags.
  useEffect(() => {
    if (analysis?.signals?.length) {
      const flagsThatTriggerAlert = analysis.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );
      setImmediateAlertFlags(flagsThatTriggerAlert);
    } else {
      setImmediateAlertFlags([]);
    }
  }, [analysis]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (newAnalysis) => {
    setAnalysis(newAnalysis);
    setError(null);
  };

  // Handler for errors from analyzer components
  const handleError = (err) => {
    setError(err?.message || "Unknown error occurred");
    setAnalysis(null);
  };

  // Render content conditionally: either dashboard or paste analyzer, plus results, alerts, sharing

  return (
    <main className="ui-container" role="main" aria-label="Flagged main application interface">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED Conversation Red Flag Detector
      </h1>

      <section aria-label="Toggle real-time monitoring dashboard" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-describedby="toggle-dashboard-desc"
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
        <p id="toggle-dashboard-desc" style={{ fontSize: "0.85rem", marginTop: "0.25rem", userSelect: "none" }}>
          {showDashboard
            ? "Monitor conversations live with real-time updates and alerts."
            : "Paste text conversations for detailed red flag analysis."}
        </p>
      </section>

      <section aria-label="Conversation analysis input and controls">
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            key="paste-analyzer"
          />
        )}

        {showDashboard && (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            key="realtime-dashboard"
          />
        )}
      </section>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#ffe6eb",
            color: "#b00020",
            fontWeight: "600",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(204, 47, 47, 0.5)",
            userSelect: "none",
          }}
        >
          Error: {error}
        </div>
      )}

      {analysis && (
        <>
          <ImmediateAlert flaggedBehaviors={immediateAlertFlags} />
          {/* Polished flagged result visualization with confidence and badges */}
          <FlaggedResultVisualization
            verdict={
              analysis.verdict?.band === "green"
                ? "Safe"
                : analysis.verdict?.band === "yellow"
                ? "Caution"
                : "Flagged"
            }
            flaggedBehaviors={analysis.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysis.confidence || 0,
            }))}
            overallConfidence={analysis.confidence || 0}
          />
          {/* Share UI for the latest analysis */}
          <ShareableResult
            analysis={analysis}
          />
        </>
      )}
    </main>
  );
}

export default App;