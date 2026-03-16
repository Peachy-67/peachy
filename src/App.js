import React, { useState, useEffect, useCallback } from "react";

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
  "control",
]);

function hasHighRiskFlag(flags = []) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase()));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); // full analysis result object
  const [showDashboard, setShowDashboard] = useState(false);
  const [immediateAlertDismissed, setImmediateAlertDismissed] = useState(false);

  // When analysis result signals change, reset immediate alert dismissed state
  useEffect(() => {
    setImmediateAlertDismissed(false);
  }, [analysisResult?.signals]);

  const onAnalyze = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  const onDismissAlert = () => {
    setImmediateAlertDismissed(true);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analyzer">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((x) => !x)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
          style={{ marginTop: "8px" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <section aria-live="polite" aria-atomic="true">
        {showDashboard ? (
          <RealTimeDashboard onAnalysisUpdate={onAnalyze} />
        ) : (
          <ConversationAnalyzerPolish onAnalyze={onAnalyze} />
        )}
      </section>

      {analysisResult && (
        <>
          <ImmediateAlert
            flaggedBehaviors={analysisResult.signals || []}
            onDismiss={onDismissAlert}
            dismissed={immediateAlertDismissed}
          />

          <section aria-label="Flagged conversation results" style={{ marginTop: "2rem" }}>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict.label}
              flaggedBehaviors={analysisResult.signals.map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: 1, // No per-flag confidence from API, using 1 for all
              }))}
              overallConfidence={analysisResult.confidence}
            />
            <ShareableResult
              analysis={analysisResult}
              conversationExcerpt={analysisResult.meta?.excerpt || ""}
            />
          </section>
        </>
      )}
    </main>
  );
};

export default App;