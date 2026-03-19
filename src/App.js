import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation input, analysis,
 * immediate alerts, result visualization with sharing,
 * and real-time dashboard toggle per product roadmap.
 */

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "discard", "threat"];

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handler when analysis result updates from ConversationAnalyzerPolish or RealTimeDashboard
   */
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);

    // Extract high-risk flags present for immediate alert
    if (result && Array.isArray(result.signals)) {
      const foundHighRisk = result.signals.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag)
      );
      setAlertFlags(foundHighRisk);
      if (foundHighRisk.length > 0) {
        // Native alert to user for immediate attention
        alert(
          `High-risk behaviors detected: ${foundHighRisk
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}`
        );
      }
    } else {
      setAlertFlags([]);
    }
  };

  /**
   * Handler for error propagation from components
   */
  const handleError = (errMsg) => {
    if (typeof errMsg === "string") setError(errMsg);
    else setError(null);
  };

  /**
   * Toggle to switch between paste analyzer and real-time dashboard views
   */
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear current state on toggle to avoid confusion
    setAnalysis(null);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED Application">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#cc2f2f", fontWeight: "700" }}>FLAGGED</h1>
        <p style={{ fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
          Detect red flags in conversations to identify manipulation, gaslighting, and harmful behavior.
        </p>
        <button
          onClick={toggleDashboard}
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label="Toggle realtime conversation monitoring dashboard"
          style={{ marginTop: "1rem" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleError}
          />
        </section>
      ) : (
        <section aria-label="Paste conversation analyzer">
          <ConversationAnalyzerPolish
            onResult={handleAnalysisUpdate}
            onError={handleError}
          />
        </section>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          tabIndex={-1}
          style={{ marginTop: "1rem" }}
        >
          {error}
        </div>
      )}

      <ImmediateAlert
        flaggedBehaviors={alertFlags.map((flag) => ({
          type: flag,
          label: flag.charAt(0).toUpperCase() + flag.slice(1),
        }))}
      />

      {analysis && (
        <section
          aria-label="Conversation analysis results"
          style={{ marginTop: "2rem", marginBottom: "2rem" }}
        >
          <FlaggedResultVisualization
            verdict={
              analysis.verdict?.label
                ? analysis.verdict.label
                : "Safe"
            }
            flaggedBehaviors={analysis.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: analysis.confidence || 0,
            }))}
            overallConfidence={analysis.confidence || 0}
          />
          <ShareableResult analysis={analysis} />
        </section>
      )}
    </main>
  );
};

export default App;