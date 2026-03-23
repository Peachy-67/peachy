import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum", "control"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alertFlags whenever analysisResult changes
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      // Immediately display browser alert for high risk
      alert(
        `High-risk behavior detected: ${highRiskDetected
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`
      );
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for ConversationAnalyzerPolish results update
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle realtime dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset analysis and alerts when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <div className="ui-container" tabIndex={-1} aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard}>
            {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-time Dashboard"}
          </button>
        </div>
      </header>

      {!showDashboard && (
        <main aria-label="Conversation analysis interface">
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {alertFlags.length > 0 && <ImmediateAlert flaggedBehaviors={alertFlags} />}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </main>
      )}

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
          {alertFlags.length > 0 && <ImmediateAlert flaggedBehaviors={alertFlags} />}
        </section>
      )}
    </div>
  );
};

export default App;