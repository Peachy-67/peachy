import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "threat",
  "gaslighting",
  "discard",
  "insult",
  "ultimatum",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Handle alert flags from current analysis result
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }

    const highRiskFound = analysisResult.signals.filter((signal) =>
      HIGH_RISK_FLAGS.has(signal)
    );

    if (highRiskFound.length > 0) {
      setAlertFlags(highRiskFound);
      setAlertDismissed(false);
      // Native alert for immediate notification
      alert(
        `Warning: High-risk behaviors detected: ${highRiskFound.join(", ")}`
      );
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  const onDismissAlert = () => {
    setAlertDismissed(true);
  };

  // Toggle view between paste-analyzer and real-time dashboard
  const toggleDashboard = () => setShowDashboard((s) => !s);

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <header>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ marginBottom: "1rem", userSelect: "none" }}>
          Detect red flags in conversations: manipulation, gaslighting, insults, and control.
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        dismissed={alertDismissed}
        onDismiss={onDismissAlert}
      />

      {!showDashboard && (
        <section aria-label="Conversation Analyzer Paste Input">
          <ConversationAnalyzerPolish onResult={setAnalysisResult} />
        </section>
      )}

      {analysisResult && !showDashboard && (
        <section aria-label="Analysis Result Visualization" style={{ marginTop: "1rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: 0.75, // Using generic confidence as no detailed per-flag confidence from main state
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}

      {showDashboard && (
        <section aria-label="Real Time Monitoring Dashboard" style={{ marginTop: "1rem" }}>
          <RealTimeDashboard onResult={setAnalysisResult} />
        </section>
      )}
    </main>
  );
}

export default App;