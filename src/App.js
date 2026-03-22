import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "control",
  "discard",
  "ultimatum",
]);

const bandToVerdictLabel = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Handle new analysis results and compute alert flags
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }

    const flaggedSignals = analysisResult.signals || [];
    const highRiskDetected = flaggedSignals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      setAlertDismissed(false);
      // Also trigger a native alert immediately as requested
      const alertMsg = `High-risk flags detected: ${highRiskDetected
        .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
        .join(", ")}`;
      // Small delay to allow UI update before alert blocking
      setTimeout(() => alert(alertMsg), 10);
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [analysisResult]);

  // Dismiss alert banner handler
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Callback from ConversationAnalyzerPolish or RealTimeDashboard when new analysis occurs
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="ui-container" aria-live="polite">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>
          FLAGGED - Red Flag Conversation Detector
        </h1>
      </header>

      {/* Toggle real-time dashboard view or paste analyzer */}
      <section
        aria-label="Mode selection for conversation analysis dashboard"
        style={{ margin: "1rem 0", textAlign: "center" }}
      >
        <button
          type="button"
          onClick={() => setShowRealTimeDashboard((v) => !v)}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
          style={{ maxWidth: "280px" }}
        >
          {showRealTimeDashboard
            ? "Switch to Paste Conversation Analyzer"
            : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showRealTimeDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalyze={handleAnalysisUpdate} />
      )}

      {/* Immediate alert banner */}
      {alertFlags.length > 0 && !alertDismissed && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />
      )}

      {/* Show flagged results only if analysis available */}
      {analysisResult && (
        <>
          <section
            aria-label="Flagged conversation results and visualization"
            style={{ marginTop: "1.5rem" }}
          >
            <FlaggedResultVisualization
              verdict={bandToVerdictLabel[analysisResult.verdict?.band] || "Safe"}
              flaggedBehaviors={(analysisResult.signals || []).map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
          </section>

          <section
            aria-label="Share flagged conversation results"
            style={{ marginTop: "1rem" }}
          >
            <ShareableResult result={analysisResult} />
          </section>
        </>
      )}
    </main>
  );
};

export default App;