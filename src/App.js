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
  "discard",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);

  // Update alert flags whenever analysisResult changes
  useEffect(() => {
    if (analysisResult && analysisResult.flags && Array.isArray(analysisResult.flags)) {
      const highRiskDetected = analysisResult.flags.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.type)
      );
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (err) => {
    setError(err || "An unknown error occurred");
  };

  // Toggle between Paste Analyzer and Real-time Dashboard modes
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    setAnalysisResult(null);
    setError(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED - Conversation Red Flag Detector
        </h1>
        <div style={{ margin: "1rem 0", textAlign: "center" }}>
          <button
            className="peachy-button"
            onClick={toggleDashboard}
            aria-pressed={showDashboard}
            aria-label={showDashboard ? "Switch to paste analyzer mode" : "Switch to real-time dashboard mode"}
          >
            {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-time Dashboard"}
          </button>
        </div>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          latestResult={analysisResult}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          latestResult={analysisResult}
        />
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: "#ffe6eb",
            border: "2px solid #ff4d6d",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginTop: "1rem",
            fontWeight: "600",
            color: "#b71c1c",
            textAlign: "center",
            userSelect: "text",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          tabIndex={-1}
        >
          {error}
        </div>
      )}

      {analysisResult && (
        <>
          <ImmediateAlert flags={alertFlags} />
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={(analysisResult.flags || []).map((f) => ({
              type: f.type,
              label: f.label,
              confidence: f.confidence,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;