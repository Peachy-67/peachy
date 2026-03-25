import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "ultimatum",
  "threat",
  "gaslighting",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskAlerts, setHighRiskAlerts] = useState([]);
  const [dashboardMode, setDashboardMode] = useState(false);

  // Handler after each analysis is completed
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);

    if (result && Array.isArray(result.signals)) {
      // Filter high-risk flags from detected signals
      const triggered = result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setHighRiskAlerts(triggered);
    } else {
      setHighRiskAlerts([]);
    }
  }, []);

  // Alert dismissal handler for ImmediateAlert component
  const handleAlertDismiss = useCallback(() => {
    setHighRiskAlerts([]);
  }, []);

  // Toggle between paste input analyzer and real-time dashboard
  const toggleDashboard = useCallback(() => {
    setDashboardMode((prev) => !prev);
    // Clear existing results and alerts on mode toggle for clean slate
    setAnalysisResult(null);
    setHighRiskAlerts([]);
  }, []);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>FLAGGED</h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            onClick={toggleDashboard}
            aria-pressed={dashboardMode}
            aria-label={`Switch to ${dashboardMode ? "conversation paste analysis" : "real-time monitoring dashboard"}`}
            className="peachy-button"
          >
            {dashboardMode ? "Paste Analyzer Mode" : "Real-Time Dashboard Mode"}
          </button>
        </div>
      </header>

      <ImmediateAlert flaggedBehaviors={highRiskAlerts} onDismiss={handleAlertDismiss} />

      {dashboardMode ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysis}
          key="realtime-dashboard"
          aria-label="Real-time conversation monitoring dashboard"
        />
      ) : (
        <section aria-label="Conversation paste analyzer" key="paste-analyzer">
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => {
                  // Map signal to label and confidence in result (confidence fallback 0.7)
                  // For label, capitalize signal
                  return {
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence:
                      Array.isArray(analysisResult.why) && analysisResult.why.length > 0
                        ? 0.7 // show at least 70% confidence if we have reasons
                        : 0.5,
                  };
                })}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </section>
      )}
    </main>
  );
};

export default App;