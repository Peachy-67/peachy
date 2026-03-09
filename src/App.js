import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); // Stores the analysis result with verdict, flags, confidence etc.
  const [alertFlags, setAlertFlags] = useState([]); // Holds high-risk flags for immediate alert
  const [showDashboard, setShowDashboard] = useState(false); // Toggle real-time dashboard view

  // Update alert flags whenever analysisResult changes
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    // High-risk signals for ImmediateAlert
    const highRiskFlags = ["insult", "gaslighting", "threat", "discard", "manipulation", "control", "ultimatum"];
    const flagged = analysisResult.signals.filter((flag) => highRiskFlags.includes(flag));
    setAlertFlags(flagged);
  }, [analysisResult]);

  // Handler when conversation analysis completes
  const onAnalysisComplete = (result) => {
    setAnalysisResult(result);
  };

  // Toggle dashboard view handler
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag analyzer">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      {/* Immediate alert triggered by high-risk flags */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Real-time monitoring dashboard toggle */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          className="peachy-button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {/* Show dashboard or conversation analyzer + result */}
      {showDashboard ? (
        <RealTimeDashboard onAnalysisComplete={onAnalysisComplete} />
      ) : (
        <>
          {/* Conversation analyzer input and analysis */}
          <ConversationAnalyzerPolish onAnalysisComplete={onAnalysisComplete} />
          {/* Result visualization and share UI, shown only if analyzed */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: 1, // Confidence per behavior not broken out in v1, use 1 as placeholder
                }))}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: 1,
                }))}
                overallConfidence={analysisResult.confidence}
                conversationExcerpt={
                  analysisResult?.meta?.excerpt || "" // Use excerpt from meta if any
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