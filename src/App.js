import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

/**
 * Main app component integrating:
 * - ConversationAnalyzerPolish: for pasting and analyzing conversations
 * - ImmediateAlert: alerts user immediately on high-risk flags
 * - FlaggedResultVisualization: polished results display with verdict and flagged badges
 * - ShareableResult: share and copy results
 * - RealTimeDashboard: toggles a live conversation monitor with real-time updates
 */

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "threat",
  "discard",
  "control",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dismisedFlags, setDismissedFlags] = useState(new Set());

  // Derive if any high-risk flags present to show alert
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const currentFlags = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );

      // Filter flags excluding dismissed ones
      const newFlags = currentFlags.filter((flag) => !dismisedFlags.has(flag));

      if (newFlags.length > 0) {
        setAlertFlags(newFlags);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult, dismisedFlags]);

  // Handler to clear alert of a flagged behavior
  const handleDismissFlag = (flag) => {
    setDismissedFlags((prev) => new Set(prev).add(flag));
    setAlertFlags((prev) => prev.filter((f) => f !== flag));
  };

  // Callback on conversation analysis done
  const onAnalyze = (result) => {
    setAnalysisResult(result);
    // Reset dismissed flags on new analysis for fresh alert visibility
    setDismissedFlags(new Set());
  };

  // Toggle to switch between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setDismissedFlags(new Set());
    setAlertFlags([]);
  };

  return (
    <main className="container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <section aria-label="Main conversation analysis section" style={{ marginTop: "1rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalyze={onAnalyze} />
        )}

        {alertFlags.length > 0 && (
          <ImmediateAlert flags={alertFlags} onDismissFlag={handleDismissFlag} />
        )}

        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={
                analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: 0.85 // Confidence unavailable from API directly - placeholder
                }))
              }
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult analysisResult={analysisResult} />
          </>
        )}
      </section>

      <section
        aria-label="Real-time conversation monitoring dashboard section"
        style={{ marginTop: "2rem" }}
      >
        <button
          className="peachy-button"
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Conversation Analyzer" : "Switch to Real-time Dashboard"}
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-time Dashboard"}
        </button>

        {showDashboard && (
          <RealTimeDashboard
            onAnalysisUpdate={(result) => {
              setAnalysisResult(result);
              // Clear alert dismiss to allow alerts fresh on new data
              setDismissedFlags(new Set());
            }}
          />
        )}
      </section>
    </main>
  );
}

export default App;