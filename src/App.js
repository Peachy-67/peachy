import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // State to hold the latest analyzed result from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);

  // State to toggle between main analyzer view and real-time dashboard view
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors with full info from analysisResult.signals
  // Here we map signals to objects with type, label, and confidence (approximate)
  // For simplified purposes, label = type capitalized, confidence is from analysisResult.confidence
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    return analysisResult.signals.map((signal) => ({
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysisResult.confidence ?? 0,
    }));
  }, [analysisResult]);

  // Derive verdict label string from analysisResult.verdict.band
  // Map backend bands (green/yellow/red) to frontend verdict labels Safe/Caution/Flagged
  const verdict = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";
    switch (analysisResult.verdict.band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  }, [analysisResult]);

  // ImmediateAlert consumes flagged behaviors to notify if any high-risk flags exist (red flags)
  // We consider any flagged behavior as high-risk for alerting purposes
  // The ImmediateAlert component can filter inside if needed

  // Handler passed to ConversationAnalyzerPolish to receive analysis results on submit
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Also allow toggling between main analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((show) => !show);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

      {/* Toggle button to switch views */}
      <div style={{ margin: "1rem 0", textAlign: "center" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Conversation Analyzer" : "Switch to Real-Time Dashboard"}
          className="peachy-button"
        >
          {showDashboard ? "Show Conversation Analyzer" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        // Real-time conversation monitoring dashboard
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        // Main conversation analyzer interface
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />

          {analysisResult && (
            <>
              {/* Visualize flagged results */}
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              {/* Share results */}
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence ?? 0}
                conversationExcerpt={
                  analysisResult.why && analysisResult.why.length > 0
                    ? analysisResult.why.slice(0, 3).join(" ")
                    : ""
                }
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;