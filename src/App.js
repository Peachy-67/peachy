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

const App = () => {
  // State for conversation analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  // Show real-time dashboard or paste input analyzer mode
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // When analysisResult changes, check if any high-risk flags present
  const hasHighRiskFlags =
    analysisResult?.flaggedBehaviors?.some((fb) =>
      HIGH_RISK_FLAGS.has(fb.type.toLowerCase())
    ) ?? false;

  // Handlers for analysis and error from ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (errMsg) => {
    setAnalysisResult(null);
    setError(errMsg);
  };

  // Toggle real-time dashboard vs conversation analyzer input
  const toggleRealTimeDashboard = () => {
    setAnalysisResult(null);
    setError(null);
    setUseRealTimeDashboard((prev) => !prev);
  };

  return (
    <main
      className="ui-container"
      aria-label="FLAGGED conversation analyzer application"
    >
      <h1
        style={{
          textAlign: "center",
          color: "#ff6f61",
          userSelect: "none",
          marginBottom: "1rem",
        }}
      >
        FLAGGED: Conversation Red Flag Detector
      </h1>

      <button
        type="button"
        onClick={toggleRealTimeDashboard}
        className="peachy-button"
        aria-pressed={useRealTimeDashboard}
        aria-label={
          useRealTimeDashboard
            ? "Switch to paste input conversation analyzer mode"
            : "Switch to real-time monitoring dashboard mode"
        }
        style={{ marginBottom: "1.5rem" }}
      >
        {useRealTimeDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
      </button>

      {useRealTimeDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} onError={handleError} />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
        />
      )}

      {error && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ marginTop: "1rem" }}
        >
          {error}
        </div>
      )}

      {/* Show immediate alert to user if high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={analysisResult?.flaggedBehaviors || []} />

      {/* If have analysis result and no error, show flagged result with share */}
      {analysisResult && !error && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            confidence={analysisResult.confidence}
            conversationExcerpt={analysisResult.conversationExcerpt || ""}
          />
        </>
      )}
    </main>
  );
};

export default App;