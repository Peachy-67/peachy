import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
]);

function hasHighRiskFlag(signals) {
  if (!Array.isArray(signals)) return false;
  return signals.some((flag) => HIGH_RISK_FLAGS.has(flag));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Handle new analysis results from pasted input or realtime dashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    if (result && hasHighRiskFlag(result.signals)) {
      setAlertFlags(result.signals.filter((f) => HIGH_RISK_FLAGS.has(f)));
      setShowAlert(true);
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, []);

  // Handler to dismiss alert banner
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Clear previous analysis on mode switch
  const toggleRealTimeMode = () => {
    setRealTimeMode((rt) => !rt);
    setAnalysisResult(null);
    setShowAlert(false);
    setAlertFlags([]);
    setError("");
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header style={{ textAlign: "center", marginBottom: "1.5rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61" }}>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={realTimeMode}
          onClick={toggleRealTimeMode}
          style={{ marginTop: "0.5rem", maxWidth: 240, width: "100%" }}
        >
          {realTimeMode ? "Use Paste Analyzer Instead" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {showAlert && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {!realTimeMode && (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((flag) => ({
                  type: flag,
                  label: flag.charAt(0).toUpperCase() + flag.slice(1),
                  confidence: analysisResult.confidence ?? 0,
                }))}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}

      {realTimeMode && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          initialAnalysis={analysisResult}
        />
      )}
    </main>
  );
};

export default App;