import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
  "boundary_push",
  "inconsistency",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardMode, setDashboardMode] = useState(false);

  // Whenever analysis changes, update alerts for high-risk flags
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const flaggedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(flaggedHighRisk);
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler to show errors from analyzer components
  const handleError = (errMsg) => {
    setError(errMsg);
    setAnalysisResult(null);
    setLoading(false);
  };

  // Handler for loading state from analyzer components
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setError(null);
      setAnalysisResult(null);
      setAlertFlags([]);
    }
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer and dashboard">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED.RUN
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setDashboardMode(!dashboardMode)}
            className="peachy-button"
            aria-pressed={dashboardMode}
            aria-label={
              dashboardMode
                ? "Switch to conversation paste analyzer mode"
                : "Switch to real-time monitoring dashboard mode"
            }
          >
            {dashboardMode ? "Paste Analyzer Mode" : "Real-time Dashboard Mode"}
          </button>
        </div>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      <section aria-live="polite" aria-relevant="additions removals" aria-atomic="true">
        {dashboardMode ? (
          <RealTimeDashboard
            onAnalysis={handleAnalysis}
            onError={handleError}
            onLoading={handleLoading}
            latestResult={analysisResult}
          />
        ) : (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysis}
            onError={handleError}
            onLoading={handleLoading}
          />
        )}
      </section>

      {loading && (
        <div
          role="status"
          aria-live="polite"
          style={{ marginTop: "1rem", textAlign: "center", color: "#cc2f2f" }}
        >
          Analyzing conversation, please wait...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
          tabIndex={-1}
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {analysisResult && !loading && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult analysis={analysisResult} />
        </>
      )}

      <footer style={{ textAlign: "center", marginTop: "2rem", color: "#999", userSelect: "none" }}>
        &copy; {new Date().getFullYear()} FLAGGED.RUN - Behavioral Red Flags Conversation Analyzer
      </footer>
    </div>
  );
};

export default App;