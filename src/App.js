import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "manipulation", "gaslighting", "discard", "control", "ultimatum", "threat"]);

function isHighRisk(flags = []) {
  return flags.some((flag) => HIGH_RISK_FLAGS.has(flag));
}

export default function App() {
  // State for the current conversation analysis result
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for alert dismissal to allow hiding immediate alert banner
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Toggle between "paste analyzer" mode and "real-time dashboard" mode
  const [dashboardMode, setDashboardMode] = useState(false);

  // Handler for analyzing text conversation, passed to ConversationAnalyzerPolish
  const handleAnalysis = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    setAlertDismissed(false);
    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Failed to analyze conversation.");
        setAnalysis(null);
        return;
      }

      const result = await response.json();

      setAnalysis({
        verdict: result.verdict.label,
        flaggedBehaviors: result.signals.map((signal) => ({
          type: signal,
          label: signal.charAt(0).toUpperCase() + signal.slice(1),
          confidence: result.confidence || 0,
        })),
        overallConfidence: result.confidence || 0,
        raw: result,
      });
    } catch (e) {
      setError("An unexpected error occurred during analysis.");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset alert dismissal if analysis changes
  useEffect(() => {
    setAlertDismissed(false);
  }, [analysis]);

  // Compose share text summary from current analysis for ShareableResult
  const shareText = React.useMemo(() => {
    if (!analysis) return "";

    const verdictLine = `Verdict: ${analysis.verdict}`;
    const flagsLine =
      analysis.flaggedBehaviors.length > 0
        ? "Flags: " + analysis.flaggedBehaviors.map((f) => `${f.label} (${Math.round(f.confidence * 100)}%)`).join(", ")
        : "No red flags detected.";
    return `${verdictLine}\n${flagsLine}\n\nAnalyze your conversations at FLAGGED.RUN`;
  }, [analysis]);

  // Compute quick flag types for alert component
  const flaggedTypes = analysis ? analysis.flaggedBehaviors.map((f) => f.type.toLowerCase()) : [];

  // Show immediate alert only if high risk flags detected and alert not dismissed
  const showImmediateAlert = !alertDismissed && isHighRisk(flaggedTypes);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61", marginBottom: "1rem" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <button
        type="button"
        onClick={() => setDashboardMode((d) => !d)}
        aria-pressed={dashboardMode}
        style={{
          marginBottom: "1rem",
          backgroundColor: dashboardMode ? "#ff6f61" : "#fff",
          color: dashboardMode ? "#fff" : "#ff6f61",
          border: `2px solid #ff6f61`,
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          fontWeight: "600",
          cursor: "pointer",
          userSelect: "none",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "220px",
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        {dashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {showImmediateAlert && (
        <ImmediateAlert
          flaggedBehaviors={flaggedTypes}
          onDismiss={() => setAlertDismissed(true)}
          key="immediate-alert"
        />
      )}

      {dashboardMode ? (
        <RealTimeDashboard onAnalysisChange={setAnalysis} />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalysis}
            loading={loading}
            error={error}
            key="conversation-analyzer"
          />

          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict}
                flaggedBehaviors={analysis.flaggedBehaviors}
                overallConfidence={analysis.overallConfidence}
                key="result-visualization"
              />
              <ShareableResult
                resultText={shareText}
                key="shareable-result"
              />
            </>
          )}
        </>
      )}
    </main>
  );
}