import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

/**
 * Main app interface integrating:
 * - ConversationAnalyzerPolish for paste conversation input & analysis
 * - ImmediateAlert for high-risk alert notifications
 * - FlaggedResultVisualization for showing verdict & flagged badges with confidence
 * - ShareableResult for share buttons & snapshot-friendly layout
 * - RealTimeDashboard toggle view for live conversation monitoring
 */

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "threat",
]);

export default function App() {
  // analysis state: result contains verdict, flaggedBehaviors, confidence, etc.
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real-time dashboard toggle
  const [showDashboard, setShowDashboard] = useState(false);

  // Track high-risk flags for ImmediateAlert
  const highRiskFlagsInResult = React.useMemo(() => {
    if (!analysisResult?.flags) return [];
    return analysisResult.flags.filter((flag) => HIGH_RISK_FLAGS.has(flag.type));
  }, [analysisResult]);

  // Handler for updating analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
    setError(null);
    setIsLoading(false);
  }

  // Handle errors from analysis components
  function handleError(message) {
    setError(message);
    setAnalysisResult(null);
    setIsLoading(false);
  }

  // Handle loading state from analysis components
  function handleLoading(loading) {
    setIsLoading(loading);
    if (loading) setError(null);
  }

  // Handler for toggling dashboard view
  function toggleDashboard() {
    setShowDashboard((show) => !show);
    setAnalysisResult(null);
    setError(null);
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection app">
      <header>
        <h1 style={{ userSelect: "none", color: "#ff6f61", textAlign: "center" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button type="button" onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard} aria-label="Toggle real-time dashboard view">
            {showDashboard ? "Back to Paste Analyzer" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {/* Show real-time dashboard or paste input analyzer */}
      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          onLoading={handleLoading}
        />
      )}

      {/* Show error if any */}
      {error && (
        <div
          className="alert-banner"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {error}
        </div>
      )}

      {/* Show loading state */}
      {isLoading && (
        <div role="status" aria-live="polite" style={{ textAlign: "center", marginTop: "1rem" }}>
          <em>Analyzing conversation...</em>
        </div>
      )}

      {/* Show immediate alert for high-risk flags */}
      <ImmediateAlert
        flaggedBehaviors={highRiskFlagsInResult}
      />

      {/* Show analysis results if available and no errors and not loading */}
      {!isLoading && !error && analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flags ?? []}
            overallConfidence={analysisResult.confidence ?? 0}
          />
          <ShareableResult
            analysisResult={analysisResult}
          />
        </>
      )}
    </main>
  );
}