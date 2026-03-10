import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  // State for the conversation analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  // State to track if an error happened during analysis
  const [analysisError, setAnalysisError] = useState(null);
  // Loading state for analysis in progress
  const [loading, setLoading] = useState(false);
  // Toggle to show/hide real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for when a new conversation is analyzed
  const handleAnalysis = useCallback((result, error) => {
    if (error) {
      setAnalysisError(error);
      setAnalysisResult(null);
    } else {
      setAnalysisResult(result);
      setAnalysisError(null);
    }
    setLoading(false);
  }, []);

  // Trigger analysis wrapped to set loading
  const handleStartAnalysis = () => {
    setLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
  };

  // Determine high-risk flags for ImmediateAlert
  const highRiskFlags = analysisResult?.signals?.filter((flag) =>
    ["insult", "manipulation", "gaslighting", "threat", "ultimatum"].includes(flag)
  ) || [];

  // Compose flagged behaviors object array for visualization
  // Using labels capitalized for UI and confidence from backend confidence for all flags
  const flaggedBehaviors = (analysisResult?.signals || []).map((flag) => ({
    type: flag,
    label:
      {
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
      }[flag] || flag,
    confidence: analysisResult?.confidence || 0,
  }));

  // Verdict label: Safe, Caution, or Flagged based on backend verdict band if present or default Safe.
  const verdict =
    analysisResult?.verdict?.band === "green"
      ? "Safe"
      : analysisResult?.verdict?.band === "yellow"
      ? "Caution"
      : analysisResult?.verdict?.band === "red"
      ? "Flagged"
      : "Safe";

  // Overall confidence score from analysis result
  const overallConfidence = analysisResult?.confidence || 0;

  return (
    <main className="container" aria-label="Flagged conversation red flag detection app">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f", marginBottom: "1rem" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Conversation input and analysis interface">
        <ConversationAnalyzerPolish
          onStartAnalysis={handleStartAnalysis}
          onAnalysisComplete={handleAnalysis}
          loading={loading}
          error={analysisError}
          initialResult={analysisResult}
        />
      </section>

      {/* Show immediate alert if high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

      {/* Show flagged results visualization and sharing only if we have an analysis result */}
      {analysisResult && (
        <section aria-label="Analysis results visualization and sharing" style={{ marginTop: "1.5rem" }}>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            conversation={analysisResult.meta?.inputText || ""}
          />
        </section>
      )}

      <section aria-label="Real-time conversation monitoring dashboard toggle" style={{ marginTop: "2rem" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          style={{
            backgroundColor: showDashboard ? "#cc2f2f" : "#ff704f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.25rem",
            fontWeight: "700",
            fontSize: "1.1rem",
            cursor: "pointer",
            userSelect: "none",
            margin: "0 auto",
            display: "block",
            transition: "background-color 0.25s ease",
            maxWidth: "280px",
          }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "1rem" }}>
          <RealTimeDashboard />
        </section>
      )}

      <footer
        style={{
          marginTop: "3rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "#777",
          userSelect: "none",
        }}
      >
        &copy; {new Date().getFullYear()} FLAGGED.RUN - Detect red flags in conversations
      </footer>
    </main>
  );
};

export default App;