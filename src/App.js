import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
  "boundary_push",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Detect if any high-risk flag is present
  const hasHighRiskFlags = analysisResult?.signals
    ? analysisResult.signals.some((flag) => HIGH_RISK_FLAGS.has(flag))
    : false;

  // Handle analysis updates
  const onAnalyze = useCallback(async (text) => {
    setLoading(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json?.message || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setErrorMsg(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error when text changes (optional)
  // Note handled inside ConversationAnalyzerPolish if needed

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff6f3c", userSelect: "none" }}>FLAGGED.RUN</h1>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginTop: "0.25rem" }}
        >
          {showDashboard ? "Paste Conversation Analyzer" : "Real-time Dashboard"}
        </button>
      </header>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={onAnalyze}
            loading={loading}
            errorMessage={errorMsg}
          />

          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={analysisResult.signals || []} />
              <FlaggedResultVisualization
                verdict={mapVerdictBandToLabel(analysisResult.verdict?.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                analysisResult={analysisResult}
              />
            </>
          )}
        </>
      )}

      {showDashboard && <RealTimeDashboard />}
    </main>
  );
};

// Map backend verdict band to the three verdict labels we use for UI
function mapVerdictBandToLabel(band) {
  switch (band) {
    case "green":
      return "Safe";
    case "yellow":
      return "Caution";
    case "red":
      return "Flagged";
    default:
      return "Safe";
  }
}

// Convert signals (string array) to flaggedBehaviors array usable by FlaggedResultVisualization
// We map known types to label and confidence (confidence unknown here, so default to 1)
function mapSignalsToFlags(signals) {
  if (!Array.isArray(signals)) return [];
  return signals.map((signal) => {
    const type = signal.toLowerCase();
    const label = signal.charAt(0).toUpperCase() + signal.slice(1);
    return {
      type,
      label,
      confidence: 1,
    };
  });
}

export default App;