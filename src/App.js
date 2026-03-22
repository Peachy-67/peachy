import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

/**
 * Main App component integrating primary UI components per product roadmap.
 * - Allows toggling between paste conversation analyzer and real-time dashboard.
 * - Shows immediate alert on high-risk flagged behaviors.
 * - Displays polished flagged result visualization with share options.
 */
const App = () => {
  // State for analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // State tracking active high-risk flags for ImmediateAlert
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  // State for toggling between dashboard and paste analyzer UI
  const [showDashboard, setShowDashboard] = useState(false);

  // Detect high-risk behaviors: 'insult', 'gaslighting', 'threat', 'ultimatum'
  const HIGH_RISK_TYPES = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

  useEffect(() => {
    if (analysisResult?.signals && analysisResult.signals.length) {
      const detectedHighRisk = analysisResult.signals.filter((signal) =>
        HIGH_RISK_TYPES.has(signal)
      );
      setHighRiskFlags(detectedHighRisk);
    } else {
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <h1 style={{ textAlign: "center", color: "#d94f42", userSelect: "none" }}>
        FLAGGED: Conversation Red Flags Detector
      </h1>

      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          onClick={() => setShowDashboard((prev) => !prev)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Conversation Analyzer" : "Switch to Real-time Dashboard"}
        >
          {showDashboard ? "Use Conversation Analyzer" : "Open Real-time Dashboard"}
        </button>
      </div>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {showDashboard ? (
        <RealTimeDashboard
          onUpdateResult={setAnalysisResult}
          aria-label="Real-time conversation monitoring dashboard"
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisComplete={setAnalysisResult}
          aria-label="Conversation analyzer with paste input"
        />
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              analysisResult.signals.map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              })) || []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysisResult={analysisResult}
            conversationExcerpt="" /* We could extend to pass excerpt if desired */
          />
        </>
      )}
    </main>
  );
};

export default App;