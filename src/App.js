import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

function App() {
  // State for conversation text analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  // Loading state during analysis request
  const [loading, setLoading] = useState(false);
  // Error message state for analysis failures or validations
  const [error, setError] = useState(null);
  // Control toggling between paste analyzer and real-time dashboard view
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract some fields for easier usage
  const verdict = analysisResult?.verdict?.label ? 
    // Normalize verdict casing for visualization components
    ["Safe", "Caution", "Flagged"].find(v => v.toLowerCase() === analysisResult.verdict.label.toLowerCase()) || "Safe" 
    : "Safe";
  const flaggedBehaviors = (analysisResult?.signals || []).map((signal) => {
    // Map known signals to labels and confidences for badges
    // Confidence not available per signal here, we use overall confidence as fallback
    return {
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: analysisResult?.confidence || 0,
    };
  });
  const overallConfidence = analysisResult?.confidence || 0;

  // Callback handler to receive analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (result) {
      setAnalysisResult(result);
      setError(null);
    } else {
      setAnalysisResult(null);
    }
    setLoading(false);
  };

  // Callback for error during analysis
  const handleAnalysisError = (msg) => {
    setError(msg);
    setLoading(false);
  };

  // Handler when user submits a new analysis request
  const handleAnalyzeStart = () => {
    setLoading(true);
    setError(null);
  };

  // Handler to toggle RealTimeDashboard view
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
    // Reset result and error when toggling views
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
  };

  // Determine if any high-risk flags detected (red flags)
  // Here we treat flaggedBehaviors with certain flags as high risk for alert
  const highRiskFlags = flaggedBehaviors.filter(({ type }) =>
    ["insult", "gaslighting", "threat", "ultimatum", "discard", "control"].includes(type.toLowerCase())
  );

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Red Flags Detector">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", maxWidth: 480, margin: "0 auto 1rem" }}>
          Detect red flags in conversations to identify manipulation, gaslighting, and harmful behavior.
        </p>
      </header>

      {/* Toggle button to switch between paste analyzer and real-time dashboard */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button 
          type="button" 
          onClick={toggleDashboard} 
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Conversation Paste Analyzer" : "Switch to Real-Time Dashboard"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {!showDashboard && (
        <>
          {/* Conversation input & analyze button */}
          <ConversationAnalyzerPolish
            onAnalysisStart={handleAnalyzeStart}
            onAnalysisComplete={handleAnalysisUpdate}
            onAnalysisError={handleAnalysisError}
            loading={loading}
          />

          {/* Show error message if any */}
          {error && (
            <section className="alert-banner" role="alert" aria-live="assertive" aria-atomic="true">
              {error}
            </section>
          )}

          {/* Immediate alert if high-risk flags found */}
          <ImmediateAlert flaggedBehaviors={highRiskFlags} />

          {/* Show flagged result visualization if available */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          )}

          {/* Shareable result if analysis is done */}
          {analysisResult && (
            <ShareableResult
              analysis={analysisResult}
            />
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onAnalysisError={handleAnalysisError}
          flaggedBehaviors={flaggedBehaviors}
          verdict={verdict}
          overallConfidence={overallConfidence}
          loading={loading}
          onAnalyzeStart={handleAnalyzeStart}
        />
      )}
    </main>
  );
}

export default App;