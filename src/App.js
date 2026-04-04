import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [viewDashboard, setViewDashboard] = useState(false);
  const [error, setError] = useState(null);

  // Detect high risk flags for alert triggering
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const detectedHighRisks = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag)
      );
      if (detectedHighRisks.length) {
        setHighRiskFlags(detectedHighRisks);
        setAlertDismissed(false);
      } else {
        setHighRiskFlags([]);
        setAlertDismissed(false);
      }
    } else {
      setHighRiskFlags([]);
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  // Handles analysis result update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setError(null);
    setAnalysisResult(result);
  };

  // Handles errors from analyzer components
  const handleError = (errMsg) => {
    setError(errMsg);
    setAnalysisResult(null);
  };

  // Dismiss alert banner
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Toggle between ConversationAnalyzerPolish and RealTimeDashboard views
  const toggleDashboardView = () => {
    setViewDashboard((prev) => !prev);
    setError(null);
    setAnalysisResult(null);
    setHighRiskFlags([]);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" role="main">
      <h1
        tabIndex={-1}
        className="ui-section-header"
        aria-label="FLAGGED conversation analysis app"
      >
        FLAGGED: Detect Red Flags in Conversations
      </h1>

      <section aria-label="Application controls" className="ui-section-controls" style={{textAlign: "center", marginBottom: '1rem'}}>
        <button
          onClick={toggleDashboardView}
          type="button"
          aria-pressed={viewDashboard}
          aria-label={viewDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
          className="peachy-button"
        >
          {viewDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {viewDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
        />
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
        >
          {error}
        </div>
      )}

      {highRiskFlags.length > 0 && !alertDismissed && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlags}
          onDismiss={dismissAlert}
        />
      )}

      {analysisResult && !viewDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label || "Safe"}
            flaggedBehaviors={
              analysisResult.signals.map((sig) => ({
                type: sig,
                label: sig.charAt(0).toUpperCase() + sig.slice(1).replace(/_/g, " "),
                confidence: 0.8, // placeholder, no confidence in state, could improve later
              })) || []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;