import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main application component integrating:
 * - ConversationAnalyzerPolish for user input and analysis
 * - ImmediateAlert for high-risk flag notifications
 * - FlaggedResultVisualization to show verdict and flags with confidence
 * - ShareableResult to enable sharing results easily
 * - RealTimeDashboard for live conversation monitoring toggling
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Parse flagged behaviors from analysisResult signals and enrich with labels and confidence
  const flaggedBehaviors =
    analysisResult && analysisResult.signals
      ? analysisResult.signals.map((signal) => {
          // Map signals to label and confidence
          // Use existing labels consistent with FlagBadge expectations
          // Confidence fallback to overall confidence for now
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
        })
      : [];

  // Determine verdict label from the backend data
  // Using "Safe" / "Caution" / "Flagged" mapping from bands
  const verdictMapping = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdict = analysisResult && analysisResult.verdict
    ? verdictMapping[analysisResult.verdict.band] || "Safe"
    : "Safe";

  // Extract overall confidence number
  const overallConfidence = analysisResult ? analysisResult.confidence : 0;

  // Detect which flags are high risk for alerting (red flags)
  // High risk set is: insult, gaslighting, threat, ultimatum, discard, control
  const highRiskFlagTypes = new Set([
    "insult",
    "gaslighting",
    "threat",
    "ultimatum",
    "discard",
    "control",
  ]);

  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = flaggedBehaviors.filter(
      (flag) => highRiskFlagTypes.has(flag.type.toLowerCase())
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation red flag detector application">
      <h1 style={{ textAlign: "center", color: "#d94f4f", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED: Conversation Red Flag Detector
      </h1>

      {/* Immediate alert banner and native alert dialog */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Show the main conversation analyzer or real-time dashboard toggle */}
      {!showRealTimeDashboard && (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={(result, error) => {
              if (error) {
                setErrorMessage(error);
                setAnalysisResult(null);
              } else {
                setErrorMessage(null);
                setAnalysisResult(result);
              }
            }}
          />

          {errorMessage && (
            <div
              className="alert-banner"
              role="alert"
              aria-live="assertive"
              style={{ marginTop: "1rem" }}
            >
              {errorMessage}
            </div>
          )}

          {/* Display flagged result visualization if available */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          )}

          {/* Shareable result interface for viral sharing */}
          {analysisResult && (
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
              conversationExcerpt={
                analysisResult.meta?.conversationExcerpt || ""
              }
            />
          )}
        </>
      )}

      {/* Toggle button for real-time dashboard */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowRealTimeDashboard(!showRealTimeDashboard)}
          aria-pressed={showRealTimeDashboard}
          aria-label={
            showRealTimeDashboard
              ? "Hide real-time dashboard"
              : "Show real-time dashboard"
          }
        >
          {showRealTimeDashboard ? "Return to Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </div>

      {/* Real-time dashboard view toggled */}
      {showRealTimeDashboard && (
        <RealTimeDashboard
          onAnalysis={(result) => {
            setAnalysisResult(result);
          }}
        />
      )}
    </main>
  );
};

export default App;