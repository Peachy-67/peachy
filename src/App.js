import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/ImmediateAlert.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "ultimatum",
  "gaslighting",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Detect high-risk signals for alerts
  const highRiskFlags = React.useMemo(() => {
    if (!analysisResult?.signals) return [];
    return analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
  }, [analysisResult]);

  // Reset alert dismissed when new high-risk flags appear
  useEffect(() => {
    if (highRiskFlags.length > 0) {
      setAlertDismissed(false);
    }
  }, [highRiskFlags]);

  // Handler for conversation analysis results update
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between paste input analyzer and real-time dashboard
  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear previous result and alert on toggle
    setAnalysisResult(null);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header aria-label="App header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1>FLAGGED</h1>
        <p style={{ color: "#cc2f2f", fontWeight: "600" }}>
          Detect behavioral red flags in conversations
        </p>
        <button
          type="button"
          onClick={handleToggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste analyzer mode" : "Switch to real-time dashboard mode"}
          style={{ marginTop: "0.8rem" }}
        >
          {showDashboard ? "Paste Analyzer Mode" : "Real-Time Dashboard Mode"}
        </button>
      </header>

      {/* Alert for high-risk flags */}
      {highRiskFlags.length > 0 && !alertDismissed && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlags}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* Real-Time Dashboard Mode */}
      {showDashboard ? (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
        </section>
      ) : (
        // Paste Input Analyzer Mode
        <section aria-label="Paste conversation analyzer">
          <ConversationAnalyzerPolish onAnalysisResult={handleAnalysisUpdate} />
        </section>
      )}

      {/* Result Visualization and Share (only show when analysis available and not in real-time dashboard) */}
      {analysisResult && !showDashboard && (
        <section
          aria-label="Analysis result"
          tabIndex={-1}
          style={{ marginTop: "1.75rem" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult resultData={analysisResult} />
        </section>
      )}
    </main>
  );
};

export default App;