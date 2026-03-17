import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // Analysis result state holds the most recent analysis output
  const [analysisResult, setAnalysisResult] = useState(null);
  // Loading and error states for analysis operations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Control toggling between paste analyzer and real-time dashboard
  const [useDashboard, setUseDashboard] = useState(false);
  // State to control visibility of alert banner for high risk warning
  const [alertVisible, setAlertVisible] = useState(false);

  // Extract key information with safe defaults for rendering
  const verdict = analysisResult?.verdict?.label || "Safe";
  const flaggedBehaviors =
    Array.isArray(analysisResult?.signals) && analysisResult.signals.length > 0
      ? analysisResult.signals.map((signal) => {
          // Map signals to label and confidence, defaults if missing
          const labelMap = {
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
            label: labelMap[signal] || signal,
            confidence: analysisResult.confidence || 0,
          };
        })
      : [];
  const overallConfidence = analysisResult?.confidence || 0;

  // Effect to trigger alert when high risk flags present (red band or certain signals)
  useEffect(() => {
    if (!analysisResult) {
      setAlertVisible(false);
      return;
    }
    const highRiskSignals = new Set([
      "insult",
      "gaslighting",
      "threat",
      "ultimatum",
      "discard",
      "control",
    ]);
    const hasHighRisk = analysisResult.signals?.some((s) =>
      highRiskSignals.has(s)
    );
    // Show alert only if high risk detected
    setAlertVisible(hasHighRisk);
  }, [analysisResult]);

  // Handler for analysis updates from both paste input and real-time dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler for errors during analysis
  const handleAnalysisError = (err) => {
    setError(err);
    setAnalysisResult(null);
    setLoading(false);
  };

  // Handler to toggle dashboard view
  const toggleDashboard = () => {
    setUseDashboard((u) => !u);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analyzer">
      <h1 style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f", marginBottom: "1rem" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Toggle dashboard view" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <button onClick={toggleDashboard} aria-pressed={useDashboard} className="peachy-button" type="button">
          {useDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {alertVisible && analysisResult && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={() => setAlertVisible(false)} />
      )}

      {useDashboard ? (
        // Show the real-time dashboard
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onError={handleAnalysisError}
          loading={loading}
          error={error}
          initialResult={analysisResult}
        />
      ) : (
        // Show the paste-your-conversation analyzer UI
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
            loading={loading}
            setLoading={setLoading}
          />
          {error && (
            <div role="alert" aria-live="assertive" style={{ color: "#cc2f2f", fontWeight: 700, marginTop: "1rem", textAlign: "center" }}>
              {error}
            </div>
          )}
          {analysisResult && !error && (
            <article aria-label="Analysis result visualization" style={{ marginTop: "2rem", textAlign: "center" }}>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </article>
          )}
        </>
      )}
    </main>
  );
};

export default App;