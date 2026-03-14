import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // State for current analyzed result from conversation input or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // State to control visibility of real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  // State to control immediate alert visibility handled inside ImmediateAlert component
  // Props will update ImmediateAlert when high-risk flags detected

  // Extract essential data for visualization and alerting from analysisResult
  // Guard for null result
  const verdict = analysisResult?.verdict?.label ?? "Safe";
  // Flatten flaggedBehaviors based on signals considering standard labels and confidence
  // We normalize the signals to include label and confidence to feed visualization components.
  const flaggedBehaviors = (analysisResult?.signals || []).map((signal) => {
    // Map signals to user-friendly labels for badges
    let label = signal.charAt(0).toUpperCase() + signal.slice(1);
    // Special case mapping common known signals to explicit labels if needed
    // Example: 'gaslighting' remains 'Gaslighting', 'discard' => 'Discard'
    // Confidence default fallback to overall confidence
    const confidence = analysisResult?.confidence || 0;
    return { type: signal, label, confidence };
  });

  const overallConfidence = analysisResult?.confidence || 0;

  // Determine if any high-risk flags detected (e.g. insult, gaslighting, threat)
  // We consider signals "insult", "gaslighting", "threat", "discard" as high-risk for alerting
  const highRiskFlags = (analysisResult?.signals || []).filter((signal) =>
    ["insult", "gaslighting", "threat", "discard", "ultimatum"].includes(signal)
  );

  // Handler when the ConversationAnalyzerPolish produces new analysis result
  const onAnalysisComplete = (result) => {
    setAnalysisResult(result);
    // If real-time dashboard is active, synchronize results there too
    // But RealTimeDashboard component manages its own input state, so we keep separate here
  };

  // Handler for real-time dashboard updates - should update analysisResult to keep in sync for sharing and alerts
  const onDashboardAnalysis = (result) => {
    setAnalysisResult(result);
  };

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <h1 tabIndex={-1}>FLAGGED: Conversation Red Flag Detector</h1>

      <section aria-label="Conversation analyzer section">
        <ConversationAnalyzerPolish onAnalysisComplete={onAnalysisComplete} />
      </section>

      <section aria-label="Analysis results visualization section" style={{ marginTop: "24px" }}>
        {analysisResult ? (
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
        ) : (
          <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "1rem" }}>
            Paste a conversation and click analyze to detect red flags.
          </p>
        )}
      </section>

      <section aria-label="Share analyzed results section" style={{ marginTop: "8px" }}>
        {analysisResult && (
          <ShareableResult
            textContent={analysisResult.why?.join(" ") || ""}
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
        )}
      </section>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      <section aria-label="Real-time conversation monitoring dashboard toggle" style={{ marginTop: "32px" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={`${showDashboard ? "Hide" : "Show"} real-time conversation monitoring dashboard`}
          className="peachy-button"
        >
          {showDashboard ? "Hide" : "Show"} Real-Time Monitoring Dashboard
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "20px" }}>
          <RealTimeDashboard onAnalysis={onDashboardAnalysis} />
        </section>
      )}
    </main>
  );
};

export default App;