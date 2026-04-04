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
]);

const initialAnalysisState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  reaction: [],
  rawResult: null,
  loading: false,
  error: null,
};

const App = () => {
  const [analysis, setAnalysis] = useState(initialAnalysisState);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // When flagged behaviors update, check high risk flags to show immediate alert
  useEffect(() => {
    if (!analysis.flaggedBehaviors) return setAlertFlags([]);

    const highRiskFound = analysis.flaggedBehaviors.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag.type)
    );

    if (highRiskFound.length > 0 && !alertDismissed) {
      setAlertFlags(highRiskFound);
    } else {
      setAlertFlags([]);
    }
  }, [analysis.flaggedBehaviors, alertDismissed]);

  // Handle new analysis results from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    if (!result) {
      setAnalysis(initialAnalysisState);
      setAlertDismissed(false);
      return;
    }

    // Map verdict colors string to standardized label 'Safe'|'Caution'|'Flagged'
    // The backend verdict might have .band as 'green'|'yellow'|'red' or label strings
    const verdictMap = {
      green: "Safe",
      yellow: "Caution",
      red: "Flagged",
    };

    let verdictLabel = "Safe";

    if (result.verdict && result.verdict.band) {
      verdictLabel = verdictMap[result.verdict.band] || "Safe";
    } else if (typeof result.verdict === "string") {
      verdictLabel = result.verdict;
    } else if (result.verdict && result.verdict.label) {
      // Defensive fallback
      const vLow = result.verdict.label.toLowerCase();
      if (vLow.includes("flag")) verdictLabel = "Flagged";
      else if (vLow.includes("caution") || vLow.includes("warn")) verdictLabel = "Caution";
      else verdictLabel = "Safe";
    }

    // flagged behaviors are signals with label and confidence
    // Convert result.signals (array string) into objects with type, label, confidence if known
    // If we have confidence per flag or overall, reuse overallConfidence here
    const flagTypes = Array.isArray(result.signals) ? result.signals : [];
    // We map flagTypes to labeled flags with confidence
    // Our backend only provides overall confidence, not per-flag confidence; use overallConfidence for all
    const flaggedBehaviors = flagTypes.map((type) => {
      // Label from type normalized
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      return {
        type: type.toLowerCase(),
        label,
        confidence: typeof result.confidence === "number" ? result.confidence : 0,
      };
    });

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence: typeof result.confidence === "number" ? result.confidence : 0,
      reaction: result.reaction || [],
      rawResult: result,
      loading: false,
      error: null,
    });

    setAlertDismissed(false);
  };

  const handleError = (errorMsg) => {
    setAnalysis({
      ...initialAnalysisState,
      error: errorMsg,
      loading: false,
    });
    setAlertDismissed(false);
  };

  const handleLoading = (loadingState) => {
    setAnalysis((prev) => ({
      ...prev,
      loading: loadingState,
      error: loadingState ? null : prev.error,
    }));
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis tool">
      <header style={{ marginBottom: "1.5rem", textAlign: "center", userSelect: "none" }}>
        <h1 style={{ color: "#ff6f61" }}>FLAGGED</h1>
        <p style={{ fontWeight: "600", fontSize: "1rem", color: "#6a4a3a" }}>
          Detect red flags in your conversations &amp; identify manipulation patterns.
        </p>
        <button
          type="button"
          onClick={() => setShowDashboard(!showDashboard)}
          aria-pressed={showDashboard}
          style={{
            marginTop: "0.5rem",
            backgroundColor: "#ff6f61",
            color: "white",
            fontWeight: "700",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onLoading={handleLoading}
          onError={handleError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          loading={analysis.loading}
          error={analysis.error}
        />
      )}

      <ImmediateAlert flags={alertFlags} onDismiss={() => setAlertDismissed(true)} />

      {/* Show analysis results if not loading and no errors */}
      {!analysis.loading && !analysis.error && analysis.rawResult && (
        <>
          <section aria-label="Flagged result visualization and sharing" style={{ marginTop: "2rem" }}>
            <FlaggedResultVisualization
              verdict={analysis.verdict}
              flaggedBehaviors={analysis.flaggedBehaviors}
              overallConfidence={analysis.overallConfidence}
            />
            <ShareableResult
              verdict={analysis.verdict}
              flaggedBehaviors={analysis.flaggedBehaviors}
              overallConfidence={analysis.overallConfidence}
              conversationExcerpt={
                analysis.rawResult?.meta?.excerpt || "" // Defensive fallback; may be empty
              }
            />
          </section>
        </>
      )}

      {/* Show error message if error */}
      {analysis.error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: "#ffe6e6",
            color: "#a63636",
            border: "1.5px solid #cc2f2f",
            padding: "16px",
            borderRadius: "8px",
            marginTop: "1rem",
            fontWeight: "600",
            textAlign: "center",
            userSelect: "text",
          }}
        >
          {analysis.error}
        </div>
      )}
    </main>
  );
};

export default App;