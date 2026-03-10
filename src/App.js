import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Update immediate alert flags when analysisResult changes
  useEffect(() => {
    if (
      analysisResult &&
      Array.isArray(analysisResult.signals) &&
      analysisResult.signals.length > 0
    ) {
      // We consider only high-risk signals for alert: insult, gaslighting, discard, control, threat, ultimatum
      const highRiskFlags = [
        "insult",
        "gaslighting",
        "discard",
        "control",
        "threat",
        "ultimatum",
        "manipulation",
      ];

      const detectedHighRisk = analysisResult.signals.filter((flag) =>
        highRiskFlags.includes(flag)
      );
      setImmediateAlertFlags(detectedHighRisk);
    } else {
      setImmediateAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis data from ConversationAnalyzerPolish or RealTimeDashboard manual analyze
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="container" role="main" aria-label="FLAGGED red flag conversation analysis app">
      <h1 style={{ textAlign: "center", userSelect: "none" }}>FLAGGED 🚩</h1>

      <ImmediateAlert flaggedBehaviors={immediateAlertFlags} />

      <section aria-labelledby="analyzer-heading">
        <h2 id="analyzer-heading" className="ui-section-header">
          Analyze Conversation
        </h2>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {analysisResult && (
        <section aria-labelledby="result-heading" style={{ marginTop: "2rem" }}>
          <h2 id="result-heading" className="ui-section-header">
            Analysis Result
          </h2>
          <FlaggedResultVisualization
            verdict={
              analysisResult.verdict?.label ||
              (analysisResult.verdict && analysisResult.verdict.band === "red"
                ? "Flagged"
                : "Safe")
            }
            flaggedBehaviors={analysisResult.signals?.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: 1, // Confidence scores not exposed per signal here; 1 as fallback
            })) || []}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}

      <section
        aria-labelledby="realtime-dashboard-heading"
        style={{ marginTop: "3rem", textAlign: "center" }}
      >
        <button
          type="button"
          className="share-button"
          onClick={() => setShowRealTimeDashboard(!showRealTimeDashboard)}
          aria-pressed={showRealTimeDashboard}
        >
          {showRealTimeDashboard ? "Hide" : "Show"} Real-time Dashboard
        </button>

        {showRealTimeDashboard && (
          <div style={{ marginTop: "1rem" }}>
            <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
          </div>
        )}
      </section>
    </main>
  );
};

export default App;