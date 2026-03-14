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
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Handle incoming analysis update, trigger alerts if needed
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);

    if (result && Array.isArray(result.signals)) {
      const highRiskDetected = result.signals.some((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      if (highRiskDetected) {
        // We can collect the flagged types for alert display
        setActiveAlerts(
          result.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag))
        );
      } else {
        setActiveAlerts([]);
      }
    } else {
      setActiveAlerts([]);
    }
  };

  const dismissAlert = () => {
    setActiveAlerts([]);
  };

  // Optional toggle for real-time dashboard view
  const toggleRealTimeDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
    // Reset analysis result and alerts when toggling to keep clean state
    setAnalysisResult(null);
    setActiveAlerts([]);
  };

  // Extract flagged behaviors as array of objects for visualization
  // Map known flag labels; we assign the label as capitalized type for simplicity.
  // Confidence scores can be passed if available, default to 0.8 for demo
  const flaggedBehaviorObjects = (analysisResult?.signals || []).map(
    (type) => {
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      // Confidence score: use normalized confidence from result or default 0.8
      const confidence = analysisResult?.confidence || 0.8;
      return { type, label, confidence };
    }
  );

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
      </header>

      {!showRealTimeDashboard && (
        <>
          <section aria-label="Conversation analysis">
            <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          </section>

          {activeAlerts.length > 0 && (
            <ImmediateAlert flags={activeAlerts} onDismiss={dismissAlert} />
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={flaggedBehaviorObjects}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={flaggedBehaviorObjects}
                overallConfidence={analysisResult.confidence || 0}
              />
            </>
          )}
        </>
      )}

      <section aria-label="Real-time conversation monitoring dashboard">
        <button
          type="button"
          onClick={toggleRealTimeDashboard}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
          style={{ marginTop: "1.5rem" }}
        >
          {showRealTimeDashboard ? "Hide" : "Show"} Real-Time Dashboard
        </button>

        {showRealTimeDashboard && (
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;