import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

function hasHighRiskFlags(flags = []) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveMode, setLiveMode] = useState(false);

  const handleAnalyze = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Analysis failed");
      }
      const data = await response.json();
      setAnalysisResult(data);
      if (hasHighRiskFlags(data.signals)) {
        setAlertFlags(data.signals);
      } else {
        setAlertFlags([]);
      }
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // If liveMode is toggled off, clear results and alerts
  useEffect(() => {
    if (liveMode) {
      // optionally clear prior results to encourage live input
      setAnalysisResult(null);
      setAlertFlags([]);
      setError(null);
    }
  }, [liveMode]);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff7043", userSelect: "none" }}>FLAGGED</h1>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setLiveMode((lm) => !lm)}
          aria-pressed={liveMode}
          aria-label={`Toggle real-time dashboard mode ${liveMode ? "on" : "off"}`}
          style={{ maxWidth: 220 }}
        >
          {liveMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </div>

      {alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {!liveMode && (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />

          {analysisResult && (
            <section
              aria-live="polite"
              aria-label="Analysis results and flagged behaviors"
              style={{ marginTop: "1.5rem" }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label || "Safe"}
                flaggedBehaviors={
                  analysisResult.signals.map((flag) => ({
                    type: flag,
                    label: flag.charAt(0).toUpperCase() + flag.slice(1),
                    confidence: analysisResult.confidence || 0,
                  }))
                }
                overallConfidence={analysisResult.confidence || 0}
              />

              <ShareableResult analysis={analysisResult} />
            </section>
          )}
        </>
      )}

      {liveMode && (
        <RealTimeDashboard onAlert={setAlertFlags} />
      )}
    </main>
  );
};

export default App;