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

const analyzeResultIsHighRisk = (flags) =>
  flags.some((flag) => HIGH_RISK_FLAGS.has(flag.type));

export default function App() {
  // State for conversation analyzer results
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for Immediate Alert dismissal
  const [dismissedAlertFlags, setDismissedAlertFlags] = useState(new Set());

  // Real-time dashboard toggle
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Handle new analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);

    // Reset dismissed flags when new analysis arrives
    setDismissedAlertFlags(new Set());
  };

  // Handle errors from analyzer components
  const handleError = (err) => {
    setError(err);
    setLoading(false);
  };

  // Handle loading state from analyzer component
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Compose alerted flags for ImmediateAlert, filtering out dismissed
  const alertedFlags = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    // Map signals to flag objects with type and label for alert
    // We derive label with capitalization (first letter uppercase)
    const uniqueFlagsMap = new Map();
    analysis.signals.forEach((signal) => {
      if (HIGH_RISK_FLAGS.has(signal.toLowerCase())) {
        const type = signal.toLowerCase();
        if (!dismissedAlertFlags.has(type)) {
          uniqueFlagsMap.set(type, { type, label: type[0].toUpperCase() + type.slice(1) });
        }
      }
    });
    return Array.from(uniqueFlagsMap.values());
  }, [analysis, dismissedAlertFlags]);

  // Dismiss an alert flag
  const dismissAlertFlag = (flagType) => {
    setDismissedAlertFlags((prev) => new Set(prev).add(flagType));
  };

  // Render the main UI
  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation detection app">
      <header>
        <h1>FLAGGED</h1>
        <p>Detect red flags in your conversations and stay safe.</p>
      </header>

      {!showRealTimeDashboard && (
        <>
          <section aria-labelledby="analyzer-heading">
            <h2 id="analyzer-heading" className="ui-section-header">
              Paste Conversation to Analyze
            </h2>
            <ConversationAnalyzerPolish
              onAnalysis={handleAnalysisUpdate}
              onError={handleError}
              onLoading={handleLoading}
            />
          </section>

          {loading && (
            <div role="status" aria-live="polite" style={{ marginTop: "1rem", textAlign: "center" }}>
              Analyzing conversation...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              style={{ marginTop: "1rem" }}
              tabIndex={-1}
            >
              {error.message || "Error during analysis. Please try again."}
            </div>
          )}

          {analysis && !loading && !error && (
            <section aria-labelledby="results-heading" className="flagged-result-container">
              <h2 id="results-heading" className="ui-section-header">
                Analysis Results
              </h2>

              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={analysis.signals.map((type) => ({
                  type,
                  label: type[0].toUpperCase() + type.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />

              <ShareableResult analysis={analysis} />

              <button
                type="button"
                className="peachy-button"
                onClick={() => setShowRealTimeDashboard(true)}
                aria-label="Switch to realtime conversation monitoring dashboard"
                style={{ marginTop: "1.5rem" }}
              >
                Switch to Real-Time Dashboard
              </button>
            </section>
          )}
        </>
      )}

      {showRealTimeDashboard && (
        <section aria-labelledby="dashboard-heading" className="dashboard-container">
          <h2 id="dashboard-heading" className="dashboard-title">
            Real-Time Conversation Monitoring
          </h2>
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            onLoading={handleLoading}
          />
          <button
            type="button"
            className="peachy-button"
            onClick={() => setShowRealTimeDashboard(false)}
            aria-label="Switch to conversation paste analyzer"
            style={{ marginTop: "1.5rem" }}
          >
            Switch to Paste Conversation Analyzer
          </button>
        </section>
      )}

      <ImmediateAlert flaggedBehaviors={alertedFlags} onDismiss={dismissAlertFlag} />
    </main>
  );
}