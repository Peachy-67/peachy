import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags when new analysisResult received
  useEffect(() => {
    if (analysisResult && analysisResult.flaggedBehaviors) {
      const flagged = analysisResult.flaggedBehaviors.map((f) => f.type);
      const highRiskDetected = flagged.filter((flag) => highRiskFlags.has(flag));

      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to update analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Prepare flaggedBehaviors prop for FlaggedResultVisualization:
  // Expect array of objects with {type, label, confidence}
  // Map from signals array with confidence if available
  const flaggedBehaviors = analysisResult?.flaggedBehaviors || [];

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <h1 className="app-title" tabIndex="-1">
        Flagged: Conversation Red Flags Detector
      </h1>

      <section aria-label="Mode selector" className="mode-toggle-section" style={{ textAlign: "center", margin: "1rem 0" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard(false)}
          aria-pressed={!showDashboard}
          aria-label="Paste conversation analyzer mode"
          style={{ marginRight: "1rem" }}
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard(true)}
          aria-pressed={showDashboard}
          aria-label="Real-time monitoring dashboard mode"
        >
          Real-Time Dashboard
        </button>
      </section>

      {!showDashboard && (
        <section aria-label="Conversation input analyzer" className="analyzer-section" tabIndex={-1}>
          <ConversationAnalyzerPolish onAnalysis={onAnalysisUpdate} />
        </section>
      )}

      {showDashboard && (
        <section aria-label="Real-time monitoring dashboard" className="dashboard-section" tabIndex={-1}>
          <RealTimeDashboard onAnalysis={onAnalysisUpdate} />
        </section>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <section aria-label="Flagged result summary and sharing" className="results-share-section" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict || "Safe"}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}
    </main>
  );
};

export default App;