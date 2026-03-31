import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "threat",
  "discard",
]);

const App = () => {
  // State for analysis result from conversation input analyzer
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for immediate alert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);

  // State to toggle between paste analyzer and real-time dashboard views
  const [showDashboard, setShowDashboard] = useState(false);

  // Called by ConversationAnalyzerPolish on analysis completion or error
  const handleAnalysisUpdate = useCallback(({ result, error }) => {
    setError(error || null);
    if (result) {
      setAnalysis(result);
      setAlertDismissed(false);
    } else {
      setAnalysis(null);
    }
    setIsLoading(false);
  }, []);

  // Called by ConversationAnalyzerPolish when analysis starts
  const handleStartLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  // Handler to dismiss the visible alert banner (ImmediateAlert)
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Detect if there are any high-risk flags in current analysis signals
  const hasHighRiskFlags = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return false;
    return analysis.signals.some((sig) => HIGH_RISK_FLAGS.has(sig));
  }, [analysis]);

  // Compose flagged behaviors array for FlaggedResultVisualization & ShareableResult
  // Map signals (string) to objects with type, label and confidence
  // Using static labels and approximate confidence from analysis.confidence
  // Map known signals to user-friendly labels and types
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    const confidence = typeof analysis.confidence === "number" ? analysis.confidence : 0;
    const mapSignalToLabel = {
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

    return analysis.signals
      .filter((sig) => mapSignalToLabel[sig])
      .map((sig) => ({
        type: sig,
        label: mapSignalToLabel[sig],
        confidence: confidence,
      }));
  }, [analysis]);

  // Overall verdict: derive from analysis.verdict.label if available, else fallback
  const verdict = React.useMemo(() => {
    if (analysis && analysis.verdict && typeof analysis.verdict.label === "string") {
      // Normalize to capitalized verdict string expected by visualization
      const label = analysis.verdict.label.toLowerCase();
      if (label === "safe" || label === "green") return "Safe";
      if (label === "caution" || label === "yellow") return "Caution";
      if (label === "flagged" || label === "red") return "Flagged";
    }
    // Fallback if no verdict provided
    if (hasHighRiskFlags) return "Flagged";
    if (flaggedBehaviors.length > 0) return "Caution";
    return "Safe";
  }, [analysis, hasHighRiskFlags, flaggedBehaviors]);

  // Overall confidence: use analysis.confidence or 0 if unknown
  const overallConfidence = React.useMemo(() => {
    return analysis && typeof analysis.confidence === "number" ? analysis.confidence : 0;
  }, [analysis]);

  // Support toggling real-time dashboard view
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED red flag detector application">
      <header>
        <h1 style={{ userSelect: "none", color: "#ff6f61", textAlign: "center", marginBottom: "1rem" }}>
          FLAGGED Conversation Red Flags Detector
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste analyzer" : "Switch to real-time dashboard"}
          style={{ display: "block", marginLeft: "auto", marginRight: "auto", maxWidth: "240px", marginBottom: "1rem" }}
        >
          {showDashboard ? "← Paste Analyzer" : "Real-Time Dashboard →"}
        </button>
      </header>

      {showDashboard ? (
        <section aria-label="Real time conversation monitoring dashboard" tabIndex={-1}>
          <RealTimeDashboard />
        </section>
      ) : (
        <section aria-label="Conversation analyzer with paste input" tabIndex={-1}>
          <ConversationAnalyzerPolish
            onStartLoading={handleStartLoading}
            onResult={handleAnalysisUpdate}
            loading={isLoading}
            error={error}
          />
        </section>
      )}

      {/* Show immediate alert if needed and not dismissed */}
      {hasHighRiskFlags && !alertDismissed && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={dismissAlert} />
      )}

      {/* Show flagged result visualization and sharing only for paste analyzer mode with an analysis */}
      {!showDashboard && analysis && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            conversationExcerpt={
              typeof analysis?.meta?.excerpt === "string"
                ? analysis.meta.excerpt
                : ""
            }
          />
        </>
      )}
    </main>
  );
};

export default App;