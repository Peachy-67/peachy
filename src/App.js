import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
];

/**
 * Main App component integrating conversation analyzer, alert system,
 * flagged result visualization, shareable results, and real-time dashboard.
 */
const App = () => {
  // State for current analysis result
  const [analysisResult, setAnalysisResult] = useState(null);

  // State for error messages during analysis
  const [error, setError] = useState(null);

  // State to toggle real-time dashboard mode
  const [dashboardMode, setDashboardMode] = useState(false);

  // Track highest risk flags currently alerted, for dismiss control
  const [alertFlags, setAlertFlags] = useState([]);

  // Handler for new analysis results from ConversationAnalyzerPolish
  const handleAnalysis = (result, error) => {
    setError(error || null);

    if (result) {
      setAnalysisResult(result);

      // Check if any high-risk flags are present for alert triggering
      const flagsDetected = result.signals?.filter((flag) =>
        HIGH_RISK_FLAGS.includes(flag)
      ) || [];

      setAlertFlags(flagsDetected);
    } else {
      // Clear alerts if no result
      setAlertFlags([]);
      setAnalysisResult(null);
    }
  };

  // Dismiss alert handler
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  // Compose flagged behaviors for visualization from signals
  // Map signal strings to label and default confidence values
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals) return [];

    // Map known signals to labels and confidence from result (approximate)
    // confidence fallback to overall confidence
    return analysisResult.signals.map((signal) => {
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
      return {
        type: signal,
        label: labelMap[signal] || signal,
        confidence: analysisResult.confidence || 0,
      };
    });
  }, [analysisResult]);

  // Derive verdict short label from analysisResult.verdict.band
  const verdictLabel = React.useMemo(() => {
    if (!analysisResult?.verdict?.band) return "Safe";
    switch (analysisResult.verdict.band) {
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

  // Overall confidence from analysisResult
  const overallConfidence = analysisResult?.confidence || 0;

  // Compose text to share from analysisResult
  const shareText = React.useMemo(() => {
    if (!analysisResult) return "";

    let flagsSummary = analysisResult.signals.length
      ? analysisResult.signals.join(", ")
      : "No red flags";

    let snippet = analysisResult.why?.length
      ? `Notes: ${analysisResult.why[0]}`
      : "";

    return `FLAGGED conversation analysis\nVerdict: ${verdictLabel}\nFlags: ${flagsSummary}\nConfidence: ${(overallConfidence * 100).toFixed(0)}%\n${snippet}`;
  }, [analysisResult, verdictLabel, overallConfidence]);

  return (
    <main className="ui-container" aria-labelledby="app-title">
      <h1 id="app-title" tabIndex="-1" style={{ userSelect: "none" }}>
        FLAGGED Conversation Red Flag Detector
      </h1>

      {/* Toggle button for Real-Time Dashboard */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          aria-pressed={dashboardMode}
          onClick={() => setDashboardMode((mode) => !mode)}
          className="peachy-button"
          aria-label={
            dashboardMode
              ? "Switch to Paste Analyzer Mode"
              : "Switch to Real-Time Dashboard Mode"
          }
        >
          {dashboardMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {/* Show either RealTimeDashboard or Paste Analyzer + Results */}
      {dashboardMode ? (
        <RealTimeDashboard onAnalysis={handleAnalysis} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} error={error} />

          {/* Show alert if any high-risk flagged behaviors detected */}
          {alertFlags.length > 0 && (
            <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
          )}

          {/* Show flagged result visualization if result available */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult shareText={shareText} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;