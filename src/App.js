import React, { useState, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
];

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const flaggedBehaviors = analysisResult?.signals?.map((type) => {
    // Map to label for display
    // Use a short label capitalized, fallback type if unknown
    const labelMap = {
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
    const label = labelMap[type.toLowerCase()] || type;
    // Confidence is unknown here, fallback to 0.75
    return {
      type,
      label,
      confidence: 0.75,
    };
  }) || [];

  // Compute verdict for visualization component from analysisResult.verdict
  const verdict =
    analysisResult && analysisResult.verdict
      ? (() => {
          switch (analysisResult.verdict.band) {
            case "green":
              return "Safe";
            case "yellow":
              return "Caution";
            case "red":
              return "Flagged";
            default:
              return "Safe";
          }
        })()
      : "Safe";

  const overallConfidence =
    analysisResult?.confidence !== undefined ? analysisResult.confidence : 0;

  // Derive if high risk flags are present
  const hasHighRiskFlag =
    flaggedBehaviors.some((flag) => HIGH_RISK_FLAGS.includes(flag.type)) &&
    !alertDismissed;

  // Reset alert dismiss on new analysis
  const onNewAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setAlertDismissed(false);
  }, []);

  // Toggle between paste analyzer and real-time dashboard modes
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Reset alert dismissed on mode switch
    setAlertDismissed(false);
  };

  // Handle dismiss alert
  const onDismissAlert = () => {
    setAlertDismissed(true);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
        >
          {showDashboard ? "Back to Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={onNewAnalysis}
          initialResult={analysisResult}
        />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={onNewAnalysis} />
      )}

      {hasHighRiskFlag && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={onDismissAlert} />
      )}

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
            conversation={analysisResult?.meta?.conversationExcerpt || ""}
          />
        </>
      )}
    </main>
  );
}

export default App;