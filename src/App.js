import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Alert dismissal state
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Real-time dashboard toggle
  const [useDashboard, setUseDashboard] = useState(false);

  // Callback when new analysis is available
  // Reset alert dismissal on new analysis
  const onAnalyze = useCallback((result, err = null) => {
    setAnalysisResult(result);
    setError(err);
    setAlertDismissed(false);
  }, []);

  // Detect if there are any high-risk flags
  const highRiskFlags = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    // Define high risk signals: insult, discard, gaslighting, threat, ultimatum, control
    const highRiskTypes = new Set([
      "insult",
      "discard",
      "gaslighting",
      "threat",
      "ultimatum",
      "control",
    ]);
    return (analysisResult.signals || []).filter((flag) =>
      highRiskTypes.has(flag)
    );
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED.RUN</h1>
        <button
          type="button"
          onClick={() => setUseDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={useDashboard}
          aria-label={
            useDashboard
              ? "Switch to paste conversation analyzer mode"
              : "Switch to real-time dashboard monitoring mode"
          }
          style={{ maxWidth: 280, margin: "0.25rem auto", fontSize: "0.9rem" }}
        >
          {useDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <section aria-label="Conversation input and analysis section">
        {useDashboard ? (
          <RealTimeDashboard onAnalysisUpdate={onAnalyze} />
        ) : (
          <ConversationAnalyzerPolish onAnalyze={onAnalyze} />
        )}
      </section>

      <ImmediateAlert
        flaggedBehaviors={highRiskFlags}
        dismissed={alertDismissed}
        onDismiss={() => setAlertDismissed(true)}
      />

      <section
        aria-label="Analysis results"
        style={{ marginTop: "1.5rem", textAlign: "center" }}
      >
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="alert-banner"
            style={{ maxWidth: 480, margin: "auto" }}
          >
            {error}
          </div>
        )}

        {analysisResult && !error && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={(analysisResult.signals || []).map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={(analysisResult.signals || []).map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              confidence={analysisResult.confidence || 0}
            />
          </>
        )}
      </section>
    </main>
  );
};

export default App;