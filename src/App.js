import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // State for analysis result from pasted conversation
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // State to control real-time dashboard mode
  const [showDashboard, setShowDashboard] = useState(false);

  // Callback when new analysis is done in ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (errMessage) => {
    setError(errMessage);
    setAnalysisResult(null);
  };

  // Derived props for ImmediateAlert - show if any high-risk flags present
  const highRiskFlags = analysisResult?.signals?.filter((signal) =>
    ["insult", "gaslighting", "threat", "ultimatum"].includes(signal)
  );

  // Toggle handler to switch between paste-input analyzer and real-time dashboard
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detector">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED
      </h1>

      <button
        type="button"
        aria-pressed={showDashboard}
        onClick={toggleDashboard}
        className="peachy-button"
        style={{ marginBottom: "1rem" }}
        title="Toggle between paste analyzer and real-time monitoring dashboard"
      >
        {showDashboard ? "Use Paste Conversation Analyzer" : "Use Real-Time Conversation Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalyze={handleAnalysisUpdate}
          onError={handleError}
        />
      )}

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {/* Show error message if any */}
      {error && (
        <section className="alert-banner" role="alert" aria-live="assertive" aria-atomic="true">
          {error}
        </section>
      )}

      {/* Show flagged results and sharing if analysis result available */}
      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals?.map((sig) => ({
              type: sig,
              label: sig.charAt(0).toUpperCase() + sig.slice(1),
              confidence: analysisResult.confidence || 0,
            })) || []}
            overallConfidence={analysisResult.confidence || 0}
          />

          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;