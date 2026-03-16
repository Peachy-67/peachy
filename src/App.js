import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const App = () => {
  // State for the main analysis result from ConversationAnalyzerPolish
  const [analysisResult, setAnalysisResult] = useState(null);

  // State for immediate alert dismiss
  const [alertDismissed, setAlertDismissed] = useState(false);

  // State to toggle real-time dashboard view
  const [showDashboard, setShowDashboard] = useState(false);

  // Derived flaggedBehaviors from analysis signals
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    // Map known signals to consistent labels and confidence
    // Use 0.75 as default confidence if missing from analysisResult
    return analysisResult.signals.map((signal) => {
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

      // Confidence fallback as analysis confidence (0-1) or 0.75 default
      const confidence = analysisResult.confidence ?? 0.75;

      return {
        type: signal,
        label: labelMap[signal] || signal,
        confidence,
      };
    });
  }, [analysisResult]);

  // Determine verdict string for FlaggedResultVisualization per roadmap enums
  const verdictLabelMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdict = analysisResult?.verdict?.band
    ? verdictLabelMap[analysisResult.verdict.band] || "Safe"
    : "Safe";

  // Function to handle new analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) return;
    setAnalysisResult(result);
    setAlertDismissed(false);
  };

  // High-risk flags for ImmediateAlert trigger
  const highRiskFlags = ["threat", "ultimatum", "discard", "control", "gaslighting"];

  // Determine if any high-risk flags are detected
  const hasHighRiskFlag = flaggedBehaviors.some((flag) =>
    highRiskFlags.includes(flag.type.toLowerCase())
  );

  return (
    <main className="ui-container" aria-label="Flagged Red Flag Detection Application">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1>FLAGGED Conversation Red Flag Detector</h1>
        <button
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={`${showDashboard ? "Hide" : "Show"} Real-time Dashboard`}
          style={{ marginTop: "0.5rem" }}
        >
          {showDashboard ? "Hide" : "Show"} Real-time Dashboard
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <ImmediateAlert
                flaggedBehaviors={flaggedBehaviors}
                dismissed={alertDismissed}
                onDismiss={() => setAlertDismissed(true)}
              />
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;