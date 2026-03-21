import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "ultimatum",
  "threat",
  "gaslighting",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // When analysisResult updates, check for high-risk flags for immediate alert
  useEffect(() => {
    if (!analysisResult) {
      setAlerts([]);
      return;
    }
    // Determine newly detected high-risk flags not already alerted
    const flaggedSet = new Set(analysisResult.signals);
    const newAlerts = Array.from(flaggedSet).filter((f) => HIGH_RISK_FLAGS.has(f));
    setAlerts(newAlerts);
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer main app interface">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>FLAGGED</h1>

      <section aria-labelledby="mode-toggle-label" style={{ marginBottom: 24, textAlign: "center" }}>
        <label id="mode-toggle-label" style={{ fontWeight: "600", fontSize: "1.1rem", marginRight: 8 }}>
          Mode:
        </label>
        <button
          type="button"
          onClick={() => setShowDashboard(false)}
          aria-pressed={!showDashboard}
          aria-label="Switch to paste analyzer mode"
          style={{
            marginRight: 8,
            padding: "0.5rem 1.25rem",
            fontWeight: !showDashboard ? "700" : "400",
            backgroundColor: !showDashboard ? "#ff6f61" : "#f4c2be",
            color: !showDashboard ? "white" : "#cc2f2f",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          onClick={() => setShowDashboard(true)}
          aria-pressed={showDashboard}
          aria-label="Switch to real-time dashboard mode"
          style={{
            padding: "0.5rem 1.25rem",
            fontWeight: showDashboard ? "700" : "400",
            backgroundColor: showDashboard ? "#ff6f61" : "#f4c2be",
            color: showDashboard ? "white" : "#cc2f2f",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Real-Time Dashboard
        </button>
      </section>

      <ImmediateAlert flaggedBehaviors={alerts} />

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={setAnalysisResult} />

          {/* Only show visualization and sharing if we have analysis results */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: 1, // Confidence not detailed per flag here, fallback 1
                }))}
                overallConfidence={analysisResult.confidence}
              />

              <ShareableResult
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: 1,
                }))}
                overallConfidence={analysisResult.confidence}
                conversationExcerpt="" // Not passed from analyzer here, could be extended later
              />
            </>
          )}
        </>
      ) : (
        <RealTimeDashboard />
      )}
    </main>
  );
};

export default App;