import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dashboardMode, setDashboardMode] = useState(false);

  // When analysisResult changes, check for high risk flags and trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      highRiskFlags.has(flag)
    );
    setAlertFlags(detectedHighRisk);
  }, [analysisResult]);

  // Handler to clear alert flags on dismiss of immediate alert
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result, error = null) => {
    setAnalysisResult(result && typeof result === "object" ? result : null);
    setErrorMessage(error);
  };

  // Toggle between paste analyzer mode and real-time dashboard mode
  const toggleDashboard = () => {
    setDashboardMode((prev) => !prev);
    // Clear prior state on mode switch
    setAnalysisResult(null);
    setAlertFlags([]);
    setErrorMessage(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ color: "#cc2f2f", userSelect: "none", textAlign: "center" }}>
          FLAGGED
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button
            className="peachy-button"
            onClick={toggleDashboard}
            aria-pressed={dashboardMode}
            aria-label={
              dashboardMode
                ? "Switch to paste conversation analyzer"
                : "Switch to real-time dashboard"
            }
            type="button"
          >
            {dashboardMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {dashboardMode ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />

      {errorMessage && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ marginTop: "1rem" }}
        >
          {errorMessage}
        </div>
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={
              analysisResult.verdict?.label
                ? analysisResult.verdict.label
                : "Safe"
            }
            flaggedBehaviors={(analysisResult.signals || []).map((signal) => ({
              type: signal,
              label:
                signal.charAt(0).toUpperCase() + signal.slice(1).replace("_", " "),
              confidence: 1, // Currently no per-flag confidence available in unified result, use 1
            }))}
            overallConfidence={
              typeof analysisResult.confidence === "number"
                ? analysisResult.confidence
                : 0
            }
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;