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

const initialResultState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawResult: null,
};

function App() {
  // State: conversation text input managed inside ConversationAnalyzerPolish
  const [analysisResult, setAnalysisResult] = useState(initialResultState);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler: receives analysis result from ConversationAnalyzerPolish
  const handleAnalysisUpdate = useCallback((result) => {
    if (!result || !result.verdict || !result.signals) {
      setAnalysisResult(initialResultState);
      setAlertFlags([]);
      return;
    }

    // Map signals to flaggedBehaviors array with labels and confidence
    // Signals from backend: array of strings like "insult", "gaslighting" etc.
    // Backend provides confidence in result.confidence

    // Map each detected signal to badge info, with confidence fallback 0.8 if not provided
    const flaggedBehaviors = result.signals.map((signal) => {
      // Map signal to label (capitalize first letter + words)
      const label = signal
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      // Use approximate confidence per signal — try to infer from confidence overall
      // We only have overall confidence; assume per flag is overall confidence minus adjustment (simple approach)
      // Here we assign overall confidence to all signals equally
      const confidence = result.confidence ?? 0.8;

      return {
        type: signal,
        label,
        confidence,
      };
    });

    // Determine verdict label for visualization (Safe, Caution, Flagged)
    // According to existing VerdictDisplay, verdict is one of these
    // We convert backend verdict band to one of these labels:
    const bandMap = {
      green: "Safe",
      yellow: "Caution",
      red: "Flagged",
    };
    const verdictLabel = bandMap[result.verdict.band] || "Safe";

    setAnalysisResult({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence: result.confidence ?? 0,
      rawResult: result,
    });

    // Determine high-risk alerts by checking if any flagged behaviors are high risk
    const highRiskFound = flaggedBehaviors.filter((fb) =>
      HIGH_RISK_FLAGS.has(fb.type)
    );

    setAlertFlags(highRiskFound);
  }, []);

  // Handler to dismiss alerts
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation Analyzer">
      <h1 tabIndex={-1} style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f", marginBottom: "1rem" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Immediate Alert for high-risk flags */}
      <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />

      {/* Conversation input and analysis */}
      <section aria-label="Conversation input and analysis">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {/* Show flagged visualization summary below input if analysis available */}
      {analysisResult.rawResult && (
        <section
          aria-label="Analysis result summary"
          tabIndex={-1}
          style={{ marginTop: "1.5rem" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
          />

          {/* ShareableResult wraps FlaggedResultVisualization with sharing controls */}
          <ShareableResult
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
            rawResult={analysisResult.rawResult}
          />
        </section>
      )}

      {/* Toggle Real-time Dashboard */}
      <section aria-label="Real-time monitoring dashboard" style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          style={{ maxWidth: "260px" }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>

        {showDashboard && <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />}
      </section>
    </main>
  );
}

export default App;