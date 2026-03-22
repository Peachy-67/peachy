import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
]);

const App = () => {
  // State for holding latest analysis result
  const [analysis, setAnalysis] = useState(null);
  // State for errors or messages from analysis
  const [error, setError] = useState(null);
  // Show the real time dashboard or normal paste analysis mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler of analysis result update from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (result, errorMsg = null) => {
    setAnalysis(result);
    setError(errorMsg || null);
  };

  // Check if any of the flagged signals are high-risk for alert
  const flaggedHighRisk = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    return analysis.signals.filter((signal) => highRiskFlags.has(signal));
  }, [analysis]);

  // Share text summary for the ShareableResult
  const shareText = React.useMemo(() => {
    if (!analysis) return "";
    const verdictText = analysis.verdict?.label || "Unknown";
    const confidencePercent = Math.round((analysis.confidence || 0) * 100);
    const flags = (analysis.signals || []).join(", ") || "none";
    return `FLAGGED analysis result: ${verdictText} (Confidence: ${confidencePercent}%). Flags: ${flags}.\nUse FLAGGED to identify manipulative and harmful behavior in conversations.`;
  }, [analysis]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", marginBottom: "1.25rem" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>
      <section aria-label="Toggle real-time dashboard mode" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowDashboard(!showDashboard)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <>
          <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
          {error && (
            <div className="alert-banner" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          {analysis && (
            <section aria-label="Real-time dashboard flagged result visualization" style={{ marginTop: "1rem" }}>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={(analysis.signals || []).map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult shareText={shareText} />
            </section>
          )}
        </>
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} />
          {error && (
            <div className="alert-banner" role="alert" aria-live="assertive" tabIndex={-1}>
              {error}
            </div>
          )}
          {analysis && (
            <section aria-label="Conversation analysis result visualization" style={{ marginTop: "1rem" }}>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={(analysis.signals || []).map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult shareText={shareText} />
            </section>
          )}
        </>
      )}

      <ImmediateAlert flaggedBehaviors={flaggedHighRisk} />
    </main>
  );
};

export default App;