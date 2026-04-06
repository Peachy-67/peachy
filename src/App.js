import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handler when analysis updates (from ConversationAnalyzerPolish or RealTimeDashboard)
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    if (!result) {
      setAlertFlags([]);
      return;
    }
    // Determine if any high risk flags present
    const flaggedHighRisk = (result?.signals || []).filter((s) =>
      HIGH_RISK_FLAGS.has(s)
    );
    setAlertFlags(flaggedHighRisk);
  };

  const handleError = (err) => {
    setError(err);
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Reset states on mode switch
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#e55b4d" }}>
          FLAGGED: Conversation Red Flags Detector
        </h1>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ display: "block", margin: "0.5rem auto 1rem auto" }}
          type="button"
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <section aria-live="polite" aria-relevant="additions removals" aria-atomic="true">
        {showDashboard ? (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </section>

      {/* Immediate Alerts for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Results display and sharing */}
      {analysisResult && !showDashboard && (
        <section aria-label="Analysis results and sharing" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      {/* Errors */}
      {error && (
        <aside
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#ffe6e6",
            color: "#a63636",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {error}
        </aside>
      )}
    </main>
  );
}

export default App;