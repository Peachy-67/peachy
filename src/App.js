import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle new analysis from analyzer component
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);

    // Determine if any high-risk flags are present
    if (result?.signals) {
      const foundHighRisk = result.signals.filter((signal) =>
        HIGH_RISK_FLAGS.includes(signal)
      );
      setAlertFlags(foundHighRisk);
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Handle error from analyzer
  const handleError = useCallback((errMsg) => {
    setError(errMsg);
    setAnalysisResult(null);
    setAlertFlags([]);
    setLoading(false);
  }, []);

  // Handle loading state from analyzer
  const handleLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  // Dismiss alert banner
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle between dashboard and paste input analyzer
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setError(null);
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED red flag detector app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Back to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={dismissAlert}
      />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          onError={handleError}
          onLoading={handleLoading}
          initialResult={analysisResult}
        />
      ) : (
        <section aria-label="Conversation paste analyzer">
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysis}
            onError={handleError}
            onLoading={handleLoading}
          />
          {loading && (
            <p role="status" aria-live="polite" style={{textAlign: "center"}}>
              Analyzing conversation…
            </p>
          )}
          {error && (
            <div
              role="alert"
              className="alert-banner"
              style={{ marginTop: "1rem", textAlign: "center" }}
            >
              {error}
            </div>
          )}
          {analysisResult && !loading && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((signal) => {
                  // Map known signals to labels and confidence if any
                  // We do not have direct confidence per signal here, so default 1
                  let label = signal.charAt(0).toUpperCase() + signal.slice(1);
                  // Map some signals names to common flag names:
                  if (signal === "ultimatum") label = "Ultimatum";
                  else if (signal === "threat") label = "Threat";
                  else if (signal === "gaslighting") label = "Gaslighting";
                  else if (signal === "discard") label = "Discard";
                  else if (signal === "insult") label = "Insult";
                  else if (signal === "control") label = "Control";
                  else if (signal === "guilt") label = "Manipulation";
                  else if (signal === "boundary_push") label = "Boundary Push";
                  else if (signal === "inconsistency") label = "Inconsistency";

                  // Confidence not provided per flag in analysisResult, default 1.0
                  return {
                    type: signal,
                    label,
                    confidence: 1,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </section>
      )}
    </main>
  );
};

export default App;