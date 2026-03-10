import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Define which flags are considered high risk for immediate alert
  const highRiskFlagTypes = new Set([
    "insult",
    "gaslighting",
    "threat",
    "discard",
    "control",
  ]);

  // When analysisResult updates, check for high-risk flags
  useEffect(() => {
    if (analysisResult && analysisResult.flaggedBehaviors) {
      const highRiskDetected = analysisResult.flaggedBehaviors.filter((flag) =>
        highRiskFlagTypes.has(flag.type.toLowerCase())
      );
      if (highRiskDetected.length > 0) {
        setHighRiskFlags(highRiskDetected);
        setAlertVisible(true);
      } else {
        setHighRiskFlags([]);
        setAlertVisible(false);
      }
    } else {
      setHighRiskFlags([]);
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Handler to dismiss alert banner
  const onDismissAlert = () => {
    setAlertVisible(false);
  };

  // Handler for new analysis result from conversation analyzer
  const handleAnalysis = (result) => {
    // Expected result shape:
    // {
    //   verdict: 'Safe' | 'Caution' | 'Flagged',
    //   flaggedBehaviors: [{ type, label, confidence }, ...],
    //   overallConfidence: number (0-1)
    // }
    setAnalysisResult(result);
  };

  // Toggle dashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="container" role="main" aria-labelledby="app-title">
      <h1 id="app-title" style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      {/* Immediate alert banner */}
      {alertVisible && highRiskFlags.length > 0 && (
        <ImmediateAlert flags={highRiskFlags} onDismiss={onDismissAlert} />
      )}

      {/* Conversation Analyzer Input / Result */}
      <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysis} />

      {/* Show flagged result visualization with share if result is available */}
      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.overallConfidence}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}

      {/* Toggle real-time dashboard section */}
      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: 32, textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-controls="real-time-dashboard"
          aria-expanded={showDashboard}
        >
          {showDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>
        {showDashboard && <RealTimeDashboard id="real-time-dashboard" />}
      </section>
    </main>
  );
};

export default App;