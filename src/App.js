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
  "control",
  "discard",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [lastAlertDismissedAt, setLastAlertDismissedAt] = useState(null);

  // Update alert flags on new analysis
  useEffect(() => {
    if (
      analysisResult &&
      Array.isArray(analysisResult.signals) &&
      analysisResult.signals.length > 0
    ) {
      const detectedHighRisk = analysisResult.signals.filter((flag) =>
        highRiskFlags.has(flag.toLowerCase())
      );
      if (detectedHighRisk.length > 0) {
        setAlertFlags(detectedHighRisk);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for dismissing alert banner
  const dismissAlert = () => {
    setAlertFlags([]);
    setLastAlertDismissedAt(Date.now());
  };

  // When user re-analyzes, reset dismissed alert
  const onAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    // Only clear dismiss if new flags appear or no flags present
    const newHighRisk =
      result?.signals?.filter((flag) => highRiskFlags.has(flag.toLowerCase())) ??
      [];
    if (
      newHighRisk.length === 0 || // no high risk flags now
      lastAlertDismissedAt === null
    ) {
      setAlertFlags(newHighRisk);
    }
  };

  return (
    <main className="ui-container" aria-label="Flagged red flags conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED - Red Flags Detector
      </h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((show) => !show)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={onAnalysisUpdate}
          initialResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={onAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => {
                  // Map each signal type to label and confidence if available
                  // Use defaults if not existing
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
                    label: labelMap[type.toLowerCase()] || type,
                    confidence:
                      typeof analysisResult.confidence === "number"
                        ? analysisResult.confidence
                        : 0,
                  };
                })}
                overallConfidence={
                  typeof analysisResult.confidence === "number"
                    ? analysisResult.confidence
                    : 0
                }
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}

      <ImmediateAlert alertFlags={alertFlags} onDismiss={dismissAlert} />
    </main>
  );
};

export default App;