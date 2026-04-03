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
  "discard",
  "gaslighting",
  "ultimatum",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // When analysisResult changes, check for high risk flags to alert
  useEffect(() => {
    if (!analysisResult?.signals) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    if (highRiskDetected.length) {
      setAlertFlags(highRiskDetected);
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for conversation analysis updates (from ConversationAnalyzerPolish or RealTimeDashboard)
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  const handleAnalysisError = (err) => {
    setError(err);
    setAnalysisResult(null);
    setLoading(false);
    setAlertFlags([]);
  };

  // Handler for loading state
  const handleLoading = (loadingState) => {
    setLoading(loadingState);
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle between paste analyzer and real-time dashboard views
  const handleToggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Clear result and alerts when switching
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
  };

  // Derive verdict and flagged behaviors with label and confidence for visualization
  const getVisualData = () => {
    if (!analysisResult) return null;
    // verdict mapped to Safe, Caution, Flagged for FlaggedResultVisualization
    let verdictLabel = "Safe";
    if (analysisResult.verdict?.band === "green") {
      verdictLabel = "Safe";
    } else if (analysisResult.verdict?.band === "yellow") {
      verdictLabel = "Caution";
    } else if (analysisResult.verdict?.band === "red") {
      verdictLabel = "Flagged";
    }
    // flagged behaviors array { type, label, confidence }
    // Map signals to descriptive labels:
    const flagLabelMap = {
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

    const flaggedBehaviors = (analysisResult.signals || []).map((sig) => ({
      type: sig,
      label: flagLabelMap[sig] || sig,
      confidence:
        typeof analysisResult.confidence === "number"
          ? analysisResult.confidence
          : 0,
    }));

    return {
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence:
        typeof analysisResult.confidence === "number"
          ? analysisResult.confidence
          : 0,
    };
  };

  const visualData = getVisualData();

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED: Red Flag Conversation Detector
      </h1>

      <section aria-label="Toggle between conversation analyzer and real-time dashboard">
        <button
          type="button"
          onClick={handleToggleDashboard}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-live="polite"
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisResult={handleAnalysisUpdate}
          onLoading={handleLoading}
          onError={handleAnalysisError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisResult={handleAnalysisUpdate}
          onLoading={handleLoading}
          onError={handleAnalysisError}
          initialText=""
        />
      )}

      {loading && (
        <p
          role="status"
          aria-live="polite"
          style={{ textAlign: "center", marginTop: "1rem", userSelect: "none" }}
        >
          Analyzing conversation...
        </p>
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

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={dismissAlert}
      />

      {visualData && (
        <section
          aria-label="Flagged conversation result"
          style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <FlaggedResultVisualization
            verdict={visualData.verdict}
            flaggedBehaviors={visualData.flaggedBehaviors}
            overallConfidence={visualData.overallConfidence}
          />
          <ShareableResult
            analysis={analysisResult}
            text={showDashboard ? "" : undefined} /* no raw text prop needed for dashboard */
          />
        </section>
      )}
    </main>
  );
};

export default App;