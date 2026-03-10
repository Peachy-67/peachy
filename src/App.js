import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main application component integrating:
 * - Conversation Analyzer with polished UI
 * - Immediate alert notification on high-risk flags
 * - Flagged result visualization with confidence and badges
 * - Shareable results component
 * - Real-time monitoring dashboard toggle
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flags considered high-risk for immediate alert
  // We consider signals: insult, gaslighting, discard, control as high risk
  const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "discard", "control"]);

  // Check if any high-risk signals are present in the current result
  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const flaggedSignals = analysisResult.signals || [];
    const highRiskFound = flaggedSignals.filter((s) => HIGH_RISK_FLAGS.has(s));
    if (highRiskFound.length > 0) {
      setAlertFlags(highRiskFound);
      setShowAlert(true);
      // Native alert popup for immediate notification
      alert(
        `⚠️ High-risk behaviors detected: ${highRiskFound.join(", ")}\nPlease review the flagged conversation result.`
      );
    } else {
      setAlertFlags([]);
      setShowAlert(false);
    }
  }, [analysisResult]);

  // Handler for new analysis results from analyzer
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    // When analysis is performed manually, dashboard should hide to focus on static results
    setShowDashboard(false);
  };

  // Handler to toggle real-time dashboard
  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setShowAlert(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      <button
        type="button"
        aria-pressed={showDashboard}
        onClick={handleToggleDashboard}
        className="peachy-button"
        style={{ marginBottom: "1rem" }}
      >
        {showDashboard ? "Stop Real-Time Monitoring" : "Start Real-Time Monitoring"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={setAnalysisResult} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />

          {showAlert && alertFlags.length > 0 && (
            <ImmediateAlert
              flaggedBehaviors={alertFlags.map((flag) => ({ type: flag, label: flag.charAt(0).toUpperCase() + flag.slice(1) }))}
              onDismiss={() => setShowAlert(false)}
            />
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label === "Safe" ? "Safe" : analysisResult.verdict.label === "Caution" ? "Caution" : "Flagged"}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0.5,
                }))}
                overallConfidence={analysisResult.confidence || 0}
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