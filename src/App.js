import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "ultimatum",
  "discard",
  "threat",
  "gaslighting",
  "control",
]);

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Derive flagged behaviors for visualization
  const flaggedBehaviors =
    analysis?.signals?.map((sig) => {
      // Map signal to a label for display (capitalized)
      const label = sig.charAt(0).toUpperCase() + sig.slice(1);
      // For confidence, fallback to overall confidence if not provided per signal
      const confidence = analysis.confidence ?? 0;
      return { type: sig, label, confidence };
    }) || [];

  // Verdict text mapping from backend verdict band
  // We map backend band green/yellow/red to Safe/Caution/Flagged (VerdictDisplay expects these)
  const verdict =
    analysis?.verdict?.band === "green"
      ? "Safe"
      : analysis?.verdict?.band === "yellow"
      ? "Caution"
      : analysis?.verdict?.band === "red"
      ? "Flagged"
      : "Safe";

  // Immediate alerts on high-risk flags
  const highRiskFlagsInAnalysis = flaggedBehaviors.filter((f) =>
    HIGH_RISK_FLAGS.has(f.type)
  );

  // Handler to receive analyzed results from ConversationAnalyzerPolish or RealTimeDashboard
  function onAnalysisUpdate(newAnalysis) {
    setAnalysis(newAnalysis);
    setError(null);
  }

  // Handler for errors in analyze calls from ConversationAnalyzerPolish or RealTimeDashboard
  function onError(errMsg) {
    setError(errMsg);
    setAnalysis(null);
  }

  // Update loading state controlled by ConversationAnalyzerPolish and RealTimeDashboard via a callback they provide
  function onLoading(loadingState) {
    setLoading(loadingState);
  }

  // Toggle view between Conversation Analyzer and RealTime Dashboard
  function toggleDashboard() {
    setShowDashboard((v) => !v);
    setError(null);
    setAnalysis(null);
  }

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", userSelect: "none", marginBottom: "1rem", color: "#ff6f3c" }}>
        FLAGGED.RUN Conversation Analyzer
      </h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard}>
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={onAnalysisUpdate}
          onError={onError}
          onLoading={onLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysis={onAnalysisUpdate}
          onError={onError}
          onLoading={onLoading}
        />
      )}

      {error && (
        <div role="alert" aria-live="assertive" className="alert-banner" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      {loading && (
        <div role="status" aria-live="polite" style={{ marginTop: "1rem", fontWeight: "600" }}>
          Analyzing conversation...
        </div>
      )}

      {analysis && !loading && (
        <>
          <ImmediateAlert flaggedBehaviors={highRiskFlagsInAnalysis} />

          <section
            aria-label="Conversation analysis results"
            style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysis.confidence || 0}
            />
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysis.confidence || 0}
              conversationText={analysis.meta?.originalText || ""}
              analysisSummary={analysis.why || []}
            />
          </section>
        </>
      )}
    </main>
  );
}

export default App;