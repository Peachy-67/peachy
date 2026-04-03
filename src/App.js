import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "guilt",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "boundary_push",
]);

const verdictMap = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

/**
 * Main App component that integrates conversation analyzer,
 * immediate alert system, flagged result visualization with share,
 * and real-time dashboard toggle per product roadmap.
 */
export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // When analysisResult updates, check for high risk flags to show alert
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const hasHighRisk = analysisResult.signals.some((flag) =>
        highRiskFlags.has(flag)
      );
      setShowAlert(hasHighRisk);
    } else {
      setShowAlert(false);
    }
  }, [analysisResult]);

  const handleAnalysis = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Analysis failed");
      }

      const data = await response.json();

      // Map backend verdict band to verdict label
      const verdictLabel = verdictMap[data.verdict?.band] || "Caution";

      // Map signals to badge objects for visualization with confidence fallback
      const flaggedBadges =
        data.signals?.map((flag) => ({
          type: flag,
          label:
            flag.charAt(0).toUpperCase() + flag.slice(1).replace("_", " "),
          confidence:
            typeof data.confidence === "number"
              ? data.confidence
              : 0.5,
        })) || [];

      const result = {
        verdict: verdictLabel,
        flaggedBehaviors: flaggedBadges,
        overallConfidence:
          typeof data.confidence === "number" ? data.confidence : 0,
        raw: data,
      };

      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler to toggle real-time dashboard view
  const toggleDashboard = () => setShowDashboard((v) => !v);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer">
      <h1
        tabIndex={-1}
        className="ui-section-header"
        aria-live="polite"
        aria-atomic="true"
      >
        FLAGGED: Conversation Red Flag Detector
      </h1>

      {/* Toggle for Real-Time Dashboard or Paste Analyzer */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={
            showDashboard
              ? "Switch to paste conversation analyzer view"
              : "Switch to real-time dashboard view"
          }
        >
          {showDashboard ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
        </button>
      </div>

      {/* Real-Time Dashboard Mode */}
      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          {/* Conversation Analyzer Input and Results */}
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalysis}
            loading={loading}
            error={error}
            result={analysisResult}
          />

          {/* Immediate alert banner and dialog when high risk flags detected */}
          {analysisResult && (
            <ImmediateAlert
              flaggedBehaviors={analysisResult.flaggedBehaviors.map((f) => f.type)}
              visible={showAlert}
              onDismiss={() => setShowAlert(false)}
            />
          )}

          {/* Show polished flagged result visualization */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
            />
          )}

          {/* Shareable flagged result */}
          {analysisResult && (
            <ShareableResult
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
              conversation={analysisResult.raw?.meta?.input_text || ""}
            />
          )}
        </>
      )}
    </main>
  );
}