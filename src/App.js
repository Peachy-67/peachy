import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main app component integrating conversation analyzer, immediate alerts, results visualization,
 * sharing, and real-time dashboard toggle as per product roadmap.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Show alert if any high-risk flags are detected.
  useEffect(() => {
    if (!analysisResult) {
      setAlertVisible(false);
      return;
    }

    // High-risk flags we consider for immediate alert
    const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

    const detectedFlags = new Set(analysisResult.signals || []);

    const foundHighRisk = [...detectedFlags].some((flag) => highRiskFlags.has(flag));

    setAlertVisible(foundHighRisk);

    if (foundHighRisk) {
      // Native alert for immediate notification (but non-blocking)
      // We check to prevent repetitive alerts on rerender
      if (window && typeof window.alert === "function") {
        window.alert(
          "Warning: High-risk behaviors detected in conversation. Please review carefully."
        );
      }
    }
  }, [analysisResult]);

  // Handler for new analysis results from conversation analyzer or dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Dismiss alert banner manually
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Main FLAGGED application interface">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f3c", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-labelledby="mode-toggle-label" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <label id="mode-toggle-label" htmlFor="modeToggle">
          <strong>Toggle Real-Time Monitoring Dashboard:</strong>
        </label>
        <br />
        <button
          type="button"
          onClick={() => setRealTimeMode((prev) => !prev)}
          aria-pressed={realTimeMode}
          aria-label={realTimeMode ? "Switch to paste analyzer mode" : "Switch to real-time monitoring mode"}
          className="peachy-button"
          style={{ marginTop: 8, minWidth: 180 }}
        >
          {realTimeMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {/* Immediate alert banner */}
      {alertVisible && analysisResult && (
        <ImmediateAlert flaggedBehaviors={analysisResult.signals} onDismiss={dismissAlert} />
      )}

      {/* Conditional rendering: real-time dashboard or paste-based analyzer */}
      {realTimeMode ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
          {/* Show flagged results visualization and share if analysisResult exists */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: 1.0, // Confidence is not detailed in signals, assume full confidence for UI
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;