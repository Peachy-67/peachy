import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "control",
  "ultimatum",
  "threat",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // When analysis result changes, update alert flags if any high-risk flags detected
  useEffect(() => {
    setAlertDismissed(false);
    if (
      analysisResult &&
      Array.isArray(analysisResult.signals) &&
      analysisResult.signals.some((flag) => HIGH_RISK_FLAGS.has(flag))
    ) {
      setAlertFlags(
        analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag))
      );
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to dismiss alert
  const onDismissAlert = () => {
    setAlertDismissed(true);
  };

  // Handler when conversation analysis completes with result
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setAlertDismissed(false);
  };

  // Toggle between conversation analyzer and live real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    setAnalysisResult(null);
    setAlertFlags([]);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation detector app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED &#8211; Conversation Red Flags Detector
      </h1>

      <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
        <button
          className="peachy-button"
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to conversation paste analyzer"
              : "Switch to real-time monitoring dashboard"
          }
        >
          {showDashboard ? "Paste Conversation to Analyze" : "Open Real-time Dashboard"}
        </button>
      </div>

      {alertFlags.length > 0 && !alertDismissed && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
      )}

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onComplete={handleAnalysisComplete} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => {
                  // We provide a label and confidence if available
                  // Map some type aliases to label for display; basic label fallback to capitalized type
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
                  return {
                    type,
                    label: labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
                    confidence: 0.75, // placeholder confidence for visualization when API confidence per flag unavailable
                  };
                })}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals}
                confidence={analysisResult.confidence}
                conversationExcerpt={analysisResult.why?.[0] || ""}
              />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysisResult={(result) => {
            setAnalysisResult(result);
            setAlertDismissed(false);
          }}
        />
      )}
    </main>
  );
};

export default App;