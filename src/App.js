import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer,
 * immediate alert system, flagged result visualization,
 * shareable result, and real-time dashboard monitoring toggle.
 */
const App = () => {
  // Analysis state: result data structure includes verdict, signals, confidence, etc.
  const [analysisResult, setAnalysisResult] = useState(null);

  // Alert banner visible and flagged behaviors for immediate alert
  const [alertFlags, setAlertFlags] = useState([]);

  // Show real-time dashboard toggle
  const [showDashboard, setShowDashboard] = useState(false);

  /**
   * Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
   * Updates main analysis state and triggers alerts if high-risk flags found
   */
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);

    // Identify high-risk flags for alerting (e.g. 'insult', 'gaslighting', 'threat', 'discard')
    const highRiskFlags = ["insult", "gaslighting", "threat", "discard", "control"];
    if (result && Array.isArray(result.signals)) {
      const foundHighRisk = result.signals.filter((signal) => highRiskFlags.includes(signal));
      setAlertFlags(foundHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, []);

  /**
   * Handler to dismiss alert banner
   */
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  /**
   * Prepare flagged behaviors array (type, label, confidence) for visualization and sharing
   * Map signals to labels, and approximate confidence from result.confidence
   */
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    // Map signal type to human-readable label - same keys as detection signals
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

    // We approximate confidence per flagged behavior as overall confidence for now,
    // as backend returns only a global confidence score.
    // If available, individual confidence scores can be added later.
    return analysisResult.signals.map((signal) => ({
      type: signal,
      label: labelMap[signal] || signal,
      confidence: analysisResult.confidence || 0,
    }));
  }, [analysisResult]);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis tool">
      <h1 style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED - Conversation Analyzer
      </h1>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysisResult={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={
                  analysisResult.verdict?.label === "Safe"
                    ? "Safe"
                    : analysisResult.verdict?.label === "Caution"
                    ? "Caution"
                    : "Flagged"
                }
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={handleDismissAlert} />

      <section
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          userSelect: "none",
        }}
        aria-label="Dashboard toggle section"
      >
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section
          aria-label="Real-time conversation monitoring dashboard"
          style={{ marginTop: "1.5rem" }}
        >
          <RealTimeDashboard onAnalysisResult={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
};

export default App;