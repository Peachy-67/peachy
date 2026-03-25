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
  "discard",
]);

const App = () => {
  // State to hold the analysis result from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);

  // Track visibility of real-time dashboard mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors from analysisResult for alert and display
  const flaggedBehaviors = (analysisResult?.signals || []).map((signal) => {
    // Map signal keys to label for badge display
    // We'll normalize for known flags, unknown map label to capitalized
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
    return {
      type: signal,
      label: labelMap[signal] || signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysisResult?.confidence || 0,
    };
  });

  // Determine overall verdict label for visualization
  // Map band in verdict to 'Safe' | 'Caution' | 'Flagged'
  // Assume: green -> Safe, yellow -> Caution, red -> Flagged
  const verdictLabelLookup = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdict =
    verdictLabelLookup?.[analysisResult?.verdict?.band] || "Safe";

  // Check if any flagged behavior is high risk for ImmediateAlert
  const hasHighRiskFlag = flaggedBehaviors.some((flag) =>
    HIGH_RISK_FLAGS.has(flag.type)
  );

  // Shareable text for ShareableResult component
  const generateShareText = () => {
    if (!analysisResult) return "";

    const verdictText = verdict;
    const confidencePct = Math.round((analysisResult.confidence || 0) * 100);

    const flagsText =
      flaggedBehaviors.length > 0
        ? flaggedBehaviors
            .map((f) => `${f.label} (${Math.round(f.confidence * 100)}%)`)
            .join(", ")
        : "No red flags";

    return (
      `FLAGGED analysis: Verdict - ${verdictText} (Confidence: ${confidencePct}%)\n` +
      `Detected flags: ${flagsText}\n\n` +
      "Analyze your conversations for red flags at flagged.run"
    );
  };

  // Handler when new analysis arrives from analyzer
  const onAnalysisComplete = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between textarea analyzer mode and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null); // Clear general analysis when switching views for clarity
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flags analyzer">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED™ - Conversation Red Flags Detector
      </h1>
      <section aria-live="polite" aria-atomic="true" aria-relevant="additions removals" style={{ marginBottom: "1rem" }}>
        {/* Immediate alert box for high risk flags */}
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />
      </section>

      <section aria-label="Mode toggle and conversation analyzer" style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
          style={{
            backgroundColor: "#ff6f61",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            padding: "0.6rem 1.2rem",
            fontWeight: "700",
            fontSize: "1rem",
            marginBottom: "1rem",
            userSelect: "none",
            boxShadow: "0 3px 7px rgba(255,111,97,0.5)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e65b50";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ff6f61";
          }}
        >
          {showDashboard ? "Paste Analyzer Mode" : "Real-Time Dashboard Mode"}
        </button>

        {!showDashboard ? (
          <ConversationAnalyzerPolish onAnalysisComplete={onAnalysisComplete} />
        ) : (
          <RealTimeDashboard />
        )}
      </section>

      <section aria-label="Analysis results with sharing" style={{ marginBottom: "2rem" }}>
        {analysisResult ? (
          <>
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult shareText={generateShareText()} />
          </>
        ) : (
          !showDashboard && <p style={{ textAlign: "center", fontStyle: "italic", color: "#999" }}>
            Paste a conversation and click Analyze to see results.
          </p>
        )}
      </section>
    </main>
  );
};

export default App;