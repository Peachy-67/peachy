import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardMode, setDashboardMode] = useState(false);

  // Check for high risk flags on analysis update and trigger alert
  useEffect(() => {
    if (analysisResult?.signals) {
      const highRisksDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );

      if (highRisksDetected.length > 0) {
        setAlertFlags(highRisksDetected);
        setShowAlert(true);
        // Also show a native alert for immediate attention
        alert(
          `High-risk behavior detected: ${highRisksDetected
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}`
        );
      } else {
        setAlertFlags([]);
        setShowAlert(false);
      }
    } else {
      setAlertFlags([]);
      setShowAlert(false);
    }
  }, [analysisResult]);

  // Handler to dismiss alert banner
  const dismissAlert = () => {
    setShowAlert(false);
  };

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    // Important: If dashboard mode is active, sync may be handled via WebSocket inside dashboard
  };

  // Toggle between paste input analyzer and real-time monitoring dashboard views
  const toggleDashboardMode = () => {
    setDashboardMode((mode) => !mode);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED
      </h1>
      <section aria-label="Main conversation analysis section" style={{ marginBottom: "1rem" }}>
        {!dashboardMode && (
          <>
            <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
            {analysisResult && (
              <>
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict?.label || "Safe"}
                  flaggedBehaviors={analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence:
                      typeof analysisResult.confidence === "number"
                        ? analysisResult.confidence
                        : 0,
                  }))}
                  overallConfidence={
                    typeof analysisResult.confidence === "number"
                      ? analysisResult.confidence
                      : 0
                  }
                />
                <ShareableResult
                  verdict={analysisResult.verdict?.label || "Safe"}
                  flaggedBehaviors={analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence:
                      typeof analysisResult.confidence === "number"
                        ? analysisResult.confidence
                        : 0,
                  }))}
                  overallConfidence={
                    typeof analysisResult.confidence === "number"
                      ? analysisResult.confidence
                      : 0
                  }
                />
              </>
            )}
          </>
        )}
        {dashboardMode && (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            initialResult={analysisResult}
          />
        )}
      </section>
      <ImmediateAlert
        visible={showAlert}
        flaggedBehaviors={alertFlags}
        onDismiss={dismissAlert}
      />
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={toggleDashboardMode}
          aria-pressed={dashboardMode}
          className="peachy-button"
          aria-label={
            dashboardMode
              ? "Switch to paste conversation analyzer"
              : "Switch to real-time monitoring dashboard"
          }
        >
          {dashboardMode ? "Paste Conversation Analyzer" : "Real-time Dashboard"}
        </button>
      </div>
    </main>
  );
};

export default App;