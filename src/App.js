import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

function App() {
  // Analysis result state structure:
  // {
  //   verdict: 'Safe' | 'Caution' | 'Flagged',
  //   flaggedBehaviors: [{type, label, confidence}, ...],
  //   overallConfidence: number,
  // }
  const [analysisResult, setAnalysisResult] = useState(null);

  // Alert flags state (immediate alert)
  // We consider alert triggered if any flagged behavior's confidence > threshold and type in high risk.
  const [alertFlags, setAlertFlags] = useState([]);

  // Show/hide real-time dashboard toggler
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Handler to update analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    // Detect high-risk flags for immediate alert:
    // Consider any flags with confidence >= 0.7 as high risk
    // and types that are serious red flags.
    const highRiskTypes = new Set([
      "insult",
      "manipulation",
      "gaslighting",
      "discard",
      "control",
      "ultimatum",
      "threat",
    ]);

    if (result?.flaggedBehaviors && result.flaggedBehaviors.length > 0) {
      const detectedHighRisk = result.flaggedBehaviors.filter(
        (flag) => flag.confidence >= 0.7 && highRiskTypes.has(flag.type.toLowerCase())
      );
      setAlertFlags(detectedHighRisk);
    } else {
      setAlertFlags([]);
    }
  };

  // Callback for alert dismissal to clear alert flags
  const handleDismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle real-time dashboard display
  const toggleDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
    // Reset analysis result to clear UI when switching modes
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header role="banner" aria-label="App header" style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ marginTop: 0, fontWeight: "600", color: "#cc3d2c" }}>
          Detect red flags in conversations and spot manipulation or harmful behavior
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showRealTimeDashboard}
          aria-label={showRealTimeDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          style={{ marginTop: "0.5rem" }}
        >
          {showRealTimeDashboard ? "Use Conversation Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <section aria-label="Conversation analysis section">
        {!showRealTimeDashboard && (
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            key="paste-analyzer"
          />
        )}
        {showRealTimeDashboard && (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            key="real-time-dashboard"
          />
        )}
      </section>

      <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />

      <section
        aria-label="Analysis result section"
        style={{ marginTop: "1.5rem", display: analysisResult ? "block" : "none" }}
      >
        {analysisResult && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
            />
            <ShareableResult result={analysisResult} />
          </>
        )}
      </section>
    </main>
  );
}

export default App;