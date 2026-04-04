import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  // Extend as needed
]);

function hasHighRiskFlags(flags) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.type || flag));
}

const App = () => {
  // State holds latest analyzed result
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeFlags, setActiveFlags] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Clear alert function for ImmediateAlert dismiss
  const dismissAlert = useCallback(() => {
    setShowAlert(false);
    setAlertFlags([]);
  }, []);

  // Handle new analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    if (result && Array.isArray(result.signals)) {
      // Map signals to flagged behavior objects
      // For visualization we expect objects {type, label, confidence}
      // But some components may provide just strings (type)
      // We normalize here:
      const flaggedBehaviors =
        result.flaggedBehaviors ||
        result.signals.map((signal) => ({
          type: signal,
          label: signal.charAt(0).toUpperCase() + signal.slice(1),
          confidence: result.confidence || 0,
        }));

      setActiveFlags(flaggedBehaviors);

      if (hasHighRiskFlags(flaggedBehaviors)) {
        setAlertFlags(flaggedBehaviors.filter((f) => HIGH_RISK_FLAGS.has(f.type)));
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertFlags([]);
      }
    } else {
      setActiveFlags([]);
      setShowAlert(false);
      setAlertFlags([]);
    }
  };

  // Toggle real-time dashboard view
  const toggleRealTimeMode = () => {
    setRealTimeMode((v) => !v);
    setAnalysisResult(null);
    setActiveFlags([]);
    setShowAlert(false);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  // Error handling for ConversationAnalyzer and Dashboard could update error and loading state
  // Passing state callbacks to child components

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED application main interface">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>

      <section aria-label="Toggle between conversation analyzer and real-time dashboard" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleRealTimeMode}
          aria-pressed={realTimeMode}
          aria-label={`Switch to ${realTimeMode ? "conversation analyzer paste input" : "real-time dashboard"} mode`}
        >
          {realTimeMode ? "Switch to Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      <ImmediateAlert visible={showAlert} flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />

      {realTimeMode ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          error={error}
          setError={setError}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisResult={handleAnalysisUpdate}
          error={error}
          setError={setError}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={activeFlags}
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult
            analysis={analysisResult}
            flaggedBehaviors={activeFlags}
          />
        </>
      )}
    </main>
  );
};

export default App;