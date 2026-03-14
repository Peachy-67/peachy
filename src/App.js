import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [isRealTimeMonitoring, setIsRealTimeMonitoring] = useState(false);

  // We define the high-risk flags for the alert system
  const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

  // When analysis result updates, check for any high-risk flags, and update alerts
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }

    const foundHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag)
    );

    setAlertFlags(foundHighRisk);
  }, [analysisResult]);

  // Handler when a new analysis is done by ConversationAnalyzerPolish
  const handleAnalysisUpdate = (result, err) => {
    if (err) {
      setError(err);
      setAnalysisResult(null);
    } else {
      setError(null);
      setAnalysisResult(result);
    }
  };

  // Toggle button to enable/disable real-time dashboard monitoring
  const handleToggleRealTime = () => {
    setIsRealTimeMonitoring((prev) => !prev);
  };

  return (
    <main className="ui-container" tabIndex={-1} aria-label="FLAGGED Conversation Analyzer">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Alert system at top when high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Toggle real-time dashboard */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          className="peachy-button"
          onClick={handleToggleRealTime}
          aria-pressed={isRealTimeMonitoring}
          aria-label={
            isRealTimeMonitoring
              ? "Disable Real-Time Monitoring Dashboard"
              : "Enable Real-Time Monitoring Dashboard"
          }
          type="button"
        >
          {isRealTimeMonitoring ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {/* Show real-time dashboard if enabled */}
      {isRealTimeMonitoring ? (
        <RealTimeDashboard />
      ) : (
        <>
          {/* Conversation input and analyze feature */}
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {/* Show error message if any */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="alert-banner"
              style={{ marginTop: "0.5rem" }}
            >
              {error}
            </div>
          )}

          {/* Show flagged results (verdict + badges + confidence) if analysis is done */}
          {analysisResult && (
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={
                  analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysisResult.confidence,
                  })) || []
                }
                overallConfidence={analysisResult.confidence}
              />

              {/* Shareable result area for easy viral sharing */}
              <ShareableResult
                analysis={analysisResult}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default App;