import React, { useState, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors with labels and confidence for visualization
  const extractFlaggedBehaviors = (signals = []) => {
    // Map signals to objects with type, label, and confidence (mock confidence = 0.8 here, or from result if available)
    if (!analysisResult || !analysisResult.signals) return [];

    // Use signals from analysis result for actual confidence if present
    const confidenceMap = {};
    if (Array.isArray(analysisResult.signals)) {
      // If actual confidences available, extend here; else assume 0.75
      analysisResult.signals.forEach((type) => {
        confidenceMap[type] = 0.75;
      });
    }

    return signals.map((type) => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      confidence: confidenceMap[type] ?? 0.75,
    }));
  };

  // Calculate overall confidence from analysis result if present, fallback 0
  const overallConfidence = analysisResult?.confidence ?? 0;

  // Determine verdict label from frontend enum 'Safe', 'Caution', 'Flagged'
  // Map from band: green=>Safe, yellow=>Caution, red=>Flagged
  const verdictFromBand = (band) => {
    switch (band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  };

  // Extract flagged behaviors for visualization from analysisResult.signals
  const flaggedBehaviors = extractFlaggedBehaviors(analysisResult?.signals || []);

  // Derive verdict string for visualization
  const verdictLabel = verdictFromBand(analysisResult?.verdict?.band);

  // Check if any high-risk flags are present for immediate alert
  const highRiskFlagsDetected =
    flaggedBehaviors.some((fb) => HIGH_RISK_FLAGS.has(fb.type)) ?? false;

  // Handler for new analysis results from conversation analyzer
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((show) => !show);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Conversation Analyzer Input and Result */}
      <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />

      {/* Immediate Alert on high-risk flags */}
      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

      {/* Flagged Result Visualization if analysis result available */}
      {analysisResult && (
        <FlaggedResultVisualization
          verdict={verdictLabel}
          flaggedBehaviors={flaggedBehaviors}
          overallConfidence={overallConfidence}
        />
      )}

      {/* Shareable Result contains the share buttons and snapshot friendly styling */}
      {analysisResult && (
        <ShareableResult
          verdict={verdictLabel}
          flaggedBehaviors={flaggedBehaviors}
          confidence={overallConfidence}
          conversationExcerpt={analysisResult.why?.[0] || ""}
        />
      )}

      {/* Toggle Real-Time Dashboard visibility */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={`${showDashboard ? "Hide" : "Show"} real-time monitoring dashboard`}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard && <RealTimeDashboard />}
    </main>
  );
};

export default App;