import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function hasHighRiskFlags(flags) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.type.toLowerCase()));
}

const App = () => {
  // analysisResult shape: { verdict, flaggedBehaviors, overallConfidence }
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // When new high-risk flags appear, if alert was dismissed previously reset dismissal for new alerts
  useEffect(() => {
    if (analysisResult && hasHighRiskFlags(analysisResult.flaggedBehaviors)) {
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  // Handlers
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Extract flagged behaviors from analysisResult for ImmediateAlert
  const flaggedBehaviors = analysisResult?.flaggedBehaviors || [];

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label="Toggle real-time monitoring dashboard"
        >
          {showDashboard ? "Back to Paste Analyzer" : "Go to Real-Time Dashboard"}
        </button>
      </div>

      {/* Immediate alert for high-risk flags */}
      {!alertDismissed && flaggedBehaviors.length > 0 && (
        <ImmediateAlert
          flaggedBehaviors={flaggedBehaviors}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {showDashboard ? (
        // Show real-time dashboard with live updates, manual analyze fallback
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
        />
      ) : (
        // Show paste input analyzer view
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;