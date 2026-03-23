import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "discard"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [immediateAlerts, setImmediateAlerts] = useState([]);
  const [dashboardActive, setDashboardActive] = useState(false);

  // Trigger immediate alert for high-risk flags in the latest result
  useEffect(() => {
    if (!analysisResult) {
      setImmediateAlerts([]);
      return;
    }

    const highRiskDetected = analysisResult.signals.filter((signal) =>
      HIGH_RISK_FLAGS.includes(signal)
    );
    setImmediateAlerts(highRiskDetected);

    // Also trigger native alert for immediate notification
    if (highRiskDetected.length > 0) {
      const alertMessage = `⚠️ High-risk flags detected: ${highRiskDetected.join(", ")}`;
      // Use setTimeout to avoid blocking React rendering
      setTimeout(() => {
        alert(alertMessage);
      }, 100);
    }
  }, [analysisResult]);

  const handleAnalyze = (result) => {
    setAnalysisResult(result);
  };

  const toggleDashboard = () => {
    setDashboardActive((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={dashboardActive}
        aria-label={dashboardActive ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        style={{
          marginBottom: "1rem",
          backgroundColor: dashboardActive ? "#ff4d6d" : "#ff6f61",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "none",
          fontWeight: "700",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          userSelect: "none",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "300px",
        }}
      >
        {dashboardActive ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {dashboardActive ? (
        <RealTimeDashboard onAnalyze={handleAnalyze} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} />
          {immediateAlerts.length > 0 && <ImmediateAlert flaggedBehaviors={immediateAlerts} />}
          {analysisResult && (
            <section aria-label="Analysis results and sharing section" style={{ marginTop: "1rem" }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => {
                  // For labels, capitalize first letter and replace underscores if any
                  const label = signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " ");
                  // Confidence not supplied here, fallback 0.9 for demo
                  return { type: signal, label, confidence: 0.9 };
                })}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysis={analysisResult} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;