import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // States for analysis results and loading/error
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Control to show real-time dashboard or paste analyzer
  const [useRealtime, setUseRealtime] = useState(false);
  // Track dismissed alerts to allow dismiss button
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // Handler invoked when new analysis received
  const handleAnalysisUpdate = useCallback(
    (newAnalysis) => {
      setAnalysis(newAnalysis);
      setError(null);
      setDismissedAlerts([]); // Reset dismissed alerts on new analysis
    },
    [setAnalysis, setError, setDismissedAlerts]
  );

  // Handler for errors in ConversationAnalyzerPolish or dashboard
  const handleError = useCallback(
    (msg) => {
      setError(msg);
      setAnalysis(null);
      setDismissedAlerts([]);
    },
    [setError, setAnalysis, setDismissedAlerts]
  );

  // Extract high risk flags currently present in analysis signals
  const getHighRiskFlags = () => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    // High risk flags as defined per detection rules
    const highRiskTypes = ["threat", "ultimatum", "discard", "insult", "gaslighting"];
    return analysis.signals.filter(
      (flag) => highRiskTypes.includes(flag.toLowerCase()) && !dismissedAlerts.includes(flag.toLowerCase())
    );
  };

  const highRiskFlags = getHighRiskFlags();

  // Dismiss handler for alerts banner
  const handleDismissAlert = (flag) => {
    setDismissedAlerts((prev) => [...prev, flag]);
  };

  // Toggle between paste analyzer and real-time monitoring dashboard
  const toggleRealtime = () => {
    setUseRealtime((prev) => !prev);
    setError(null);
    setAnalysis(null);
    setDismissedAlerts([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis tool">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED
      </h1>

      <button
        type="button"
        onClick={toggleRealtime}
        aria-pressed={useRealtime}
        className="peachy-button"
        style={{ marginBottom: "1.5rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {useRealtime ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      <ImmediateAlert
        flaggedBehaviors={highRiskFlags}
        onDismiss={handleDismissAlert}
      />

      {error && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}
        >
          {error}
        </div>
      )}

      {!useRealtime && (
        <>
          <ConversationAnalyzerPolish
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            onAnalysis={handleAnalysisUpdate}
          />

          {analysis && (
            <>
              <section aria-label="Flagged result visualization" style={{ marginTop: "1rem" }}>
                <FlaggedResultVisualization
                  verdict={
                    analysis.verdict?.label === "Flagged"
                      ? "Flagged"
                      : analysis.verdict?.label === "Caution"
                      ? "Caution"
                      : "Safe"
                  }
                  flaggedBehaviors={analysis.signals.map((sig) => ({
                    type: sig,
                    label: sig[0].toUpperCase() + sig.slice(1),
                    confidence: analysis.confidence ?? 0,
                  }))}
                  overallConfidence={analysis.confidence ?? 0}
                />
              </section>

              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}

      {useRealtime && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
        />
      )}
    </main>
  );
};

export default App;