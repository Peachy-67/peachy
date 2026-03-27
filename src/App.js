import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isRealTimeDashboard, setIsRealTimeDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Effect to handle alert flags based on analysisResult
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }

    // Extract flagged signals from analysis result
    const flaggedSignals = analysisResult.signals || [];

    // Filter high-risk flags
    const highRiskDetected = flaggedSignals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag)
    );

    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      setAlertDismissed(false);
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const handleDismissAlert = () => {
    setAlertDismissed(true);
  };

  const handleToggleView = () => {
    setIsRealTimeDashboard((prev) => !prev);
    // Clear alerts and analysis when toggling view for clarity
    setAlertFlags([]);
    setAlertDismissed(false);
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1>FLAGGED</h1>
        <p style={{ fontWeight: "600", color: "#ff6f61" }}>
          Detect red flags in conversations
        </p>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={isRealTimeDashboard}
          onClick={handleToggleView}
          aria-label={
            isRealTimeDashboard
              ? "Switch to Conversation Analyzer paste input mode"
              : "Switch to Real-time Dashboard mode"
          }
          style={{ marginTop: "0.5rem" }}
        >
          {isRealTimeDashboard ? "Use Conversation Analyzer" : "Open Real-time Dashboard"}
        </button>
      </header>

      {!isRealTimeDashboard && (
        <section aria-label="Conversation analyzer" style={{ marginBottom: "1rem" }}>
          <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
        </section>
      )}

      {analysisResult && !isRealTimeDashboard && (
        <>
          <ImmediateAlert
            flaggedBehaviors={alertFlags}
            dismissed={alertDismissed}
            onDismiss={handleDismissAlert}
          />

          <section aria-label="Analysis results" tabIndex={-1}>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={analysisResult.signals.map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: 0.9, // Confidence placeholder; if available, use actual
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />

            <ShareableResult analysisResult={analysisResult} />
          </section>
        </>
      )}

      {isRealTimeDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" tabIndex={-1}>
          <RealTimeDashboard
            onAnalysisUpdate={handleAnalysisUpdate}
            alertFlags={alertFlags}
            alertDismissed={alertDismissed}
            onDismissAlert={handleDismissAlert}
          />
        </section>
      )}
    </main>
  );
};

export default App;