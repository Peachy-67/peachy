import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const extractFlagsInfo = (signals, confidenceByType) => {
  // Map signals to flagged behaviors with label and confidence
  // Use existing known labels, fallback label capitalized
  const labelsMap = {
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
  return signals.map((sig) => {
    const key = sig.toLowerCase();
    return {
      type: key,
      label: labelsMap[key] || sig.charAt(0).toUpperCase() + sig.slice(1),
      confidence: confidenceByType?.[key] ?? 0.75,
    };
  });
};

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // When new analysis comes, check for high-risk flags to trigger alert
  useEffect(() => {
    if (analysisResult?.signals && analysisResult.signals.length) {
      const risky = analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
      setHighRiskFlags(risky);
    } else {
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  // Callback to update analysis result from analyzer and dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <div className="container" aria-label="FLAGGED conversation analyzer application" tabIndex={-1}>
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none", marginBottom: "1rem" }}>
          FLAGGED
        </h1>
      </header>

      {/* Immediate alert triggers for high risk flags */}
      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {/* Conversation Analyzer */}
      <section aria-labelledby="analyzer-section-header">
        <h2 id="analyzer-section-header" className="ui-section-header">
          Analyze Conversation
        </h2>
        <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
      </section>

      {/* Result Visualization */}
      {analysisResult && (
        <section aria-labelledby="result-section-header">
          <h2 id="result-section-header" className="ui-section-header">
            Analysis Result
          </h2>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={extractFlagsInfo(analysisResult.signals, null)}
            overallConfidence={analysisResult.confidence || 0}
          />
          {/* Shareable Result wraps the visualization and provides share UI */}
          <ShareableResult result={analysisResult} />
        </section>
      )}

      {/* Real-time Monitoring Dashboard Toggle */}
      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-time Dashboard" : "Show Real-time Dashboard"}
        </button>

        {showDashboard && (
          <div style={{ marginTop: "1.5rem" }}>
            <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
          </div>
        )}
      </section>
    </div>
  );
}