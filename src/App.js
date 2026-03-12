import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Trigger immediate alert if any high-risk flags appear
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const foundFlags = analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      if (foundFlags.length) {
        setAlertFlags(foundFlags);
        // Native alert for immediate attention
        alert(`⚠️ High-risk behavior detected: ${foundFlags.join(", ")}`);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="container" aria-label="FLAGGED application main interface">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", maxWidth: 450, margin: "0 auto 1rem" }}>
          Detect red flags in conversations and protect yourself from manipulation and harmful behavior.
        </p>
      </header>

      <section aria-label="Conversation analysis section">
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalyze={handleAnalysisUpdate} key="conv-analyzer" />
        )}
        {analysisResult && !showDashboard && (
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: 1, // Confidence not passed so default 100%, can extend when needed
            }))}
            overallConfidence={analysisResult.confidence}
          />
        )}
        {analysisResult && !showDashboard && (
          <ShareableResult analysis={analysisResult} />
        )}
      </section>

      <ImmediateAlert flags={alertFlags} />

      <section aria-label="Real-time monitoring dashboard toggle" style={{ textAlign: "center", marginTop: 30 }}>
        <button
          type="button"
          onClick={() => setShowDashboard(!showDashboard)}
          aria-pressed={showDashboard}
          className="peachy-button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalyze={handleAnalysisUpdate} key="rt-dashboard" />
        </section>
      )}
    </main>
  );
};

export default App;