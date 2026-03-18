import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
  "discard",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskDetected, setHighRiskDetected] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Update high risk detection and reset alert dismissal on analysis changes
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const hasHighRisk = analysisResult.signals.some((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setHighRiskDetected(hasHighRisk);
      if (hasHighRisk) {
        setAlertDismissed(false); // Show alert when new high-risk flags found
      }
    } else {
      setHighRiskDetected(false);
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  // Handler passed to analyzer on new result
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Alert dismiss handler
  const handleAlertDismiss = useCallback(() => {
    setAlertDismissed(true);
  }, []);

  // Compose alert message text for immediate alert banner
  const alertMessage = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return null;
    const highRisks = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    if (highRisks.length === 0) return null;
    // Create label summary for alert
    const uniqueFlags = [...new Set(highRisks)];
    return `High-risk red flags detected: ${uniqueFlags
      .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
      .join(", ")}.`;
  }, [analysisResult]);

  // Toggle between real-time dashboard and single analysis mode
  const toggleRealTimeMode = useCallback(() => {
    setRealTimeMode((cur) => !cur);
    // Reset alert state and result when toggling mode
    setAlertDismissed(false);
    setAnalysisResult(null);
  }, []);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1
          tabIndex={-1}
          style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}
        >
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", userSelect: "none" }}>
          Detect red flags in conversations, identify manipulation and gaslighting
        </p>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={toggleRealTimeMode}
            className="peachy-button"
            aria-pressed={realTimeMode}
            aria-label={`Switch to ${realTimeMode ? "paste input analyzer mode" : "real-time dashboard mode"}`}
          >
            {realTimeMode ? "Use Paste Input Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {highRiskDetected && !alertDismissed && alertMessage && (
        <ImmediateAlert message={alertMessage} onDismiss={handleAlertDismiss} />
      )}

      {realTimeMode ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals?.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0,
                })) || []}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;