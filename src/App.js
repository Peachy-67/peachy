import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = [
  "insult",
  "ultimatum",
  "threat",
  "discard",
  "gaslighting",
  "control",
];

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDashboard, setShowDashboard] = useState(false);

  // Trigger immediate alert if high-risk flags appear
  const highRiskDetected =
    analysis?.signals?.some((sig) => highRiskFlags.includes(sig)) || false;

  const handleAnalyze = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message || "Failed to analyze conversation.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("Network error or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  // Reset analysis and error when toggling between dashboard and paste analyzer
  useEffect(() => {
    setError(null);
    setAnalysis(null);
  }, [showDashboard]);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer">
      <h1 style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f" }}>
        FLAGGED
      </h1>

      <section aria-label="Toggle between conversation analyzer and real-time dashboard" style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />

          {highRiskDetected && (
            <ImmediateAlert 
              flaggedBehaviors={analysis?.signals ?? []}
            />
          )}

          {analysis && (
            <>
              <FlaggedResultVisualization
                verdict={mapBandToVerdict(analysis.verdict.band)}
                flaggedBehaviors={mapSignalsToFlags(analysis.signals)}
                overallConfidence={analysis.confidence}
              />
              <ShareableResult result={analysis} />
            </>
          )}
        </>
      )}
    </main>
  );
};

function mapBandToVerdict(band = "green") {
  switch (band) {
    case "green":
      return "Safe";
    case "yellow":
      return "Caution";
    case "red":
      return "Flagged";
    default:
      return "Safe";
  }
}

// Map detected signal names to label and type for badges
function mapSignalsToFlags(signals) {
  if (!Array.isArray(signals)) return [];

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
    inconsistency: "Inconsistency",
  };

  // Confidence not available per signal here so set default 1
  return signals.map((sig) => ({
    type: sig,
    label: labelMap[sig] ?? sig,
    confidence: 1,
  }));
}

export default App;