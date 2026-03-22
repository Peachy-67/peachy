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

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Trigger alerts if high-risk flags detected
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      if (highRiskDetected.length) {
        setAlertFlags(highRiskDetected);
        setAlertVisible(true);
        // Also show a native alert popup
        alert(
          `High-risk behavior detected: ${highRiskDetected.join(", ")}. Please proceed with caution.`
        );
      } else {
        setAlertVisible(false);
        setAlertFlags([]);
      }
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const handleDismissAlert = () => {
    setAlertVisible(false);
  };

  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation red flag detector">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED
        </h1>
      </header>

      <section aria-label="Conversation analysis paste interface" style={{ marginBottom: "2rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        )}
      </section>

      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          onDismiss={handleDismissAlert}
          aria-live="assertive"
        />
      )}

      <section aria-label="Flagged result visualization and sharing" style={{ textAlign: "center" }}>
        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || "Safe"}
              flaggedBehaviors={analysisResult.signals.map((flag) => ({
                type: flag,
                label: flag.charAt(0).toUpperCase() + flag.slice(1),
                confidence: 1, // Confidence not detailed here, default 1 for UI
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult result={analysisResult} />
          </>
        )}
      </section>

      <section aria-label="Real-time monitoring dashboard" style={{ marginTop: "2rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-expanded={showDashboard}
          aria-controls="real-time-dashboard"
          className="peachy-button"
          style={{ marginBottom: "1rem", userSelect: "none" }}
        >
          {showDashboard ? "Return to Paste Analyzer" : "Open Real-time Dashboard"}
        </button>

        {showDashboard && (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            id="real-time-dashboard"
          />
        )}
      </section>
    </main>
  );
}

export default App;