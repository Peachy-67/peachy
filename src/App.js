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
  "discard",
  "ultimatum",
  "threat",
  "control",
]);

const mapSignalsToFlaggedBehavior = (signals) => {
  // Map backend signals to flaggedBehaviors array with label and confidence stub
  // Here we assume we only get signals and some have confidence 1.0 for demo
  const flagLabels = {
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

  if (!Array.isArray(signals)) return [];

  return signals.map((type) => ({
    type,
    label: flagLabels[type] || type,
    confidence: 1.0,
  }));
};

const getOverallConfidence = (analysis) => {
  if (typeof analysis?.confidence === "number") return analysis.confidence;
  return 0;
};

const verdictLabelMap = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

const App = () => {
  // Manage main analysis state from ConversationAnalyzerPolish and RealTimeDashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Compose flagged behaviors from analysis signals
  const flaggedBehaviors = analysisResult
    ? mapSignalsToFlaggedBehavior(analysisResult.signals)
    : [];

  const overallConfidence = analysisResult ? getOverallConfidence(analysisResult) : 0;

  // Derive verdict label string from verdict.band or default
  const verdict =
    analysisResult && analysisResult.verdict && analysisResult.verdict.band
      ? verdictLabelMap[analysisResult.verdict.band] || "Safe"
      : "Safe";

  // Immediate alert flags - any high risk signals trigger alert
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(highRiskDetected);
    if (highRiskDetected.length) {
      // Also show native alert for immediate attention
      alert(`High risk behavior detected: ${highRiskDetected.join(", ")}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult]);

  // Handler for toggling between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
    // Clear previous analysis when switching views
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <header role="banner" style={{ marginBottom: "1rem", userSelect: "none" }}>
        <h1 style={{ color: "#cc2f2f", textAlign: "center", fontWeight: "700" }}>
          FLAGGED
        </h1>
        <button
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time monitoring dashboard"}
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          style={{ margin: "0 auto", display: "block", marginBottom: "1rem" }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </header>

      <section aria-label="Conversation analysis and input section">
        {showDashboard ? (
          <RealTimeDashboard
            onAnalysisUpdate={setAnalysisResult}
          />
        ) : (
          <ConversationAnalyzerPolish
            onAnalysisUpdate={setAnalysisResult}
          />
        )}
      </section>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && analysisResult.signals && analysisResult.signals.length > 0 && (
        <section aria-label="Flagged conversation results with visualization and sharing">
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
        </section>
      )}
    </main>
  );
};

export default App;