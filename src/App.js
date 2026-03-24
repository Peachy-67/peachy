import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = [
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
  "boundary_push",
  "inconsistency",
];

const hasHighRiskFlags = (flags = []) =>
  flags.some((flag) => highRiskFlags.includes(flag));

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [realtimeMode, setRealtimeMode] = useState(false);

  // When analysis changes, check for high-risk flags to trigger alert
  useEffect(() => {
    if (
      analysisResult &&
      analysisResult.signals &&
      hasHighRiskFlags(analysisResult.signals)
    ) {
      setAlertFlags(analysisResult.signals.filter((flag) => highRiskFlags.includes(flag)));
      setShowAlert(true);

      // Show native alert for immediate attention
      // Compose alert message with flag names capitalized
      const flagList = alertFlags.length
        ? alertFlags
        : analysisResult.signals.filter((flag) => highRiskFlags.includes(flag));
      if (flagList.length) {
        const alertMessage = `Warning: High-risk flags detected - ${flagList
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`;
        // Use setTimeout to avoid React warning on alert sync call
        setTimeout(() => {
          window.alert(alertMessage);
        }, 100);
      }
    } else {
      // no high risk flags, hide alert
      setShowAlert(false);
      setAlertFlags([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult]);

  // Handler for conversation analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Handler to dismiss alert banner
  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  // Toggle between paste analyzer and real-time dashboard mode
  const toggleRealtimeMode = () => {
    setRealtimeMode((prev) => !prev);
    setAnalysisResult(null);
    setShowAlert(false);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6847", userSelect: "none" }}>
        FLAGGED
      </h1>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleRealtimeMode}
          aria-pressed={realtimeMode}
          aria-label={
            realtimeMode
              ? "Switch to paste conversation analyzer"
              : "Switch to real-time dashboard"
          }
          className="peachy-button"
        >
          {realtimeMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {showAlert && (
        <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {!realtimeMode && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysisResult.confidence ?? 0,
                }))}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}

      {realtimeMode && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          initialAnalysis={analysisResult}
        />
      )}
    </main>
  );
};

export default App;