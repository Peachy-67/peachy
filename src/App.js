import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const initialAnalysisResult = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  raw: null,
};

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(initialAnalysisResult);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Extract flaggedBehaviors in shape {type, label, confidence} for visualization from raw analysis response
  useEffect(() => {
    if (!analysisResult.raw) {
      setAlertFlags([]);
      return;
    }

    const flags = (analysisResult.raw.signals || []).map((signal) => {
      // Use label as capitalized signal, confidence from raw confidence or placeholder 0.5
      const label = signal.charAt(0).toUpperCase() + signal.slice(1);
      // For confidence estimate: not in raw, so approximate from overallConfidence or 0.5
      const confidence = analysisResult.raw.confidence || 0.5;
      return { type: signal, label, confidence };
    });

    // Determine which flags are considered high risk
    const highRisk = flags.filter((f) => HIGH_RISK_FLAGS.has(f.type));
    setAlertFlags(highRisk);
  }, [analysisResult]);

  // Central handler for analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysisResult(initialAnalysisResult);
      return;
    }

    const verdictStr =
      result.verdict && typeof result.verdict === "string"
        ? result.verdict
        : (result.verdict?.label || "Safe");

    // flaggedBehaviors from signals
    const flaggedBehaviors = (result.signals || []).map((signal) => ({
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: result.confidence || 0.5,
    }));

    setAnalysisResult({
      verdict: verdictStr,
      flaggedBehaviors,
      overallConfidence: result.confidence || 0,
      raw: result,
    });
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#d94f4f", userSelect: "none" }}>
        FLAGGED
      </h1>

      <section aria-label="Conversation Analyzer Section" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        {alertFlags.length > 0 && <ImmediateAlert flaggedBehaviors={alertFlags} />}
      </section>

      <section aria-label="Flagged Result Display Section" style={{ marginBottom: "2rem" }}>
        <FlaggedResultVisualization
          verdict={analysisResult.verdict}
          flaggedBehaviors={analysisResult.flaggedBehaviors}
          overallConfidence={analysisResult.overallConfidence}
        />
        {analysisResult.raw && <ShareableResult analysis={analysisResult.raw} />}
      </section>

      <section aria-label="Real Time Dashboard Section" style={{ marginBottom: "2rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time monitoring dashboard" : "Show real-time monitoring dashboard"}
          style={{ minWidth: "280px" }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
        {showDashboard && (
          <div style={{ marginTop: "1rem" }}>
            <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
          </div>
        )}
      </section>
    </main>
  );
};

export default App;