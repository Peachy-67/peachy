import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
  "discard",
]);

const initialResultState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawResponse: null,
  conversation: "",
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(initialResultState);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Handler when analysis completes
  const onAnalysisComplete = useCallback((result, conversationText) => {
    // Prepare flaggedBehaviors array compatible with FlaggedResultVisualization
    // Map signals from result.signals to label & confidence if available
    const flags = (result.signals || []).map((signal) => {
      let label = signal.charAt(0).toUpperCase() + signal.slice(1);
      // Some labels might need mapping to friendlier names
      if (signal === "guilt") label = "Manipulation";
      if (signal === "border_push") label = "Boundary Push";
      if (signal === "inconsistency") label = "Inconsistency";
      if (signal === "ultimatum") label = "Ultimatum";
      if (signal === "threat") label = "Threat";

      // Confidence fallback to result.confidence if no per-flag confidence exists
      return {
        type: signal,
        label,
        confidence: result.confidence || 0,
      };
    });

    // Derive verdict string: map from band to capitalized label
    const verdictMap = {
      green: "Safe",
      yellow: "Caution",
      red: "Flagged",
    };
    const verdictLabel = (result.verdict?.band && verdictMap[result.verdict.band]) || "Safe";

    setAnalysisResult({
      verdict: verdictLabel,
      flaggedBehaviors: flags,
      overallConfidence: result.confidence || 0,
      rawResponse: result,
      conversation: conversationText,
    });

    // Check if any high risk flags exist
    const highRiskDetected = flags.some((f) => HIGH_RISK_FLAGS.has(f.type.toLowerCase()));
    if (highRiskDetected) {
      setAlertFlags(flags.filter((f) => HIGH_RISK_FLAGS.has(f.type.toLowerCase())));
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, []);

  // Close alert manually
  const onDismissAlert = () => {
    setShowAlert(false);
  };

  // Toggle between paste input analyzer and real-time dashboard
  const toggleRealTimeMode = () => {
    setRealTimeMode((prev) => !prev);
    setShowAlert(false);
    setAnalysisResult(initialResultState);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Red Flag Detector Application">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>FLAGGED Conversation Analyzer</h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={toggleRealTimeMode}
            className="peachy-button"
            aria-pressed={realTimeMode}
            aria-label={realTimeMode ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          >
            {realTimeMode ? "Paste Analyzer Mode" : "Real-Time Dashboard Mode"}
          </button>
        </div>
      </header>

      {showAlert && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
      )}

      {!realTimeMode && (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={onAnalysisComplete} />
          {analysisResult.rawResponse && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
                conversation={analysisResult.conversation}
              />
            </>
          )}
        </>
      )}

      {realTimeMode && (
        <RealTimeDashboard
          onAnalysisComplete={onAnalysisComplete}
          flaggedBehaviors={analysisResult.flaggedBehaviors}
          verdict={analysisResult.verdict}
          overallConfidence={analysisResult.overallConfidence}
        />
      )}
    </main>
  );
};

export default App;