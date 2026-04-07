import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "threat", // include threat as high-risk per server signals
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Trigger alert for any high-risk flagged behavior detected
  const highRiskFlagsDetected = React.useMemo(() => {
    if (!analysisResult?.signals) return [];
    return analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
  }, [analysisResult]);

  const handleAnalyze = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Analysis failed.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Compose flaggedBehaviors array with type, label, confidence for visualization and sharing
      // Use signal labels capitalized, confidence assume equal confidence as overall confidence for now
      const flaggedBehaviors = (data.signals || []).map((sig) => {
        // Map signal to label (capitalize first letter or map custom labels)
        const labelMap = {
          insult: "Insult",
          manipulation: "Manipulation",
          gaslighting: "Gaslighting",
          discard: "Discard",
          control: "Control",
          ultimatum: "Ultimatum",
          threat: "Threat",
          guilt: "Guilt",
          boundary_push: "Boundary push",
          inconsistency: "Inconsistency",
        };
        return {
          type: sig,
          label: labelMap[sig] || sig,
          confidence: data.confidence ?? 0.5,
        };
      });

      // Derive verdict label and band for FlaggedResultVisualization
      // Use data.verdict or fallback
      const verdictLabelMap = {
        green: "Safe",
        yellow: "Caution",
        red: "Flagged",
      };
      const verdict = verdictLabelMap[data.verdict?.band] || "Safe";

      setAnalysisResult({
        verdict,
        flaggedBehaviors,
        overallConfidence: data.confidence ?? 0,
        rawApiData: data,
      });
    } catch (e) {
      setError("Failed to analyze conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      <section aria-label="Conversation analyzer input and results" style={{ marginBottom: "2rem" }}>
        {!showDashboard && (
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            errorMessage={error}
            result={analysisResult?.rawApiData}
          />
        )}

        {analysisResult && !showDashboard && (
          <>
            <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} />
            <FlaggedResultVisualization
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
            />
            <ShareableResult
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
            />
          </>
        )}
      </section>

      <section aria-label="Real-time monitoring dashboard toggle" style={{ textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Back to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard
            onUpdateAnalysis={setAnalysisResult}
            error={error}
            loading={loading}
          />
          <ImmediateAlert flaggedBehaviors={highRiskFlagsDetected} />
        </section>
      )}
    </main>
  );
};

export default App;