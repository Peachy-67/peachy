import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const highRiskFlagsSet = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors with label and confidence for the visualization and alert
  const flaggedBehaviors = analysisResult?.signals?.map((signal) => {
    // Simple labeling plus confidence from analysis confidence (uniform here since no sub-confidence available)
    // Map signal to label
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
      label: labelMap[signal] || signal,
      confidence: analysisResult.confidence || 0,
    };
  }) || [];

  // Determine verdict string from verdict band for visualization component
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdict = analysisResult?.verdict?.band ? verdictMap[analysisResult.verdict.band] : "Safe";

  // On analysis update, check if any high-risk flags present to trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const foundHighRiskFlags = analysisResult.signals.filter((flag) => highRiskFlagsSet.has(flag));
    setAlertFlags(foundHighRiskFlags);
  }, [analysisResult]);

  // Handle analysis update from conversation analyzer (or dashboard)
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Toggle dashboard view
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis application">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ fontSize: "1rem", color: "#666" }}>Detects red flags in conversations to spot manipulation, gaslighting, and harmful behavior.</p>
      </header>

      {/* Immediate alert */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Toggle Real-time dashboard */}
      <section aria-label="Real-time conversation monitoring toggle" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={showDashboard ? "Hide real-time conversation dashboard" : "Show real-time conversation dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {/* Conversation analyzer or realtime dashboard */}
      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {/* Show result visualization if have a result */}
          {analysisResult && (
            <section aria-label="Analysis result and share options" tabIndex={-1}>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} conversationExcerpt="" />
              {/* Note: conversationExcerpt prop can be enhanced by passing conversation snippet if needed */}
            </section>
          )}
        </>
      ) : (
        // Real-time Dashboard view
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}
    </main>
  );
}

export default App;