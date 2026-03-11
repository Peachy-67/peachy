import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
  "discard",
]);

const initialAnalysisState = {
  verdict: "Safe", // 'Safe', 'Caution', or 'Flagged'
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawOutput: null,
};

const App = () => {
  const [analysis, setAnalysis] = useState(initialAnalysisState);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [latestText, setLatestText] = useState("");

  // Watch for high-risk flags in flagged behaviors, trigger immediate alert
  useEffect(() => {
    if (!analysis.flaggedBehaviors) return;

    // Filter flagged behaviors to only those considered high-risk
    const triggeredFlags = analysis.flaggedBehaviors.filter((flag) =>
      highRiskFlags.has(flag.type.toLowerCase())
    );
    if (triggeredFlags.length > 0) {
      setAlertFlags(triggeredFlags);
    } else {
      setAlertFlags([]);
    }
  }, [analysis.flaggedBehaviors]);

  // Handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysis(initialAnalysisState);
      return;
    }
    const { verdict, flaggedBehaviors, overallConfidence, rawOutput } = result;
    setAnalysis({
      verdict,
      flaggedBehaviors,
      overallConfidence,
      rawOutput,
    });
  };

  // Clear alert dismiss
  const handleDismissAlert = () => setAlertFlags([]);

  // Toggle real-time dashboard view
  const toggleDashboard = () => setShowDashboard((prev) => !prev);

  return (
    <main className="container" aria-label="FLAGGED conversation analyzer main application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={handleDismissAlert} />

      {/* Conversation analyzer input & analyze button */}
      {!showDashboard && (
        <ConversationAnalyzerPolish
          onAnalysisResult={handleAnalysisUpdate}
          onInputChange={(text) => setLatestText(text)}
          latestText={latestText}
        />
      )}

      {/* Result visualization and sharing */}
      {!showDashboard && analysis.rawOutput && (
        <>
          <FlaggedResultVisualization
            verdict={analysis.verdict}
            flaggedBehaviors={analysis.flaggedBehaviors}
            overallConfidence={analysis.overallConfidence}
          />
          <ShareableResult
            analysis={analysis.rawOutput}
            conversationText={latestText}
            verdict={analysis.verdict}
          />
        </>
      )}

      {/* Real-time dashboard toggle button */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time Dashboard" : "Show real-time Dashboard"}
          className="peachy-button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {/* Real-time dashboard live monitoring */}
      {showDashboard && <RealTimeDashboard onAnalysisResult={handleAnalysisUpdate} />}
    </main>
  );
};

export default App;