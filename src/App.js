import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

/**
 * Main App component integrating:
 * - ConversationAnalyzerPolish for user input and analysis
 * - ImmediateAlert to notify high-risk flags immediately
 * - FlaggedResultVisualization to display verdict and badges
 * - ShareableResult for sharing flagged results
 * - RealTimeDashboard for live conversation monitoring
 */
const App = () => {
  // State for the latest analysis result from user input or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // Error message from analysis failures
  const [error, setError] = useState(null);
  // Loading indicator during analysis request
  const [loading, setLoading] = useState(false);
  // Toggle between paste conversation analyzer and real-time dashboard
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  // Track if alert banner dismissed by user
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Reset alert dismissal when analysisResult changes to new state
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysisResult]);

  // Handler called on conversation text analyze from ConversationAnalyzerPolish
  const handleAnalyzeConversation = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message || "Analysis failed");
        setLoading(false);
        return;
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  // High-risk signals to trigger immediate alert
  const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "discard"];

  // Check if current analysis has any high-risk signals to alert
  const hasHighRiskFlags =
    analysisResult?.signals?.some((flag) => HIGH_RISK_FLAGS.includes(flag)) && !alertDismissed;

  // Handler to toggle between the main paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowRealTimeDashboard((prev) => !prev);
    // Clear analysis/error state when toggling to avoid confusion
    setAnalysisResult(null);
    setError(null);
    setAlertDismissed(false);
  };

  return (
    <main className="ui-container" role="main" aria-labelledby="app-title">
      <h1 id="app-title" tabIndex={-1} style={{ userSelect: "none", color: "#ff6f61" }}>
        FLAGGED conversation analyzer
      </h1>

      <button
        type="button"
        aria-pressed={showRealTimeDashboard}
        onClick={toggleDashboard}
        style={{
          marginBottom: "1.5rem",
          backgroundColor: showRealTimeDashboard ? "#ff6f61" : "transparent",
          color: showRealTimeDashboard ? "#fff" : "#ff6f61",
          border: "2px solid #ff6f61",
          borderRadius: 6,
          padding: "0.5rem 1.2rem",
          fontWeight: 600,
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.3s ease",
        }}
      >
        {showRealTimeDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {hasHighRiskFlags && (
        <ImmediateAlert
          flaggedBehaviors={analysisResult.signals.filter((flag) =>
            HIGH_RISK_FLAGS.includes(flag)
          )}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={(result) => {
            setAnalysisResult(result);
            setError(null);
            setAlertDismissed(false);
          }}
          error={error}
          loading={loading}
          initialResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyzeConversation}
            loading={loading}
            error={error}
          />

          {analysisResult && (
            <section
              aria-live="polite"
              aria-label="Analysis results"
              style={{ marginTop: "1.5rem" }}
            >
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence ?? 0,
                }))}
                overallConfidence={analysisResult.confidence ?? 0}
              />

              <ShareableResult analysisResult={analysisResult} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;