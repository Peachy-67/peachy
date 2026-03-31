import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
  "guilt",
  "boundary_push",
]);

function hasHighRiskFlags(flags) {
  if (!flags || !Array.isArray(flags)) return false;
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase()));
}

const App = () => {
  // State for analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // Error message from analysis
  const [error, setError] = useState(null);
  // Loading state of analysis
  const [loading, setLoading] = useState(false);
  // Visible alert flags, resets on dismiss
  const [alertFlags, setAlertFlags] = useState([]);
  // Toggle for showing RealTimeDashboard vs paste analyzer
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);

  // Effect to trigger immediate alert when high risk flags detected in analysisResult
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const highRiskDetected = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.toLowerCase())
      );
      if (highRiskDetected.length > 0) {
        setAlertFlags(highRiskDetected);
        // Also show native alert for immediate attention
        alert(
          "High-risk behavior detected: " + highRiskDetected.join(", ")
        );
      } else {
        // Clear visible alert if no high-risk flags
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler when new analysis is done (from paste analyzer or dashboard manual trigger)
  const handleAnalyze = async ({ text }) => {
    setError(null);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson?.message || "Analysis error");
      }

      const json = await response.json();

      setAnalysisResult(json);
    } catch (e) {
      setError(e.message || "Analysis failed");
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowRealTimeDashboard((v) => !v)}
          aria-pressed={showRealTimeDashboard}
          aria-label={
            showRealTimeDashboard
              ? "Switch to conversation paste analyzer"
              : "Switch to real-time monitoring dashboard"
          }
        >
          {showRealTimeDashboard ? "Use Paste Analyzer" : "Use Real-time Dashboard"}
        </button>
      </div>

      {showRealTimeDashboard ? (
        // Real-time dashboard mode
        <RealTimeDashboard
          onAnalysisUpdate={setAnalysisResult}
          setError={setError}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        // Paste conversation analyzer mode
        <ConversationAnalyzerPolish
          onAnalyze={handleAnalyze}
          loading={loading}
          error={error}
        />
      )}

      {/* Immediate alert banner on detected high-risk flags */}
      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={() => setAlertFlags([])}
      />

      {/* Show results and sharing options if analysis result present */}
      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </>
      )}

      {/* Error display below all */}
      {error && (
        <div
          role="alert"
          className="alert-banner"
          aria-live="assertive"
          aria-atomic="true"
        >
          {error}
        </div>
      )}
    </main>
  );
};

export default App;