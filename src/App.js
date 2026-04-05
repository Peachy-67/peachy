import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * App main component that integrates:
 * - ConversationAnalyzerPolish for pasting conversation input and analysis,
 * - ImmediateAlert for alerting on high-risk flags,
 * - FlaggedResultVisualization to display verdict and flagged badges,
 * - ShareableResult for sharing results with social/web features,
 * - RealTimeDashboard for live monitoring and toggle to dashboard mode.
 */
const App = () => {
  // Analysis result state with default empty safe state
  const [analysisResult, setAnalysisResult] = useState({
    verdict: { label: "Safe", score: 0, band: "green" },
    reaction: [],
    confidence: 0,
    signals: [],
    why: [],
    watch_next: [],
    usage: {},
    meta: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Immediate alert dismiss state to allow dismissing alert banner
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Real-time dashboard view toggle
  const [showDashboard, setShowDashboard] = useState(false);

  // Trigger immediate alert dialog and banner on high-risk signals
  // High-risk defined as verdict band === "red" or any "insult", "threat", "gaslighting"
  const highRiskSignals = ["insult", "threat", "gaslighting", "ultimatum", "control"];
  const hasHighRiskFlag =
    analysisResult.verdict.band === "red" ||
    analysisResult.signals.some((signal) => highRiskSignals.includes(signal));

  // Reset alert dismissal if new analysis with high risk
  useEffect(() => {
    if (hasHighRiskFlag) setAlertDismissed(false);
  }, [analysisResult, hasHighRiskFlag]);

  // Handler for conversation submit from analyzer component
  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data?.message || "Analysis failed. Please try again.";
        throw new Error(msg);
      }
      const json = await res.json();
      setAnalysisResult(json);
    } catch (err) {
      setError(err.message || "Error occurred");
      setAnalysisResult({
        verdict: { label: "Safe", score: 0, band: "green" },
        reaction: [],
        confidence: 0,
        signals: [],
        why: [],
        watch_next: [],
        usage: {},
        meta: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61" }}>
        FLAGGED: Conversation Red Flags Detector
      </h1>

      {/* Mode toggle for dashboard or paste analyzer */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={isLoading}
            error={error}
            lastResult={analysisResult}
          />

          {/* Immediate alert on high-risk with native alert + dismissable banner */}
          {hasHighRiskFlag && !alertDismissed && (
            <ImmediateAlert
              flaggedBehaviors={analysisResult.signals}
              onDismiss={() => setAlertDismissed(true)}
            />
          )}

          {/* Show flagged result visualization for latest analysis */}
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence}
          />

          {/* Wrapper shareable result for viral sharing */}
          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;