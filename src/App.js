import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "threat", "gaslighting", "ultimatum"]);

const verdictMap = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

const App = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [realtimeMode, setRealtimeMode] = useState(false);

  // Determine if any high-risk flag is present to show alert
  useEffect(() => {
    if (currentAnalysis && currentAnalysis.signals) {
      const highRiskDetected = currentAnalysis.signals.filter((sig) => HIGH_RISK_FLAGS.has(sig));
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [currentAnalysis]);

  // Handler when analysis is done in ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (analysis) => {
    setCurrentAnalysis(analysis);
  };

  // Toggle real-time dashboard mode
  const toggleRealtime = () => {
    setRealtimeMode((v) => !v);
    setCurrentAnalysis(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector app main interface">
      <h1 tabIndex={-1} style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", gap: "1rem" }}>
        <button
          type="button"
          onClick={toggleRealtime}
          aria-pressed={realtimeMode}
          className="peachy-button"
          aria-label={realtimeMode ? "Switch to paste conversation analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {realtimeMode ? "Paste Conversation Analyze" : "Real-Time Dashboard"}
        </button>
      </div>

      {/* Immediate alert of high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Conditional render either real-time dashboard or paste analyzer */}
      {realtimeMode ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {/* Show results visualization and sharing for completed analysis */}
      {currentAnalysis && (
        <section
          aria-label="Analysis results"
          style={{ marginTop: "1.5rem", textAlign: "center", userSelect: "text" }}
        >
          <FlaggedResultVisualization
            verdict={verdictMap[currentAnalysis.verdict?.band] || "Safe"}
            flaggedBehaviors={currentAnalysis.signals.map((sig) => {
              // Provide a label for the behavior for better human readability
              let label = sig.charAt(0).toUpperCase() + sig.slice(1).replace(/_/g, " ");
              // Some signals might have alternate label mapping
              if (sig === "ultimatum") label = "Ultimatum";
              if (sig === "threat") label = "Threat";
              if (sig === "boundary_push") label = "Boundary Push";
              if (sig === "guilt") label = "Guilt-tripping";
              return { type: sig, label, confidence: currentAnalysis.confidence || 0 };
            })}
            overallConfidence={currentAnalysis.confidence || 0}
          />
          <ShareableResult analysis={currentAnalysis} />
        </section>
      )}
    </main>
  );
};

export default App;