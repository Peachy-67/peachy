import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrates:
 * - ConversationAnalyzerPolish for input and analysis
 * - ImmediateAlert for high-risk flag notification
 * - FlaggedResultVisualization to show verdict and flags
 * - ShareableResult enabling easy sharing of results
 * - RealTimeDashboard for optional live monitoring
 *
 * Manages analysis state, alerting, and toggling dashboard view.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors for visualization and alert
  const flaggedBehaviors = (analysisResult?.signals || []).map((type) => {
    return {
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      confidence: analysisResult?.confidence || 0,
    };
  });

  // Determine verdict label mapping (Safe, Caution, Flagged) from band
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdict =
    analysisResult && analysisResult.verdict && analysisResult.verdict.band
      ? verdictMap[analysisResult.verdict.band] || "Safe"
      : "Safe";

  // High risk flags set for alert triggering. Consider critical flags here.
  // We treat "threat", "insult", "gaslighting", "discard", "control" as high-risk.
  // But since local detection/merged signals might not have all, we check signals array.
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHighRiskFlags([]);
      return;
    }

    const highRiskCandidates = [
      "threat",
      "insult",
      "gaslighting",
      "discard",
      "control",
      "ultimatum",
    ];
    const foundHighRisk = analysisResult.signals.filter((s) =>
      highRiskCandidates.includes(s)
    );
    setHighRiskFlags(foundHighRisk);
  }, [analysisResult]);

  // Handler when analysis completes from child ConversationAnalyzerPolish
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
  };

  // Dismiss alert callback for ImmediateAlert component
  const handleDismissAlert = () => {
    setHighRiskFlags([]);
  };

  // Toggle the real-time dashboard view
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1>FLAGGED</h1>
        <p>
          Detect manipulation, gaslighting, and red flags in conversations.
        </p>
      </header>

      <ConversationAnalyzerPolish onAnalyzeComplete={handleAnalysisComplete} />

      <ImmediateAlert flags={highRiskFlags} onDismiss={handleDismissAlert} />

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </>
      )}

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={(result) => {
            setAnalysisResult(result);
            // Also update high risk flags accordingly
            const highRiskCandidates = [
              "threat",
              "insult",
              "gaslighting",
              "discard",
              "control",
              "ultimatum",
            ];
            const foundHighRisk = (result.signals || []).filter((s) =>
              highRiskCandidates.includes(s)
            );
            setHighRiskFlags(foundHighRisk);
          }}
        />
      )}

      <footer style={{ marginTop: "3rem", textAlign: "center", fontSize: "0.9rem", color: "#999" }}>
        <small>
          FLAGGED &copy; 2024. Developed to help identify manipulation and harmful behaviors.
        </small>
      </footer>
    </main>
  );
};

export default App;