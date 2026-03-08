import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  // Add other flags considered high risk if needed
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [useDashboard, setUseDashboard] = useState(false);

  // Handler for new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    if (result?.signals) {
      const detectedHighRiskFlags = result.signals.filter((flag) =>
        highRiskFlags.has(flag.toLowerCase())
      );
      if (detectedHighRiskFlags.length > 0) {
        setAlertFlags(detectedHighRiskFlags);
        setShowAlert(true);
      } else {
        setAlertFlags([]);
        setShowAlert(false);
      }
    } else {
      setAlertFlags([]);
      setShowAlert(false);
    }
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Toggle between analyzer and dashboard UI modes
  const toggleDashboard = () => {
    setUseDashboard((prev) => !prev);
    // Reset analysis and alerts on mode change
    setAnalysisResult(null);
    setAlertFlags([]);
    setShowAlert(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61" }}>FLAGGED Conversation Analyzer</h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={useDashboard}
        aria-label={useDashboard ? "Switch to manual conversation analyzer" : "Switch to real-time dashboard"}
        className="peachy-button"
        style={{ marginBottom: "1.25rem", display: "block", width: "fit-content", marginLeft: "auto", marginRight: "auto" }}
      >
        {useDashboard ? "Use Manual Analyzer" : "Use Real-Time Dashboard"}
      </button>

      {showAlert && alertFlags.length > 0 && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {useDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onResult={onAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((signal) => {
                  // Map signal to label and confidence. Labels capitalize signal name.
                  return {
                    type: signal.toLowerCase(),
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence:
                      typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0,
                  };
                })}
                overallConfidence={typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;