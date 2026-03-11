import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  // State for analysis result from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // State to toggle real-time dashboard view
  const [showDashboard, setShowDashboard] = useState(false);

  // Track immediate alerts: show alert if any high-risk flags detected
  // High risk means verdict band 'red' or presence of severe flags like 'threat', 'ultimatum'
  const [alertFlags, setAlertFlags] = useState([]);

  // Handler for when new analysis is available from conversation analyzer component
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setAnalysisError(null);
    setLoading(false);

    // Determine if immediate alert is needed
    if (result) {
      const highRiskFlags = result.flaggedBehaviors
        .filter(
          (flag) =>
            [
              "threat",
              "ultimatum",
              "insult",
              "gaslighting",
              "discard",
              "control",
            ].includes(flag.type.toLowerCase()) &&
            (result.verdict === "Flagged" || result.verdict === "Caution")
        )
        .map((flag) => flag.label);

      setAlertFlags(highRiskFlags);
    } else {
      setAlertFlags([]);
    }
  };

  // Handler for errors from conversation analyzer
  const handleAnalysisError = (error) => {
    setAnalysisError(error);
    setAnalysisResult(null);
    setLoading(false);
    setAlertFlags([]);
  };

  // Loader flag for analysis in progress
  const handleAnalysisLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Handler to dismiss alerts shown by ImmediateAlert
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-labelledby="app-title">
      <h1
        id="app-title"
        style={{ textAlign: "center", userSelect: "none", marginBottom: "1rem" }}
      >
        FLAGGED Conversation Analyzer
      </h1>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />

      {/* Toggle to switch between Analyzer and Real-Time Dashboard */}
      <section
        aria-label="Toggle application mode"
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to manual conversation analyzer"
              : "Switch to real-time dashboard"
          }
        >
          {showDashboard ? "Use Manual Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {/* Main Content */}
      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onLoading={handleAnalysisLoading}
          onError={handleAnalysisError}
          analysisResult={analysisResult}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onLoading={handleAnalysisLoading}
          onError={handleAnalysisError}
        />
      )}

      {/* Display analysis error messages */}
      {analysisError && (
        <p
          role="alert"
          style={{ color: "#cc2f2f", fontWeight: "700", marginTop: "1rem", textAlign: "center" }}
        >
          {analysisError}
        </p>
      )}

      {/* Show flagged result visualization and share only if analysis completed and has result */}
      {analysisResult && (
        <section
          aria-label="Analysis Result"
          style={{ marginTop: "2rem", textAlign: "center" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}

      {/* Loading indicator */}
      {loading && (
        <p
          role="status"
          aria-live="polite"
          style={{ textAlign: "center", marginTop: "1rem", fontStyle: "italic" }}
        >
          Analyzing conversation...
        </p>
      )}
    </main>
  );
};

export default App;