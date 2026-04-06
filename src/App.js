import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "threat",
  "discard",
  "control",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Handle new analysis results: set alert if high-risk flags present
  useEffect(() => {
    if (analysisResult?.signals?.length) {
      const detectedHighRisk = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(detectedHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handle analysis triggered by paste or manual analyze
  async function handleAnalyze(conversationText) {
    setError(null);
    setLoading(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: conversationText }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Analysis failed");
      }
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer">
      <h1 tabIndex={-1} style={{ userSelect: "none", color: "#cc2f2f", textAlign: "center" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Toggle between Dashboard and Analyzer */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={`Switch to ${showDashboard ? "Conversation Analyzer" : "Real-Time Dashboard"}`}
        >
          {showDashboard ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalyze={handleAnalyze}
          loading={loading}
          error={error}
          analysisResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
            analysisResult={analysisResult}
          />

          {/* ImmediateAlert watches for high-risk flags */}
          <ImmediateAlert flaggedBehaviors={alertFlags} />

          {/* Show flagged results and share options when analysis is done */}
          {analysisResult && (
            <section aria-live="polite" aria-label="Analysis Results" tabIndex={-1}>
              <FlaggedResultVisualization
                verdict={
                  analysisResult.verdict?.band === "green"
                    ? "Safe"
                    : analysisResult.verdict?.band === "yellow"
                    ? "Caution"
                    : "Flagged"
                }
                overallConfidence={analysisResult.confidence || 0}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
              />
              <ShareableResult analysisResult={analysisResult} />
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;