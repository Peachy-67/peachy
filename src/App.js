import React, { useState, useEffect } from "react";

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
]);

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Update alert flags when analysis changes
  useEffect(() => {
    if (analysis && Array.isArray(analysis.signals)) {
      const highRiskDetected = analysis.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysis]);

  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation red-flag detection app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", color: "#666", fontWeight: 500 }}>
          Detect behavioral red flags in conversations
        </p>
      </header>

      {/* Immediate alerts on high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Toggle between Conversation Analyzer or Real-Time Dashboard */}
      <div style={{ textAlign: "center", margin: "1rem 0" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={showDashboard ? "Switch to conversation analyzer view" : "Switch to real-time dashboard view"}
        >
          {showDashboard ? "Use Conversation Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={analysis.signals?.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysis.confidence || 0,
                })) || []}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;