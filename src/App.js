import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set(["insult", "threat", "gaslighting", "ultimatum"]);

const App = () => {
  // State for analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Immediate alert state for high-risk flags and dismiss
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);

  // Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);

    if (result && Array.isArray(result.signals)) {
      const detectedHighRisk = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setImmediateAlertFlags(detectedHighRisk);
    } else {
      setImmediateAlertFlags([]);
    }
  }, []);

  // Handler to dismiss immediate alert banner
  const dismissImmediateAlert = () => {
    setImmediateAlertFlags([]);
  };

  // Toggle between paste analyzer UI and real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setImmediateAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection application">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to text paste analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flags={immediateAlertFlags} onDismiss={dismissImmediateAlert} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {analysisResult && !showDashboard && (
        <section
          aria-live="polite"
          aria-label="Analysis result summary and flagged behaviors"
          style={{ marginTop: "1.5rem" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              // Map signal types to labels for badges - basic mappings
              const labelMap = {
                insult: "Insult",
                manipulation: "Manipulation",
                gaslighting: "Gaslighting",
                discard: "Discard",
                control: "Control",
                ultimatum: "Ultimatum",
                threat: "Threat",
                guilt: "Guilt",
                "boundary_push": "Boundary Push",
                inconsistency: "Inconsistency",
              };

              return {
                type,
                label: labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
                confidence: 1.0, // Confidence is not detailed here; default 1.0 for display
              };
            })}
            overallConfidence={analysisResult.confidence}
          />

          <ShareableResult analysis={analysisResult} />
        </section>
      )}
    </main>
  );
};

export default App;