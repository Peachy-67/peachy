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
  "discard",
  "ultimatum",
  "control",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  
  // Update alerts on flagged behaviors whenever analysis result changes
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const highRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(highRisk);
  }, [analysisResult]);

  // Handler to receive analysis results from ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Toggle real-time dashboard view
  const toggleRealTimeDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff5a3c", userSelect: "none" }}>
        FLAGGED
      </h1>
      <section aria-label="Conversation analyzer section" style={{ marginBottom: "1.5rem" }}>
        {!showRealTimeDashboard && (
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        )}
        <button
          type="button"
          onClick={toggleRealTimeDashboard}
          aria-pressed={showRealTimeDashboard}
          aria-label={showRealTimeDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
          style={{
            marginTop: "1rem",
            backgroundColor: "#ff705a",
            color: "white",
            fontWeight: "600",
            borderRadius: "8px",
            padding: "0.6rem 1.3rem",
            border: "none",
            cursor: "pointer",
            userSelect: "none",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 3px 8px rgba(255, 80, 50, 0.5)",
          }}
        >
          {showRealTimeDashboard ? "Close Real-Time Dashboard" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {showRealTimeDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginBottom: "2rem" }}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <section aria-label="Analysis result visualization and sharing" style={{ marginTop: "1rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((flag) => {
              // Map signals to full labels and confidence if available
              // Provide label format: capitalize first + friendly label
              const labelMap = {
                insult: "Insult",
                manipulation: "Manipulation",
                gaslighting: "Gaslighting",
                discard: "Discard",
                ultimatum: "Ultimatum",
                threat: "Threat",
                control: "Control",
                guilt: "Guilt",
                boundary_push: "Boundary Push",
                inconsistency: "Inconsistency",
              };
              return {
                type: flag,
                label: labelMap[flag] || flag,
                confidence: typeof analysisResult.confidence === "number"
                  ? analysisResult.confidence
                  : 0,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}
    </main>
  );
}

export default App;