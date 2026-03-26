import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
]);

const App = () => {
  // State for analysis result from paste input analyzer
  const [analysis, setAnalysis] = useState(null);
  // Error message string for analyze failures
  const [error, setError] = useState(null);
  // Loading state for API request
  const [loading, setLoading] = useState(false);
  // Dismiss flag for alert banner
  const [alertDismissed, setAlertDismissed] = useState(false);
  // Toggle boolean for showing real-time dashboard or static analyzer
  const [showDashboard, setShowDashboard] = useState(false);

  // Handle analysis result update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);
    setAlertDismissed(false);
  };

  // Handle errors from analyze component
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
    setAnalysis(null);
    setLoading(false);
  };

  // Trigger loading state on analyze request
  const handleLoading = () => {
    setLoading(true);
    setError(null);
  };

  // Determine if analysis contains any high-risk flags
  const hasHighRiskFlags = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return false;
    return analysis.signals.some((flag) => HIGH_RISK_FLAGS.has(flag));
  }, [analysis]);

  // Compose a concise share text summary from analysis data
  const composeShareText = () => {
    if (!analysis) return "";
    const verdictLabel = analysis.verdict?.label || "Unknown verdict";
    const flags = analysis.signals.length > 0 ? analysis.signals.join(", ") : "No red flags";
    return `FLAGGED Verdict: ${verdictLabel}\nDetected Flags: ${flags}\nConfidence: ${Math.round(
      (analysis.confidence || 0) * 100
    )}%`;
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer main interface">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      {/* Toggle between dashboard and paste analyzer */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", gap: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          onClick={() => setShowDashboard(false)}
          disabled={!showDashboard}
          aria-label="Show conversation paste analyzer"
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={!showDashboard}
          onClick={() => setShowDashboard(true)}
          disabled={showDashboard}
          aria-label="Show real-time conversation dashboard"
        >
          Real-Time Dashboard
        </button>
      </div>

      {/* Show alert banner for high-risk flags */}
      <ImmediateAlert
        flaggedBehaviors={(analysis && analysis.signals) || []}
        alertDismissed={alertDismissed}
        onDismiss={() => setAlertDismissed(true)}
      />

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: "1rem", textAlign: "center" }}
          tabIndex={-1}
        >
          {error}
        </div>
      )}

      {/* Real-time dashboard view */}
      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleLoading}
        />
      ) : (
        <>
          {/* Conversation analyzer input and button */}
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={handleLoading}
            loading={loading}
          />

          {/* Show results visualization and share only if analysis present */}
          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={analysis.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />

              <ShareableResult shareText={composeShareText()} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;