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

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Called when analysis result is updated from ConversationAnalyzerPolish or dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);

    if (alertsEnabled && result?.flaggedBehaviors) {
      // Find any high risk flags
      const risky = result.flaggedBehaviors.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag.type)
      );
      if (risky.length) {
        setAlertFlags(risky);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  };

  const handleAlertDismiss = () => {
    setAlertFlags([]);
  };

  // Reset alert flags if alerts are disabled or no analysis
  useEffect(() => {
    if (!alertsEnabled) {
      setAlertFlags([]);
    }
  }, [alertsEnabled]);

  // Extract data for FlaggedResultVisualization and ShareableResult
  // The existing analysis object may not be directly the expected shape
  // Wrap it for visualization components
  const verdict =
    analysis && analysis.verdict
      ? analysis.verdict.label
      : "Safe";

  const flaggedBehaviors =
    analysis && analysis.flaggedBehaviors
      ? analysis.flaggedBehaviors
      : (analysis && analysis.signals
        ? analysis.signals.map((sig) => ({
            type: sig,
            label: sig.charAt(0).toUpperCase() + sig.slice(1),
            confidence: 0.75, // fallback confidence
          }))
        : []);

  const overallConfidence =
    analysis && typeof analysis.confidence === "number"
      ? analysis.confidence
      : 0;

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", userSelect: "none", color:"#cc2f2f" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={`Toggle to ${showDashboard ? "paste analyzer" : "real-time dashboard"
            }`}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      )}

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        onDismiss={handleAlertDismiss}
        visible={alertFlags.length > 0}
      />

      {analysis && (
        <>
          <section
            aria-label="Analysis result visualization"
            style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
              conversationExcerpt={analysis.usage?.excerpt || ""}
            />
          </section>
        </>
      )}
    </main>
  );
};

export default App;