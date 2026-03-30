import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for receiving new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setErrorMessage(null);

    // Determine if any high-risk flags are present for alert
    if (result && Array.isArray(result.signals)) {
      const detectedHighRisks = result.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setImmediateAlertFlags(detectedHighRisks);
    } else {
      setImmediateAlertFlags([]);
    }
  };

  // Handler for errors reported from children
  const handleError = (error) => {
    setErrorMessage(error);
    setAnalysisResult(null);
    setImmediateAlertFlags([]);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setImmediateAlertFlags([]);
    setShowDashboard((prev) => !prev);
  };

  return (
    <main
      className="ui-container"
      role="main"
      aria-label="FLAGGED conversation red flag detection application"
    >
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED
      </h1>

      <div
        style={{
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={toggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={`Switch to ${showDashboard ? "conversation paste analyzer" : "real-time monitoring dashboard"}`}
          title={`Switch to ${showDashboard ? "conversation paste analyzer" : "real-time monitoring dashboard"}`}
        >
          {showDashboard ? "Paste Conversation to Analyze" : "Open Real-Time Monitoring Dashboard"}
        </button>
      </div>

      {/* Show RealTimeDashboard or ConversationAnalyzerPolish based on toggle */}
      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {errorMessage && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          style={{ marginTop: "1.25rem" }}
        >
          {errorMessage}
        </div>
      )}

      <ImmediateAlert
        flags={immediateAlertFlags}
        onDismiss={() => setImmediateAlertFlags([])}
      />

      {analysisResult && !showDashboard && (
        <section
          aria-label="Conversation analysis results"
          style={{ marginTop: "1.5rem" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((sig) => {
              // Map signals to labels and confidence for badges
              // We map signal types to label same as signal
              // Confidence is from analysisResult.confidence or 0.5 fallback
              return {
                type: sig,
                label: sig.charAt(0).toUpperCase() + sig.slice(1),
                confidence: analysisResult.confidence || 0.5,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysis={analysisResult}
            conversationExcerpt="" // Real conversation excerpt not kept here; could be implemented later
          />
        </section>
      )}
    </main>
  );
};

export default App;