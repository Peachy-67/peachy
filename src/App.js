import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "discard",
  "gaslighting",
  "ultimatum",
]);

const App = () => {
  // State holds analysis result after a conversation is analyzed by ConversationAnalyzerPolish or dashboard
  const [analysis, setAnalysis] = useState(null);

  // State tracks active immediate alert flags and banner visibility
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  // Real-time dashboard visibility toggle mode: true shows dashboard, false shows paste-analyze UI
  const [showDashboard, setShowDashboard] = useState(false);

  // Called by ConversationAnalyzerPolish or RealTimeDashboard on analysis update
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // When analysis changes, update alert flags if any high risk flagged behaviors found
  useEffect(() => {
    if (!analysis || !Array.isArray(analysis.signals)) {
      setAlertFlags([]);
      setAlertVisible(false);
      return;
    }

    const detectedHighRisk = analysis.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    if (detectedHighRisk.length > 0) {
      setAlertFlags(detectedHighRisk);
      setAlertVisible(true);
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  }, [analysis]);

  // Dismiss the visible alert banner (does not clear flags to keep native alert on next)
  const dismissAlert = () => setAlertVisible(false);

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analyzer">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Paste Analyzer view" : "Switch to Real-Time Dashboard"}
          style={{
            margin: "1rem auto",
            display: "block",
            padding: "0.6rem 1.4rem",
            borderRadius: 8,
            cursor: "pointer",
            border: "none",
            backgroundColor: "#ff6f61",
            color: "white",
            fontWeight: "600",
            fontSize: "1rem",
          }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {alertFlags.length > 0 && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          visible={alertVisible}
          onDismiss={dismissAlert}
        />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysis && (
            <section
              aria-live="polite"
              aria-label="Flagged conversation results"
              role="region"
              style={{ marginTop: "1.5rem" }}
            >
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </section>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          recentAnalysis={analysis}
        />
      )}
    </main>
  );
};

export default App;