import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css"; // Core shared UI polish styles

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  // State holds analysis results from conversation input
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle for real-time dashboard view or paste-analyzer view
  const [useDashboard, setUseDashboard] = useState(false);

  // Derived states for convenience
  const flaggedBehaviors =
    analysis && Array.isArray(analysis.signals)
      ? analysis.signals.map((signal) => {
          // Map signal names to label capitalization
          // Labels match those in FlagBadge or flagged behaviors standards
          const label = signal.charAt(0).toUpperCase() + signal.slice(1);
          // Confidence is not present per signal; using overall confidence as fallback
          return {
            type: signal,
            label,
            confidence: analysis.confidence || 0,
          };
        })
      : [];

  // Extract verdict label for visualization
  const verdict =
    analysis && analysis.verdict && analysis.verdict.label
      ? analysis.verdict.label
      : "Safe";

  // Overall confidence score (0 to 1)
  const overallConfidence = analysis?.confidence || 0;

  // Check for any high-risk flags in signals
  const highRiskDetected = flaggedBehaviors.some((flag) =>
    highRiskFlags.has(flag.type)
  );

  // Handler for conversation analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysis(result);
    setError(null);
    setIsLoading(false);
  }, []);

  // Handler to capture error from analyzer
  const handleAnalysisError = useCallback((errMsg) => {
    setError(errMsg);
    setAnalysis(null);
    setIsLoading(false);
  }, []);

  // Handler for loading state change
  const handleLoadingChange = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  return (
    <main className="ui-container" role="main" aria-label="Flagged red flag detection app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>
        FLAGGED Conversation Analyzer
      </h1>

      {/* Toggle between paste-analyzer and real-time dashboard */}
      <section aria-label="View mode toggle" style={{ textAlign: "center", margin: "1rem 0" }}>
        <button
          type="button"
          onClick={() => setUseDashboard(false)}
          disabled={!useDashboard}
          aria-pressed={!useDashboard}
          style={{ marginRight: 12, padding: "0.5rem 1.25rem" }}
          className="peachy-button"
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          onClick={() => setUseDashboard(true)}
          disabled={useDashboard}
          aria-pressed={useDashboard}
          style={{ padding: "0.5rem 1.25rem" }}
          className="peachy-button"
        >
          Real-Time Dashboard
        </button>
      </section>

      {useDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onLoadingChange={handleLoadingChange}
          onError={handleAnalysisError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onLoadingChange={handleLoadingChange}
          onError={handleAnalysisError}
        />
      )}

      {error && (
        <section
          role="alert"
          aria-live="assertive"
          className="alert-banner"
          style={{ marginTop: "1rem" }}
        >
          {error}
        </section>
      )}

      {analysis && (
        <>
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <section aria-label="Share analysis result" style={{ marginTop: "1rem" }}>
            <ShareableResult analysis={analysis} />
          </section>
        </>
      )}

      {isLoading && (
        <p
          role="status"
          aria-live="polite"
          style={{ textAlign: "center", marginTop: "1rem", fontWeight: "600", color: "#cc2f2f" }}
        >
          Analyzing conversation...
        </p>
      )}
    </main>
  );
};

export default App;