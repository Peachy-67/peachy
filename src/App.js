import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "threat",
  "discard",
  "gaslighting",
  "ultimatum",
  "control",
];

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [analysisError, setAnalysisError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Called when analysis completes from conversation input or real-time dashboard
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
    setAnalysisError(null);

    const highRiskDetected =
      Array.isArray(result?.signals) &&
      result.signals.some((signal) => HIGH_RISK_FLAGS.includes(signal));
    if (highRiskDetected) {
      const foundFlags = result.signals.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag)
      );
      setAlertFlags(foundFlags);
    } else {
      setAlertFlags([]);
    }
  }

  // Handle errors coming from analyzer components
  function handleError(err) {
    setAnalysisError(err);
    setAnalysisResult(null);
    setAlertFlags([]);
  }

  // Handles dismissing the visible alert banner
  function dismissAlert() {
    setAlertFlags([]);
  }

  // Toggle between paste conversation analyzer and real-time dashboard views
  function toggleDashboard() {
    setShowRealTimeDashboard((v) => !v);
    // Clear previous results/alerts on toggle for clarity
    setAnalysisResult(null);
    setAlertFlags([]);
    setAnalysisError(null);
  }

  return (
    <main className="ui-container" aria-label="FLAGGED Application Main Interface">
      <header>
        <h1
          style={{
            userSelect: "none",
            textAlign: "center",
            color: "#d9534f",
            marginBottom: "1rem",
          }}
        >
          FLAGGED
        </h1>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showRealTimeDashboard}
          onClick={toggleDashboard}
          aria-label={
            showRealTimeDashboard
              ? "Switch to conversation paste analyzer"
              : "Switch to real-time conversation dashboard"
          }
        >
          {showRealTimeDashboard ? "Use Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <section aria-live="polite" aria-atomic="true" style={{ marginTop: "1.5rem" }}>
        {!showRealTimeDashboard && (
          <>
            <ConversationAnalyzerPolish
              onAnalyze={handleAnalysisUpdate}
              loading={loading}
              setLoading={setLoading}
              onError={handleError}
            />
            {analysisError && (
              <div
                className="alert-banner"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                style={{ marginTop: "1rem" }}
                tabIndex={-1}
              >
                {analysisError.message || "An error occurred during analysis."}
              </div>
            )}

            {analysisResult && (
              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict?.label || "Safe"}
                  flaggedBehaviors={
                    analysisResult.signals && Array.isArray(analysisResult.signals)
                      ? analysisResult.signals.map((signal) => ({
                          type: signal,
                          label: signal.charAt(0).toUpperCase() + signal.slice(1),
                          confidence: analysisResult.confidence || 0,
                        }))
                      : []
                  }
                  overallConfidence={analysisResult.confidence || 0}
                />
                <ShareableResult
                  analysis={analysisResult}
                  conversationText={analysisResult.meta?.originalText || ""}
                  style={{ marginTop: "1rem", width: "100%", maxWidth: 500 }}
                />
              </div>
            )}
          </>
        )}

        {showRealTimeDashboard && (
          <RealTimeDashboard
            onAnalyze={handleAnalysisUpdate}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </section>

      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />

      <footer style={{ marginTop: "3rem", textAlign: "center", userSelect: "none", fontSize: "0.85rem", color: "#888" }}>
        &copy; {new Date().getFullYear()} FLAGGED - Behavioral Red Flag Detector
      </footer>
    </main>
  );
}

export default App;