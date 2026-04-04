import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const extractHighRiskFlags = (flags) => {
  if (!Array.isArray(flags)) return [];
  return flags.filter((flag) => HIGH_RISK_FLAGS.has(flag.toLowerCase()));
};

function App() {
  // State for analysis result from conversation analyzer
  const [analysis, setAnalysis] = useState(null);
  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for dismissed alerts to allow dismissal in ImmediateAlert
  const [dismissedFlags, setDismissedFlags] = useState([]);

  // State to toggle between paste analyzer view and real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for conversation analyzer result update
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);
  };

  // Handler for errors from analyzer
  const handleAnalyzerError = (msg) => {
    setError(msg);
    setAnalysis(null);
  };

  // Clear dismissed flags when analysis changes
  useEffect(() => {
    setDismissedFlags([]);
  }, [analysis]);

  // Determine which flags trigger immediate alert
  const currentHighRiskFlags = analysis
    ? extractHighRiskFlags(analysis.signals).filter(
        (flag) => !dismissedFlags.includes(flag)
      )
    : [];

  // Compose flagged behaviors for visualization
  // Based on signals array, map to labeled objects with confidence 1 (default)
  // Because we lack per-flag confidence in app state except analysis.confidence as overall
  const flaggedBehaviors = (analysis?.signals || []).map((signal) => ({
    type: signal,
    label: signal.charAt(0).toUpperCase() + signal.slice(1),
    confidence: 1, // Default to 100%
  }));

  // Compute verdict label from analysis verdict label if present else 'Safe'
  const verdictLabel =
    analysis?.verdict?.label?.charAt(0).toUpperCase() +
      analysis?.verdict?.label?.slice(1) || "Safe";

  // Default overall confidence 0 if absent
  const overallConfidence = analysis?.confidence || 0;

  // Compose share text for ShareableResult, composing verdict and signals summary
  const shareText = analysis
    ? `FLAGGED Analysis Result: Verdict - ${verdictLabel}\nDetected red flags: ${
        flaggedBehaviors.length > 0
          ? flaggedBehaviors.map((b) => b.label).join(", ")
          : "None"
      }\nConfidence: ${(overallConfidence * 100).toFixed(0)}%\n\nPaste your conversation for analysis at flagged.run.`
    : "Try FLAGGED to detect red flags in conversations: manipulated, gaslighting, insult, control, discard.";

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        FLAGGED Conversation Red-Flag Detector
      </h1>

      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button
          className="peachy-button"
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <ConversationAnalyzerPolish
          onResult={handleAnalysisUpdate}
          onError={handleAnalyzerError}
          loading={loading}
          setLoading={setLoading}
          error={error}
        />
      )}

      {/* Immediate alert for high-risk flags */}
      <ImmediateAlert
        flaggedBehaviors={currentHighRiskFlags}
        onDismiss={(flag) =>
          setDismissedFlags((prev) => [...prev, flag])
        }
      />

      {/* Show result visualization if analysis available */}
      {analysis && (
        <>
          <section
            aria-label="Flagged conversation result visualization"
            role="region"
          >
            <FlaggedResultVisualization
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          </section>
          <section aria-label="Share flagged conversation result" role="region">
            <ShareableResult shareText={shareText} />
          </section>
        </>
      )}
    </main>
  );
}

export default App;