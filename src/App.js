import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating:
 * - Conversation analyzer paste input & analysis
 * - Immediate alert on high-risk flags
 * - Polished flagged result visualization with share options
 * - Toggleable real-time dashboard view for monitoring
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detect high-risk flags to trigger alert
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setHighRiskFlags([]);
      return;
    }
    // Define high-risk flags that trigger immediate alert
    const highRisk = ["insult", "gaslighting", "threat", "ultimatum", "discard", "control"];
    const foundHighRiskFlags = analysisResult.signals.filter((flag) => highRisk.includes(flag));
    setHighRiskFlags(foundHighRiskFlags);
  }, [analysisResult]);

  // Handler for analysis updates from child analyzer components
  const handleAnalysis = (result, err) => {
    if (err) {
      setError(err);
      setAnalysisResult(null);
      return;
    }
    setError(null);
    setAnalysisResult(result);
  };

  // Toggle RealTimeDashboard / ConversationAnalyzer view
  const toggleDashboard = () => {
    setError(null);
    setAnalysisResult(null);
    setShowDashboard((prev) => !prev);
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer and dashboard">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
        <button
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          className="peachy-button"
          style={{ marginBottom: "1.5rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
          type="button"
        >
          {showDashboard ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={highRiskFlags} />

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ maxWidth: "440px", margin: "12px auto" }}
        >
          {error}
        </div>
      )}

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysis} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysis} loading={loading} setLoading={setLoading} />
      )}

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: 1, // Assume full confidence for UI badges, real data could enhance
            }))}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysis={analysisResult} />
        </>
      )}
    </div>
  );
};

export default App;