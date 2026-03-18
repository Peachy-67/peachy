import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Called when new analysis is available from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError("");
    if (result && Array.isArray(result.signals)) {
      // Check if there are any high risk flags in signals
      const foundHighRisk = result.signals.filter((flag) => highRiskFlags.has(flag));
      setAlertFlags(foundHighRisk);
    } else {
      setAlertFlags([]);
    }
  };

  // Called on analysis error from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisError = (errMessage) => {
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(errMessage || "Analysis failed. Please try again.");
  };

  // Handler to toggle between paste analyzer mode and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Reset previous analysis and alerts when switching modes for clarity
    setAnalysisResult(null);
    setAlertFlags([]);
    setError("");
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 tabIndex={-1}>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginTop: "10px" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleAnalysisError}
          initialResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            disabled={loading}
            onResult={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={setLoading}
          />

          {error && (
            <div role="alert" aria-live="assertive" className="alert-banner" style={{ marginTop: "1rem" }}>
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence,
                }))}
                overallConfidence={analysisResult.confidence}
              />

              <ShareableResult
                result={analysisResult}
                conversationExcerpt=""
                // Passing conversation excerpt empty here as conversation text not stored globally
                // ShareableResult can enhance to accept text if available if needed
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;