import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovement.css";
import "./styles/FlaggedResultVisualization.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Handle new analysis results
  const onAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result || null);

    // Determine if any high-risk flags are present
    const flagsDetected = (result?.signals || []).filter((sig) =>
      highRiskFlags.has(sig)
    );

    setAlertFlags(flagsDetected);
  }, []);

  // Reset results/alerts when switching mode
  useEffect(() => {
    setAnalysisResult(null);
    setAlertFlags([]);
  }, [realTimeMode]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED
      </h1>

      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          onClick={() => setRealTimeMode((mode) => !mode)}
          aria-pressed={realTimeMode}
          aria-label={`Toggle ${realTimeMode ? "paste analyzer mode" : "real-time dashboard mode"}`}
          className="peachy-button"
          type="button"
        >
          {realTimeMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </div>

      {realTimeMode ? (
        <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={onAnalysisUpdate} />
          {analysisResult && (
            <>
              <ImmediateAlert flaggedBehaviors={alertFlags} />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={(analysisResult.signals || []).map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysisResult.confidence,
                }))}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                result={analysisResult}
                conversationExcerpt={
                  analysisResult?.meta?.conversationExcerpt || ""
                }
              />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;