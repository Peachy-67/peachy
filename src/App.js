import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

/**
 * Defines which behavior flags trigger the immediate alert system.
 * For instance we treat insult, gaslighting, threat, discard, and control as high risk.
 */
const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "control"
]);

function App() {
  // Analysis result state from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  // Controls whether to show the real-time monitoring dashboard or paste analyzer
  const [useDashboard, setUseDashboard] = useState(false);
  // Used for user visible alerts in ImmediateAlert component
  const [activeAlertFlags, setActiveAlertFlags] = useState([]);

  // Whenever analysis changes, update alert flags for high-risk behaviors
  useEffect(() => {
    if (analysis && Array.isArray(analysis.signals)) {
      const highRiskDetected = analysis.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );

      if (highRiskDetected.length > 0) {
        setActiveAlertFlags(highRiskDetected);
      } else {
        setActiveAlertFlags([]);
      }
    } else {
      setActiveAlertFlags([]);
    }
  }, [analysis]);

  // Callback for new analysis results with error handling
  const handleAnalysisUpdate = ({ result, error: err }) => {
    if (err) {
      setError(err);
      setAnalysis(null);
    } else {
      setError(null);
      setAnalysis(result);
    }
  };

  // Toggle button handler for switching modes
  const toggleMode = () => {
    setError(null);
    setAnalysis(null);
    setUseDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Application">
      <header>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>FLAGGED.RUN</h1>
        <button
          onClick={toggleMode}
          className="peachy-button"
          aria-pressed={useDashboard}
          aria-label={`Switch to ${useDashboard ? "Conversation Analyzer" : "Real-Time Dashboard"}`}
          type="button"
        >
          {useDashboard ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>
      <ImmediateAlert flags={activeAlertFlags} />

      {!useDashboard && (
        <>
          <ConversationAnalyzerPolish
            onAnalysisComplete={handleAnalysisUpdate}
            onError={setError}
          />

          {error && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              style={{ marginTop: "1rem" }}
            >
              {error}
            </div>
          )}

          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={analysis.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: 0.85, // Placeholder confidence, real app should pass actual per-flag confidence
                }))}
                overallConfidence={analysis.confidence}
              />
              <ShareableResult result={analysis} />
            </>
          )}
        </>
      )}

      {useDashboard && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          initialAnalysis={analysis}
        />
      )}
    </main>
  );
}

export default App;