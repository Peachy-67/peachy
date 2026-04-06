import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["threat", "ultimatum", "gaslighting", "discard"];

const App = () => {
  // State for conversation analyzer paste input mode
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for alert control
  const [alertFlags, setAlertFlags] = useState([]);

  // Toggle real-time dashboard mode
  const [useDashboard, setUseDashboard] = useState(false);

  // Handle new analysis from paste analyzer or dashboard
  const onNewAnalysis = useCallback((result) => {
    setAnalysis(result);
    setError("");
    setLoading(false);

    // Check for high-risk flags for alert
    const flaggedSet = new Set(result?.signals || []);
    const highRiskDetected = HIGH_RISK_FLAGS.filter((flag) => flaggedSet.has(flag));

    setAlertFlags(highRiskDetected);
  }, []);

  // Called by ConversationAnalyzerPolish on submit
  const handleAnalyze = async (text) => {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.message || "Analysis failed");
        setLoading(false);
        return;
      }

      const data = await response.json();
      onNewAnalysis(data);
    } catch (e) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Handle alert dismiss
  const onDismissAlert = () => {
    setAlertFlags([]);
  };

  // Handle toggle between paste-analyzer and dashboard mode
  const toggleDashboard = () => {
    setUseDashboard((prev) => !prev);
    setAnalysis(null);
    setError("");
    setAlertFlags([]);
    setLoading(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flags detection app">
      <header>
        <h1 tabIndex={-1} className="ui-section-header" id="app-title">
          FLAGGED
        </h1>
        <p>
          Detect red flags in conversations to identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      <button
        type="button"
        className="peachy-button"
        onClick={toggleDashboard}
        aria-pressed={useDashboard}
        aria-label={useDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time monitoring dashboard"}
        style={{ marginBottom: "1.25rem" }}
      >
        {useDashboard ? "Paste Conversation for Analysis" : "Open Real-Time Dashboard"}
      </button>

      {useDashboard ? (
        <>
          <RealTimeDashboard onAnalysis={onNewAnalysis} />

          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label || "Safe"}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence ?? 0,
                }))}
                overallConfidence={analysis.confidence ?? 0}
              />

              <ShareableResult analysis={analysis} />
            </>
          )}
          {error && <div role="alert" className="alert-banner">{error}</div>}

          <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
        </>
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} loading={loading} error={error} />

          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label || "Safe"}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence ?? 0,
                }))}
                overallConfidence={analysis.confidence ?? 0}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}

          <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
        </>
      )}

      <footer style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#888", textAlign: "center", userSelect: "none" }}>
        Powered by FLAGGED AI detection &copy; 2024
      </footer>
    </main>
  );
};

export default App;