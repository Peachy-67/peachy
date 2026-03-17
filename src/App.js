import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "ultimatum",
  "threat",
  "gaslighting",
  "control",
  "discard",
];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [viewDashboard, setViewDashboard] = useState(false);

  // Handle updating alert flags on new result
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const foundHighRisks = analysisResult.signals.filter((signal) =>
        HIGH_RISK_FLAGS.includes(signal)
      );
      if (foundHighRisks.length > 0) {
        setAlertFlags(foundHighRisks);
        setAlertDismissed(false);
      } else {
        setAlertFlags([]);
        setAlertDismissed(false);
      }
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const handleAlertDismiss = () => {
    setAlertDismissed(true);
  };

  const handleToggleView = () => {
    setViewDashboard((v) => !v);
    // Clear alerts and result when switching views
    setAlertFlags([]);
    setAlertDismissed(false);
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED - Conversation analyzer">
      <header
        style={{ textAlign: "center", marginBottom: "1.5rem", userSelect: "none" }}
      >
        <h1 style={{ color: "#e65500", fontWeight: "700" }}>FLAGGED</h1>
        <button
          className="peachy-button"
          onClick={handleToggleView}
          aria-pressed={viewDashboard}
          aria-label={
            viewDashboard
              ? "Switch to paste analyzer view"
              : "Switch to real-time dashboard view"
          }
          type="button"
          style={{ marginTop: 10 }}
        >
          {viewDashboard ? "Paste Analyzer" : "Real-time Dashboard"}
        </button>
      </header>

      <ImmediateAlert
        visible={!alertDismissed && alertFlags.length > 0}
        flaggedBehaviors={alertFlags}
        onDismiss={handleAlertDismiss}
      />

      {viewDashboard ? (
        // Show real-time dashboard view
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          highRiskFlags={HIGH_RISK_FLAGS}
        />
      ) : (
        // Show paste conversation analyzer
        <section aria-label="Conversation input and analysis">
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
          {analysisResult && (
            <>
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
            </>
          )}
        </section>
      )}
    </main>
  );
};

export default App;