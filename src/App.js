import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const highRiskFlags = [
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "ultimatum",
  "control",
];

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardEnabled, setDashboardEnabled] = useState(false);

  // On analysis update, check for high-risk flags to trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const detectedHighRiskFlags = analysisResult.signals.filter((flag) =>
      highRiskFlags.includes(flag)
    );
    setAlertFlags(detectedHighRiskFlags);
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
  };

  // Toggle dashboard real-time monitoring
  const toggleDashboard = () => {
    setDashboardEnabled((enabled) => !enabled);
  };

  // Prepare props for visualization and sharing
  // Map signals to flaggedBehaviors with labels and confidence from analysisResult if available
  const flaggedBehaviors =
    analysisResult && analysisResult.signals
      ? analysisResult.signals.map((type) => {
          // Possible label mapping for flags
          let label;
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
            case "ultimatum":
              label = "Ultimatum";
              break;
            case "threat":
              label = "Threat";
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
          // Confidence fallback to 0.5 if not present (analysisResult.confidence is overall confidence)
          const confidence = 0.5;

          return { type, label, confidence };
        })
      : [];

  // Map verdict band to label for FlaggedResultVisualization
  const verdictLabelMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  const verdictLabel =
    analysisResult && analysisResult.verdict && analysisResult.verdict.band
      ? verdictLabelMap[analysisResult.verdict.band] || "Safe"
      : "Safe";

  const overallConfidence =
    analysisResult && typeof analysisResult.confidence === "number"
      ? analysisResult.confidence
      : 0;

  return (
    <main className="container" aria-label="FLAGGED conversation analysis app">
      <h1
        style={{
          textAlign: "center",
          color: "#cc2f2f",
          userSelect: "none",
          marginBottom: "1rem",
        }}
      >
        FLAGGED
      </h1>

      <section aria-label="Conversation input and analyzer">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />
      </section>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <section aria-label="Analysis results visualization and sharing">
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
        </section>
      )}

      <section
        aria-label="Toggle real-time conversation monitoring dashboard"
        style={{ textAlign: "center", marginTop: "2rem" }}
      >
        <button
          aria-pressed={dashboardEnabled}
          onClick={toggleDashboard}
          type="button"
          style={{
            backgroundColor: dashboardEnabled ? "#cc2f2f" : "#f08080",
            color: "white",
            padding: "0.7rem 1.5rem",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 3px 8px rgba(204, 47, 47, 0.7)",
            userSelect: "none",
            transition: "background-color 0.25s ease",
          }}
        >
          {dashboardEnabled ? "Close Real-Time Dashboard" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {dashboardEnabled && (
        <section aria-label="Real-time conversation monitoring dashboard">
          <RealTimeDashboard onAnalysis={handleAnalysis} />
        </section>
      )}
    </main>
  );
}

export default App;