import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  // State for the latest analysis result
  const [analysisResult, setAnalysisResult] = useState(null);

  // State to track if the dashboard real-time view is active
  const [showDashboard, setShowDashboard] = useState(false);

  // State to track if immediate alert banner is dismissed
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Extract relevant flags to trigger alerts
  const highRiskFlags = ["insult", "gaslighting", "threat", "discard", "control"];
  const alertedFlags = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    return analysisResult.signals.filter((flag) => highRiskFlags.includes(flag));
  }, [analysisResult]);

  // Handler when a new analysis is completed
  const handleAnalyze = (result) => {
    setAlertDismissed(false);
    setAnalysisResult(result);
  };

  // Handler to dismiss alert banner
  const handleDismissAlert = () => {
    setAlertDismissed(true);
  };

  return (
    <main className="container" aria-label="Flagged conversation analysis application">
      <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Conversation Analyzer
      </h1>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} />
          {analysisResult && (
            <>
              <ImmediateAlert
                flaggedBehaviors={alertedFlags}
                onDismiss={handleDismissAlert}
                visible={!alertDismissed && alertedFlags.length > 0}
              />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={(analysisResult.signals || []).map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
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
        <RealTimeDashboard
          onAnalyze={handleAnalyze}
          analysisResult={analysisResult}
          highRiskFlags={highRiskFlags}
        />
      )}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((prev) => !prev)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>
    </main>
  );
};

export default App;