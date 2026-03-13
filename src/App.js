import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "ultimatum",
  "threat",
  "gaslighting",
  "discard",
  "control",
]);

const App = () => {
  // Analysis state holds the current analysis output from conversation input
  const [analysisResult, setAnalysisResult] = useState(null);
  // Alert visible state for ImmediateAlert dismiss control
  const [alertVisible, setAlertVisible] = useState(false);
  // High risk flags currently detected from analysisResult.signals
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  // Toggle showing the real-time monitoring dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Update high-risk flags and alert visibility whenever analysisResult changes
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setHighRiskFlags([]);
      setAlertVisible(false);
      return;
    }

    const detectedHighRisks = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    setHighRiskFlags(detectedHighRisks);

    // Show alert immediately if any high-risk flags found
    if (detectedHighRisks.length > 0) {
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Handler to dismiss the visible alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle the real-time dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <section aria-label="Conversation input and analysis" style={{ marginTop: "1rem" }}>
        <ConversationAnalyzerPolish onAnalysisComplete={setAnalysisResult} />
      </section>

      {alertVisible && highRiskFlags.length > 0 && (
        <ImmediateAlert
          highRiskFlags={highRiskFlags}
          onDismiss={dismissAlert}
        />
      )}

      {analysisResult && !showDashboard && (
        <section aria-label="Analysis results" style={{ marginTop: "1.5rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => {
              // Map signal to label and confidence (if any)
              const label = signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " ");
              // Use 1.0 confidence if no individual confidence available; overall confidence available from analysisResult.confidence
              return {
                type: signal,
                label,
                confidence: 1.0,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}

      <section
        aria-label="Real-time conversation monitoring dashboard toggle"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          style={{
            cursor: "pointer",
            backgroundColor: "#ff6f61",
            color: "white",
            border: "none",
            padding: "10px 22px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "1rem",
            boxShadow: "0 4px 12px rgba(255,111,97,0.7)",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "1rem" }}>
          <RealTimeDashboard
            onAnalysisUpdate={setAnalysisResult}
          />
        </section>
      )}
    </main>
  );
};

export default App;