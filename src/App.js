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
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const initialResult = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
};

function App() {
  const [analysisResult, setAnalysisResult] = useState(initialResult);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // When analysisResult updates, check for high risk and update alerts
  useEffect(() => {
    if (!analysisResult || !analysisResult.flaggedBehaviors) {
      setAlertFlags([]);
      return;
    }
    const flags = analysisResult.flaggedBehaviors
      .map((f) => f.type)
      .filter((type) => HIGH_RISK_FLAGS.has(type));

    setAlertFlags(flags);
  }, [analysisResult]);

  // Handler for received analysis result from children
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysisResult(initialResult);
      return;
    }
    // Defensive fallback if result verdict is string or object
    const verdictLabel =
      typeof result.verdict === "object"
        ? result.verdict.label || "Safe"
        : result.verdict || "Safe";

    const flaggedBehaviors = Array.isArray(result.signals)
      ? result.signals.map((type) => {
          // Map type to label and confidence
          // Use defaults if missing
          const label = type.charAt(0).toUpperCase() + type.slice(1);
          const confidence = typeof result.confidence === "number" ? result.confidence : 0;
          return { type, label, confidence };
        })
      : [];

    const overallConfidence =
      typeof result.confidence === "number" ? result.confidence : 0;

    setAnalysisResult({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence,
      raw: result,
    });
  };

  // Toggle between pasted conversation analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Real-time dashboard toggle" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time dashboard"}
          type="button"
          className="peachy-button"
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {alertFlags.length > 0 && (
        <ImmediateAlert flaggedBehaviors={alertFlags} />
      )}

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          <section aria-label="Flagged analysis result" style={{ marginTop: "1.5rem" }}>
            {analysisResult && analysisResult.flaggedBehaviors && (
              <FlaggedResultVisualization
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.overallConfidence}
              />
            )}
          </section>

          {analysisResult && (
            <section aria-label="Share analysis result">
              <ShareableResult
                result={analysisResult.raw || null}
                verdict={analysisResult.verdict}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                confidence={analysisResult.overallConfidence}
              />
            </section>
          )}
        </>
      ) : (
        <>
          <RealTimeDashboard
            onUpdate={handleAnalysisUpdate}
            alertFlags={alertFlags}
          />
        </>
      )}

      <footer style={{ marginTop: "3rem", textAlign: "center", fontSize: "0.8rem", color: "#666" }}>
        &copy; 2024 FLAGGED. All rights reserved.
      </footer>
    </main>
  );
}

export default App;