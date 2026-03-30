import React, { useState, useEffect } from "react";

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

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  // Holds current analyzed result
  const [analysis, setAnalysis] = useState(null);
  // Analysis loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Alert visibility and flagged behaviors that triggered it
  const [alertFlags, setAlertFlags] = useState([]);
  // Toggle between paste analyzer and real-time dashboard
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Watch for analysis changes to detect high-risk flags and trigger alerts
  useEffect(() => {
    if (!analysis || !Array.isArray(analysis.signals)) {
      setAlertFlags([]);
      return;
    }

    // Find intersection of current signals and high risk flags
    const triggeredFlags = analysis.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));

    // Only set alert if there is at least one high risk flag
    if (triggeredFlags.length > 0) {
      setAlertFlags(triggeredFlags);
      // Also trigger browser alert
      alert(
        `⚠️ High risk behavior detected: ${triggeredFlags
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`
      );
    } else {
      setAlertFlags([]);
    }
  }, [analysis]);

  // Handler for new analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);
  };

  // Handler for errors from ConversationAnalyzerPolish or RealTimeDashboard
  const handleError = (errMsg) => {
    setError(errMsg);
    setAnalysis(null);
  };

  // Handler when analysis loading state changes
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Dismiss alert banner handler
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", fontWeight: "600" }}>
          Detect red flags in conversations for manipulation, gaslighting & harmful behavior.
        </p>
      </header>

      <section aria-label="Mode selection" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          aria-pressed={!showRealTimeDashboard}
          onClick={() => setShowRealTimeDashboard(false)}
          disabled={!showRealTimeDashboard}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem 1rem",
            fontWeight: "600",
            cursor: showRealTimeDashboard ? "pointer" : "default",
            backgroundColor: showRealTimeDashboard ? "transparent" : "#ff6f61",
            color: showRealTimeDashboard ? "#ff6f61" : "#fff",
            border: "2px solid #ff6f61",
            borderRadius: "6px",
          }}
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          aria-pressed={showRealTimeDashboard}
          onClick={() => setShowRealTimeDashboard(true)}
          disabled={showRealTimeDashboard}
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            fontWeight: "600",
            cursor: !showRealTimeDashboard ? "pointer" : "default",
            backgroundColor: showRealTimeDashboard ? "#ff6f61" : "transparent",
            color: showRealTimeDashboard ? "#fff" : "#ff6f61",
            border: "2px solid #ff6f61",
            borderRadius: "6px",
          }}
        >
          Real-time Dashboard
        </button>
      </section>

      {alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
          currentAnalysis={analysis}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleError}
            onLoading={handleLoading}
          />

          {loading && (
            <p role="status" aria-live="polite" style={{ textAlign: "center", marginTop: "1rem" }}>
              Analyzing conversation...
            </p>
          )}

          {error && (
            <p
              role="alert"
              style={{ color: "#cc2f2f", fontWeight: "700", marginTop: "1rem", textAlign: "center" }}
            >
              {error}
            </p>
          )}

          {analysis && !loading && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={analysis.signals.map((signal) => ({
                  type: signal,
                  label:
                    signal.charAt(0).toUpperCase() +
                    signal.slice(1).replace(/_/g, " "),
                  confidence: analysis.confidence,
                }))}
                overallConfidence={analysis.confidence}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;