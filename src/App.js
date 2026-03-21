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
]);

const App = () => {
  // State to hold the latest analysis from conversation analyzer (paste input)
  const [analysis, setAnalysis] = useState(null);
  // Track errors from analysis
  const [error, setError] = useState(null);
  // Flag to toggle real-time dashboard mode
  const [liveDashboard, setLiveDashboard] = useState(false);

  // Determine if any high-risk flags exist in current analysis
  const hasHighRiskFlags =
    analysis?.signals?.some((flag) => HIGH_RISK_FLAGS.has(flag)) || false;

  // Handler on analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysis(null);
      setError(null);
    } else if (result.error) {
      setAnalysis(null);
      setError(result.message || "Analysis error");
    } else {
      // Clear error on successful result
      setError(null);
      setAnalysis(result);
    }
  };

  // When toggling to dashboard, clear analysis and errors to avoid confusion
  useEffect(() => {
    if (liveDashboard) {
      setAnalysis(null);
      setError(null);
    }
  }, [liveDashboard]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <h1 tabIndex={-1} style={{ textAlign: "center", color: "#cc2f2f" }}>
        FLAGGED: Conversation Red Flag Detector
      </h1>

      <div
        style={{
          marginTop: "1rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          className="peachy-button"
          onClick={() => setLiveDashboard(!liveDashboard)}
          aria-pressed={liveDashboard}
          aria-label={
            liveDashboard
              ? "Switch to conversation paste analyzer"
              : "Switch to real-time dashboard monitoring"
          }
        >
          {liveDashboard ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
        </button>
      </div>

      {liveDashboard ? (
        <>
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
          <ImmediateAlert flaggedBehaviors={analysis?.signals || []} />
        </>
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
          <ImmediateAlert flaggedBehaviors={analysis?.signals || []} />

          {/* Error message display */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: "1rem" }}
            >
              {error}
            </div>
          )}

          {/* Show results only if no error and have analysis */}
          {!error && analysis && (
            <>
              <FlaggedResultVisualization
                verdict={
                  analysis.verdict?.label === "Safe"
                    ? "Safe"
                    : analysis.verdict?.label === "Caution"
                    ? "Caution"
                    : "Flagged"
                }
                flaggedBehaviors={analysis.signals.map((type) => {
                  // Map some flag type to more readable label (fallback to type)
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
                  // Confidence not separately provided here, use confidence from overall
                  return {
                    type,
                    label: labelMap[type.toLowerCase()] || type,
                    confidence: analysis.confidence || 0,
                  };
                })}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;