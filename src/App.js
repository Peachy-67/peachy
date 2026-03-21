import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "discard", "control"];

const initialResultState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawData: null,
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(initialResultState);
  const [showImmediateAlert, setShowImmediateAlert] = useState(false);
  const [dashboardMode, setDashboardMode] = useState(false);

  // When flagged behaviors update, check for high-risk flags and trigger alert
  useEffect(() => {
    if (!analysisResult.flaggedBehaviors || !analysisResult.flaggedBehaviors.length) {
      setShowImmediateAlert(false);
      return;
    }
    const hasHighRisk = analysisResult.flaggedBehaviors.some((flag) =>
      HIGH_RISK_FLAGS.includes(flag.type.toLowerCase())
    );
    setShowImmediateAlert(hasHighRisk);
  }, [analysisResult.flaggedBehaviors]);

  // Handler for new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    // result shape expected:
    // { verdict: "Safe"|"Caution"|"Flagged", flaggedBehaviors: [{type,label,confidence}], overallConfidence: number, rawData: ... }
    if (
      result &&
      typeof result === "object" &&
      result.verdict &&
      Array.isArray(result.flaggedBehaviors)
    ) {
      setAnalysisResult(result);
    } else {
      setAnalysisResult(initialResultState);
    }
  };

  // ImmediateAlert dismissal handler
  const onDismissAlert = () => {
    setShowImmediateAlert(false);
  };

  // Toggle between paste analyzer mode and real-time dashboard mode
  const toggleDashboardMode = () => {
    setDashboardMode((prev) => !prev);
    // Reset results and alert on mode switch for clarity
    setAnalysisResult(initialResultState);
    setShowImmediateAlert(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61" }}>
          FLAGGED
        </h1>
        <button
          type="button"
          onClick={toggleDashboardMode}
          aria-pressed={dashboardMode}
          style={{
            display: "block",
            margin: "0.5rem auto 1rem auto",
            padding: "0.5rem 1rem",
            backgroundColor: "#ff6f61",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {dashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {showImmediateAlert && (
        <ImmediateAlert
          flaggedBehaviors={analysisResult.flaggedBehaviors}
          onDismiss={onDismissAlert}
        />
      )}

      {!dashboardMode && (
        <>
          <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />

          {/* Show flagged results visualization if any result */}
          {(analysisResult.flaggedBehaviors.length > 0 || analysisResult.verdict !== "Safe") && (
            <section aria-label="Analysis results" style={{ textAlign: "center" }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
            </section>
          )}
        </>
      )}

      {dashboardMode && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          initialResult={analysisResult}
        />
      )}
    </main>
  );
};

export default App;