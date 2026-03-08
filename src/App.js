import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolishImprovements.css";

const highRiskFlagsSet = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  // State for latest analysis result from conversation analyzer
  const [analysisResult, setAnalysisResult] = useState(null);

  // State to keep track of flagged behaviors for ImmediateAlert (array of objects)
  const [flaggedBehaviors, setFlaggedBehaviors] = useState([]);

  // Derived state: verdict and overall confidence for visualization
  const verdict = analysisResult?.verdict?.label
    ? {
        label: analysisResult.verdict.label,
        band: analysisResult.verdict.band,
        score: analysisResult.verdict.score,
      }
    : "Safe";

  // Map analysisResult signals/signals detail to flagged behaviors for badges
  // We'll construct flaggedBehaviors array with {type, label, confidence} for badges
  // Mapping label is capitalized type
  const flaggedBehaviorObjects =
    analysisResult?.signals?.map((signal) => {
      const typeLower = signal.toLowerCase();
      const label = typeLower.charAt(0).toUpperCase() + typeLower.slice(1);
      // Confidence fallback to overall confidence (0-1), no confidence per signal by default
      // If detailed confidence per signal is available, it can be enhanced later
      return {
        type: typeLower,
        label,
        confidence: analysisResult.confidence || 0,
      };
    }) || [];

  // Update the flagged behaviors state whenever analysis result changes
  useEffect(() => {
    setFlaggedBehaviors(flaggedBehaviorObjects);
  }, [analysisResult]);

  // Determine if any flagged behavior is high-risk for ImmediateAlert
  const hasHighRiskFlag = flaggedBehaviors.some((flag) => highRiskFlagsSet.has(flag.type));

  return (
    <main className="ui-container" tabIndex={-1} aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      {/* Immediate alert system */}
      <ImmediateAlert flaggedBehaviors={flaggedBehaviors} visible={hasHighRiskFlag} />

      {/* Conversation analysis UI */}
      <section aria-label="Conversation input and analysis" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysisComplete={setAnalysisResult} />
      </section>

      {/* Display analysis results if available */}
      {analysisResult && (
        <section
          aria-label="Flagged conversation analysis results"
          style={{ marginBottom: "3rem" }}
          tabIndex={-1}
          id="analysis-results"
        >
          <FlaggedResultVisualization
            verdict={verdict.label || verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}

      {/* Real-time monitoring dashboard */}
      <section aria-label="Real-time conversation monitoring dashboard">
        <RealTimeDashboard />
      </section>
    </main>
  );
};

export default App;