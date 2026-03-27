import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function isHighRiskFlagPresent(flags = []) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase()));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertsActive, setAlertsActive] = useState([]);
  const [error, setError] = useState(null);

  // Update alerts when analysisResult changes
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertsActive([]);
      return;
    }
    const activeAlerts = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.toLowerCase())
    );
    setAlertsActive(activeAlerts);
  }, [analysisResult]);

  // Handler for new analysis from conversation analyzer or dashboard
  const handleNewAnalysis = (result) => {
    if (result && typeof result === "object") {
      setAnalysisResult(result);
      setError(null);
    } else {
      setAnalysisResult(null);
    }
  };

  // Toggle between paste analyzer and real-time dashboard mode
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setError(null);
    setAlertsActive([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <header>
        <h1 style={{ color: "#ff6f3c", textAlign: "center", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste analyzer" : "Switch to real-time dashboard"}
          style={{ margin: "1rem auto 1.5rem auto", display: "block" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertsActive} />

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleNewAnalysis} onError={setError} />
          {error && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              style={{ marginTop: "1rem" }}
            >
              {error}
            </div>
          )}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                confidence={analysisResult.confidence || 0}
                conversationExcerpt={analysisResult.meta?.excerpt || ""}
              />
            </>
          )}
        </>
      ) : (
        <RealTimeDashboard onAnalysis={handleNewAnalysis} />
      )}
    </main>
  );
};

export default App;