import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "ultimatum",
  "threat",
  "gaslighting",
  "discard",
  "control",
]);

function extractFlaggedDetails(signals = [], confidence = 0) {
  // Map signals to flag objects with label and confidence (mock labels here for demo)
  // We assume that the label is the capitalized version of the type for badges
  const flagLabels = {
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

  return signals.map((type) => ({
    type,
    label: flagLabels[type] || type,
    confidence,
  }));
}

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // whenever analysisResult updates, check for high-risk flags
  useEffect(() => {
    if (analysisResult?.signals) {
      const detectedHighRisk = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      setHighRiskFlags(detectedHighRisk);
      if (detectedHighRisk.length > 0) {
        setAlertDismissed(false);
      }
    } else {
      setHighRiskFlags([]);
      setAlertDismissed(true);
    }
  }, [analysisResult]);

  // Handler for analysis updates from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  const flaggedBehaviors =
    analysisResult?.signals.length > 0
      ? extractFlaggedDetails(analysisResult.signals, analysisResult.confidence)
      : [];

  const verdictLabel =
    analysisResult?.verdict?.label || "Safe";

  return (
    <main className="ui-container" aria-label="FLAGGED conversation detection application">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ color: "#ff6f61", fontWeight: "700", userSelect: "none" }}>
          FLAGGED
        </h1>
        <p style={{ fontWeight: "500", color: "#555" }}>
          Detect red flags in your conversations
        </p>
      </header>

      <section aria-label="Conversation input and analyzer section" style={{ marginBottom: "2rem" }}>
        {/* Conversation Input and Analyze */}
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />
        )}
      </section>

      <section aria-label="Flagged conversation results" className="flagged-result-container" style={{ marginBottom: "2rem" }}>
        {/* Immediate alert on high-risk flags */}
        {!!highRiskFlags.length && !alertDismissed && (
          <ImmediateAlert
            flaggedBehaviors={highRiskFlags}
            onDismiss={() => setAlertDismissed(true)}
          />
        )}

        {/* Result visualization when we have results */}
        {analysisResult && (
          <>
            <FlaggedResultVisualization
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence}
            />
            <ShareableResult
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence}
              conversationText={analysisResult.meta?.inputText || ""}
            />
          </>
        )}

        {/* No results state */}
        {!analysisResult && (
          <p
            style={{
              color: "#777",
              fontStyle: "italic",
              marginTop: "1rem",
              userSelect: "none",
            }}
          >
            Paste a conversation above and click Analyze to see red flags.
          </p>
        )}
      </section>

      <section aria-label="Real-time conversation monitoring dashboard" style={{ textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((s) => !s)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          style={{ marginBottom: "1rem", width: "100%" }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
        {showDashboard && (
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;