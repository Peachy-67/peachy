import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

/**
 * App integrates:
 * - conversation paste analyzer
 * - immediate alert for high-risk behaviors
 * - polished flagged results visualization
 * - shareable results
 * - toggleable real-time dashboard for live monitoring
 */
const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAnalyze = useCallback(async (text) => {
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
        const errJson = await response.json().catch(() => ({}));
        setError(errJson.message || "Analysis failed");
      } else {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (err) {
      setError(err?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const highRiskFlags = ["insult", "gaslighting", "threat", "ultimatum"];
  const flaggedBehaviors =
    analysis?.signals?.map((type) => {
      // Map type to label (capitalize first)
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      // Confidence fallback as analysis.confidence
      const confidence = analysis.confidence || 0;
      return { type, label, confidence };
    }) || [];

  // Determine if there are any high risk flags for alert
  const hasHighRiskFlag = flaggedBehaviors.some((flag) =>
    highRiskFlags.includes(flag.type)
  );

  // Map verdict band to label and standardized string for visualization
  // Assume verdict has band: green/yellow/red mapped to Safe/Caution/Flagged
  let verdictLabel = "Safe";
  if (analysis?.verdict?.band === "yellow") verdictLabel = "Caution";
  else if (analysis?.verdict?.band === "red") verdictLabel = "Flagged";

  // Reset alerts on analysis change by re-triggering ImmediateAlert via key
  const alertKey = hasHighRiskFlag ? analysis?.verdict?.band : "no-flag";

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ userSelect: "none", textAlign: "center", color: "#ff6f61" }}>
        Flagged.run
      </h1>

      <section aria-label="Conversation analyzer input area" style={{ marginBottom: "2rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
            initialResult={analysis}
          />
        )}
      </section>

      {analysis && !showDashboard && (
        <section aria-label="Flagged results visualization and sharing">
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysis.confidence || 0}
          />
          <ShareableResult analysis={analysis} />
        </section>
      )}

      {/* Immediate alert to notify user about high-risk flags */}
      <ImmediateAlert
        key={alertKey}
        flaggedBehaviors={flaggedBehaviors.filter((f) =>
          highRiskFlags.includes(f.type)
        )}
      />

      <section
        aria-label="Real-time conversation monitoring dashboard toggle"
        style={{ marginTop: "3rem", textAlign: "center" }}
      >
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Back to Analyzer" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard />
        </section>
      )}
    </main>
  );
};

export default App;