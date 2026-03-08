import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "control"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskDetected, setHighRiskDetected] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Handler to update analysis result from analyzer or real-time dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    const hasHighRiskFlag = result?.signals?.some((flag) =>
      HIGH_RISK_FLAGS.includes(flag)
    );

    setHighRiskDetected(hasHighRiskFlag);
    if (hasHighRiskFlag) {
      setAlertDismissed(false);
    }
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Compose flaggedBehaviors data for visualization from signals
  // Map known signals to human-readable labels
  const flagTypeLabels = {
    insult: "Insult",
    manipulation: "Manipulation",
    gaslighting: "Gaslighting",
    discard: "Discard",
    control: "Control",
    ultimatum: "Ultimatum",
    threat: "Threat",
    guilt: "Guilt",
    boundary_push: "Boundary Push",
    inconsistency: "Inconsistency",
  };

  const flaggedBehaviors = (analysisResult?.signals || []).map((sig) => ({
    type: sig,
    label: flagTypeLabels[sig] || sig,
    confidence:
      analysisResult?.confidence !== undefined && analysisResult?.confidence !== null
        ? analysisResult.confidence
        : 0.5,
  }));

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation analyzer">
      <h1>FLAGGED</h1>

      <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />

      {highRiskDetected && !alertDismissed && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={dismissAlert} />
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult
            result={analysisResult}
            flaggedBehaviors={flaggedBehaviors}
            verdict={analysisResult.verdict?.label || "Safe"}
          />
        </>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <RealTimeDashboard onAnalysisComplete={handleAnalysisUpdate} />
    </main>
  );
};

export default App;