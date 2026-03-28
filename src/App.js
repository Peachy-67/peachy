import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const App = () => {
  // State for the analysis output from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);
  // Loading and error states for analyzer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Control whether to show real-time dashboard or paste analyzer view
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract values from analysisResult safely
  const verdict = analysisResult?.verdict?.label || "Safe";
  // Map signals to structured flagged behaviors for visualization
  // Each flagged behavior = { type, label, confidence }
  // We derive labels from known signals for clarity
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals?.length) return [];
    // Map signals to label and confidence (confidence approx from analysis confidence)
    // The confidence prop is overall, used as is for all flags here (no per-flag confidence provided)
    const confidence = analysisResult.confidence ?? 0;
    const labelsMap = {
      insult: "Insult",
      manipulation: "Manipulation",
      gaslighting: "Gaslighting",
      discard: "Discard",
      control: "Control",
      ultimatum: "Ultimatum",
      threat: "Threat",
      guilt: "Guilt",
      "boundary_push": "Boundary Push",
      inconsistency: "Inconsistency",
    };
    return analysisResult.signals.map((type) => ({
      type,
      label: labelsMap[type] || type,
      confidence,
    }));
  }, [analysisResult]);

  // Overall confidence score for flagged result visualization
  const overallConfidence = analysisResult?.confidence ?? 0;

  // Handle ImmediateAlert visibility and alert dismissal
  // Show alert if any high risk flagged behavior present
  const highRiskFlagsPresent = React.useMemo(() => {
    if (!flaggedBehaviors.length) return false;
    return flaggedBehaviors.some((flag) => HIGH_RISK_FLAGS.has(flag.type));
  }, [flaggedBehaviors]);

  // Maintain alert dismissed state to allow user to dismiss the alert banner
  const [alertDismissed, setAlertDismissed] = useState(false);

  // If analysis result changes and there is a high-risk flag, reset dismiss state to show alert again
  useEffect(() => {
    if (highRiskFlagsPresent) {
      setAlertDismissed(false);
    }
  }, [highRiskFlagsPresent]);

  // Handler passed to shareable result or analyzer to get analysis data updates
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
  }, []);

  // Handler to set loading state from ConversationAnalyzerPolish
  const handleLoadingChange = useCallback((loadingState) => {
    setLoading(loadingState);
  }, []);

  // Handler for analysis error
  const handleError = useCallback((err) => {
    setError(err);
    setAnalysisResult(null);
    setLoading(false);
  }, []);

  // Toggle view between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Reset analysis and alert dismissal on mode switch to avoid confusion
    setAnalysisResult(null);
    setError(null);
    setAlertDismissed(false);
    setLoading(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged main application interface">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61", fontWeight: 900, fontSize: "2rem" }}>FLAGGED.RUN</h1>
        <p style={{ marginTop: "0.25rem", fontWeight: 600 }}>
          Detect red flags in conversations. Identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        className="peachy-button"
        style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} onError={handleError} />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onLoading={handleLoadingChange}
          onError={handleError}
        />
      )}

      {/* Show immediate alerts if high-risk flags present and alert is not dismissed */}
      {highRiskFlagsPresent && !alertDismissed && (
        <ImmediateAlert
          flaggedBehaviors={flaggedBehaviors.filter((fb) => HIGH_RISK_FLAGS.has(fb.type))}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* Show error message if any */}
      {error && (
        <div
          role="alert"
          className="alert-banner"
          style={{ maxWidth: "440px", margin: "1rem auto", userSelect: "text" }}
        >
          {error}
        </div>
      )}

      {/* Show loading message */}
      {loading && (
        <p
          role="status"
          aria-live="polite"
          style={{ textAlign: "center", fontWeight: "600", color: "#ff6f61", marginTop: "1rem" }}
        >
          Analyzing conversation...
        </p>
      )}

      {/* Show flagged results with share options only when analysis is present and not loading */}
      {!loading && analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            analysisResult={analysisResult}
            flaggedBehaviors={flaggedBehaviors}
            verdict={verdict}
          />
        </>
      )}
    </main>
  );
};

export default App;