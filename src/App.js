import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Core App component integrating conversation analyzer, immediate alert,
 * flagged result visualization with share, and real-time dashboard toggle.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);

  // Extract necessary data for visualization and alerts
  const verdict = analysisResult?.verdict?.label || "Safe";
  const flaggedBehaviors =
    analysisResult?.signals?.map((type) => {
      // Map known flags to labels with confidence (fake confidence for display here)
      // Ideally confidence comes from backend detection
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
      const label = labelMap[type.toLowerCase()] || type;
      // For now, confidence not available in this integration, default to 0.75
      return { type, label, confidence: 0.75 };
    }) || [];

  // Detect high-risk flags for alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHighRiskFlags([]);
      return;
    }
    const highRiskSignals = ["insult", "gaslighting", "threat", "discard"];
    const found = analysisResult.signals.filter((signal) =>
      highRiskSignals.includes(signal)
    );
    setHighRiskFlags(found);
  }, [analysisResult]);

  // Handler when new analysis available
  const handleNewAnalysis = (result, errorFromAnalyzer = null) => {
    setError(errorFromAnalyzer);
    if (result) {
      setAnalysisResult(result);
    } else {
      setAnalysisResult(null);
    }
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <section aria-label="Conversation input and analysis">
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysisComplete={handleNewAnalysis} />
        )}
      </section>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      <section aria-label="Analysis results and sharing" style={{ marginTop: "1.5rem" }}>
        {error && (
          <div
            className="alert-banner"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {error}
          </div>
        )}

        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult analysis={analysisResult} />
          </>
        )}
      </section>

      <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-time Dashboard"}
        </button>

        {showDashboard && (
          <RealTimeDashboard onAnalysisUpdate={handleNewAnalysis} />
        )}
      </section>
    </main>
  );
};

export default App;