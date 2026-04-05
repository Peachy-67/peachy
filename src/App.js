import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "ultimatum",
  "gaslighting",
  "discard",
  "control",
]);

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);

    // Determine if there's any high-risk flags for alert trigger
    if (result?.signals) {
      const foundFlags = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(foundFlags);
    } else {
      setAlertFlags([]);
    }
  }, []);

  const handleLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const handleError = useCallback((errMessage) => {
    setError(errMessage);
    setLoading(false);
  }, []);

  // Toggle real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear previous analysis and alerts when toggling views for clarity
    setAnalysis(null);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flags detector">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED &mdash; Conversation Red Flags Detector
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            className="peachy-button"
            type="button"
            onClick={toggleDashboard}
            aria-pressed={showDashboard}
            aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time monitoring dashboard"}
          >
            {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {!showDashboard && (
        <section aria-label="Paste conversation analyzer" tabIndex={-1}>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onLoading={handleLoadingState}
            onError={handleError}
          />
          {error && (
            <div
              role="alert"
              style={{
                marginTop: "12px",
                color: "#b00020",
                fontWeight: "600",
                userSelect: "text",
                maxWidth: "400px",
                textAlign: "center",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {error}
            </div>
          )}
          {loading && (
            <div
              role="status"
              aria-live="polite"
              style={{ userSelect: "none", textAlign: "center", marginTop: "1rem", color: "#cc2f2f" }}
            >
              Analyzing conversation, please wait…
            </div>
          )}
          {analysis && !loading && !error && (
            <>
              <ImmediateAlert flaggedBehaviors={alertFlags} />
              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </section>
      )}

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" tabIndex={-1}>
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
          />
          {error && (
            <div
              role="alert"
              style={{
                marginTop: "12px",
                color: "#b00020",
                fontWeight: "600",
                userSelect: "text",
                maxWidth: "400px",
                textAlign: "center",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {error}
            </div>
          )}
          {alertFlags.length > 0 && !loading && (
            <ImmediateAlert flaggedBehaviors={alertFlags} />
          )}
          {analysis && !loading && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default App;