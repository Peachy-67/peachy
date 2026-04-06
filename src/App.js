import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]); // flags triggering immediate alert

  // Updates alertFlags whenever analysisResult changes
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.toLowerCase())
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysis(newResult) {
    setAnalysisResult(newResult);
    setAnalysisError(null);
    setIsLoading(false);
  }

  // Handler for analysis errors
  function handleError(error) {
    setAnalysisResult(null);
    setAnalysisError(error);
    setIsLoading(false);
  }

  // Handler while analysis is loading
  function handleLoading(loadingState) {
    setIsLoading(loadingState);
  }

  // Toggle between paste analyzer and real-time dashboard views
  function toggleDashboard() {
    setShowDashboard((prev) => !prev);
    // Clear previous state on toggle
    setAnalysisResult(null);
    setAnalysisError(null);
    setAlertFlags([]);
  }

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <header>
        <h1 style={{ userSelect: "none", color: "#ff6f61", textAlign: "center" }}>
          FLAGGED
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onResult={handleAnalysis}
          onError={handleError}
          onLoading={handleLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onResult={handleAnalysis}
          onError={handleError}
          onLoading={handleLoading}
        />
      )}

      {isLoading && (
        <div role="status" aria-live="polite" style={{ textAlign: "center", margin: "12px 0" }}>
          Analyzing conversation...
        </div>
      )}

      {analysisError && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
        >
          {analysisError}
        </div>
      )}

      {analysisResult && (
        <>
          <ImmediateAlert flaggedBehaviors={alertFlags} />
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              // Map signals to labels and default confidence as the overall confidence percentage
              // We provide some default labels matching the known flags; fallback to capitalized
              const labelMap = {
                insult: "Insult",
                manipulation: "Manipulation",
                gaslighting: "Gaslighting",
                discard: "Discard",
                control: "Control",
                ultimatum: "Ultimatum",
                threat: "Threat",
                guilt: "Guilt",
                boundary_push: "Boundary Push",
                inconsistency: "Inconsistency",
              };
              return {
                type,
                label: labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0.5,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            verdict={analysisResult.verdict.label || "Safe"}
            flaggedBehaviors={analysisResult.signals}
            confidence={analysisResult.confidence}
            why={analysisResult.why}
            watchNext={analysisResult.watch_next}
          />
        </>
      )}
    </main>
  );
}

export default App;