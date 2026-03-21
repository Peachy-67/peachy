import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "discard",
  "control",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Whenever analysis result updates, check for high-risk flags and update alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHighRiskFlagsDetected([]);
      return;
    }

    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.toLowerCase())
    );

    setHighRiskFlagsDetected(detectedHighRisk);
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1
          style={{
            textAlign: "center",
            color: "#ff6f3c",
            userSelect: "none",
            marginBottom: "1rem",
          }}
        >
          FLAGGED: Conversation Red Flag Detector
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <button
            type="button"
            onClick={() => setShowDashboard((v) => !v)}
            aria-pressed={showDashboard}
            aria-label={
              showDashboard
                ? "Switch to conversation analyzer paste mode"
                : "Switch to real-time dashboard mode"
            }
            style={{
              backgroundColor: "#ff6f3c",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(255,111,97,0.6)",
              userSelect: "none",
            }}
          >
            {showDashboard ? "Paste Analyzer Mode" : "Real-Time Dashboard Mode"}
          </button>
        </div>
      </header>

      <ImmediateAlert flags={highRiskFlagsDetected} />

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysisComplete={setAnalysisResult} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence,
                }))}
                overallConfidence={analysisResult.confidence}
              />

              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      ) : (
        <RealTimeDashboard onAnalysisUpdate={setAnalysisResult} />
      )}
    </main>
  );
};

export default App;