import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

/**
 * Main App component integrating conversation analyzer,
 * immediate alerts, flagged results visualization,
 * shareable results, and real-time dashboard toggle.
 */
const App = () => {
  // State for conversation analysis result
  const [analysis, setAnalysis] = useState(null);
  // Loading state when analyzing
  const [loading, setLoading] = useState(false);
  // Error message if analysis fails
  const [error, setError] = useState("");
  // Whether real-time dashboard mode is active
  const [dashboardMode, setDashboardMode] = useState(false);
  // Controlled conversation input for real-time dashboard
  const [realTimeText, setRealTimeText] = useState("");
  // Latest analysis from real-time dashboard
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null);

  // Combined current analysis for alerts and display
  const combinedAnalysis = dashboardMode ? realTimeAnalysis : analysis;

  // Detect if any high-risk flags present
  const highRiskFlags = (combinedAnalysis?.signals || []).filter((flag) =>
    HIGH_RISK_FLAGS.includes(flag)
  );

  // Handler to analyze conversation text input (from paste analyzer)
  const handleAnalyze = useCallback(async (text) => {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        let msg = errorData.message || "Analysis failed. Please try again.";
        setError(msg);
        setLoading(false);
        return;
      }
      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler for real-time dashboard analysis result
  const handleRealTimeUpdate = useCallback((result) => {
    setRealTimeAnalysis(result);
  }, []);

  // Handler to toggle dashboard view mode
  const toggleDashboardMode = () => {
    setDashboardMode((prev) => !prev);
    // Reset real-time specific state on toggle
    if (dashboardMode) {
      setRealTimeText("");
      setRealTimeAnalysis(null);
    } else {
      setError("");
      setAnalysis(null);
    }
  };

  return (
    <main
      className="ui-container"
      role="main"
      aria-label="FLAGGED conversation red flag detection application"
    >
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED
      </h1>

      <section aria-label="Application mode toggle" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboardMode}
          aria-pressed={dashboardMode}
          aria-describedby="mode-toggle-desc"
        >
          {dashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
        <div
          id="mode-toggle-desc"
          style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.3rem", userSelect: "none" }}
        >
          {dashboardMode
            ? "Monitor conversations live with alerts."
            : "Paste conversation text to analyze red flags."}
        </div>
      </section>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {!dashboardMode && (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
            result={analysis}
          />

          {/* Show results visualization and share options if result available */}
          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label || "Safe"}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence ?? 0,
                }))}
                overallConfidence={analysis.confidence ?? 0}
              />

              <ShareableResult analysis={analysis} />
            </>
          )}
        </>
      )}

      {dashboardMode && (
        <RealTimeDashboard
          conversation={realTimeText}
          onConversationChange={setRealTimeText}
          analysis={realTimeAnalysis}
          onAnalysisUpdate={handleRealTimeUpdate}
          loading={loading}
          error={error}
          setError={setError}
        />
      )}
    </main>
  );
};

export default App;