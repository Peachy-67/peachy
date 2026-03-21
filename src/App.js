import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";

/**
 * Main application component integrating conversation analyzer,
 * immediate alert notifications, flagged result visualization with share options,
 * and real-time dashboard toggle for live monitoring.
 */
const App = () => {
  // Analysis result state to share between components
  const [analysis, setAnalysis] = useState(null);
  // Tracks if a high-risk flag alert was triggered and dismissed
  const [alertDismissed, setAlertDismissed] = useState(false);
  // Toggle between Paste Analyzer mode and Real-Time Dashboard mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Derived state for flagged behaviors from analysis signals
  // We map signals to objects with { type, label, confidence } for visualization
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    // Map known signal types to labels and default confidences from analysis.confidence
    // Adapt labels to match existing badge labels
    const signalLabelMap = {
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

    // We use a default confidence from analysis.confidence or 0.75 for each
    const defaultConfidence = typeof analysis.confidence === "number" ? analysis.confidence : 0.75;

    // Filter only signals that map to visual badges (important behavior flags)
    // We pick keys that exist in signalLabelMap for visualization
    return analysis.signals
      .filter((stype) => signalLabelMap[stype])
      .map((stype) => ({
        type: stype,
        label: signalLabelMap[stype],
        confidence: defaultConfidence,
      }));
  }, [analysis]);

  // Compute verdict label from analysis.verdict
  // Map backend bands (green,yellow,red) to VerdictDisplay labels (Safe, Caution, Flagged)
  const verdictLabel = React.useMemo(() => {
    if (!analysis || !analysis.verdict || !analysis.verdict.band) return "Safe";
    const band = analysis.verdict.band.toLowerCase();
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
  }, [analysis]);

  // Overall confidence from analysis.confidence scaled 0-1, fallback 0
  const overallConfidence = analysis && typeof analysis.confidence === "number" ? analysis.confidence : 0;

  // Detect if a high-risk flag (red band) is present in flagged behaviors
  const hasHighRiskFlags = React.useMemo(() => {
    if (!analysis || !analysis.verdict) return false;
    return analysis.verdict.band === "red";
  }, [analysis]);

  // Effect to automatically reset alert dismissal once analysis changes
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysis]);

  // Handler for conversation analysis result updates
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Handler for dismissing alert banner
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Handler toggle between modes
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear previous results and alert dismissal on mode change
    setAnalysis(null);
    setAlertDismissed(false);
  };

  return (
    <main
      className="ui-container"
      aria-label="FLAGGED conversation analyzer application"
    >
      <header style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={`Switch to ${showDashboard ? "Paste Analyzer" : "Real-Time Dashboard"} mode`}
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
        />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {/* Show alert only if high risk and not dismissed */}
      {hasHighRiskFlags && !alertDismissed && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={dismissAlert} />
      )}

      {/* Render flagged result and share features if analysis exists */}
      {analysis && (
        <section aria-label="Analyzed conversation results" role="region" tabIndex={-1} style={{ marginTop: "1.2rem" }}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            analysis={analysis}
            verdictLabel={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
          />
        </section>
      )}
    </main>
  );
};

export default App;