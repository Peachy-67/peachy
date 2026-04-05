import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer,
 * immediate alerts on high-risk flags,
 * flagged result visualization with sharing options,
 * and toggling real-time dashboard monitoring view.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract flags of high risk suitable for immediate alerting
  // Per roadmap flags: insult, manipulation, gaslighting, discard, control, ultimatum, threat
  const highRiskFlagTypes = new Set([
    "insult",
    "manipulation",
    "gaslighting",
    "discard",
    "control",
    "ultimatum",
    "threat",
  ]);

  // Monitor analysisResult for high risk flags to trigger alerts
  useEffect(() => {
    if (!analysisResult) {
      setHighRiskFlags([]);
      return;
    }
    const foundHighRisks = analysisResult.signals.filter((flag) =>
      highRiskFlagTypes.has(flag)
    );
    setHighRiskFlags(foundHighRisks);
  }, [analysisResult]);

  // Handler called by ConversationAnalyzerPolish on new analysis completion
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler to set loading and reset error on analyze start
  const handleAnalysisStart = () => {
    setLoading(true);
    setError(null);
  };

  // Handler to receive error during analysis
  const handleAnalysisError = (err) => {
    setError(err);
    setLoading(false);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={
            showDashboard
              ? "Switch to conversation paste analyzer view"
              : "Switch to real-time monitoring dashboard view"
          }
        >
          {showDashboard ? "Use Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </div>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onStart={handleAnalysisStart}
            onError={handleAnalysisError}
            onSuccess={handleAnalysisUpdate}
          />
          {loading && (
            <p role="status" aria-live="polite" style={{ color: "#cc2f2f" }}>
              Analyzing conversation...
            </p>
          )}
          {error && (
            <p role="alert" style={{ color: "#cc2f2f" }}>
              {error}
            </p>
          )}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((signal) => ({
                  type: signal,
                  label: signal.charAt(0).toUpperCase() + signal.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                verdict={analysisResult.verdict.label}
                flags={analysisResult.signals}
                confidence={analysisResult.confidence}
              />
            </>
          )}
          <ImmediateAlert flaggedBehaviors={highRiskFlags} />
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          flaggedBehaviors={analysisResult?.signals || []}
          verdict={analysisResult?.verdict?.label || "Safe"}
          confidence={analysisResult?.confidence || 0}
        />
      )}
    </main>
  );
};

export default App;