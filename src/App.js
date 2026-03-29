import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/ImmediateAlert.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "discard"];

const App = () => {
  // State holds latest analysis data
  // Structure: { verdict, flaggedBehaviors, overallConfidence }
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors with labels and confidence for display
  // Map signals to label + type and confidence from analysis data if available
  const flaggedBehaviors = analysis?.flaggedBehaviors || [];

  // Convenience flags for alerting
  const hasHighRiskFlags =
    flaggedBehaviors.some((f) => HIGH_RISK_FLAGS.includes(f.type.toLowerCase())) || false;

  // Handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  // Accepts analysis result object similar to:
  // {
  //   verdict: { label: string, band: string, score: number },
  //   flaggedBehaviors: [{ type, label, confidence }],
  //   overallConfidence: number,
  // }
  // Composite of data needed for UI
  const handleAnalysisUpdate = (result) => {
    setError(null);
    if (!result || typeof result !== "object") {
      setError("Invalid analysis result.");
      return;
    }
    setAnalysis(result);
  };

  // Handler for errors during analysis
  const handleAnalysisError = (err) => {
    setError(err?.message || "Analysis error");
    setAnalysis(null);
  };

  // Toggle view between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear previous results/errors when switching modes
    setAnalysis(null);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: "0.8rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label="Toggle real-time dashboard view"
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-time Dashboard"}
        </button>
      </div>

      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} highRiskFlagTypes={HIGH_RISK_FLAGS} />

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
            loading={isAnalyzing}
            setLoading={setIsAnalyzing}
          />

          {error && (
            <section
              aria-live="assertive"
              role="alert"
              className="alert-banner"
              style={{ marginTop: "1rem" }}
            >
              {error}
            </section>
          )}

          {analysis && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysis.overallConfidence ?? 0}
              />

              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      ) : (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} onError={handleAnalysisError} />
      )}
    </main>
  );
};

export default App;