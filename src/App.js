import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main app interface that connects core components:
 * - ConversationAnalyzerPolish: main input and analyze interface
 * - ImmediateAlert: shows instant warnings on high-risk flags
 * - FlaggedResultVisualization: polished verdict and flag badges
 * - ShareableResult: wrap visualization with share & copy buttons
 * - RealTimeDashboard: toggleable real-time monitoring dashboard
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);

  // Extract relevant data for immediate alert and visualization
  const verdict = analysisResult?.verdict?.label || "Safe";
  const flaggedBehaviors = (analysisResult?.signals || []).map((signal) => {
    // Map signals to label & confidence if available
    // Confidence fallback to 1 (100%) if missing
    return {
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: 1,
    };
  });
  const overallConfidence = analysisResult?.confidence || 0;

  // Determine if high-risk flags are present to show alert
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlags([]);
      return;
    }
    // Consider red flags as "insult", "gaslighting", "threat", "discard", "ultimatum" as high risk
    const highRisk = (analysisResult.signals || []).filter((flag) =>
      ["insult", "gaslighting", "threat", "discard", "ultimatum"].includes(flag)
    );
    setHighRiskFlags(highRisk);
  }, [analysisResult]);

  // Handler on new analysis from ConversationAnalyzerPolish
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle real-time dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Input and conversation analysis section">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {analysisResult && (
        <section aria-label="Flagged results visualization">
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            conversationText={analysisResult.meta?.inputText || ""}
          />
        </section>
      )}

      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
          className="peachy-button"
          style={{ display: "block", margin: "0 auto" }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
        {showDashboard && <RealTimeDashboard />}
      </section>
    </main>
  );
};

export default App;