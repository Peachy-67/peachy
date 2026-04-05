import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main application interface integrating:
 * - Conversation analyzer (paste input + analyze)
 * - Immediate alert on high-risk flags
 * - Polished flagged result visualization with sharing
 * - Toggleable real-time monitoring dashboard
 * 
 * This app manages analysis result state, triggers alerts on high-risk behaviors,
 * displays polished results with confidence and share options,
 * and supports real-time dashboard toggling per product roadmap.
 */
const App = () => {
  // Real-time dashboard toggle state
  const [useDashboard, setUseDashboard] = useState(false);

  // Analysis result state from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysis, setAnalysis] = useState(null);

  // Track if immediate alert banner is dismissed
  const [alertDismissed, setAlertDismissed] = useState(false);

  // When analysis changes reset dismissed alert
  useEffect(() => {
    if (analysis && analysis.flaggedBehaviors && analysis.flaggedBehaviors.length > 0) {
      setAlertDismissed(false);
    }
  }, [analysis]);

  // Calculate flagged behaviors array from signals for visualization and alerting
  // Map signal types to label with confidence if available
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];

    // Map signals to label (capitalize) and confidence
    const behaviors = analysis.signals.map((signal) => {
      // Use manual label capitalization for consistency
      const label =
        signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " ");

      // Try to find confidence per signal if available, else default 0.8 
      let confidence = 0.8;
      if (
        analysis.flagsConfidence &&
        typeof analysis.flagsConfidence === "object" &&
        analysis.flagsConfidence[signal] != null
      ) {
        confidence = analysis.flagsConfidence[signal];
      } else if (analysis.confidence != null) {
        confidence = analysis.confidence;
      }

      return {
        type: signal,
        label,
        confidence,
      };
    });

    return behaviors;
  }, [analysis]);

  // Derive overall verdict (string) from analysis verdict object
  const verdictLabel = React.useMemo(() => {
    if (!analysis || !analysis.verdict || typeof analysis.verdict !== "object")
      return "Safe";

    const label = analysis.verdict.label || "Safe";
    // Map to Safe / Caution / Flagged for FlaggedResultVisualization
    if (label.toLowerCase() === "green" || label.toLowerCase() === "safe") return "Safe";
    if (
      label.toLowerCase() === "yellow" ||
      label.toLowerCase() === "caution"
    )
      return "Caution";
    if (label.toLowerCase() === "red" || label.toLowerCase() === "flagged")
      return "Flagged";

    return "Safe";
  }, [analysis]);

  // Overall confidence (number 0-1)
  const overallConfidence = analysis?.confidence ?? 0;

  // High risk flags that trigger immediate alerts
  // We consider some signals high risk: insult, gaslighting, threat, control, ultimatum, discard
  const highRiskSignals = new Set([
    "insult",
    "gaslighting",
    "threat",
    "control",
    "ultimatum",
    "discard",
  ]);
  const hasHighRiskFlag =
    analysis?.signals?.some((sig) => highRiskSignals.has(sig)) && !alertDismissed;

  // Callbacks for analysis update from child components
  const handleAnalysisUpdate = (newAnalysis) => {
    setAnalysis(newAnalysis);
  };

  // Toggle real-time dashboard mode
  const toggleDashboard = () => {
    setUseDashboard((prev) => !prev);
    // Reset state on toggle
    setAnalysis(null);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged red flag detection app">
      <header aria-label="App header" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff6f61" }}>FLAGGED: Conversation Analyzer</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={useDashboard}
          aria-label={
            useDashboard
              ? "Switch to paste input conversation analyzer"
              : "Switch to real-time monitoring dashboard"
          }
          className="peachy-button"
          style={{ marginBottom: "1.5rem" }}
        >
          {useDashboard ? "Use Paste Input Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {hasHighRiskFlag && (
        <ImmediateAlert
          flaggedBehaviors={flaggedBehaviors.filter((f) =>
            highRiskSignals.has(f.type)
          )}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {useDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {analysis && (
        <>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            result={analysis}
            excerptEnabled={true}
            containerClassName="shareable-result-container"
          />
        </>
      )}
    </main>
  );
};

export default App;