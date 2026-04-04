import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // When new analysis result arrives, check for high-risk flags to trigger alert
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const highRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.toLowerCase())
    );
    setAlertFlags(highRisk);
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalyze = (result, error = null) => {
    if (error) {
      setAnalysisResult(null);
      setError(error);
      setAlertFlags([]);
      return;
    }
    setAnalysisResult(result);
    setError(null);
  };

  // Toggle between paste analyzer view and real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear results and alerts on toggle for clarity
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to paste conversation analyzer"
              : "Switch to real-time dashboard"
          }
          className="peachy-button"
          style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <section aria-live="polite" aria-atomic="true" style={{ minHeight: "6rem" }}>
        {error && (
          <div
            className="alert-banner"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {error}
          </div>
        )}
      </section>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalyze}
            loading={loading}
            setLoading={setLoading}
          />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: 1, // Confidence not provided per signal, assume full for now
                }))}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard onAnalysis={handleAnalyze} />
      )}

      <ImmediateAlert flags={alertFlags} />
    </main>
  );
};

export default App;