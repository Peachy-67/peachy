import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "ultimatum",
  "gaslighting",
  "discard",
]);

const App = () => {
  // State for analysis output
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);

  // When analysis result updates, we show immediate alert for high risk flags if any
  const highRiskFlagsPresent =
    analysisResult &&
    analysisResult.signals &&
    analysisResult.signals.some((signal) => HIGH_RISK_FLAGS.has(signal));

  // Handler passed to ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result || null);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleRealTimeMode = () => {
    setAnalysisResult(null); // Clear analysis when switching mode
    setIsRealTimeMode((current) => !current);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff735a" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Mode toggle" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={toggleRealTimeMode}
          className="peachy-button"
          aria-pressed={isRealTimeMode}
          aria-label={`Switch to ${isRealTimeMode ? "paste input analysis" : "real-time dashboard"} mode`}
        >
          {isRealTimeMode ? "Use Paste Input Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {isRealTimeMode ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
      )}

      {highRiskFlagsPresent && analysisResult && (
        <ImmediateAlert flaggedBehaviors={analysisResult.signals} />
      )}

      {analysisResult && !isRealTimeMode && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={(analysisResult.signals || []).map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysisResult={analysisResult}
          />
        </>
      )}
    </main>
  );
};

export default App;