import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  // Extract flagged behaviors with labels and confidence for visualization
  const flaggedBehaviors = analysisResult?.signals?.map((signal) => {
    // Map signal to label and type for badges
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
      type: signal,
      label: labelMap[signal] || signal,
      confidence: analysisResult.confidence ?? 0,
    };
  }) || [];

  // Decide overall verdict label for FlaggedResultVisualization
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdictLabel = analysisResult?.verdict?.band ? verdictMap[analysisResult.verdict.band] : "Safe";

  // Extract confidence score for display
  const overallConfidence = analysisResult?.confidence || 0;

  // Immediate Alert triggers when any high-risk flags detected
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      setAlertVisible(false);
      return;
    }
    const detectedHighRisk = analysisResult.signals.filter((sig) => HIGH_RISK_FLAGS.has(sig));
    if (detectedHighRisk.length > 0) {
      setAlertFlags(detectedHighRisk);
      setAlertVisible(true);
      // Also immediate native alert popup
      const labels = detectedHighRisk.map(
        (sig) =>
          ({
            insult: "Insult",
            gaslighting: "Gaslighting",
            threat: "Threat",
            ultimatum: "Ultimatum",
          }[sig] || sig)
      );
      alert(`⚠️ High-risk behavior detected: ${labels.join(", ")}`);
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Handle analysis from ConversationAnalyzerPolish component
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    if (showDashboard && result) {
      // optionally update if dashboard needs
    }
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear analysis and alerts when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED Conversation Red Flag Detector</h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        style={{marginBottom: "1rem"}}
      >
        {showDashboard ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {alertVisible && alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={() => setAlertVisible(false)} />
      )}

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisComplete} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      ) : (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisComplete}
          alertFlags={alertFlags}
          alertVisible={alertVisible}
          onAlertDismiss={() => setAlertVisible(false)}
        />
      )}
    </main>
  );
};

export default App;