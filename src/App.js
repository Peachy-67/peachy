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
  "ultimatum",
  "discard",
]);

const App = () => {
  // State for analysis result of pasted conversation
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for error message during analysis
  const [error, setError] = useState(null);
  // Loading state during analysis
  const [loading, setLoading] = useState(false);

  // State for showing immediate alert banner
  const [alertFlags, setAlertFlags] = useState([]);

  // Toggle between paste-analyzer view and real-time dashboard view
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Handler to process new analysis data from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (data) => {
    if (!data) {
      setAnalysisResult(null);
      setAlertFlags([]);
      setError(null);
      return;
    }
    setAnalysisResult(data);
    setError(null);

    // Determine if there are any high-risk flags to alert immediately
    const highRiskDetected =
      data.signals?.some((signal) => HIGH_RISK_FLAGS.has(signal)) || false;

    if (highRiskDetected) {
      // Filter signals to those high-risk for alert display
      const flagsToAlert = data.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );
      setAlertFlags(flagsToAlert);
    } else {
      setAlertFlags([]);
    }
  };

  // Handler to dismiss the visible banner alert (but native alert already shown immediately)
  const onAlertDismiss = () => {
    setAlertFlags([]);
  };

  // When new high risk alert flags added, show native alert immediately
  useEffect(() => {
    if (alertFlags.length > 0) {
      // Compose message listing detected flags
      const uniqueFlags = Array.from(new Set(alertFlags));
      const alertMessage = `⚠️ High-risk behavior detected: ${uniqueFlags.join(
        ", "
      )}. Please proceed with caution.`;
      // Show native alert dialog (blocking)
      window.alert(alertMessage);
    }
  }, [alertFlags]);

  // Handler for toggling dashboard view
  const toggleDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
    // Reset analysis and alerts on toggle to keep views clean
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <header>
        <h1 style={{ color: "#ff6f3c", userSelect: "none", textAlign: "center" }}>
          FLAGGED
        </h1>
        <button
          className="peachy-button"
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showRealTimeDashboard}
          aria-label={showRealTimeDashboard ? "Switch to paste analyzer" : "Switch to real-time dashboard"}
          style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          {showRealTimeDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flags={alertFlags} onDismiss={onAlertDismiss} />

      {showRealTimeDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish
          onResult={(result) => {
            setError(null);
            setLoading(false);
            onAnalysisUpdate(result);
          }}
          onError={(err) => {
            setAnalysisResult(null);
            setLoading(false);
            setError(err);
            setAlertFlags([]);
          }}
          onLoading={() => {
            setLoading(true);
            setError(null);
            setAlertFlags([]);
          }}
        />
      )}

      {/* Error display */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
        >
          {error}
        </div>
      )}

      {/* Show flagged result visualization and share when analysis result exists */}
      {analysisResult && !loading && !error && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label:
                signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " "),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;