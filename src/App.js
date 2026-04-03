import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = ["insult", "gaslighting", "threat", "ultimatum", "discard"];

function hasHighRiskFlags(flags) {
  return flags.some((flag) => highRiskFlags.includes(flag.toLowerCase()));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Reset alert dismiss when new analysis result arrives
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysisResult]);

  const onAnalysisComplete = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
    setAnalysisResult(null);
    setAlertDismissed(false);
  };

  // Extract flags from analysis result object shape
  const flaggedBehaviors = analysisResult
    ? analysisResult.signals.map((type) => {
        // Map type to label for badges consistent with FlagBadge usage
        // Use capitalized label replacing underscores/ dashes
        const label = type
          .replace(/_/g, " ")
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        return { type, label, confidence: analysisResult.confidence };
      })
    : [];

  const verdictLabel =
    analysisResult && analysisResult.verdict && analysisResult.verdict.label
      ? analysisResult.verdict.label
      : "Safe";

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED main application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
          aria-label={
            showRealTimeDashboard
              ? "Switch to conversation paste analyzer"
              : "Switch to real-time conversation dashboard"
          }
        >
          {showRealTimeDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </div>

      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisComplete={onAnalysisComplete}
          onError={() => setAnalysisResult(null)}
          aria-live="polite"
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisComplete={onAnalysisComplete}
          aria-live="polite"
          key="paste-analyzer"
        />
      )}

      <ImmediateAlert
        flaggedBehaviors={flaggedBehaviors}
        alertDismissed={alertDismissed}
        onDismiss={() => setAlertDismissed(true)}
      />

      {analysisResult && !showRealTimeDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            confidence={analysisResult.confidence || 0}
            conversationExcerpt="" // no conversation text stored here for sharing
          />
        </>
      )}
    </main>
  );
};

export default App;