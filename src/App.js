import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer,
 * alert system, flagged result visualization, shareable results,
 * and real-time dashboard with toggle.
 */
const App = () => {
  // Analysis result state
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real-time dashboard toggle state
  const [dashboardActive, setDashboardActive] = useState(false);

  // Handle new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null); // clear any previous errors
  };

  // Handle loading state from ConversationAnalyzerPolish or RealTimeDashboard
  const handleLoadingUpdate = (isLoading) => {
    setLoading(isLoading);
  };

  // Handle error from ConversationAnalyzerPolish or RealTimeDashboard
  const handleError = (errMessage) => {
    setError(errMessage);
  };

  // Extract flagged behaviors from analysis signals with labels and confidence (dummy labels mapped here)
  // We map signals to objects { type, label, confidence }
  // Use signal type as label capitalized, confidence from confidence score or default 1.0
  // For demonstration, map some known flags; extend as needed.
  const flaggedBehaviors =
    analysis && Array.isArray(analysis.signals)
      ? analysis.signals.map((sig) => {
          // Map known flags with readable labels:
          let label = sig.charAt(0).toUpperCase() + sig.slice(1);
          // Some translations for better label
          if (sig === "ultimatum") label = "Ultimatum";
          else if (sig === "threat") label = "Threat";
          else if (sig === "guilt") label = "Guilt";
          else if (sig === "boundary_push") label = "Boundary Push";
          else if (sig === "inconsistency") label = "Inconsistency";
          // Confidence fallback to analysis.confidence or 1
          return {
            type: sig,
            label: label,
            confidence: analysis.confidence ?? 1,
          };
        })
      : [];

  // Overall verdict in short label form for visualization component
  // We map verdict.band to "Safe", "Caution", or "Flagged"
  const verdictLabel = (() => {
    if (!analysis || !analysis.verdict) return "Safe";
    switch (analysis.verdict.band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  })();

  // ImmediateAlert needs to know flagged behaviors for immediate alerts on high-risk flags
  // Define high risk flags as signals including 'threat', 'ultimatum', 'gaslighting', 'control'
  const highRiskFlags = ["threat", "ultimatum", "gaslighting", "control", "discard", "insult"];
  const highRiskDetected =
    flaggedBehaviors.filter((fb) => highRiskFlags.includes(fb.type.toLowerCase())).length > 0;

  // Share text build for shareable results component
  // Simple summary + excerpt for viral sharing
  const getShareText = () => {
    if (!analysis) return "";
    const safetySummary = `Conversation Verdict: ${verdictLabel}`;
    const flagsSummary =
      flaggedBehaviors.length > 0
        ? `Flags: ${flaggedBehaviors.map((f) => f.label).join(", ")}`
        : "No red flags detected";
    const confidenceSummary = `Confidence: ${Math.round((analysis.confidence ?? 0) * 100)}%`;
    // Optionally include first lines of watch_next or why arrays
    const watchNextExcerpt = (analysis.watch_next && analysis.watch_next.length > 0)
      ? `Watch out for: ${analysis.watch_next.slice(0, 3).join("; ")}`
      : "";
    return [safetySummary, flagsSummary, confidenceSummary, watchNextExcerpt].filter(Boolean).join("\n");
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none", marginBottom: "1rem" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: "2rem" }}>
        <button
          aria-pressed={dashboardActive}
          onClick={() => setDashboardActive(!dashboardActive)}
          className="peachy-button"
          type="button"
          aria-label={dashboardActive ? "Switch to Paste Conversation Analyzer" : "Switch to Real-Time Dashboard"}
        >
          {dashboardActive ? "Use Paste Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {!dashboardActive && (
        <ConversationAnalyzerPolish
          onAnalysis={handleAnalysisUpdate}
          onLoading={handleLoadingUpdate}
          onError={handleError}
        />
      )}

      {dashboardActive && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          onLoading={handleLoadingUpdate}
          onError={handleError}
        />
      )}

      {/* Show error if any */}
      {error && (
        <div role="alert" className="alert-banner" style={{ marginTop: "0.8rem" }}>
          Error: {error}
        </div>
      )}

      {/* Show loading state */}
      {loading && (
        <div
          aria-live="polite"
          style={{ marginTop: "1rem", fontWeight: "600", color: "#cc2f2f", textAlign: "center" }}
        >
          Analyzing conversation…
        </div>
      )}

      {analysis && !loading && (
        <>
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} active={highRiskDetected} />

          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysis.confidence ?? 0}
          />

          <ShareableResult textToShare={getShareText()} />
        </>
      )}
    </main>
  );
};

export default App;