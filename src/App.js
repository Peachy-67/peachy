import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);
  const [lastAnalysisText, setLastAnalysisText] = useState("");

  // Handler when new analysis data arrives
  const handleAnalysisUpdate = (result, analyzedText) => {
    setAnalysis(result);
    setLastAnalysisText(analyzedText || "");
  };

  // Watch for high-risk flags in the analysis and show immediate alert
  useEffect(() => {
    if (!analysis || !Array.isArray(analysis.signals)) {
      setImmediateAlertFlags([]);
      return;
    }
    const foundHighRiskFlags = analysis.signals.filter((flag) =>
      highRiskFlags.has(flag)
    );
    setImmediateAlertFlags(foundHighRiskFlags);
  }, [analysis]);

  // Toggle real-time dashboard visibility
  const handleToggleDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED
      </h1>

      <section aria-label="Conversation analysis section" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {immediateAlertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={immediateAlertFlags} />
      )}

      {analysis && (
        <section aria-label="Analysis results and sharing" style={{ marginBottom: "2rem" }}>
          <FlaggedResultVisualization
            verdict={analysis.verdict ? analysis.verdict.label : "Safe"}
            flaggedBehaviors={analysis.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence:
                typeof analysis.confidence === "number" ? analysis.confidence : 0,
            }))}
            overallConfidence={
              typeof analysis.confidence === "number" ? analysis.confidence : 0
            }
          />
          <ShareableResult analysis={analysis} originalText={lastAnalysisText} />
        </section>
      )}

      <section aria-label="Real-time monitoring dashboard toggle" style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={handleToggleDashboard}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
          style={{ minWidth: "220px" }}
        >
          {showRealTimeDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>
      </section>

      {showRealTimeDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard />
        </section>
      )}
    </main>
  );
};

export default App;