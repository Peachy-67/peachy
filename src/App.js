import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analysis,
 * immediate alert for high-risk flags,
 * flagged result visualization with sharing,
 * and real-time dashboard toggle per product roadmap.
 */
const App = () => {
  // State for analysis results from the ConversationAnalyzerPolish
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for errors returned by analyzer
  const [error, setError] = useState(null);
  // State of loading analysis
  const [loading, setLoading] = useState(false);
  // State to toggle real-time dashboard view
  const [showDashboard, setShowDashboard] = useState(false);

  /**
   * Handler invoked when ConversationAnalyzerPolish produces new result
   * Receives { verdict, flaggedBehaviors, overallConfidence } as argument
   */
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  /**
   * Handler invoked if an error occurs during analysis
   */
  const handleAnalysisError = (errMsg) => {
    setAnalysisResult(null);
    setError(errMsg);
    setLoading(false);
  };

  /**
   * Handler invoked when analysis starts (loading = true)
   */
  const handleAnalysisLoading = () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
  };

  /**
   * Determine high-risk flags presence (for ImmediateAlert)
   * High risk flags include: insult, gaslighting, discard, threat, ultimatum, control, guilt, boundary_push, inconsistency
   */
  const highRiskFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum", "control", "guilt", "boundary_push", "inconsistency"];

  const detectedHighRiskFlags = (analysisResult?.flaggedBehaviors || []).filter(({ type }) =>
    highRiskFlags.includes(type.toLowerCase())
  );

  /**
   * Toggle between paste analyzer and real-time dashboard
   */
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61", marginBottom: "1.5rem" }}>
        Flagged - Detect Red Flags in Conversations
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        style={{ marginBottom: "1.5rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisStart={handleAnalysisLoading}
            onAnalysisComplete={handleAnalysisUpdate}
            onAnalysisError={handleAnalysisError}
            disabled={loading}
          />

          {loading && <p role="status" aria-live="polite" style={{ textAlign: "center", marginTop: "1rem" }}>Analyzing conversation...</p>}

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: "1rem", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}
            >
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />

              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}

      {/* Immediate alert for detected high-risk flags */}
      <ImmediateAlert flaggedBehaviors={detectedHighRiskFlags} />
    </main>
  );
};

export default App;