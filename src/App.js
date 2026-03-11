import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

/**
 * Main App component that integrates conversation analyzer, immediate alert,
 * flagged result visualization, shareable result, and real-time dashboard toggle.
 */
export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Callback to receive new analysis results from conversation analyzer components
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);

    // Determine any high-risk flags from signals
    const highRisk = result?.signals?.filter((signal) =>
      ["insult", "gaslighting", "threat", "discard"].includes(signal.toLowerCase())
    ) || [];

    setHighRiskFlags(highRisk);
  }, []);

  // Reset alerts if no high-risk flags remain
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  // Toggle real-time dashboard visibility
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61" }}>FLAGGED</h1>

      {/* Immediate alert banner for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {/* Conversation analyzer section with polished conversation input and analyze */}
      <section
        aria-label="Conversation input and analysis"
        style={{ marginTop: "1rem" }}
      >
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      </section>

      {/* Show flagged results with visualization and sharing if analysis exists */}
      {analysisResult && (
        <section
          aria-label="Flagged results and share options"
          style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              (analysisResult.signals || []).map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              }))
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </section>
      )}

      {/* Toggle button for real-time dashboard */}
      <section aria-label="Real-time dashboard toggle" style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          className="peachy-button"
          type="button"
          style={{ minWidth: 200 }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {/* Real-time dashboard section conditionally rendered */}
      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
}