import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlagsSet = new Set([
  "insult",
  "discard",
  "threat",
  "gaslighting",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  // Update high risk flags when analysisResult changes
  useEffect(() => {
    if (analysisResult?.signals?.length) {
      const detectedHighRisk = analysisResult.signals.filter((signal) =>
        highRiskFlagsSet.has(signal)
      );
      setHighRiskFlags(detectedHighRisk);
    } else {
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  // Handle analysis update from analyzer components
  const handleAnalysisUpdate = (result, error) => {
    if (error) {
      setError(error);
      setAnalysisResult(null);
    } else {
      setError(null);
      // The result follows the formatAnalyzeResponse schema
      // Map signals to expected flags with label and confidence if possible
      setAnalysisResult(result);
    }
  };

  // Compose flagged behaviors for visualization from signals
  // We'll map signals to labels and dummy confidence for display
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals) return [];
    // Map known signals with labels and fixed confidence (sample 0.85)
    // We can enhance this later to use real confidence if available in reaction or elsewhere
    const signalLabelMap = {
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

    return analysisResult.signals.map((sig) => ({
      type: sig,
      label: signalLabelMap[sig] || sig,
      confidence: 0.85,
    }));
  }, [analysisResult]);

  // Determine verdict label for FlaggedResultVisualization
  // The formatAnalyzeResponse verdict label may be "Safe", "Caution", or "Flagged" per roadmap
  // We'll derive this from analysisResult.verdict.band mapped to label
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

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analyzer App">
      <h1 style={{ color: "#ff6f61", textAlign: "center", userSelect: "none" }}>
        FLAGGED
      </h1>

      <section aria-label="Real-time dashboard toggle" style={{ textAlign: "center", margin: "1rem 0" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          initialResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />

          {error && (
            <div
              role="alert"
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                backgroundColor: "#ffccbc",
                borderRadius: "8px",
                fontWeight: "600",
                color: "#b71c1c",
                boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                userSelect: "text",
              }}
            >
              {error}
            </div>
          )}

          {analysisResult && (
            <section
              aria-label="Analysis results"
              style={{ marginTop: "1.25rem", textAlign: "center" }}
            >
              <ImmediateAlert flaggedBehaviors={highRiskFlags} />
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
                conversationExcerpt={
                  analysisResult.meta?.inputExcerpt || ""
                }
              />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;