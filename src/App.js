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
]);

const App = () => {
  // Current analysis result state
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Display dashboard or paste analyzer mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Immediate alert banner dismissed flag
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Handle analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (newAnalysis) => {
    setAnalysis(newAnalysis);
    setError(null);
    setLoading(false);
    setAlertDismissed(false);
  };

  // Handle errors in analysis
  const handleError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
  };

  // Loading state setter
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Determine if any high-risk flags are present
  const hasHighRiskFlags =
    analysis?.signals?.some((flag) => HIGH_RISK_FLAGS.has(flag)) && !alertDismissed;

  // Toggle between paste analyzer and real-time dashboard modes
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear alerts and results when switching mode
    setAlertDismissed(false);
    setAnalysis(null);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to paste conversation analyzer mode"
              : "Switch to real-time monitoring dashboard mode"
          }
          style={{ maxWidth: 320, margin: "0 auto" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <section aria-live="polite" aria-atomic="true">
        <ImmediateAlert
          flaggedBehaviors={analysis?.signals || []}
          visible={hasHighRiskFlags}
          onDismiss={() => setAlertDismissed(true)}
        />
      </section>

      <section>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
            setLoading={handleLoading}
          />
        )}

        {showDashboard && (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            error={error}
            loading={loading}
            setLoading={handleLoading}
          />
        )}
      </section>

      {analysis && (
        <section
          className="flagged-result-container"
          aria-label="Analysis results and share options"
          tabIndex={-1}
          style={{ marginTop: "2rem" }}
        >
          <FlaggedResultVisualization
            verdict={analysis.verdict?.label || "Safe"}
            flaggedBehaviors={analysis.signals.map((type) => {
              // Map type to label for display, fallback upper first letter
              const labelMap = {
                insult: "Insult",
                manipulation: "Manipulation",
                gaslighting: "Gaslighting",
                discard: "Discard",
                control: "Control",
                ultimatum: "Ultimatum",
                threat: "Threat",
                guilt: "Guilt",
                boundary_push: "Boundary Push",
                inconsistency: "Inconsistency",
              };
              return {
                type,
                label: labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysis.confidence || 0,
              };
            })}
            overallConfidence={analysis.confidence || 0}
          />

          <ShareableResult analysis={analysis} />
        </section>
      )}

      {error && (
        <section
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#ffd6d6",
            color: "#a60000",
            borderRadius: 6,
            maxWidth: 440,
            marginLeft: "auto",
            marginRight: "auto",
            fontWeight: 600,
            textAlign: "center",
            userSelect: "text",
          }}
        >
          {error}
        </section>
      )}
    </main>
  );
};

export default App;