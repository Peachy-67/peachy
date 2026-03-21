import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum", "discard"]);

const initialAnalysis = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawOutput: null,
};

const parseVerdictFromBand = (band) => {
  if (band === "green") return "Safe";
  if (band === "yellow") return "Caution";
  if (band === "red") return "Flagged";
  return "Safe";
};

const mapSignalsToFlags = (signals = []) => {
  // Map raw signals to structured flagged behavior objects for visualization
  // Provide label and type consistent with FlagBadge usage
  // Confidence is unknown here, set to default 1 for visualization unless real confidence exists
  // Use label capitalization for display clarity.
  // We only include recognized flags for display.
  const knownFlags = {
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

  return signals
    .filter((sig) => knownFlags[sig])
    .map((sig) => ({
      type: sig,
      label: knownFlags[sig],
      confidence: 1,
    }));
};

const App = () => {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardMode, setDashboardMode] = useState(false);

  // Handler for new analysis results
  const onAnalysisComplete = (result) => {
    // result expected with:
    // { verdict: { band, label, score }, signals: [], confidence }
    // We convert to data model needed in state.
    if (!result) {
      setAnalysis(initialAnalysis);
      setAlertFlags([]);
      return;
    }

    const verdictLabel = parseVerdictFromBand(result.verdict?.band);
    const flaggedBehaviors = mapSignalsToFlags(result.signals);
    const overallConfidence = typeof result.confidence === "number" ? result.confidence : 0;

    setAnalysis({
      verdict: verdictLabel,
      flaggedBehaviors,
      overallConfidence,
      rawOutput: result,
    });

    // Check for high risk signals for alert
    const foundHighRiskFlags = flaggedBehaviors.filter((flag) => highRiskFlags.has(flag.type));

    setAlertFlags(foundHighRiskFlags);
  };

  // Alert dismiss handler
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED red flag detection app">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
      </header>

      <section aria-label="Conversation analyzer input and results" style={{ marginBottom: "2rem" }}>
        {!dashboardMode && (
          <>
            <ConversationAnalyzerPolish onAnalysisComplete={onAnalysisComplete} />

            {analysis.rawOutput && (
              <>
                <FlaggedResultVisualization
                  verdict={analysis.verdict}
                  flaggedBehaviors={analysis.flaggedBehaviors}
                  overallConfidence={analysis.overallConfidence}
                />
                <ShareableResult
                  verdict={analysis.verdict}
                  flaggedBehaviors={analysis.flaggedBehaviors}
                  overallConfidence={analysis.overallConfidence}
                />
              </>
            )}

            <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />
          </>
        )}
      </section>

      <section aria-label="Real-time monitoring dashboard" style={{ marginBottom: "2rem" }}>
        <button
          type="button"
          aria-pressed={dashboardMode}
          onClick={() => setDashboardMode((prev) => !prev)}
          className="peachy-button"
          style={{ marginBottom: "1rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          {dashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>

        {dashboardMode && (
          <RealTimeDashboard
            onAnalysisComplete={onAnalysisComplete}
            alertFlags={alertFlags}
            onDismissAlert={dismissAlert}
          />
        )}
      </section>
    </main>
  );
};

export default App;