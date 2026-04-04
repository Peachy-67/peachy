import React, { useState, useEffect } from "react";

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
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  // Determine if current analysis has any high risk flags
  useEffect(() => {
    if (analysisResult?.signals?.length) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler when analysis completes from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result, err = null) => {
    if (err) {
      setError(err);
      setAnalysisResult(null);
      return;
    }
    setError(null);
    setAnalysisResult(result);
  };

  // Toggle between dashboard and simple analyzer
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setError(null);
    setAnalysisResult(null);
  };

  return (
    <main className="ui-container" aria-live="polite" aria-label="Flagged Conversation Analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED.RUN
        </h1>
      </header>

      <section style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        >
          {showDashboard ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {error && (
        <div
          role="alert"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
          aria-live="assertive"
        >
          Error: {error}
        </div>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && !showDashboard && (
        <section aria-label="Flagged conversation analysis results" style={{ marginTop: "1rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: 1, // We do not have individual flag confidence in current data, set to 1
            }))}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}
    </main>
  );
};

export default App;