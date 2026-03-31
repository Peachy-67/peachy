import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showLiveDashboard, setShowLiveDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handler triggered by conversation analysis component on new results
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
    setIsLoading(false);

    if (result?.signals) {
      const highRiskDetected = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Handler for error from conversation analyzer
  const handleError = useCallback((err) => {
    setError(err);
    setAnalysisResult(null);
    setAlertFlags([]);
    setIsLoading(false);
  }, []);

  // Handler for loading state from conversation analyzer
  const handleLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  // Toggle between paste analyzer mode and real-time dashboard mode
  const toggleDashboard = () => {
    setShowLiveDashboard((active) => !active);
    // reset alerts and analysis on mode switch for clarity
    setAlertFlags([]);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  // Compose share text summary for ShareableResult component
  const getShareText = () => {
    if (!analysisResult) return "";

    const { verdict, signals, confidence } = analysisResult;

    const verdictLabel = verdict?.label || "Unknown";

    const flagsSummary =
      signals && signals.length > 0 ? signals.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(", ") : "None";

    return `FLAGGED Analysis
Verdict: ${verdictLabel}
Detected Flags: ${flagsSummary}
Confidence: ${(confidence * 100).toFixed(0)}%

Analyze your conversations at flagged.run`;
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis application">
      <h1 style={{ textAlign: "center", color: "#ff7433", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        onClick={toggleDashboard}
        className="peachy-button"
        aria-pressed={showLiveDashboard}
        aria-label={showLiveDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time monitoring dashboard"}
        type="button"
      >
        {showLiveDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
      </button>

      {showLiveDashboard ? (
        // Show live dashboard with real-time monitoring and manual analyze fallback
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          onError={handleError}
          onLoading={handleLoading}
          analysisResult={analysisResult}
        />
      ) : (
        // Show paste analyzer input form
        <ConversationAnalyzerPolish onAnalysis={handleAnalysis} onError={handleError} onLoading={handleLoading} />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {(error || isLoading) && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: error ? "#ffe6e6" : "#fff3cd",
            color: error ? "#a63636" : "#856404",
            border: error ? "1.5px solid #cc2f2f" : "1.5px solid #ffecb5",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {isLoading && "Analyzing conversation..."}
          {error && `Error: ${error}`}
        </div>
      )}

      {analysisResult && !isLoading && !error && !showLiveDashboard && (
        <>
          <section aria-label="Analysis results" style={{ marginTop: "1rem" }}>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={analysisResult.signals.map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
          </section>

          <ShareableResult textToShare={getShareText()} />
        </>
      )}
    </main>
  );
};

export default App;