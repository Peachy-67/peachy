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
  "threat",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardMode, setDashboardMode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // When analysisResult updates, determine high risk flags for immediate alert
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler to update state on new analysis from ConversationAnalyzerPolish or RealTimeDashboard fallback
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler for errors from analyzers
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
    setAnalysisResult(null);
  };

  // Handler for loading state
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
    setError(null);
  };

  // Allow toggling between paste conversation analyzer and real-time dashboard
  const toggleDashboardMode = () => {
    setDashboardMode((prev) => !prev);
    // Reset results and alerts on mode change
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <h1 style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f" }}>
        FLAGGED
      </h1>

      <button
        className="peachy-button"
        onClick={toggleDashboardMode}
        type="button"
        aria-pressed={dashboardMode}
        aria-label={
          dashboardMode
            ? "Switch to conversation analyzer paste input"
            : "Switch to real-time conversation dashboard"
        }
        style={{ marginBottom: "1rem" }}
      >
        {dashboardMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
      </button>

      {dashboardMode ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoading}
          currentResult={analysisResult}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisResult={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoading}
        />
      )}

      {loading && (
        <p
          aria-live="assertive"
          style={{ textAlign: "center", marginTop: "1rem", color: "#cc2f2f" }}
        >
          Analyzing...
        </p>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            backgroundColor: "#ffe6e6",
            color: "#a63636",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: "700",
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 2px 8px rgba(204, 47, 47, 0.7)",
          }}
        >
          {error}
        </div>
      )}

      {/* Show immediate alerts on high-risk flags */}
      <ImmediateAlert flags={alertFlags} />

      {analysisResult && !loading && !error && (
        <section aria-label="Analysis results" role="region" style={{ marginTop: "2rem" }}>
          {/* Visualize result */}
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          {/* Shareable interface */}
          <ShareableResult
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
            conversationExcerpt={analysisResult.why?.[0] || ""}
          />
        </section>
      )}
    </main>
  );
};

export default App;