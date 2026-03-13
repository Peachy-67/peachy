import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "threat", "gaslighting", "discard", "control", "ultimatum"];

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags on new analysis results containing high-risk signals
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((sig) =>
      HIGH_RISK_FLAGS.includes(sig.toLowerCase())
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler when conversation analyzed from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between analyzer + result view and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((show) => !show);
    // Clear current results and alerts when switching mode
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="container" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1>FLAGGED</h1>
        <p style={{ color: "#cc2f2f", fontWeight: "600" }}>Detect red flags in conversations</p>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          style={{
            marginTop: "12px",
            backgroundColor: "#ff6f61",
            border: "none",
            borderRadius: "6px",
            padding: "0.55rem 1.3rem",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 3px 7px rgba(255,111,97,0.7)",
            fontWeight: "600",
            fontSize: "1rem",
            userSelect: "none",
            transition: "background-color 0.25s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e65b50")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ff6f61")}
        >
          {showDashboard ? "Back to Analyzer" : "Go to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: 1,
                }))}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} flaggedBehaviors={alertFlags} />
      )}
    </main>
  );
}

export default App;