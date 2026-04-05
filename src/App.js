import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

/**
 * Main App component integrating all key features:
 * - Conversation analysis with paste input and AI analysis
 * - Immediate alerts on high-risk behavior flags
 * - Polished flagged results visualization with confidence and verdict
 * - Shareable results with native sharing and copy options
 * - Real-time dashboard toggle for live monitoring
 */
const App = () => {
  // Analysis result state: structure per formatAnalyzeResponse output
  const [analysisResult, setAnalysisResult] = useState(null);
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Show real-time monitoring dashboard toggle state
  const [showDashboard, setShowDashboard] = useState(false);

  // ImmediateAlert dismissal state
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  function onAnalysisUpdate(result) {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
    setAlertDismissed(false);
  }

  // Handler for submit start from ConversationAnalyzerPolish or RealTimeDashboard
  function onAnalysisLoading() {
    setLoading(true);
    setError(null);
    setAlertDismissed(false);
  }

  // Handler for error from analyze API call
  function onAnalysisError(errMessage) {
    setError(errMessage || "Unexpected error. Please try again.");
    setLoading(false);
  }

  // Computes true if any high-risk flags present, indicating alert should show
  // High-risk flags: insult, gaslighting, threat, ultimatum, discard, control, guilt, boundary_push, inconsistency
  // We check signals array of analysisResult
  const highRiskFlags = [
    "insult",
    "gaslighting",
    "threat",
    "ultimatum",
    "discard",
    "control",
    "guilt",
    "boundary_push",
    "inconsistency",
  ];

  const hasHighRiskFlags = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return false;
    return analysisResult.signals.some((flag) => highRiskFlags.includes(flag.toLowerCase()));
  }, [analysisResult]);

  // Dismiss alert handler
  function dismissAlert() {
    setAlertDismissed(true);
  }

  // Compose flagged behaviors for FlaggedResultVisualization and ShareableResult components
  // Use a set of known flag types with labels and pull confidence from analysisResult.confidence
  // Since detailed confidence per flag isn't always present, we use overall confidence for all
  // Label mapping for UI consistency:
  const flagLabels = {
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

  // To keep output concise and per existing UI, show only unique signals filtered by known flags
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    const distinctFlags = Array.from(new Set(analysisResult.signals));
    return distinctFlags
      .filter((flag) => flagLabels.hasOwnProperty(flag))
      .map((flag) => ({
        type: flag,
        label: flagLabels[flag],
        confidence: typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0,
      }));
  }, [analysisResult]);

  // Compute verdict for display consistent with FlaggedResultVisualization expectations
  // Map backend "band" green/yellow/red to "Safe", "Caution", "Flagged"
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdictDisplay = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";
    return verdictMap[analysisResult.verdict.band] || "Safe";
  }, [analysisResult]);

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer main application">
      <h1 style={{ textAlign: "center", userSelect: "none", marginBottom: "1.25rem", color: "#cc2f2f" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Mode toggle for conversation analyzer or real-time dashboard">
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Conversation Paste Analyzer" : "Switch to Real-Time Dashboard"}
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={onAnalysisUpdate}
          onLoading={onAnalysisLoading}
          onError={onAnalysisError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={onAnalysisUpdate}
          onLoading={onAnalysisLoading}
          onError={onAnalysisError}
        />
      )}

      {loading && (
        <div role="status" aria-live="polite" style={{ marginTop: "1rem", fontWeight: "600", color: "#cc2f2f" }}>
          Analyzing conversation...
        </div>
      )}

      {error && (
        <div role="alert" aria-live="assertive" className="alert-banner" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      {/* Immediate alert for high-risk flags, only if not dismissed and analysisResult present */}
      {hasHighRiskFlags && analysisResult && !alertDismissed && (
        <ImmediateAlert analysis={analysisResult} onDismiss={dismissAlert} />
      )}

      {/* Show flagged results visualization and share only if analysis and not loading */}
      {analysisResult && !loading && !error && (
        <>
          <FlaggedResultVisualization
            verdict={verdictDisplay}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} flaggedBehaviors={flaggedBehaviors} verdict={verdictDisplay} />
        </>
      )}
    </main>
  );
};

export default App;