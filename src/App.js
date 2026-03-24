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
  "control",
]);

function App() {
  // State for latest analysis result from pasted conversation input
  const [analysisResult, setAnalysisResult] = useState(null);
  // State for errors during analysis
  const [analysisError, setAnalysisError] = useState(null);
  // Loading state during analysis request
  const [loading, setLoading] = useState(false);
  // Whether to show the real-time monitoring dashboard instead of paste-input analyzer
  const [showDashboard, setShowDashboard] = useState(false);
  // Tracks if an alert banner is visible (dismissed state)
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Effect to reset alert dismissal if flagged behaviors change
  useEffect(() => {
    if (analysisResult?.signals) {
      // Show alert banner if high-risk flags present and alert was dismissed previously
      const hasHighRisk = analysisResult.signals.some((flag) => HIGH_RISK_FLAGS.has(flag));
      if (hasHighRisk && alertDismissed) {
        setAlertDismissed(false);
      }
    }
  }, [analysisResult, alertDismissed]);

  // Handler for updates from ConversationAnalyzerPolish component
  const handleAnalysisUpdate = ({ result, error, loading: isLoading }) => {
    setLoading(isLoading);
    setAnalysisError(error || null);
    if (result) {
      setAnalysisResult(result);
    }
  };

  // Derive high-risk flags from current analysis result signals
  const highRiskFlags = analysisResult?.signals?.filter((flag) => HIGH_RISK_FLAGS.has(flag)) || [];

  // Consolidate flagged behaviors info for visualization and sharing
  // We'll map signals (strings) to label/confidence objects expected by FlaggedResultVisualization
  // Confidence example: 0.8 for demonstration or derive from analysisResult.confidence
  
  // Map signal types to user-friendly labels for visualization/share
  const FLAG_LABELS = {
    insult: "Insult",
    manipulation: "Manipulation",
    gaslighting: "Gaslighting",
    discard: "Discard",
    control: "Control",
    ultimatum: "Ultimatum",
    threat: "Threat",
    guilt: "Guilt",
    boundary_push: "Boundary Push",
    inconsistency: "Inconsistency",
  };

  // Compose flaggedBehaviors array for visualization/share component
  const flaggedBehaviors = (analysisResult?.signals || []).map((type) => ({
    type,
    label: FLAG_LABELS[type] || type,
    confidence: analysisResult?.confidence || 0.5, // fallback confidence
  }));

  // Derive verdict string for visualization component based on analysisResult.verdict.band
  const bandToVerdictLabel = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdict = bandToVerdictLabel[analysisResult?.verdict?.band] || "Safe";

  // Toggle showDashboard view handler
  const toggleDashboard = () => {
    // Clear current analysis and errors when toggling dashboard to paste analyzer UI
    if (showDashboard) {
      setAnalysisResult(null);
      setAnalysisError(null);
    }
    setShowDashboard((prev) => !prev);
    setAlertDismissed(false);
  };

  return (
    <main
      className="ui-container"
      aria-label="Flagged Conversation Analyzer Main Application"
    >
      <header>
        <h1 tabIndex={-1} style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f" }}>
          FLAGGED
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer view" : "Switch to real-time dashboard view"}
          style={{
            backgroundColor: "#ff5a56",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontWeight: "700",
            cursor: "pointer",
            margin: "12px auto 24px",
            display: "block",
            userSelect: "none",
            boxShadow: "0 3px 9px rgba(255, 90, 86, 0.6)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e2524f")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ff5a56")}
        >
          {showDashboard ? "Switch to Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        // Show real-time monitoring dashboard with live updates and alerts
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        // Show conversation paste analyzer with button and display results
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
          {loading && (
            <p aria-live="polite" style={{ marginTop: "1rem", userSelect: "none" }}>
              Analyzing conversation...
            </p>
          )}
          {analysisError && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                color: "#cc2f2f",
                fontWeight: "600",
                marginTop: "1rem",
                userSelect: "text",
              }}
            >
              {analysisError}
            </div>
          )}
          {analysisResult && !loading && !analysisError && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                analysisResult={analysisResult}
                flaggedBehaviors={flaggedBehaviors}
                verdict={verdict}
                conversationExcerpt={analysisResult.why && analysisResult.why[0] ? analysisResult.why[0] : ""}
              />
            </>
          )}
        </>
      )}

      <ImmediateAlert
        flaggedBehaviors={highRiskFlags}
        onDismiss={() => setAlertDismissed(true)}
        visible={highRiskFlags.length > 0 && !alertDismissed}
      />
    </main>
  );
}

export default App;