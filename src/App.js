import React, { useState, useCallback } from "react";
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
  "discard",
]);

const App = () => {
  // State for analysis data from conversation input or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);

  // State for visibility of ImmediateAlert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);

  // State for toggling real-time dashboard view
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Determine if any high-risk flags are present to trigger alert
  const hasHighRiskFlags =
    analysisResult?.flaggedBehaviors?.some((flag) => highRiskFlags.has(flag.type.toLowerCase())) ?? false;

  // Handler when new analysis data is received (from analyzer or dashboard)
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    // Reset alert dismissal when new result comes in with high-risk flags
    const hasRisks =
      result?.flaggedBehaviors?.some((flag) => highRiskFlags.has(flag.type.toLowerCase())) ?? false;
    if (hasRisks) {
      setAlertDismissed(false);
    }
  }, []);

  const handleDismissAlert = useCallback(() => {
    setAlertDismissed(true);
  }, []);

  // Compose the shareable text for sharing button components
  const buildShareText = () => {
    if (!analysisResult) return "";

    const verdictLine = `Verdict: ${analysisResult.verdict}`;
    const flagsLines =
      analysisResult.flaggedBehaviors.length > 0
        ? analysisResult.flaggedBehaviors
            .map((flag) => `- ${flag.label} (${Math.round(flag.confidence * 100)}%)`)
            .join("\n")
        : "No red flags detected.";

    const excerpt = analysisResult.originalText
      ? `\n\nConversation excerpt:\n` +
        (analysisResult.originalText.length > 200
          ? analysisResult.originalText.slice(0, 200) + "..."
          : analysisResult.originalText)
      : "";

    return `${verdictLine}\n${flagsLines}${excerpt}\n\nAnalyzed with FLAGGED.RUN - detect manipulation and unhealthy behavior in conversations.`;
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header>
        <h1 style={{ color: "#ff6f61", userSelect: "none", textAlign: "center" }}>FLAGGED Conversation Detector</h1>
      </header>

      <section aria-label="Conversation analysis input and results">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

        {/* Immediate alert banner for high-risk flags */}
        {hasHighRiskFlags && !alertDismissed && (
          <ImmediateAlert flaggedBehaviors={analysisResult.flaggedBehaviors} onDismiss={handleDismissAlert} />
        )}

        {/* Show flagged result visualization for latest analysis */}
        {analysisResult && (
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
        )}

        {/* Shareable result area */}
        {analysisResult && (
          <ShareableResult shareText={buildShareText()} disabled={!analysisResult}>
            {/* Children are optional, this component handles UI internally */}
          </ShareableResult>
        )}
      </section>

      <hr style={{ margin: "2rem 0" }} />

      <section aria-label="Real-time dashboard for monitoring conversations">
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowRealTimeDashboard((show) => !show)}
          aria-pressed={showRealTimeDashboard}
          aria-label="Toggle real-time conversation monitoring dashboard"
          style={{ marginBottom: "1rem", display: "block", width: "100%" }}
        >
          {showRealTimeDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>

        {showRealTimeDashboard && <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />}
      </section>
    </main>
  );
};

export default App;