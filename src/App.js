import React, { useState, useEffect } from "react";

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
]);

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);

  // Handler for receiving a new conversation analysis result
  const handleAnalysisResult = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);

    // Check for high-risk flags to immediately alert
    if (result && result.signals?.some((signal) => HIGH_RISK_FLAGS.has(signal))) {
      setImmediateAlertFlags(result.signals.filter((s) => HIGH_RISK_FLAGS.has(s)));
    } else {
      setImmediateAlertFlags([]);
    }
  };

  // Handler for errors in analysis
  const handleAnalysisError = (err) => {
    setError(err || "Analysis failed. Please try again.");
    setLoading(false);
    setImmediateAlertFlags([]);
  };

  // Handler for starting analysis (loading)
  const handleAnalysisStart = () => {
    setLoading(true);
    setError(null);
    setImmediateAlertFlags([]);
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setImmediateAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis application">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f3c" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", maxWidth: 480, margin: "0 auto 1rem auto", userSelect: "none", color: "#666" }}>
          Detect red flags in conversations like manipulation, gaslighting, insults, and more.
        </p>
      </header>

      {/* Toggle real-time dashboard view */}
      <section style={{ maxWidth: 720, margin: "0 auto 2rem auto", textAlign: "center" }}>
        <button
          className="peachy-button"
          type="button"
          onClick={() => setShowRealTimeDashboard((v) => !v)}
          aria-pressed={showRealTimeDashboard}
          aria-label={`${showRealTimeDashboard ? "Hide" : "Show"} real-time monitoring dashboard`}
        >
          {showRealTimeDashboard ? "Back to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {immediateAlertFlags.length > 0 && (
        <ImmediateAlert
          flaggedBehaviors={immediateAlertFlags}
          onDismiss={dismissAlert}
        />
      )}

      {/* Render real-time dashboard or conversation analyzer/paste input */}
      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisResult}
          onError={handleAnalysisError}
          onLoading={handleAnalysisStart}
        />
      ) : (
        <section aria-label="Conversation analyzer" style={{ maxWidth: 720, margin: "0 auto" }}>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisResult}
            onError={handleAnalysisError}
            onLoading={handleAnalysisStart}
          />

          {loading && (
            <p
              role="status"
              aria-live="polite"
              style={{ textAlign: "center", marginTop: "1rem", color: "#ff6f3c", fontWeight: "600" }}
            >
              Analyzing conversation...
            </p>
          )}

          {error && (
            <div
              role="alert"
              style={{
                color: "#b00020",
                backgroundColor: "#ffdede",
                borderRadius: 6,
                padding: "12px 16px",
                marginTop: "1rem",
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {analysis && !loading && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={analysis.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysis.confidence,
                }))}
                overallConfidence={analysis.confidence}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default App;