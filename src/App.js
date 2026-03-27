import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const verdictFromBand = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Update alert flags on new analysis result
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    // Find any high risk flags present in signals
    const highRisk = analysisResult.signals.filter((signal) =>
      HIGH_RISK_FLAGS.has(signal)
    );
    setAlertFlags(highRisk);
    if (highRisk.length > 0) {
      // Native alert on first high risk flag
      alert(
        `Warning: High-risk behavior detected: ${highRisk
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`
      );
    }
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result, error) => {
    if (error) {
      setErrorMessage(error);
      setAnalysisResult(null);
    } else {
      setErrorMessage(null);
      setAnalysisResult(result);
    }
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 tabIndex={-1} className="app-title" style={{ textAlign: "center", color: "#ff6f61" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Mode selection" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard(false)}
          disabled={!showDashboard}
          aria-pressed={!showDashboard}
          aria-label="Switch to paste conversation analyzer mode"
          style={{ marginRight: "1rem" }}
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard(true)}
          disabled={showDashboard}
          aria-pressed={showDashboard}
          aria-label="Switch to real-time dashboard mode"
        >
          Real-Time Dashboard
        </button>
      </section>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: "1rem" }}
            >
              {errorMessage}
            </div>
          )}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdictFromBand[analysisResult.verdict.band] || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label:
                    {
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
                    }[type] || type,
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}
    </div>
  );
};

export default App;