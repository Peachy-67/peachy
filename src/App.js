import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); 
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");

  // Effect to detect high-risk flags for ImmediateAlert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const risky = analysisResult.signals.filter((f) => highRiskFlags.has(f));
    setAlertFlags(risky);
  }, [analysisResult]);

  // Handler for when conversation is analyzed via the paste UI
  const handleAnalysisUpdate = (result, inputText) => {
    setAnalysisResult(result);
    setLastAnalyzedText(inputText);
  };

  // Handler for analysis update from RealTimeDashboard (live monitoring)
  const handleDashboardAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    // For live dashboard maybe no last text update needed
    // But we keep it for sharing summary, so omit update here
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Toggle between Paste Conversation Analyzer and RealTime Dashboard */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button
          aria-pressed={!showDashboard}
          className="peachy-button"
          style={{ marginRight: "8px" }}
          onClick={() => setShowDashboard(false)}
          type="button"
        >
          Paste Analyzer
        </button>
        <button
          aria-pressed={showDashboard}
          className="peachy-button"
          onClick={() => setShowDashboard(true)}
          type="button"
        >
          Real-Time Dashboard
        </button>
      </div>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {!showDashboard && (
        <>
          {/* Paste input analyzer */}
          <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />

          {/* Display flagged result with verdict and badges */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={analysisResult.verdict.label}
              flaggedBehaviors={analysisResult.signals.map((signal) => {
                // Map signals to label and confidence for badges
                // Use known labels and make confidence from reaction confidence if available
                // We'll set dummy confidence here because original signals are strings
                // But we should check if analysisResult has confidence for each signal
                // We do not have individual confidences in current data, so default 0.75
                const signalLabelMap = {
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
                return {
                  type: signal,
                  label: signalLabelMap[signal] || signal,
                  confidence: 0.75,
                };
              })}
              overallConfidence={analysisResult.confidence || 0}
            />
          )}

          {/* Shareable result component with sharing/copy features */}
          {analysisResult && (
            <ShareableResult
              verdict={analysisResult.verdict.label}
              flaggedBehaviors={analysisResult.signals}
              confidence={analysisResult.confidence}
              conversationExcerpt={lastAnalyzedText}
            />
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard onAnalysisUpdate={handleDashboardAnalysisUpdate} />
      )}
    </main>
  );
};

export default App;