import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "threat",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags when analysisResult changes
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Immediate Alert for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Conversation analyzer input and analysis */}
      {!showDashboard && (
        <section aria-label="Conversation input and analysis" style={{ marginBottom: "2rem" }}>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        </section>
      )}

      {/* Result visualization and sharing */}
      {!showDashboard && analysisResult && (
        <section aria-label="Flagged conversation results and sharing">
          <FlaggedResultVisualization
            verdict={
              analysisResult.verdict?.label
                ? analysisResult.verdict.label
                : "Safe"
            }
            flaggedBehaviors={
              (analysisResult.signals || []).map((type) => ({
                type,
                label:
                  type.charAt(0).toUpperCase() + type.slice(1), // Capitalize
                confidence:
                  (typeof analysisResult.confidence === "number"
                    ? analysisResult.confidence
                    : 0) || 0,
              }))
            }
            overallConfidence={
              typeof analysisResult.confidence === "number"
                ? analysisResult.confidence
                : 0
            }
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}

      {/* Toggle button to show/hide real-time dashboard */}
      <section
        aria-label="Toggle real-time dashboard view"
        style={{ marginTop: "2.5rem", textAlign: "center" }}
      >
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Hide real-time monitoring dashboard"
              : "Show real-time monitoring dashboard"
          }
          className="peachy-button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {/* Real-Time Dashboard */}
      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
};

export default App;