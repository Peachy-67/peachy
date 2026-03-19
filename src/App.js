import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";
import "./styles/ImmediateAlert.css";
import "./styles/ShareableResult.css";
import "./styles/RealTimeDashboard.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "discard",
  "gaslighting",
  "ultimatum",
  "control",
  "boundary_push",
]);

const verdictLabelMap = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlagsDetected, setHighRiskFlagsDetected] = useState([]);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);

  // Update high risk flags for alert system
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHighRiskFlagsDetected([]);
      return;
    }

    const foundHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    setHighRiskFlagsDetected(foundHighRisk);
  }, [analysisResult]);

  // Handler to receive conversation analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Prepare flagged behaviors array for visualization and sharing
  const flaggedBehaviors = (analysisResult?.signals || []).map((signal) => {
    // Map signal to label (some signals are direct labels, others can be more descriptive)
    const label = signal.charAt(0).toUpperCase() + signal.slice(1).replace(/_/g, " ");
    // Use a default confidence if we don't have one, fallback 0.8
    const confidence = analysisResult?.confidence ?? 0.8;
    return { type: signal, label, confidence };
  });

  // Map verdict band to display label
  const verdict = analysisResult
    ? verdictLabelMap[analysisResult.verdict.band] || "Safe"
    : "Safe";

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED.RUN
      </h1>

      {/* Toggle dashboard view */}
      <button
        type="button"
        className="peachy-button"
        onClick={() => setDashboardEnabled((enabled) => !enabled)}
        aria-pressed={dashboardEnabled}
        aria-label={
          dashboardEnabled
            ? "Switch to paste analyzer"
            : "Switch to real-time dashboard"
        }
        style={{ marginBottom: "1rem" }}
      >
        {dashboardEnabled ? "Use Paste Analyzer" : "Use Real-time Dashboard"}
      </button>

      {!dashboardEnabled && (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {dashboardEnabled && (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}

      {/* Show immediate alerts if high risk flags detected */}
      <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} />

      {/* Show flagged result visualization only if we have analysis */}
      {analysisResult && (
        <FlaggedResultVisualization
          verdict={verdict}
          flaggedBehaviors={flaggedBehaviors}
          overallConfidence={analysisResult.confidence}
        />
      )}

      {/* Shareable result with sharing buttons */}
      {analysisResult && (
        <ShareableResult
          verdict={verdict}
          flaggedBehaviors={flaggedBehaviors}
          overallConfidence={analysisResult.confidence}
          conversation={analysisResult.meta?.excerpt || ""}
        />
      )}
    </main>
  );
}

export default App;