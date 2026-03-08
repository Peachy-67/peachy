import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer, immediate alerts,
 * flagged results visualization with share options, and real-time dashboard toggle.
 */
const App = () => {
  // Holds the latest analysis result and conversation text
  const [analysisResult, setAnalysisResult] = useState(null);
  const [conversationText, setConversationText] = useState("");

  // Manages visibility of real-time dashboard mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Flags considered high risk for immediate alert triggering
  const highRiskFlags = ["insult", "gaslighting", "threat", "discard", "control"];

  // Extract flagged behaviors from analysisResult
  const flaggedBehaviors =
    analysisResult?.signals?.map((signal) => {
      // Map signals to label and confidence, fallback label capitalized signal
      // Confidence defaults to overall confidence or 0.7
      const labelMap = {
        insult: "Insult",
        manipulation: "Manipulation",
        gaslighting: "Gaslighting",
        discard: "Discard",
        control: "Control",
        ultimatum: "Ultimatum",
        threat: "Threat",
        guilt: "Guilt-tripping",
        boundary_push: "Boundary Push",
        inconsistency: "Inconsistency",
      };
      return {
        type: signal,
        label: labelMap[signal] || signal.charAt(0).toUpperCase() + signal.slice(1),
        confidence: analysisResult.confidence || 0.7,
      };
    }) || [];

  // Determine overall verdict label (Safe, Caution, Flagged) based on band
  const verdictFromBand = (band) => {
    switch (band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  };

  // Current overall verdict string for visualization
  const verdict = analysisResult?.verdict?.band
    ? verdictFromBand(analysisResult.verdict.band)
    : "Safe";

  // Handler called on new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = useCallback(
    (result, inputText) => {
      setAnalysisResult(result);
      setConversationText(inputText);
    },
    [setAnalysisResult, setConversationText]
  );

  // Extract any high risk flagged behaviors for alert system
  const highRiskDetected = flaggedBehaviors.filter((flag) =>
    highRiskFlags.includes(flag.type.toLowerCase())
  );

  // Toggle real-time dashboard mode
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear existing analysis and text when toggling mode
    setAnalysisResult(null);
    setConversationText("");
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", fontWeight: "600", color: "#555" }}>
          Detect red flags in conversations - manipulation, gaslighting & more.
        </p>
      </header>

      <section aria-label="Analysis controls and input" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ width: "100%", marginBottom: "1rem" }}
        >
          {showDashboard ? "Switch to Manual Analyzer" : "Switch to Real-Time Dashboard"}
        </button>

        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        )}

        {showDashboard && (
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        )}
      </section>

      <ImmediateAlert flaggedBehaviors={highRiskDetected} />

      <section
        aria-label="Analysis results and sharing"
        style={{ marginTop: "1.5rem", textAlign: "center" }}
      >
        {analysisResult && (
          <>
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
              conversationText={conversationText}
            />
          </>
        )}
        {!analysisResult && (
          <p aria-live="polite" style={{ color: "#666", userSelect: "none" }}>
            Paste a conversation and analyze to detect red flags.
          </p>
        )}
      </section>
    </main>
  );
};

export default App;