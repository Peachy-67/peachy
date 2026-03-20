import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main app component integrating all core features:
 * - Conversation input/analyzer with polished UI
 * - Immediate alert system on high-risk flags
 * - Flagged result visualization with confidence and badges
 * - Result sharing UI
 * - Real-time dashboard toggle for live monitoring
 */
export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles new analysis updates.
   * Trigger alerts if high-risk flags present.
   */
  function handleAnalysisUpdate(result) {
    setAnalysisResult(result);
    setError(null);

    if (!result || !Array.isArray(result.signals)) {
      setAlertFlags([]);
      return;
    }

    // Define high-risk flags that trigger immediate alerts
    const highRiskFlags = ["insult", "gaslighting", "threat", "discard", "manipulation", "control"];
    const triggeredAlerts = result.signals.filter((flag) => highRiskFlags.includes(flag.toLowerCase()));
    setAlertFlags(triggeredAlerts);
  }

  /**
   * Handle errors from analyzer component.
   */
  function handleError(errMsg) {
    setError(errMsg);
    setAnalysisResult(null);
    setAlertFlags([]);
  }

  /**
   * Toggle dashboard mode on/off
   */
  function toggleDashboard() {
    setShowDashboard((prev) => !prev);
    // Clear analysis and alert on toggle for fresh start
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  }

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Conversation Analyzer Application">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
          style={{ marginBottom: "1.5rem" }}
        >
          {showDashboard ? "Back to Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleError}
          initialData={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} onError={handleError} />

          {error && (
            <div className="alert-banner" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {analysisResult && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((type) => {
                  // Map flag type to a descriptive label and confidence
                  // We assume signals are lowercase strings; confidence fallback 0.75
                  let label = type.charAt(0).toUpperCase() + type.slice(1);
                  let confidence = 0.75;
                  // Attempt to get confidence from signals with details if available
                  if (Array.isArray(analysisResult.why) && analysisResult.why.length > 0) {
                    // Nothing to map directly here, so use fallback
                  }
                  return { type, label, confidence };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult result={analysisResult} />
            </>
          )}
        </>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />
    </main>
  );
}