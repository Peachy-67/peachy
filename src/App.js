import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "control",
  "ultimatum",
  "threat",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);

  // Handle updates from ConversationAnalyzerPolish and RealTimeDashboard
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
    setErrorMessage("");
    setLoading(false);

    if (result && result.signals) {
      // Detect high-risk flags for immediate alert
      const highRisk = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setImmediateAlertFlags(highRisk);
    } else {
      setImmediateAlertFlags([]);
    }
  }

  // Handle errors from analyzer components
  function handleError(error) {
    setErrorMessage(error);
    setLoading(false);
    setImmediateAlertFlags([]);
  }

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis main application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>

      <section aria-label="Application mode toggle and navigation" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((d) => !d)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          style={{ minWidth: "200px" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      <ImmediateAlert flaggedBehaviors={immediateAlertFlags} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisResult={handleAnalysisUpdate}
          onError={handleError}
          initialResult={analysisResult}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onResult={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />

          {errorMessage && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              style={{ marginTop: "1rem" }}
            >
              {errorMessage}
            </div>
          )}

          {analysisResult && (
            <section
              aria-label="Analysis results and sharing"
              style={{ marginTop: "1.5rem", userSelect: "text" }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence:
                    typeof analysisResult.confidence === "number"
                      ? analysisResult.confidence
                      : 0.5,
                }))}
                overallConfidence={
                  typeof analysisResult.confidence === "number"
                    ? analysisResult.confidence
                    : 0.5
                }
              />

              <ShareableResult
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence:
                    typeof analysisResult.confidence === "number"
                      ? analysisResult.confidence
                      : 0.5,
                }))}
                overallConfidence={
                  typeof analysisResult.confidence === "number"
                    ? analysisResult.confidence
                    : 0.5
                }
                conversationExcerpt={
                  analysisResult?.meta?.inputExcerpt || ""
                }
              />
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;