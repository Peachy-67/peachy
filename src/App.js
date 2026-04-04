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

const App = () => {
  // State for conversation analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle between paste analyzer mode and real-time dashboard mode
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // State to control immediate alert visibility and data
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Effect watch for high risk flags to trigger ImmediateAlert
  useEffect(() => {
    if (!analysisResult) {
      setAlertVisible(false);
      setAlertFlags([]);
      return;
    }
    const detectedHighRiskFlags = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    if (detectedHighRiskFlags.length > 0) {
      setAlertFlags(detectedHighRiskFlags);
      setAlertVisible(true);
      // Also trigger native alert prompt
      // Compose a short list for native alert
      const alertText = detectedHighRiskFlags
        .map(
          (f) =>
            f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ") + " detected."
        )
        .join("\n");
      // Using setTimeout to avoid blocking render flow
      setTimeout(() => alert(`High-risk behavior detected:\n${alertText}`), 100);
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for receiving new analysis from conversation analyzer
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler to signal loading state from analyzer
  const handleLoadingState = (isLoading) => {
    setLoading(isLoading);
  };

  // Handler for errors from analyzer
  const handleError = (err) => {
    setError(err);
    setLoading(false);
    setAnalysisResult(null);
  };

  // Handler to dismiss alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Handler toggle between real-time dashboard and paste analyzer
  const toggleMode = () => {
    // Clear results and error state on mode switch
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
    setAlertVisible(false);
    setAlertFlags([]);
    setUseRealTimeDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
        <button
          type="button"
          onClick={toggleMode}
          className="peachy-button"
          aria-pressed={useRealTimeDashboard}
          aria-label={
            useRealTimeDashboard
              ? "Switch to Conversation Paste Analyzer mode"
              : "Switch to Real-Time Monitoring Dashboard mode"
          }
          style={{ display: "block", margin: "0.75rem auto 1.5rem auto", maxWidth: 320 }}
        >
          {useRealTimeDashboard ? "Use Conversation Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {alertVisible && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {useRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          loading={loading}
          error={error}
          onLoadingChange={handleLoadingState}
          onError={handleError}
          initialAnalysis={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            onLoadingChange={handleLoadingState}
            onError={handleError}
          />

          {loading && (
            <p
              aria-live="polite"
              style={{ textAlign: "center", marginTop: "1rem", userSelect: "none" }}
            >
              Analyzing conversation...
            </p>
          )}

          {error && (
            <p
              role="alert"
              aria-live="assertive"
              style={{ color: "#cc2f2f", textAlign: "center", marginTop: "1rem" }}
            >
              Error: {error}
            </p>
          )}

          {analysisResult && !loading && (
            <>
              <section
                className="flagged-result-container"
                aria-live="polite"
                aria-label="Analysis results"
              >
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict.label}
                  flaggedBehaviors={analysisResult.signals.map((signal) => ({
                    type: signal,
                    label:
                      // Map signals to user-friendly labels (capitalize etc.)
                      signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " "),
                    confidence: analysisResult.confidence || 0,
                  }))}
                  overallConfidence={analysisResult.confidence || 0}
                />
              </section>

              <section aria-label="Share analysis result" style={{ textAlign: "center" }}>
                <ShareableResult result={analysisResult} />
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;