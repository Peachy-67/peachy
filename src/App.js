import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "ultimatum",
  "gaslighting",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Trigger alert whenever high risk flags appear in analysisResult.signals
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const flaggedHighRisk = analysisResult.signals.filter((flag) =>
        HIGH_RISK_FLAGS.has(flag)
      );
      if (flaggedHighRisk.length > 0) {
        setAlertFlags(flaggedHighRisk);
      } else {
        setAlertFlags([]);
      }
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for clearing alert flags (dismiss banner)
  const dismissAlert = () => setAlertFlags([]);

  // Handler called by ConversationAnalyzerPolish and RealTimeDashboard with analysis updates
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Mapping signals to labeled flagged behaviors for visualization and sharing
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    return analysisResult.signals.map((type) => {
      // Map to label and confidence (default confidence from 'confidence' property or 0.75)
      let label = "";
      switch (type) {
        case "insult":
          label = "Insult";
          break;
        case "manipulation":
          label = "Manipulation";
          break;
        case "gaslighting":
          label = "Gaslighting";
          break;
        case "discard":
          label = "Discard";
          break;
        case "control":
          label = "Control";
          break;
        case "threat":
          label = "Threat";
          break;
        case "ultimatum":
          label = "Ultimatum";
          break;
        case "guilt":
          label = "Guilt";
          break;
        case "boundary_push":
          label = "Boundary Push";
          break;
        case "inconsistency":
          label = "Inconsistency";
          break;
        default:
          label = type.charAt(0).toUpperCase() + type.slice(1);
      }
      // Use overall confidence score for all flags as no per-flag confidence in root data here
      return {
        type,
        label,
        confidence:
          typeof analysisResult.confidence === "number"
            ? analysisResult.confidence
            : 0.75,
      };
    });
  }, [analysisResult]);

  // Derive simple verdict label for visualization from analysisResult.verdict.band or fallback
  const verdict =
    analysisResult?.verdict?.band === "green"
      ? "Safe"
      : analysisResult?.verdict?.band === "yellow"
      ? "Caution"
      : analysisResult?.verdict?.band === "red"
      ? "Flagged"
      : "Safe";

  // Overall confidence score for result visualization (0-1)
  const overallConfidence =
    typeof analysisResult?.confidence === "number"
      ? analysisResult.confidence
      : 0;

  return (
    <main className="ui-container" role="main" aria-label="Flagged application main interface">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED Conversation Red Flags Detector
        </h1>
      </header>

      <section aria-label="Mode selection">
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <button
            type="button"
            aria-pressed={!showDashboard}
            onClick={() => setShowDashboard(false)}
            style={{
              marginRight: "1rem",
              backgroundColor: !showDashboard ? "#ff6f61" : "#ddd",
              color: !showDashboard ? "#fff" : "#666",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Analyze Conversation
          </button>
          <button
            type="button"
            aria-pressed={showDashboard}
            onClick={() => setShowDashboard(true)}
            style={{
              backgroundColor: showDashboard ? "#ff6f61" : "#ddd",
              color: showDashboard ? "#fff" : "#666",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Real-Time Dashboard
          </button>
        </div>
      </section>

      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />

      {!showDashboard && (
        <section aria-label="Conversation analyzer paste input">
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />
        </section>
      )}

      {(analysisResult && !showDashboard) && (
        <section aria-label="Flagged conversation results">
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            result={analysisResult}
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            confidence={overallConfidence}
          />
        </section>
      )}

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysisComplete={handleAnalysisUpdate} />
        </section>
      )}
    </main>
  );
};

export default App;