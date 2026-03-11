import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Handle new analysis updates
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);

    if (result && result.signals) {
      const foundHighRisk = result.signals.filter((signal) => HIGH_RISK_FLAGS.has(signal));
      setHighRiskFlags(foundHighRisk);
      if (foundHighRisk.length > 0) setShowAlert(true);
      else setShowAlert(false);
    } else {
      setHighRiskFlags([]);
      setShowAlert(false);
    }
  }, []);

  // Dismiss alert banner
  const dismissAlert = () => setShowAlert(false);

  // Toggle real time dashboard mode
  const toggleRealTime = () => setRealTimeMode((prev) => !prev);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
      <button
        type="button"
        onClick={toggleRealTime}
        aria-pressed={realTimeMode}
        aria-label={`${realTimeMode ? "Disable" : "Enable"} real-time dashboard`}
        style={{
          display: "block",
          margin: "0.5rem auto 1rem",
          padding: "0.5rem 1rem",
          fontWeight: "600",
          borderRadius: 6,
          border: "2px solid #cc2f2f",
          backgroundColor: realTimeMode ? "#cc2f2f" : "transparent",
          color: realTimeMode ? "#fff" : "#cc2f2f",
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.25s ease",
        }}
      >
        {realTimeMode ? "Disable Real-Time Dashboard" : "Enable Real-Time Dashboard"}
      </button>

      <ImmediateAlert flags={highRiskFlags} show={showAlert} onDismiss={dismissAlert} />

      {!realTimeMode && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />
          {analysisResult && (
            <section aria-label="Analysis results" style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: 0.8, // Confidence per individual flags not available here; using dummy 0.8
                }))}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult result={analysisResult} />
            </section>
          )}
        </>
      )}

      {realTimeMode && (
        <RealTimeDashboard onAnalysis={handleAnalysis} />
      )}
    </main>
  );
};

export default App;