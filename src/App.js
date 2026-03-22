import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const highRiskFlags = new Set(["insult", "gaslighting", "discard", "threat", "ultimatum"]);

const App = () => {
  // State for current conversation analysis
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // State to toggle real-time dashboard mode
  const [dashboardVisible, setDashboardVisible] = useState(false);

  // Alert banner visibility state
  const [alertVisible, setAlertVisible] = useState(true);

  // Extract flagged behaviors as array of objects with type, label, confidence for visualization
  // We'll map signals to labels for UI consistency
  // Provide confidence if available, else default 1
  const flaggedBehaviors = (analysis?.signals || []).map((flag) => {
    // Simple mapping for label per signal (capitalize and replace _)
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
      inconsistency: "Inconsistency"
    };

    const label = labelMap[flag] || flag;

    return {
      type: flag,
      label,
      confidence: 1,
    };
  });

  // Determine verdict string for visualization (Safe, Caution, Flagged)
  // We can map backend verdict.band (green/yellow/red) to verdict strings
  const verdictString = (() => {
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

  // Confidence score from analysis
  const overallConfidence = analysis?.confidence || 0;

  // Check if there are any high-risk flags present for immediate alert
  const highRiskFound = analysis?.signals?.some((flag) => highRiskFlags.has(flag));

  // Handle analysis update from ConversationAnalyzerPolish or RealTimeDashboard
  // Also reset alert visibility when new analysis is received
  const handleAnalysisUpdate = useCallback(({ result, error: analysisError }) => {
    setError(analysisError || null);
    if (result) {
      setAnalysis(result);
      setAlertVisible(true);
    } else {
      setAnalysis(null);
    }
    setLoading(false);
  }, []);

  // Trigger loading state when analysis request starts (used by ConversationAnalyzerPolish)
  const handleLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  return (
    <main className="ui-container" role="main" aria-label="Flagged Conversation Analysis App">
      <header>
        <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f", marginBottom: "1rem" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Mode toggle" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setDashboardVisible((v) => !v)}
          aria-pressed={dashboardVisible}
          className="peachy-button"
          title={dashboardVisible ? "Switch to paste analyzer" : "Switch to real-time dashboard"}
        >
          {dashboardVisible ? "Use Paste Analyzer Mode" : "Use Real-Time Dashboard Mode"}
        </button>
      </section>

      {/* Immediate alert banner if high-risk flags */}
      {highRiskFound && alertVisible && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={() => setAlertVisible(false)} />
      )}

      {!dashboardVisible ? (
        <>
          <section aria-labelledby="paste-analyzer-header" style={{ marginBottom: "2rem" }}>
            <h2 id="paste-analyzer-header" className="ui-section-header">
              Paste Conversation for Analysis
            </h2>
            <ConversationAnalyzerPolish
              onAnalysisUpdate={handleAnalysisUpdate}
              onLoadingChange={handleLoading}
            />
          </section>

          <section aria-live="polite" aria-atomic="true" aria-label="Analysis results" tabIndex={-1}>
            {loading && <p style={{ userSelect: "none", color: "#cc2f2f" }}>Analyzing conversation…</p>}
            {error && (
              <div className="alert-banner" role="alert" tabIndex={-1}>
                {error}
              </div>
            )}
            {!loading && !error && analysis && (
              <>
                <FlaggedResultVisualization
                  verdict={verdictString}
                  flaggedBehaviors={flaggedBehaviors}
                  overallConfidence={overallConfidence}
                />
                <ShareableResult
                  result={analysis}
                  conversationExcerpt={
                    // Show excerpt of the first 350 chars from signals or why field if available
                    analysis.why.length > 0 ? analysis.why.join(" ") : "Conversation analyzed"
                  }
                  verdict={verdictString}
                />
              </>
            )}
          </section>
        </>
      ) : (
        <section aria-label="Real-Time Conversation Monitoring Dashboard" style={{ marginBottom: "2rem" }}>
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
        </section>
      )}

      <footer style={{ textAlign: "center", marginTop: "4rem", fontSize: "0.85rem", color: "#999", userSelect: "none" }}>
        <p>FLAGGED &copy; 2024 Peachy AI</p>
      </footer>
    </main>
  );
};

export default App;