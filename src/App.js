import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
];

// Main App component integrating conversation analyzer, alert system, result visualization,
// shareable results, and real-time dashboard with toggle.
export default function App() {
  // Analysis state: holds latest analysis output or null.
  const [analysis, setAnalysis] = useState(null);
  // Loading and error states for analyze requests.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Toggle to show real-time monitoring dashboard instead of paste analyzer.
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  // Tracks dismissed flag labels for alert dismiss banner.
  const [dismissedFlags, setDismissedFlags] = useState(new Set());

  // Handler to clear dismissed flags when analysis result changes.
  useEffect(() => {
    setDismissedFlags(new Set());
  }, [analysis]);

  // Handle new analysis result from conversation analyzer or dashboard.
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysis(result);
    setError("");
    setLoading(false);
  }, []);

  // Handle error from analysis component.
  const handleAnalysisError = useCallback((msg) => {
    setError(msg);
    setLoading(false);
  }, []);

  // Handle loading state from analyzer.
  const handleLoadingState = useCallback((loadingState) => {
    setLoading(loadingState);
    if (loadingState) setError("");
  }, []);

  // Compute array of high risk flags currently detected (not dismissed).
  const highRiskFlagsPresent = analysis
    ? analysis.signals.filter(
        (flag) => HIGH_RISK_FLAGS.includes(flag) && !dismissedFlags.has(flag)
      )
    : [];

  // Dismiss a displayed flag alert.
  const dismissFlag = (flag) => {
    setDismissedFlags((prev) => new Set(prev).add(flag));
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
      </header>

      <section aria-label="Mode switch">
        <button
          className="peachy-button"
          type="button"
          onClick={() => setShowRealTimeDashboard((v) => !v)}
          aria-pressed={showRealTimeDashboard}
          aria-label={
            showRealTimeDashboard
              ? "Switch to Paste Conversation Analyzer mode"
              : "Switch to Real-Time Monitoring Dashboard mode"
          }
          style={{ marginBottom: "1rem" }}
        >
          {showRealTimeDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {highRiskFlagsPresent.length > 0 && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlagsPresent.map((flag) => ({
            type: flag,
            label: flag.charAt(0).toUpperCase() + flag.slice(1),
          }))}
          onDismiss={dismissFlag}
        />
      )}

      {showRealTimeDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoadingState}
        />
      )}

      <section aria-live="polite" aria-label="Analysis Results" style={{ marginTop: 24 }}>
        {loading && <p style={{ textAlign: "center" }}>Analyzing conversation...</p>}
        {error && (
          <div
            className="alert-banner"
            role="alert"
            aria-live="assertive"
            style={{ maxWidth: 400, margin: "10px auto" }}
          >
            {error}
          </div>
        )}
        {analysis && !loading && !error && (
          <>
            <FlaggedResultVisualization
              verdict={analysis.verdict.label}
              flaggedBehaviors={analysis.signals.map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysis.confidence || 0,
              }))}
              overallConfidence={analysis.confidence || 0}
            />
            <ShareableResult
              verdict={analysis.verdict.label}
              flaggedBehaviors={analysis.signals.map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysis.confidence || 0,
              }))}
              confidence={analysis.confidence || 0}
              conversation={analysis?.meta?.excerpt || ""}
            />
          </>
        )}
      </section>
    </div>
  );
}