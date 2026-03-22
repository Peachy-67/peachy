import React, { useState, useEffect } from "react";

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
  "discard",
]);

const initialResult = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
};

function extractFlaggedBehaviors(signals = []) {
  // Map signals to labeled flags with confidence placeholders (confidence 1 for UI simplicity)
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
  return signals.map((signal) => ({
    type: signal,
    label: labelMap[signal] || signal,
    confidence: 1,
  }));
}

const App = () => {
  // State for latest analysis from paste analyzer
  const [analysis, setAnalysis] = useState(null);
  // State for error messages from analysis
  const [error, setError] = useState(null);
  // State for showing real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  // State for immediate alert visibility and content
  const [alertFlags, setAlertFlags] = useState([]);
  // State for loading indicator in analyzer
  const [loading, setLoading] = useState(false);

  // Handler for analysis result updates from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisResult = (result) => {
    if (!result) {
      setAnalysis(null);
      setAlertFlags([]);
      return;
    }
    setAnalysis(result);

    // Determine which flags are high risk and trigger alerts
    const flaggedTypes = new Set(result.signals || []);
    const highRiskInResult = [...flaggedTypes].filter((f) => HIGH_RISK_FLAGS.has(f));
    setAlertFlags(highRiskInResult);
  };

  // Handler for errors from conversation analyzer or dashboard
  const onAnalysisError = (errMsg) => {
    setError(errMsg);
    setAnalysis(null);
    setAlertFlags([]);
  };

  // Handler to dismiss alert banner
  const onDismissAlert = () => setAlertFlags([]);

  // Extract flagged behaviors array for visualization (from analysis.signals)
  const flaggedBehaviors = analysis ? extractFlaggedBehaviors(analysis.signals) : [];

  // Determine verdict standardized label for visualization
  const verdictLabel = analysis && analysis.verdict && typeof analysis.verdict === "string"
    ? analysis.verdict
    : "Safe";

  // Overall confidence float 0-1
  const overallConfidence = analysis && typeof analysis.confidence === "number"
    ? analysis.confidence
    : 0;

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analyzer Application">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
      </header>

      {!showDashboard && (
        <>
          <section aria-label="Conversation Input and Analysis">
            <ConversationAnalyzerPolish
              onResult={onAnalysisResult}
              onError={onAnalysisError}
              loadingSetter={setLoading}
            />
            {loading && <p aria-live="polite">Analyzing conversation...</p>}
            {error && (
              <div role="alert" aria-live="assertive" className="alert-banner" tabIndex={-1}>
                {error}
              </div>
            )}
          </section>

          {analysis && (
            <section aria-label="Analysis Result Visualization">
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
            </section>
          )}

          <section style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setShowDashboard(true)}
              className="peachy-button"
              aria-controls="realtime-dashboard"
              aria-expanded={showDashboard}
            >
              Switch to Real-Time Dashboard
            </button>
          </section>
        </>
      )}

      {showDashboard && (
        <section id="realtime-dashboard" aria-label="Real-Time Monitoring Dashboard">
          <RealTimeDashboard onResult={onAnalysisResult} onError={onAnalysisError} />
          <section style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => {
                setShowDashboard(false);
                setAnalysis(null);
                setError(null);
                setAlertFlags([]);
              }}
              className="peachy-button"
              aria-controls="conversation-input"
              aria-expanded={!showDashboard}
            >
              Back to Conversation Input
            </button>
          </section>
        </section>
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={onDismissAlert} />
    </main>
  );
};

export default App;