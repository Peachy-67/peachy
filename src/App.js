import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum", "discard", "control"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [hasHighRiskAlert, setHasHighRiskAlert] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // Helper to detect any high-risk flag present from analysis result signals
  const checkHighRiskFlags = (flags) => {
    if (!flags || !Array.isArray(flags)) return false;
    return flags.some((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase()));
  };

  // Handler for when new analysis is done via ConversationAnalyzerPolish or RealTimeDashboard manual analysis
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);

    const highRiskDetected = checkHighRiskFlags(result?.signals || []);
    setHasHighRiskAlert(highRiskDetected);
  };

  // Handler for errors from analysis components
  const handleAnalysisError = (err) => {
    setError(err?.message || "Analysis failed. Please try again.");
    setAnalysisResult(null);
    setLoading(false);
    setHasHighRiskAlert(false);
  };

  // Handler for loading state from analysis
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Toggle between real-time dashboard and paste analyzer views
  const toggleDashboard = () => {
    setAnalysisResult(null);
    setError(null);
    setHasHighRiskAlert(false);
    setUseRealTimeDashboard((enabled) => !enabled);
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation red flag analyzer">
      <header style={{ textAlign: "center", marginBottom: "1.5rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f3c" }}>FLAGGED</h1>
        <p style={{ fontWeight: "600", color: "#aa573e" }}>
          Detect red flags in conversations and identify manipulation &amp; harmful behavior
        </p>
        <button onClick={toggleDashboard} className="peachy-button" aria-pressed={useRealTimeDashboard}>
          {useRealTimeDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {useRealTimeDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} onError={handleAnalysisError} onLoading={handleLoading} />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoading}
        />
      )}

      {/* Show immediate alert if high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={analysisResult?.signals || []} dismissable />

      {/* Show error if any */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#ffe6e6",
            color: "#a63636",
            fontWeight: "700",
            boxShadow: "0 2px 8px rgba(204, 47, 47, 0.7)",
            maxWidth: "440px",
            marginLeft: "auto",
            marginRight: "auto",
            userSelect: "text",
          }}
          tabIndex={-1}
        >
          {error}
        </div>
      )}

      {/* When not loading and have analysis result, show visualization and sharing */}
      {!loading && analysisResult && !error && (
        <section aria-label="Analysis results" style={{ marginTop: "1.5rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              Array.isArray(analysisResult.signals)
                ? analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysisResult.confidence || 0,
                  }))
                : []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              Array.isArray(analysisResult.signals)
                ? analysisResult.signals.map((signal) => ({
                    type: signal,
                    label: signal.charAt(0).toUpperCase() + signal.slice(1),
                    confidence: analysisResult.confidence || 0,
                  }))
                : []
            }
            overallConfidence={analysisResult.confidence || 0}
            conversationExcerpt={analysisResult.usage?.inputExcerpt || ""}
          />
        </section>
      )}

      {/* Loading indicator */}
      {loading && (
        <p
          aria-live="polite"
          style={{
            marginTop: "1rem",
            fontWeight: "700",
            color: "#cc5533",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          Analyzing conversation...
        </p>
      )}
    </div>
  );
};

export default App;