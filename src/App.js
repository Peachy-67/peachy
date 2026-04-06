import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

/**
 * Main app component integrating conversation input/analyzer,
 * immediate alerts on high-risk flags, flagged results visualization,
 * share options, and real-time dashboard toggle.
 */

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
]);

const App = () => {
  // Holds latest analysis result after user pastes conversation and analyzes
  const [analysisResult, setAnalysisResult] = useState(null);

  // Track any error from analysis backend
  const [error, setError] = useState(null);

  // Loading state for analysis
  const [loading, setLoading] = useState(false);

  // Whether the real-time dashboard view is active
  const [dashboardActive, setDashboardActive] = useState(false);

  // Handler for new analysis coming from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler for errors from analyzer
  const handleAnalysisError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
  };

  // Handler when analysis starts (to show loading)
  const handleAnalysisStart = () => {
    setLoading(true);
    setError(null);
  };

  // Extract flagged behavior types for alerting from current result
  const flaggedTypes = React.useMemo(() => {
    return (analysisResult?.signals || []).map((signal) => signal.toLowerCase());
  }, [analysisResult]);

  // Determine if any high-risk flags present
  const hasHighRiskFlags = flaggedTypes.some((type) => highRiskFlags.has(type));

  // Toggle dashboard button label
  const dashboardToggleLabel = dashboardActive ? "Use Paste Analyzer" : "Use Real-Time Dashboard";

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED Red Flag Conversation Analyzer">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED
      </h1>

      {/* Toggle between RealTimeDashboard and ConversationAnalyzerPolish */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setDashboardActive(!dashboardActive)}
          aria-pressed={dashboardActive}
          aria-label={`Toggle to ${dashboardToggleLabel}`}
        >
          {dashboardToggleLabel}
        </button>
      </div>

      {dashboardActive ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleAnalysisStart}
          currentResult={analysisResult}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onError={handleAnalysisError}
          onLoading={handleAnalysisStart}
        />
      )}

      {/* Immediate alert for high-risk flags */}
      <ImmediateAlert
        flaggedBehaviors={flaggedTypes}
        visible={hasHighRiskFlags}
      />

      {/* Display flagged results visualization and share options below analyzer */}
      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => {
              // Map signal to object with label and confidence
              // Use type as label capitalized + confidence from analysisResult.confidence as proxy
              return {
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysis={analysisResult}
            conversationExcerpt={
              analysisResult?.usage?.inputExcerpt || ""
            }
          />
        </>
      )}

      {/* Show error message if any */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
        >
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div
          aria-live="polite"
          style={{ marginTop: "1rem", textAlign: "center", fontWeight: "600" }}
        >
          Analyzing conversation...
        </div>
      )}
    </main>
  );
};

export default App;