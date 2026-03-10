import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const DEFAULT_ANALYSIS = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawResult: null,
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(DEFAULT_ANALYSIS);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags based on analysis flaggedBehaviors
  useEffect(() => {
    if (!analysisResult || !analysisResult.flaggedBehaviors) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }
    const highRiskDetected = analysisResult.flaggedBehaviors.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.type.toLowerCase())
    );
    setAlertFlags(highRiskDetected);
    setAlertDismissed(false);
  }, [analysisResult]);

  // Handler for analysis update from conversation analyzer or real-time dashboard
  const handleAnalysisUpdate = (result) => {
    // Expecting result to include verdict(string), flaggedBehaviors(array), overallConfidence(number), rawResult(object)
    if (!result) {
      setAnalysisResult(DEFAULT_ANALYSIS);
      return;
    }
    setAnalysisResult(result);
  };

  // Toggle dashboard view
  const handleToggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
      </header>

      <section aria-label="Conversation analysis section" style={{ marginBottom: "2rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            initialResult={analysisResult.rawResult}
          />
        )}

        {alertFlags.length > 0 && !alertDismissed && (
          <ImmediateAlert
            flaggedBehaviors={alertFlags}
            onDismiss={() => setAlertDismissed(true)}
          />
        )}

        {!showDashboard && analysisResult.rawResult && (
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
          />
        )}

        {!showDashboard && analysisResult.rawResult && (
          <ShareableResult
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
            conversationText={analysisResult.rawResult?.conversationText || ""}
          />
        )}
      </section>

      <section aria-label="Real-time dashboard section" style={{ marginBottom: "2rem" }}>
        <button
          type="button"
          onClick={handleToggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Close Real-Time Dashboard" : "Open Real-Time Dashboard"}
        </button>

        {showDashboard && (
          <RealTimeDashboard
            onAnalysisUpdate={handleAnalysisUpdate}
            initialResult={analysisResult.rawResult}
          />
        )}
      </section>
    </main>
  );
};

export default App;