import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer, alert,
 * flagged results visualization, shareable results, and real-time dashboard.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update high risk flags when analysisResult changes
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlags([]);
      return;
    }
    // Define high-risk flags considered for immediate alert
    const highRiskSet = new Set(["insult", "gaslighting", "threat", "ultimatum", "control"]);
    const flaggedSignals = analysisResult.signals || [];
    // Filter high risk present in current analysis signals
    const foundHighRisk = flaggedSignals.filter((flag) => highRiskSet.has(flag));
    setHighRiskFlags(foundHighRisk);
  }, [analysisResult]);

  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  /** Compose props for visualization, defensively */
  const verdictLabelMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdict = analysisResult
    ? verdictLabelMap[analysisResult.verdict?.band] || "Safe"
    : "Safe";

  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    // Map signals to label & confidence for badges.
    // Use generic label from signal capitalized.
    return analysisResult.signals.map((sig) => ({
      type: sig,
      label:
        {
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
        }[sig] || sig,
      confidence: analysisResult.confidence || 0,
    }));
  }, [analysisResult]);

  const overallConfidence = analysisResult ? analysisResult.confidence || 0 : 0;

  return (
    <main
      className="ui-container"
      role="main"
      aria-label="FLAGGED conversation analyzer app"
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "1.25rem",
          color: "#cc2f2f",
          userSelect: "none",
          fontWeight: "700",
          fontSize: "2rem",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        FLAGGED
      </h1>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalyze={handleAnalysisUpdate} />
          <ImmediateAlert flaggedFlags={highRiskFlags} />
          {analysisResult && (
            <>
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
            </>
          )}
        </>
      )}

      <section
        style={{
          marginTop: "2rem",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          className="peachy-button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <>
          <RealTimeDashboard
            onAnalyze={handleAnalysisUpdate}
            initialVerdict={verdict}
            initialFlags={flaggedBehaviors}
            initialConfidence={overallConfidence}
          />
          <ImmediateAlert flaggedFlags={highRiskFlags} />
        </>
      )}
    </main>
  );
};

export default App;