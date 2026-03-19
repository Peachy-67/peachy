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
  "control",
]);

function App() {
  // State for latest analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Track if any high-risk alerts need to be shown
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Callback for when new analysis is available from analyzer or dashboard
  function onAnalysisUpdate(result) {
    setAnalysisResult(result);

    if (!result?.flaggedBehaviors) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }

    const foundHighRiskFlags = result.flaggedBehaviors
      .filter((flag) => HIGH_RISK_FLAGS.has(flag.type.toLowerCase()))
      .map((flag) => flag.label);

    if (foundHighRiskFlags.length > 0) {
      setAlertFlags(foundHighRiskFlags);
      setAlertDismissed(false);
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }

  // Handle alert dismissal by user
  function dismissAlert() {
    setAlertDismissed(true);
  }

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontWeight: "900", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED
        </h1>
        <p style={{ maxWidth: 440, margin: "0 auto", color: "#555", fontWeight: "600" }}>
          Detect red flags in conversations. Identify manipulation, gaslighting,
          insults & more.
        </p>
      </header>

      {/* Immediate alert for high-risk flagged behaviors */}
      <ImmediateAlert
        flaggedLabels={alertFlags}
        dismissed={alertDismissed}
        onDismiss={dismissAlert}
      />

      {/* Toggle between conversation analyzer paste mode and real-time dashboard mode */}
      <section style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={() => setShowDashboard((prev) => !prev)}
          className="peachy-button"
          style={{ maxWidth: 240 }}
        >
          {showDashboard ? "Use Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {/* Conditionally render real-time dashboard or paste analyzer */}
      {showDashboard ? (
        <RealTimeDashboard onAnalysis={onAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onResult={onAnalysisUpdate} />
      )}

      {/* Show flagged result visualization and share for current analysis */}
      {analysisResult && (
        <section aria-label="Flagged conversation results" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors || []}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}
    </main>
  );
}

export default App;