import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // State for the latest analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for error message from analysis
  const [error, setError] = useState(null);
  // State to toggle real-time dashboard view
  const [showDashboard, setShowDashboard] = useState(false);
  // Flag to track if high-risk flags present for ImmediateAlert
  const [highRiskFlags, setHighRiskFlags] = useState([]);

  // Handler when new analysis is received from analyzer components
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);

    // Determine if high-risk flags (e.g. insult, threat, discard, gaslighting)
    if (result && Array.isArray(result.signals)) {
      const highRisk = result.signals.filter((signal) =>
        ["insult", "threat", "discard", "gaslighting", "ultimatum"].includes(signal.toLowerCase())
      );
      setHighRiskFlags(highRisk);
    } else {
      setHighRiskFlags([]);
    }
  };

  // Handler for errors during analysis
  const handleAnalysisError = (err) => {
    setError(err?.message || "Unexpected error");
  };

  // Handler toggle switch for real-time dashboard view
  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Conversation paste analyzer" style={{ marginBottom: "2.5rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
          />
        )}

        {error && (
          <div
            className="alert-banner"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            style={{ marginTop: "1rem" }}
          >
            {error}
          </div>
        )}

        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={analysisResult.signals.map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult result={analysisResult} />
          </>
        )}

        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={handleToggleDashboard}
          className="peachy-button"
          style={{ marginTop: "1.5rem", width: "100%" }}
        >
          {showDashboard ? "Back to Paste Analyzer" : "Open Real-time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} onError={handleAnalysisError} />
        </section>
      )}

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />
    </main>
  );
};

export default App;