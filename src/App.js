import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const initialAnalysisState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawOutput: null,
};

function mapSignalsToFlags(signals) {
  // Map raw signals to flag objects for badges and alerts
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

  const flags = signals.map((sig) => ({
    type: sig,
    label: flagLabels[sig] || sig,
    confidence: 0.85, // Placeholder confidence; real confidence unknown here
  }));

  return flags;
}

const verdictToLabel = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

function App() {
  const [analysis, setAnalysis] = useState(initialAnalysisState);
  const [showDashboard, setShowDashboard] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");

  // Extract signals from raw output for mapping badges and alerts
  const flaggedBehaviors = analysis.flaggedBehaviors;
  const verdict = analysis.verdict;
  const overallConfidence = analysis.overallConfidence;

  // Determine if there are any high risk flags for alerting
  const highRiskFlags = flaggedBehaviors.filter((flag) => HIGH_RISK_FLAGS.has(flag.type));

  // Handle analysis update from analyzer component
  const handleAnalysisUpdate = (result) => {
    // result assumed to have structure matching backend + postprocessing
    // Format for visualization:
    // verdict: "Safe" | "Caution" | "Flagged"
    // flaggedBehaviors: array of {type, label, confidence}
    // overallConfidence: number float 0..1

    const verdictLabel = 
      result?.verdict?.band && verdictToLabel[result.verdict.band]
        ? verdictToLabel[result.verdict.band]
        : "Safe";

    const signals = Array.isArray(result?.signals) ? result.signals : [];
    const flagged = mapSignalsToFlags(signals);

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors: flagged,
      overallConfidence: typeof result.confidence === "number" ? result.confidence : 0,
      rawOutput: result,
    });
  };

  // Reset analysis and last text on mode toggle if switching to analyzer
  useEffect(() => {
    if (showDashboard) {
      // Clear analysis display when switching to dashboard mode
      setAnalysis(initialAnalysisState);
      setLastAnalyzedText("");
    }
  }, [showDashboard]);

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis tool">
      <header style={{ textAlign: "center", marginBottom: "1rem", userSelect: "none" }}>
        <h1>FLAGGED</h1>
        <p style={{ fontWeight: "600", color: "#cc2f2f" }}>
          Detect behavioral red flags in conversations
        </p>
      </header>

      <section aria-label="Toggle real-time dashboard or conversation analyzer" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
          style={{ maxWidth: "240px" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </section>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onResult={handleAnalysisUpdate}
            lastText={lastAnalyzedText}
            onUpdateLastText={setLastAnalyzedText}
          />

          <ImmediateAlert flaggedBehaviors={highRiskFlags} />

          {analysis.rawOutput && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
                conversation={lastAnalyzedText}
              />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}

      <footer style={{ userSelect: "none", textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "#999" }}>
        <small>©2024 FLAGGED by Peachy</small>
      </footer>
    </main>
  );
}

export default App;