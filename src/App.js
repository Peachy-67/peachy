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
  "control",
  "guilt",
  "boundary_push",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Trigger alert flags if any high-risk signals detected
  useEffect(() => {
    if (analysisResult?.flaggedBehaviors) {
      const highRiskDetected = analysisResult.flaggedBehaviors.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.type)
      );
      if (highRiskDetected.length > 0) {
        setAlertFlags(highRiskDetected);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handle loading and errors from ConversationAnalyzerPolish or RealTimeDashboard
  const handleLoadingChange = (loadingState) => setLoading(loadingState);
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f3c", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      {/* Toggle between paste analyzer and real-time dashboard */}
      <section
        aria-label="App mode switch"
        style={{ textAlign: "center", marginBottom: "1.5rem" }}
      >
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to paste conversation analyzer mode"
              : "Switch to real-time conversation monitoring dashboard mode"
          }
        >
          {showDashboard
            ? "Switch to Paste Conversation Analyzer"
            : "Switch to Real-Time Monitoring Dashboard"}
        </button>
      </section>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {!showDashboard ? (
        /* Paste conversation analyzer mode */
        <section aria-label="Conversation paste analyzer" tabIndex={-1}>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onLoading={handleLoadingChange}
            onError={handleError}
          />

          {loading && (
            <p aria-live="polite" style={{ marginTop: "1rem", textAlign: "center" }}>
              Analyzing conversation, please wait…
            </p>
          )}

          {error && (
            <p
              role="alert"
              style={{
                marginTop: "1rem",
                color: "#b00020",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </section>
      ) : (
        /* Real-time monitoring dashboard mode */
        <section aria-label="Real-time conversation monitoring dashboard" tabIndex={-1}>
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            onLoading={handleLoadingChange}
            onError={handleError}
          />
          {loading && (
            <p aria-live="polite" style={{ marginTop: "1rem", textAlign: "center" }}>
              Waiting for real-time input or analyzing conversation…
            </p>
          )}
          {error && (
            <p
              role="alert"
              style={{
                marginTop: "1rem",
                color: "#b00020",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={analysisResult.verdict.label}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.confidence}
            />
          )}
          {analysisResult && (
            <ShareableResult analysisResult={analysisResult} />
          )}
        </section>
      )}
    </main>
  );
};

export default App;