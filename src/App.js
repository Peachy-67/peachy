import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "control",
]);

const App = () => {
  // States for analysis result and loading
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // Determine flagged behaviors array from analysisResult signals
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals || !Array.isArray(analysisResult.signals)) return [];
    // Map signals to objects with type, label, confidence (we'll guess confidence from 0.8 or from overall confidence)
    const signals = analysisResult.signals;
    // Label capitalization mapping
    const labelMap = {
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
    const overallConfidence = analysisResult.confidence ?? 0.5;
    return signals.map((type) => ({
      type,
      label: labelMap[type] || type,
      confidence: overallConfidence,
    }));
  }, [analysisResult]);

  // Verdict derived as short label string for visualization: "Safe", "Caution", "Flagged"
  // Map internal bands to verdict strings
  const verdict = React.useMemo(() => {
    const band = analysisResult?.verdict?.band || "green";
    switch (band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  }, [analysisResult]);

  // Handle analysis from ConversationAnalyzerPolish component
  const handleAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
  }, []);

  // Handle analysis errors
  const handleError = useCallback((e) => {
    setError(e);
    setAnalysisResult(null);
  }, []);

  // Detect if any high-risk flag is present, ignoring already dismissed alerts
  const highRiskDetected = React.useMemo(() => {
    if (!analysisResult?.signals) return false;
    return analysisResult.signals.some(
      (sig) => highRiskFlags.has(sig) && !dismissedAlerts.includes(sig)
    );
  }, [analysisResult, dismissedAlerts]);

  // Handler to dismiss alert for a flag
  const dismissAlertFlag = useCallback(
    (flag) => {
      setDismissedAlerts((prev) => [...prev, flag]);
    },
    [setDismissedAlerts]
  );

  // Reset dismissed alerts when analysisResult changes (new analysis)
  useEffect(() => {
    setDismissedAlerts([]);
  }, [analysisResult]);

  // Toggle between paste analyzer interface and real-time dashboard
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        Flagged Conversation Analyzer
      </h1>

      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
        style={{
          display: "block",
          margin: "0 auto 1rem auto",
          background: "#ff6f61",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "1rem",
          boxShadow: "0 2px 6px rgba(255,111,97,0.6)",
        }}
      >
        {showDashboard ? "Paste Analyzer View" : "Real-Time Dashboard View"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          <ConversationAnalyzerPolish onResult={handleAnalysis} onError={handleError} loading={loading} setLoading={setLoading} />
          {error && (
            <section
              className="alert-banner"
              role="alert"
              aria-live="assertive"
            >
              {typeof error === "string" ? error : "An unexpected error occurred."}
            </section>
          )}

          {analysisResult && (
            <>
              <ImmediateAlert
                flaggedBehaviors={flaggedBehaviors.filter(
                  (fb) => highRiskFlags.has(fb.type) && !dismissedAlerts.includes(fb.type)
                )}
                onDismiss={dismissAlertFlag}
              />
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult
                conversationText={analysisResult.meta?.rawText || ""}
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                confidence={analysisResult.confidence ?? 0}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;