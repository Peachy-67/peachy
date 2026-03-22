import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

/**
 * Main App component integrating conversation analyzer, immediate alert,
 * flagged result visualization, shareable results, and real-time dashboard.
 * Allows toggling between paste analyzer and real-time dashboard modes.
 */
const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDashboardMode, setIsDashboardMode] = useState(false);

  // Handle update from ConversationAnalyzerPolish or RealTimeDashboard analysis
  function handleAnalysisUpdate(result) {
    setAnalysis(result);
    setError(null);
    setIsLoading(false);
  }

  // Handle error from analyzer components
  function handleError(errMsg) {
    setError(errMsg);
    setAnalysis(null);
    setIsLoading(false);
  }

  // Handle loading state for analysis calls
  function handleLoading(setLoading) {
    setIsLoading(setLoading);
  }

  // Determine if any high-risk flags present to trigger alert
  const flaggedBehaviors = (analysis?.signals || []).map((signal) => {
    // Map signal to label and type (normalize type for badge display consistency)
    // For known flags, labels capitalized, unknown fallback to capitalized string
    const knownLabels = {
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
      type: signal.toLowerCase(),
      label: knownLabels[signal.toLowerCase()] || signal,
      confidence: analysis?.confidence || 0,
    };
  });

  // Determine if high-risk flags exist (red band or presence of specific signals)
  // Here assume "red" verdict band == high risk
  const hasHighRiskFlags = analysis?.verdict?.band === "red";

  // Toggle between real-time dashboard and paste analyzer modes
  function toggleDashboardMode() {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setIsDashboardMode(!isDashboardMode);
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED - Conversation Red Flags Detector
        </h1>
        <button
          type="button"
          onClick={toggleDashboardMode}
          aria-pressed={isDashboardMode}
          aria-label={`${isDashboardMode ? "Show paste analyzer" : "Show real-time dashboard"}`}
          style={{
            margin: "0.75rem auto 1.5rem auto",
            display: "block",
            backgroundColor: "#ff6f61",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "0.5rem 1.25rem",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 3px 7px rgba(255, 111, 97, 0.5)",
            userSelect: "none",
            transition: "background-color 0.25s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e65b50")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff6f61")}
        >
          {isDashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} active={hasHighRiskFlags} />

      {isDashboardMode ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
          analysis={analysis}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleError}
            onLoading={handleLoading}
          />

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginTop: "1rem",
                color: "#c62828",
                fontWeight: "700",
                textAlign: "center",
                userSelect: "text",
              }}
            >
              {error}
            </div>
          )}

          {analysis && (
            <section
              aria-label="Analysis results"
              style={{ marginTop: "2rem", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}
            >
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} conversationText={analysis.meta?.text || ""} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;