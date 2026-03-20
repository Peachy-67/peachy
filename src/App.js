import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Whenever analysis result updates, check if high-risk flags present for immediate alert
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const flaggedBehaviors = analysisResult.signals || [];
    const highRiskDetected = flaggedBehaviors.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.toLowerCase())
    );
    setAlertFlags(highRiskDetected);
  }, [analysisResult]);

  // Handler to update analysis result from ConversationAnalyzer or Dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Compose flagged behaviors for visualization from raw signals, mapping to label and confidence
  // Use confidence from analysisResult.confidence, distribute evenly since no per-flag in unified model
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals?.length) return [];
    // Map known flags to consistent labels, confidence
    const uniqueFlags = Array.from(new Set(analysisResult.signals));
    const confidenceEach =
      typeof analysisResult.confidence === "number"
        ? analysisResult.confidence / uniqueFlags.length || 0
        : 0;

    // Label mapping similar to existing FlagBadge labels
    const labelMapping = {
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

    return uniqueFlags.map((flagType) => ({
      type: flagType,
      label: labelMapping[flagType.toLowerCase()] || flagType,
      confidence: confidenceEach,
    }));
  }, [analysisResult]);

  // Derive verdict string capitalized
  const verdictLabel = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";
    // The existing verdict object has label as string (e.g. "Safe", "Caution", "Flagged")
    return analysisResult.verdict.label || "Safe";
  }, [analysisResult]);

  const overallConfidence =
    (analysisResult && typeof analysisResult.confidence === "number"
      ? analysisResult.confidence
      : 0) || 0;

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analyzer">
      <h1
        style={{
          textAlign: "center",
          color: "#cc2f2f",
          userSelect: "none",
          marginBottom: 12,
        }}
      >
        FLAGGED
      </h1>

      {/* Toggle real-time dashboard or paste analyzer */}
      <section style={{ textAlign: "center", marginBottom: 16 }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to Conversation Analyzer"
              : "Switch to Real-Time Dashboard"
          }
        >
          {showDashboard ? "Paste Conversation Analyzer" : "Real-Time Monitoring Dashboard"}
        </button>
      </section>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Main content: paste analyzer or real-time dashboard */}
      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          analysisResult={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
          {/* Show polished flagged result visualization */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          )}

          {/* Shareable results for viral sharing */}
          {analysisResult && (
            <ShareableResult
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
              conversationExcerpt={
                analysisResult.meta?.conversationExcerpt ||
                ""
              }
            />
          )}
        </>
      )}
    </main>
  );
};

export default App;