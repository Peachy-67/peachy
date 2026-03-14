import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alertFlags on new analysisResult to detect high-risk flags
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setAlertFlags([]);
      return;
    }
    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag)
    );
    setAlertFlags(detectedHighRisk);
  }, [analysisResult]);

  // Handler from ConversationAnalyzerPolish when analysis completes
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header>
        <h1
          tabIndex={-1}
          style={{ textAlign: "center", marginBottom: "1rem", color: "#e65b50" }}
        >
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Conversation input and analysis" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
      </section>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        alertMessage="High-risk behavior detected!"
      />

      {analysisResult && (
        <section aria-label="Analysis results" style={{ marginBottom: "2rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              // Map type to label and confidence fallback
              let label = type.charAt(0).toUpperCase() + type.slice(1);
              // Confidence for each signal is unavailable in analysisResult,
              // but we fallback to overall confidence:
              return {
                type,
                label,
                confidence: analysisResult.confidence || 0,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
        </section>
      )}

      {analysisResult && (
        <section aria-label="Share analysis results" style={{ marginBottom: "2rem" }}>
          <ShareableResult analysis={analysisResult} />
        </section>
      )}

      <section aria-label="Real-time conversation monitoring dashboard">
        <button
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          style={{
            marginBottom: "1rem",
            backgroundColor: "#ff6f61",
            border: "none",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(255,111,97,0.6)",
            userSelect: "none",
          }}
        >
          {showDashboard ? "Hide Real-Time Monitoring" : "Show Real-Time Monitoring"}
        </button>

        {showDashboard && (
          <RealTimeDashboard
            onAnalysisUpdate={(result) => setAnalysisResult(result)}
            initialAnalysis={analysisResult}
          />
        )}
      </section>
    </main>
  );
};

export default App;