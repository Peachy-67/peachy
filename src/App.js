import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "threat",
  "ultimatum",
];

const App = () => {
  // State for analyzed result from paste conversation input or real-time dashboard
  const [analysis, setAnalysis] = useState(null);
  // Loading and error state for analysis from paste input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle to show real-time monitoring dashboard or paste input analyze view
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Called when new analysis is available either from conversation analyzer or real-time dashboard
  const onAnalysisUpdate = useCallback((result) => {
    setAnalysis(result);
  }, []);

  // Handler for conversation analyze submit from ConversationAnalyzerPolish
  const handleAnalyze = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Analyze failed");
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (e) {
      setError(e.message || "Failed to analyze conversation");
    } finally {
      setLoading(false);
    }
  };

  // Determine if any high risk flags present
  const hasHighRiskFlags =
    analysis?.signals?.some((flag) => HIGH_RISK_FLAGS.includes(flag)) ?? false;

  // Handler to close the immediate alert banner
  const [alertDismissed, setAlertDismissed] = useState(false);
  useEffect(() => {
    if (hasHighRiskFlags) {
      setAlertDismissed(false);
    }
  }, [hasHighRiskFlags]);

  // Compose flagged behaviors array for FlaggedResultVisualization and ShareableResult
  // We map signals to labels and compute confidence from analysis.confidence (mocked here)
  // For MVP, confidence per flag can be assumed equal and overall confidence passed from analysis.confidence
  const flaggedBehaviors =
    analysis?.signals?.map((flag) => {
      // Map signal types to simple label keys consistent with FlagBadge.js colors
      // Some signals map to same labels (e.g. 'manipulation' covers manipulation & guilt)
      const labelMap = {
        insult: "Insult",
        manipulation: "Manipulation",
        guilt: "Manipulation",
        gaslighting: "Gaslighting",
        discard: "Discard",
        control: "Control",
        ultimatum: "Ultimatum",
        threat: "Threat",
        boundary_push: "Boundary Push",
        inconsistency: "Inconsistency",
      };
      return {
        type: flag,
        label: labelMap[flag] || flag,
        confidence:
          typeof analysis.confidence === "number"
            ? analysis.confidence
            : 0.8,
      };
    }) || [];

  // Overall verdict label mapping compatible with FlaggedResultVisualization verdict prop
  // The backend verdict band is green/yellow/red; map to Safe/Caution/Flagged
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdict =
    analysis && analysis.verdict && analysis.verdict.band
      ? verdictMap[analysis.verdict.band] || "Safe"
      : "Safe";

  const overallConfidence =
    typeof analysis?.confidence === "number" ? analysis.confidence : 0;

  // Toggle handler for dashboard view
  const toggleDashboard = () => setIsDashboardOpen((open) => !open);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 tabIndex={-1} style={{ userSelect: "none" }}>
          FLAGGED
        </h1>
      </header>

      <section aria-live="polite" aria-atomic="true" className="analyzer-section">
        {!isDashboardOpen && (
          <>
            <ConversationAnalyzerPolish
              onAnalyze={handleAnalyze}
              loading={loading}
              error={error}
            />
          </>
        )}

        {analysis && !isDashboardOpen && (
          <section
            aria-label="Analyzed conversation results"
            role="region"
            className="results-container"
          >
            <ImmediateAlert
              flaggedBehaviors={analysis.signals || []}
              dismissed={alertDismissed}
              onDismiss={() => setAlertDismissed(true)}
            />
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
              conversationText={analysis?.meta?.inputText || ""}
            />
          </section>
        )}
      </section>

      <section aria-label="Real-time monitoring dashboard toggle" style={{ marginTop: "1.8rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={isDashboardOpen}
          aria-controls="realtime-dashboard"
        >
          {isDashboardOpen ? "Return to Paste Analyzer" : "Open Real-time Monitoring Dashboard"}
        </button>
      </section>

      {isDashboardOpen && (
        <section
          id="realtime-dashboard"
          aria-label="Real-time conversation monitoring dashboard"
          style={{ marginTop: "1.8rem" }}
        >
          <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
          {!!analysis && (
            <>
              <ImmediateAlert
                flaggedBehaviors={analysis.signals || []}
                dismissed={alertDismissed}
                onDismiss={() => setAlertDismissed(true)}
              />
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
                conversationText={analysis?.meta?.inputText || ""}
              />
            </>
          )}
        </section>
      )}
    </main>
  );
};

export default App;